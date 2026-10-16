import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { ManualTransactionApiResponse } from "@/types/accountantManualUpdate";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================
   TYPES
============================================================ */

interface StaffRow extends RowDataPacket {
  staff_id: number;
  full_name: string;
  role: string;
}

interface MemberRow extends RowDataPacket {
  member_id: number;
  full_name: string;
}

/* ============================================================
   POST - ACCOUNTANT MANUAL TRANSACTION
============================================================ */

export async function POST(request: NextRequest) {
  try {
    /* ============================================================
       1. VERIFY ACCOUNTANT LOGIN
    ============================================================ */

    const staffIdCookie = request.cookies.get("staff_id")?.value;

    if (!staffIdCookie) {
      return NextResponse.json<ManualTransactionApiResponse>(
        {
          success: false,
          message:
            "Accountant login session not found. Please log in again.",
        },
        { status: 401 }
      );
    }

    const staffId = Number(staffIdCookie);

    if (!Number.isInteger(staffId) || staffId <= 0) {
      return NextResponse.json<ManualTransactionApiResponse>(
        {
          success: false,
          message: "Invalid accountant session.",
        },
        { status: 401 }
      );
    }

    /* ============================================================
       2. VERIFY ACCOUNTANT FROM admin_panel
    ============================================================ */

    const [staffRows] = await db.execute<StaffRow[]>(
      `
      SELECT
        staff_id,
        full_name,
        role
      FROM admin_panel
      WHERE staff_id = ?
      LIMIT 1
      `,
      [staffId]
    );

    if (staffRows.length === 0) {
      return NextResponse.json<ManualTransactionApiResponse>(
        {
          success: false,
          message: "Accountant account was not found.",
        },
        { status: 403 }
      );
    }

    const accountant = staffRows[0];

    if (accountant.role !== "accountant") {
      return NextResponse.json<ManualTransactionApiResponse>(
        {
          success: false,
          message: "Access denied. Accountant access required.",
        },
        { status: 403 }
      );
    }

    /* ============================================================
       3. READ REQUEST BODY
    ============================================================ */

    let body: {
      memberId?: unknown;
      amount?: unknown;
      type?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json<ManualTransactionApiResponse>(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const memberId = Number(body.memberId);
    const amount = Number(body.amount);
    const type = String(body.type ?? "").trim().toLowerCase();

    /* ============================================================
       4. VALIDATE MEMBER ID
    ============================================================ */

    if (!Number.isInteger(memberId) || memberId <= 0) {
      return NextResponse.json<ManualTransactionApiResponse>(
        {
          success: false,
          message: "Please provide a valid member ID.",
        },
        { status: 400 }
      );
    }

    /* ============================================================
       5. VALIDATE AMOUNT
    ============================================================ */

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json<ManualTransactionApiResponse>(
        {
          success: false,
          message: "Please enter a valid transaction amount.",
        },
        { status: 400 }
      );
    }

    /* ============================================================
       6. VALIDATE TRANSACTION TYPE
    ============================================================ */

    const allowedTypes = [
      "deposit",
      "repayment",
      "fixed_deposit",
      "monthly_contribution",
    ] as const;

    if (!allowedTypes.includes(type as (typeof allowedTypes)[number])) {
      return NextResponse.json<ManualTransactionApiResponse>(
        {
          success: false,
          message: "Invalid transaction type.",
        },
        { status: 400 }
      );
    }

    /* ============================================================
       7. VERIFY MEMBER
    ============================================================ */

    const [memberRows] = await db.execute<MemberRow[]>(
      `
      SELECT
        member_id,
        full_name
      FROM members
      WHERE member_id = ?
        AND deleted = 0
      LIMIT 1
      `,
      [memberId]
    );

    if (memberRows.length === 0) {
      return NextResponse.json<ManualTransactionApiResponse>(
        {
          success: false,
          message: "Member was not found or has been deleted.",
        },
        { status: 404 }
      );
    }

    const member = memberRows[0];

    /* ============================================================
       8. MAP FRONTEND TYPE TO transactions.transaction_type
       
       transactions.transaction_type only supports:
       loan
       repayment
       savings
       withdrawal
    ============================================================ */

    let transactionType:
      | "loan"
      | "repayment"
      | "savings"
      | "withdrawal";

    switch (type) {
      case "repayment":
        transactionType = "repayment";
        break;

      case "deposit":
      case "fixed_deposit":
      case "monthly_contribution":
        transactionType = "savings";
        break;

      default:
        return NextResponse.json<ManualTransactionApiResponse>(
          {
            success: false,
            message: "Unsupported transaction type.",
          },
          { status: 400 }
        );
    }

    /* ============================================================
       9. GENERATE UNIQUE REFERENCE
    ============================================================ */

    const reference = `MAN-${Date.now()}-${staffId}-${memberId}`;

    /* ============================================================
       10. SAVE TRANSACTION
       
       IMPORTANT:
       - accountant_id comes from the authenticated accountant
       - full_name is NOT stored because it belongs to members
       - transaction_type uses the transactions ENUM values
       - type stores deposit/fixed_deposit/monthly_contribution
       - balance is NOT changed yet
       - MD/Admin2 must approve first
    ============================================================ */

    const [insertResult] = await db.execute<ResultSetHeader>(
      `
      INSERT INTO transactions (
        member_id,
        transaction_type,
        amount,
        type,
        status,
        reference,
        accountant_id,
        transaction_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        member.member_id,
        transactionType,
        amount,
        type,
        "pending_admin2",
        reference,
        accountant.staff_id,
      ]
    );

    /* ============================================================
       11. VERIFY INSERT
    ============================================================ */

    if (!insertResult.insertId) {
      console.error(
        "ACCOUNTANT MANUAL TRANSACTION: INSERT DID NOT RETURN AN ID",
        insertResult
      );

      return NextResponse.json<ManualTransactionApiResponse>(
        {
          success: false,
          message: "Transaction could not be recorded.",
        },
        { status: 500 }
      );
    }

    /* ============================================================
       12. FORMAT AMOUNT
    ============================================================ */

    const formattedAmount = new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    /* ============================================================
       13. SUCCESS RESPONSE
    ============================================================ */

    return NextResponse.json<ManualTransactionApiResponse>(
      {
        success: true,
        message: `Transaction of ₦${formattedAmount} for ${member.full_name} was recorded successfully and submitted for MD approval.`,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    /* ============================================================
       DATABASE ERROR HANDLING
    ============================================================ */

    console.error(
      "============================================================"
    );
    console.error("ACCOUNTANT MANUAL TRANSACTION ERROR");
    console.error(
      "============================================================"
    );
    console.error(error);

    /*
     * mysql2 database errors normally contain:
     * code
     * errno
     * sqlMessage
     * sqlState
     */

    const dbError = error as {
      code?: string;
      errno?: number;
      sqlMessage?: string;
      sqlState?: string;
      message?: string;
    };

    console.error("MYSQL CODE:", dbError.code);
    console.error("MYSQL ERRNO:", dbError.errno);
    console.error("MYSQL SQL MESSAGE:", dbError.sqlMessage);
    console.error("MYSQL SQL STATE:", dbError.sqlState);

    /* ============================================================
       RETURN A USEFUL ERROR
       
       The SQL error is returned here so you can immediately see
       the actual reason instead of the generic message.
    ============================================================ */

    const databaseMessage =
      dbError.sqlMessage ||
      dbError.message ||
      "Unknown database error.";

    return NextResponse.json<ManualTransactionApiResponse>(
      {
        success: false,
        message: `Database error: ${databaseMessage}`,
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import {
  AccountantPaymentApiResponse,
  TransactionItem,
} from "@/types/accountantPayments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================
   HELPERS
============================================================ */

function getStaffId(request: NextRequest): number | null {
  const cookieValue = request.cookies.get("staff_id")?.value;

  if (!cookieValue) {
    return null;
  }

  const staffId = Number(cookieValue);

  if (!Number.isInteger(staffId) || staffId <= 0) {
    return null;
  }

  return staffId;
}

function normalizeTransactionType(type: string): {
  transactionType: "repayment" | "savings";
  type: "loan_repayment" | "monthly_contribution";
} | null {
  const normalized = String(type || "")
    .trim()
    .toLowerCase();

  if (
    normalized === "loan_repayment" ||
    normalized === "repayment"
  ) {
    return {
      transactionType: "repayment",
      type: "loan_repayment",
    };
  }

  if (
    normalized === "monthly_contribution" ||
    normalized === "savings"
  ) {
    return {
      transactionType: "savings",
      type: "monthly_contribution",
    };
  }

  return null;
}

/* ============================================================
   VERIFY ACCOUNTANT
============================================================ */

async function verifyAccountant(
  request: NextRequest
): Promise<{ staffId: number; role: string } | null> {
  const staffId = getStaffId(request);

  if (!staffId) {
    return null;
  }

  const [rows] = await db.execute(
    `
      SELECT
        staff_id,
        full_name,
        email,
        role
      FROM admin_panel
      WHERE staff_id = ?
      LIMIT 1
    `,
    [staffId]
  );

  const staffRows = rows as Array<{
    staff_id: number;
    full_name: string;
    email: string;
    role: string;
  }>;

  if (staffRows.length === 0) {
    return null;
  }

  const staff = staffRows[0];

  if (
    String(staff.role || "")
      .trim()
      .toLowerCase() !== "accountant"
  ) {
    return null;
  }

  return {
    staffId: Number(staff.staff_id),
    role: staff.role,
  };
}

/* ============================================================
   GET
   LOAD PENDING ACCOUNTANT TRANSACTIONS
============================================================ */

export async function GET(request: NextRequest) {
  try {
    const accountant = await verifyAccountant(request);

    if (!accountant) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized. Only an authenticated accountant can access payment transactions.",
        },
        { status: 401 }
      );
    }

    const [rows] = await db.execute(
      `
        SELECT
          t.transaction_id,
          t.member_id,
          COALESCE(m.full_name, 'Unknown Member') AS full_name,
          t.transaction_type,
          t.type,
          t.amount,
          t.payment_method,
          t.reference,
          DATE_FORMAT(t.payment_date, '%Y-%m-%d') AS payment_date,
          t.status,
          t.accountant_id,
          DATE_FORMAT(t.created_at, '%Y-%m-%d %H:%i:%s') AS created_at

        FROM transactions AS t

        LEFT JOIN members AS m
          ON m.member_id = t.member_id

        WHERE LOWER(TRIM(t.status)) = 'pending_accountant'

        ORDER BY t.transaction_id DESC
      `
    );

    const transactionRows = rows as Array<{
      transaction_id: number;
      member_id: number;
      full_name: string | null;
      transaction_type: string;
      type: string;
      amount: number | string;
      payment_method: string | null;
      reference: string | null;
      payment_date: string | null;
      status: string | null;
      accountant_id: number | null;
      created_at: string | null;
    }>;

    const transactions: TransactionItem[] =
      transactionRows.map((row) => ({
        transaction_id: Number(row.transaction_id),
        member_id: Number(row.member_id),
        full_name:
          row.full_name?.trim() || "Unknown Member",
        type: row.type,
        amount: Number(row.amount),
        payment_method: row.payment_method || "",
        reference: row.reference || "",
        payment_date: row.payment_date || "",
        status:
          row.status || "pending_accountant",
      }));

    const response: AccountantPaymentApiResponse = {
      success: true,
      message: "Transactions fetched successfully.",
      transactions,
    };

    return NextResponse.json(response, {
      status: 200,
    });
  } catch (error) {
    console.error(
      "ACCOUNTANT PAYMENT GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load transactions.",
      },
      { status: 500 }
    );
  }
}

/* ============================================================
   POST
   CREATE PENDING PAYMENT TRANSACTION
============================================================ */

export async function POST(request: NextRequest) {
  try {
    const accountant = await verifyAccountant(request);

    if (!accountant) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized. Only an authenticated accountant can submit payments.",
        },
        { status: 401 }
      );
    }

    /* ========================================================
       READ JSON
    ======================================================== */

    let body: {
      member_id?: number | string;
      type?: string;
      amount?: number | string;
      payment_method?: string;
      reference?: string;
      payment_date?: string;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request body.",
        },
        { status: 400 }
      );
    }

    const memberId = Number(body.member_id);
    const amount = Number(body.amount);

    const type = String(body.type || "")
      .trim()
      .toLowerCase();

    const paymentMethod = String(
      body.payment_method || ""
    )
      .trim()
      .toLowerCase();

    const reference = String(
      body.reference || ""
    ).trim();

    const paymentDate = String(
      body.payment_date || ""
    ).trim();

    /* ========================================================
       VALIDATE MEMBER ID
    ======================================================== */

    if (
      !Number.isInteger(memberId) ||
      memberId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid member ID is required.",
        },
        { status: 400 }
      );
    }

    /* ========================================================
       VALIDATE AMOUNT
    ======================================================== */

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment amount must be greater than zero.",
        },
        { status: 400 }
      );
    }

    if (amount > 999999999999.99) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment amount is too large.",
        },
        { status: 400 }
      );
    }

    /* ========================================================
       VALIDATE PAYMENT TYPE
    ======================================================== */

    const normalizedTransaction =
      normalizeTransactionType(type);

    if (!normalizedTransaction) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid payment type. Use loan_repayment or monthly_contribution.",
        },
        { status: 400 }
      );
    }

    /* ========================================================
       VALIDATE PAYMENT METHOD
    ======================================================== */

    const allowedPaymentMethods = [
      "cash",
      "bank_transfer",
      "pos",
    ];

    if (
      !allowedPaymentMethods.includes(paymentMethod)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid payment method. Use cash, bank_transfer or pos.",
        },
        { status: 400 }
      );
    }

    /* ========================================================
       VALIDATE REFERENCE
    ======================================================== */

    if (!reference) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment reference is required.",
        },
        { status: 400 }
      );
    }

    if (reference.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment reference cannot exceed 100 characters.",
        },
        { status: 400 }
      );
    }

    /* ========================================================
       VALIDATE DATE
    ======================================================== */

    const validDate =
      /^\d{4}-\d{2}-\d{2}$/.test(paymentDate);

    if (!validDate) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment date must be in YYYY-MM-DD format.",
        },
        { status: 400 }
      );
    }

    const dateObject = new Date(
      `${paymentDate}T00:00:00`
    );

    if (Number.isNaN(dateObject.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment date.",
        },
        { status: 400 }
      );
    }

    /* ========================================================
       VERIFY MEMBER
    ======================================================== */

    const [memberRows] = await db.execute(
      `
        SELECT
          member_id,
          full_name,
          status,
          deleted
        FROM members
        WHERE member_id = ?
        LIMIT 1
      `,
      [memberId]
    );

    const members = memberRows as Array<{
      member_id: number;
      full_name: string | null;
      status: string | null;
      deleted: number | null;
    }>;

    if (members.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Member account was not found.",
        },
        { status: 404 }
      );
    }

    const member = members[0];

    /* ========================================================
       VERIFY DELETED MEMBER
    ======================================================== */

    if (Number(member.deleted) === 1) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This member account has been deleted.",
        },
        { status: 400 }
      );
    }

    /* ========================================================
       VERIFY MEMBER STATUS
    ======================================================== */

    if (
      String(member.status || "")
        .trim()
        .toLowerCase() !== "approved"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment cannot be recorded for a member whose account is not approved.",
        },
        { status: 400 }
      );
    }

    /* ========================================================
       PREVENT DUPLICATE REFERENCE
    ======================================================== */

    const [referenceRows] = await db.execute(
      `
        SELECT
          transaction_id
        FROM transactions
        WHERE reference = ?
        LIMIT 1
      `,
      [reference]
    );

    const existingReferences =
      referenceRows as Array<{
        transaction_id: number;
      }>;

    if (existingReferences.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A transaction with this payment reference already exists.",
        },
        { status: 409 }
      );
    }

    /* ========================================================
       INSERT TRANSACTION
    ======================================================== */

    const [result] = await db.execute(
      `
        INSERT INTO transactions (
          member_id,
          transaction_type,
          amount,
          type,
          status,
          transaction_date,
          reference,
          payment_method,
          accountant_id,
          payment_date
        )
        VALUES (
          ?,
          ?,
          ?,
          ?,
          'pending_accountant',
          NOW(),
          ?,
          ?,
          ?,
          CONCAT(?, ' 00:00:00')
        )
      `,
      [
        memberId,
        normalizedTransaction.transactionType,
        amount,
        normalizedTransaction.type,
        reference,
        paymentMethod,
        accountant.staffId,
        paymentDate,
      ]
    );

    const insertResult = result as {
      insertId: number;
    };

    /* ========================================================
       RESPONSE
    ======================================================== */

    return NextResponse.json(
      {
        success: true,
        message:
          "Payment submitted successfully and is pending accountant verification.",
        transaction: {
          transaction_id:
            insertResult.insertId,
          member_id: memberId,
          full_name:
            member.full_name || "Unknown Member",
          transaction_type:
            normalizedTransaction.transactionType,
          type: normalizedTransaction.type,
          amount,
          payment_method: paymentMethod,
          reference,
          payment_date: paymentDate,
          status: "pending_accountant",
          accountant_id:
            accountant.staffId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "ACCOUNTANT PAYMENT POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Server error while processing the payment.",
      },
      { status: 500 }
    );
  }
}
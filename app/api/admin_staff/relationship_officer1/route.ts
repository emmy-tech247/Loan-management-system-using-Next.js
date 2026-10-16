import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================
   GET - LOAD SUBMITTED TRANSACTIONS
============================================================ */

export async function GET(request: NextRequest) {
  try {
    // ==========================================================
    // 1. GET STAFF ID FROM COOKIE
    // ==========================================================

    const staffIdCookie = request.cookies.get("staff_id")?.value;

    if (!staffIdCookie) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in again.",
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const staffId = Number(staffIdCookie);

    if (!Number.isInteger(staffId) || staffId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid staff session.",
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // ==========================================================
    // 2. VERIFY RELATIONSHIP OFFICER1
    // ==========================================================

    const [adminRows] = await db.query(
      `
      SELECT
        staff_id,
        full_name,
        email,
        phone,
        role
      FROM admin_panel
      WHERE staff_id = ?
      LIMIT 1
      `,
      [staffId]
    );

    const admins = adminRows as any[];

    if (!admins || admins.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff account not found.",
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const admin = admins[0];

    // ==========================================================
    // 3. VERIFY ROLE
    // ==========================================================

    if (
      String(admin.role || "").trim().toLowerCase() !==
      "relationship_officer1"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Access denied. Relationship Officer1 access required.",
        },
        {
          status: 403,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // ==========================================================
    // 4. LOAD SUBMITTED PAYMENT TRANSACTIONS
    // ==========================================================
    //
    // The transactions table contains:
    //
    // transaction_id
    // member_id
    // transaction_type
    // amount
    // type
    // status
    // transaction_date
    // reference
    // payment_method
    // payment_date
    //
    // There are NO month/year columns in transactions.
    // Therefore month and year are generated from payment_date.
    //
    // ==========================================================

    const [transactionRows] = await db.query(
      `
      SELECT
        t.transaction_id,
        t.member_id,
        COALESCE(m.full_name, 'Unknown Member') AS full_name,
        t.transaction_type,
        t.amount,
        t.type,
        t.status,
        t.transaction_date,
        t.reference,
        t.payment_method,
        t.payment_date,

        DATE_FORMAT(t.payment_date, '%M') AS month,
        YEAR(t.payment_date) AS year

      FROM transactions t

      LEFT JOIN members m
        ON m.member_id = t.member_id

      WHERE LOWER(TRIM(t.status)) = 'pending_accountant'

      ORDER BY
        t.transaction_id DESC
      `
    );

    // ==========================================================
    // 5. NORMALIZE TRANSACTION DATA
    // ==========================================================

    const transactions = (transactionRows as any[]).map(
      (transaction) => ({
        transaction_id: Number(
          transaction.transaction_id
        ),

        member_id: Number(transaction.member_id),

        full_name:
          transaction.full_name || "Unknown Member",

        transaction_type:
          transaction.transaction_type || "",

        type: transaction.type || "",

        amount: Number(transaction.amount || 0),

        payment_method:
          transaction.payment_method || "",

        reference:
          transaction.reference || "",

        month: transaction.month || "",

        year: Number(transaction.year || 0),

        payment_date: transaction.payment_date
          ? new Date(transaction.payment_date)
              .toISOString()
              .split("T")[0]
          : "",

        status: transaction.status || "pending_accountant",
      })
    );

    // ==========================================================
    // 6. RETURN TRANSACTIONS
    // ==========================================================

    return NextResponse.json(
      {
        success: true,
        fullName: admin.full_name,
        staffId: admin.staff_id,
        role: admin.role,
        transactions,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error) {
    console.error(
      "Relationship Officer1 payments GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load submitted transactions.",
        error:
          error instanceof Error
            ? error.message
            : "Unknown database/server error.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}

/* ============================================================
   POST - SUBMIT PAYMENT
============================================================ */

export async function POST(request: NextRequest) {
  try {
    // ==========================================================
    // 1. GET STAFF ID
    // ==========================================================

    const staffIdCookie = request.cookies.get("staff_id")?.value;

    if (!staffIdCookie) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in again.",
        },
        { status: 401 }
      );
    }

    const staffId = Number(staffIdCookie);

    if (!Number.isInteger(staffId) || staffId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid staff session.",
        },
        { status: 401 }
      );
    }

    // ==========================================================
    // 2. VERIFY RELATIONSHIP OFFICER1
    // ==========================================================

    const [adminRows] = await db.query(
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

    const admins = adminRows as any[];

    if (!admins || admins.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff account not found.",
        },
        { status: 401 }
      );
    }

    const admin = admins[0];

    if (
      String(admin.role || "").trim().toLowerCase() !==
      "relationship_officer1"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Access denied. Relationship Officer1 access required.",
        },
        { status: 403 }
      );
    }

    // ==========================================================
    // 3. READ REQUEST
    // ==========================================================

    const body = await request.json();

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

    // month/year are accepted from the frontend but are not
    // stored separately because the transactions table does
    // not contain month/year columns.
    const month = String(body.month || "").trim();
    const year = Number(body.year);

    // ==========================================================
    // 4. VALIDATE MEMBER
    // ==========================================================

    if (!Number.isInteger(memberId) || memberId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid member ID.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid payment amount.",
        },
        { status: 400 }
      );
    }

    // ==========================================================
    // 5. VALIDATE PAYMENT TYPE
    // ==========================================================

    const allowedTypes = [
      "loan_repayment",
      "monthly_contribution",
    ];

    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid payment type. Select Loan Repayment or Monthly Contribution.",
        },
        { status: 400 }
      );
    }

    // ==========================================================
    // 6. VALIDATE PAYMENT METHOD
    // ==========================================================

    const allowedMethods = [
      "cash",
      "bank_transfer",
      "pos",
    ];

    if (!allowedMethods.includes(paymentMethod)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment method.",
        },
        { status: 400 }
      );
    }

    // ==========================================================
    // 7. VALIDATE REFERENCE
    // ==========================================================

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

    // ==========================================================
    // 8. VALIDATE PAYMENT DATE
    // ==========================================================

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(paymentDate)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment date must be in YYYY-MM-DD format.",
        },
        { status: 400 }
      );
    }

    // Validate the actual date
    const parsedDate = new Date(
      `${paymentDate}T00:00:00`
    );

    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment date.",
        },
        { status: 400 }
      );
    }

    // ==========================================================
    // 9. VERIFY MEMBER
    // ==========================================================

    const [memberRows] = await db.query(
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

    const members = memberRows as any[];

    if (!members || members.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Member not found.",
        },
        { status: 404 }
      );
    }

    const member = members[0];

    if (Number(member.deleted || 0) === 1) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This member account is no longer active.",
        },
        { status: 400 }
      );
    }

    if (
      String(member.status || "")
        .trim()
        .toLowerCase() !== "approved"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment can only be submitted for an approved member.",
        },
        { status: 400 }
      );
    }

    // ==========================================================
    // 10. CHECK DUPLICATE REFERENCE
    // ==========================================================

    const [duplicateRows] = await db.query(
      `
      SELECT
        transaction_id
      FROM transactions
      WHERE reference = ?
      LIMIT 1
      `,
      [reference]
    );

    const duplicates = duplicateRows as any[];

    if (duplicates.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A transaction with this payment reference already exists.",
        },
        { status: 409 }
      );
    }

    // ==========================================================
    // 11. MAP TRANSACTION TYPE
    // ==========================================================

    const transactionType =
      type === "loan_repayment"
        ? "repayment"
        : "savings";

    // ==========================================================
    // 12. INSERT PENDING TRANSACTION
    // ==========================================================

    const [result] = await db.query(
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
        NULL,
        ?
      )
      `,
      [
        memberId,
        transactionType,
        amount,
        type,
        reference,
        paymentMethod,
        `${paymentDate} 00:00:00`,
      ]
    );

    const insertResult = result as any;

    // ==========================================================
    // 13. RETURN SUCCESS
    // ==========================================================

    return NextResponse.json(
      {
        success: true,
        message:
          "Payment submitted successfully and forwarded to the Accountant.",
        transaction_id: insertResult.insertId,
        member_id: memberId,
        member_name: member.full_name,
        amount,
        type,
        payment_method: paymentMethod,
        reference,
        payment_date: paymentDate,
        month,
        year,
        status: "pending_accountant",
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Relationship Officer1 payment POST error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to submit payment.",
        error:
          error instanceof Error
            ? error.message
            : "Unknown database/server error.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
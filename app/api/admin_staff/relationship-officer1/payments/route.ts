import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================
   GET - LOAD SUBMITTED TRANSACTIONS
============================================================ */

export async function GET(request: NextRequest) {
  try {
    /* ========================================================
       VERIFY STAFF LOGIN
    ======================================================== */

    const staffIdCookie = request.cookies.get("staff_id")?.value;

    if (!staffIdCookie) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff login session was not found. Please log in again.",
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

    /* ========================================================
       VERIFY RELATIONSHIP OFFICER 1
    ======================================================== */

    const [staffRows] = await db.query(
      `
      SELECT
        staff_id,
        full_name,
        role
      FROM staff
      WHERE staff_id = ?
      LIMIT 1
      `,
      [staffId]
    );

    const staff = (staffRows as any[])[0];

    if (!staff) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff account was not found.",
        },
        { status: 401 }
      );
    }

    if (staff.role !== "relationship_officer1") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Access denied. Relationship Officer1 access required.",
        },
        { status: 403 }
      );
    }

    /* ========================================================
       LOAD SUBMITTED TRANSACTIONS
    ======================================================== */

    const [transactionRows] = await db.query(
      `
      SELECT
        t.transaction_id,
        t.member_id,

        m.full_name,
        m.phone_number,
        m.email,

        t.transaction_type,
        t.type,
        t.amount,
        t.status,
        t.transaction_date,
        t.reference,
        t.created_at,
        t.payment_method,
        t.accountant_id,
        t.payment_date,

        DATE_FORMAT(
          COALESCE(t.payment_date, t.transaction_date),
          '%Y-%m'
        ) AS month,

        YEAR(
          COALESCE(t.payment_date, t.transaction_date)
        ) AS year

      FROM transactions t

      LEFT JOIN members m
        ON m.member_id = t.member_id

      WHERE t.status = 'pending_accountant'

      ORDER BY
        COALESCE(t.payment_date, t.transaction_date) DESC,
        t.transaction_id DESC
      `
    );

    const transactions = transactionRows as any[];

    return NextResponse.json(
      {
        success: true,
        fullName: staff.full_name,
        transactions,
        data: transactions,
        count: transactions.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "GET /api/admin_staff/relationship_officer1/payments error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load submitted transactions.",
      },
      { status: 500 }
    );
  }
}

/* ============================================================
   POST - SUBMIT PAYMENT
============================================================ */

export async function POST(request: NextRequest) {
  let connection: any = null;

  try {
    /* ========================================================
       VERIFY STAFF LOGIN
    ======================================================== */

    const staffIdCookie = request.cookies.get("staff_id")?.value;

    if (!staffIdCookie) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff login session was not found. Please log in again.",
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

    /* ========================================================
       VERIFY RELATIONSHIP OFFICER 1
    ======================================================== */

    const [staffRows] = await db.query(
      `
      SELECT
        staff_id,
        full_name,
        role
      FROM staff
      WHERE staff_id = ?
      LIMIT 1
      `,
      [staffId]
    );

    const staff = (staffRows as any[])[0];

    if (!staff) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff account was not found.",
        },
        { status: 401 }
      );
    }

    if (staff.role !== "relationship_officer1") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Access denied. Relationship Officer1 access required.",
        },
        { status: 403 }
      );
    }

    /* ========================================================
       READ REQUEST BODY
    ======================================================== */

    let body: any;

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

    const memberId = Number(body?.member_id);
    const amount = Number(body?.amount);

    const type = String(
      body?.type || ""
    ).trim();

    const paymentMethod = String(
      body?.payment_method || ""
    ).trim();

    const reference = String(
      body?.reference || ""
    ).trim();

    const paymentDate = String(
      body?.payment_date || ""
    ).trim();

    /* ========================================================
       VALIDATION
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

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment amount must be greater than zero.",
        },
        { status: 400 }
      );
    }

    /* ========================================================
       PAYMENT TYPE
       
       Frontend values:
       loan_repayment
       monthly_contribution

       Database transaction_type:
       repayment
       savings
    ======================================================== */

    const allowedTypes = [
      "loan_repayment",
      "monthly_contribution",
    ];

    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment type.",
        },
        { status: 400 }
      );
    }

    const transactionType =
      type === "loan_repayment"
        ? "repayment"
        : "savings";

    /* ========================================================
       PAYMENT METHOD
    ======================================================== */

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

    /* ========================================================
       REFERENCE
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

    /* ========================================================
       PAYMENT DATE
    ======================================================== */

    if (!paymentDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment date is required.",
        },
        { status: 400 }
      );
    }

    /* ========================================================
       VALIDATE PAYMENT DATE
    ======================================================== */

    const parsedDate = new Date(paymentDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment date.",
        },
        { status: 400 }
      );
    }

    /* ========================================================
       DATABASE CONNECTION
    ======================================================== */

    connection = await db.getConnection();

    await connection.beginTransaction();

    /* ========================================================
       CHECK MEMBER
    ======================================================== */

    const [memberRows] = await connection.query(
      `
      SELECT
        member_id,
        full_name
      FROM members
      WHERE member_id = ?
        AND deleted = 0
      LIMIT 1
      FOR UPDATE
      `,
      [memberId]
    );

    const member = (memberRows as any[])[0];

    if (!member) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Member not found.",
        },
        { status: 404 }
      );
    }

    /* ========================================================
       CHECK DUPLICATE REFERENCE
    ======================================================== */

    const [existingRows] = await connection.query(
      `
      SELECT
        transaction_id,
        status
      FROM transactions
      WHERE reference = ?
      LIMIT 1
      `,
      [reference]
    );

    if ((existingRows as any[]).length > 0) {
      await connection.rollback();

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
       INSERT PAYMENT

       IMPORTANT:
       transactions does NOT contain:
       - month
       - year

       transaction_type IS required.
    ======================================================== */

    const [result] = await connection.query(
      `
      INSERT INTO transactions (
        member_id,
        transaction_type,
        amount,
        type,
        status,
        reference,
        payment_method,
        payment_date,
        created_at
      )
      VALUES (
        ?,
        ?,
        ?,
        ?,
        'pending_accountant',
        ?,
        ?,
        ?,
        CURRENT_TIMESTAMP
      )
      `,
      [
        memberId,
        transactionType,
        amount,
        type,
        reference,
        paymentMethod,
        paymentDate,
      ]
    );

    const insertResult = result as {
      insertId: number;
    };

    const transactionId =
      insertResult.insertId;

    /* ========================================================
       COMMIT
    ======================================================== */

    await connection.commit();

    return NextResponse.json(
      {
        success: true,
        message:
          "Payment submitted successfully and forwarded to the Accountant.",
        transaction_id: transactionId,
        member_id: memberId,
        transaction_type: transactionType,
        type,
        amount,
        payment_method: paymentMethod,
        reference,
        payment_date: paymentDate,
        status: "pending_accountant",
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Rollback error:",
          rollbackError
        );
      }
    }

    console.error(
      "POST /api/admin_staff/relationship_officer1/payments error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.sqlMessage ||
          error?.message ||
          "Unable to submit payment.",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
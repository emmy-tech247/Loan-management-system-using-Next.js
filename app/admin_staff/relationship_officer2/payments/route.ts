import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================
   POST PAYMENT
   ============================================================ */

export async function POST(request: NextRequest) {
  const connection = await db.getConnection();

  try {
    /*
     * ----------------------------------------------------------
     * 1. CHECK STAFF SESSION
     * ----------------------------------------------------------
     */

    const staffIdCookie =
      request.cookies.get("staff_id")?.value;

    if (!staffIdCookie) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
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

    /*
     * ----------------------------------------------------------
     * 2. VERIFY STAFF
     * ----------------------------------------------------------
     */

    const [staffRows] = await connection.query(
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
          message: "Staff account not found.",
        },
        { status: 401 }
      );
    }

    if (
      String(staff.role).toLowerCase() !==
      "relationship_officer2"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Access denied. Relationship Officer 2 access required.",
        },
        { status: 403 }
      );
    }

    /*
     * ----------------------------------------------------------
     * 3. READ REQUEST BODY
     * ----------------------------------------------------------
     */

    let body: any;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request.",
        },
        { status: 400 }
      );
    }

    const memberId = Number(body.member_id);
    const amount = Number(body.amount);
    const type = String(body.type || "").trim();
    const paymentMethod = String(
      body.payment_method || ""
    ).trim();
    const reference = String(
      body.reference || ""
    ).trim();
    const paymentDate = String(
      body.payment_date || ""
    ).trim();
    const month = String(body.month || "").trim();
    const year = Number(body.year);

    /*
     * ----------------------------------------------------------
     * 4. VALIDATE REQUIRED FIELDS
     * ----------------------------------------------------------
     */

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

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment amount must be greater than zero.",
        },
        { status: 400 }
      );
    }

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

    const allowedPaymentMethods = [
      "cash",
      "bank_transfer",
      "pos",
    ];

    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment method.",
        },
        { status: 400 }
      );
    }

    if (!reference) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment reference is required.",
        },
        { status: 400 }
      );
    }

    if (!paymentDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment date is required.",
        },
        { status: 400 }
      );
    }

    if (!month) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment month is required.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(year) ||
      year < 2020 ||
      year > 2100
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment year.",
        },
        { status: 400 }
      );
    }

    /*
     * ----------------------------------------------------------
     * 5. START TRANSACTION
     * ----------------------------------------------------------
     */

    await connection.beginTransaction();

    /*
     * ----------------------------------------------------------
     * 6. VERIFY MEMBER
     * ----------------------------------------------------------
     */

    const [memberRows] = await connection.query(
      `
      SELECT
        member_id,
        full_name
      FROM members
      WHERE member_id = ?
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

    /*
     * ----------------------------------------------------------
     * 7. CHECK DUPLICATE REFERENCE
     * ----------------------------------------------------------
     */

    const [existingRows] = await connection.query(
      `
      SELECT transaction_id
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

    /*
     * ----------------------------------------------------------
     * 8. INSERT PAYMENT
     * ----------------------------------------------------------
     */

    const [insertResult] = await connection.query(
      `
      INSERT INTO transactions (
        member_id,
        type,
        amount,
        payment_method,
        reference,
        month,
        year,
        payment_date,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending_accountant')
      `,
      [
        memberId,
        type,
        amount,
        paymentMethod,
        reference,
        month,
        year,
        paymentDate,
      ]
    );

    const result = insertResult as any;

    /*
     * ----------------------------------------------------------
     * 9. COMMIT
     * ----------------------------------------------------------
     */

    await connection.commit();

    /*
     * ----------------------------------------------------------
     * 10. RETURN SUCCESS
     * ----------------------------------------------------------
     */

    return NextResponse.json(
      {
        success: true,
        message:
          "Payment submitted successfully and forwarded to the Accountant.",
        transaction_id: Number(result.insertId),
        member_id: memberId,
        member_name: member.full_name,
        status: "pending_accountant",
      },
      { status: 201 }
    );
  } catch (error: any) {
    try {
      await connection.rollback();
    } catch {}

    console.error(
      "POST /api/admin_staff/relationship-officer2/payments error:",
      error
    );

    /*
     * Duplicate database reference
     */
    if (error?.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        {
          success: false,
          message:
            "This payment reference already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to submit payment. Please check the server logs.",
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
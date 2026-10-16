import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";

/* ============================================================
   HELPERS
============================================================ */

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function numberValue(value: unknown): number {
  return Number(value);
}

/* ============================================================
   POST
============================================================ */

export async function POST(request: NextRequest) {
  let connection: Awaited<ReturnType<typeof db.getConnection>> | null =
    null;

  try {
    const body = await request.json();

    /* ========================================================
       COLLECT FORM DATA
    ======================================================== */

    const memberId = numberValue(body?.member_id);
    const loanAmount = numberValue(body?.loan_amount);
    const tenureMonth = numberValue(body?.tenure_month);
    const interestRate = numberValue(body?.interest_rate);

    const loanType = clean(body?.loan_type);
    const loanCategory = clean(body?.loan_category);
    const purpose = clean(body?.purpose);

    const repaymentSource = clean(body?.repayment_source);

    const bankName = clean(body?.bank_name);
    const accountNumber = clean(body?.account_number);
    const accountName = clean(body?.account_name);
    const bvn = clean(body?.bvn);

    const guarantor1Name = clean(body?.guarantor1_name);
    const guarantor1Phone = clean(body?.guarantor1_phone);
    const guarantor1Email = clean(body?.guarantor1_email);
    const guarantor1Address = clean(body?.guarantor1_address);

    const guarantor2Name = clean(body?.guarantor2_name);
    const guarantor2Phone = clean(body?.guarantor2_phone);
    const guarantor2Email = clean(body?.guarantor2_email);
    const guarantor2Address = clean(body?.guarantor2_address);

    /* ========================================================
       VALIDATION
    ======================================================== */

    if (!Number.isInteger(memberId) || memberId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select a valid member.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(loanAmount) || loanAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Loan amount must be greater than zero.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(tenureMonth) ||
      tenureMonth <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Loan tenure must be a valid number of months.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(interestRate) ||
      interestRate < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid interest rate.",
        },
        { status: 400 }
      );
    }

    const allowedLoanTypes = [
      "personal",
      "business",
      "education",
    ];

    if (!allowedLoanTypes.includes(loanType)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid loan type.",
        },
        { status: 400 }
      );
    }

    const allowedLoanCategories = [
      "monthly_saver",
      "borrower",
    ];

    if (!allowedLoanCategories.includes(loanCategory)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid loan category.",
        },
        { status: 400 }
      );
    }

    if (!purpose) {
      return NextResponse.json(
        {
          success: false,
          message: "Loan purpose is required.",
        },
        { status: 400 }
      );
    }

    if (!repaymentSource) {
      return NextResponse.json(
        {
          success: false,
          message: "Repayment source is required.",
        },
        { status: 400 }
      );
    }

    if (!bankName) {
      return NextResponse.json(
        {
          success: false,
          message: "Bank name is required.",
        },
        { status: 400 }
      );
    }

    if (!accountNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Account number is required.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(accountNumber)) {
      return NextResponse.json(
        {
          success: false,
          message: "Account number must contain exactly 10 digits.",
        },
        { status: 400 }
      );
    }

    if (!accountName) {
      return NextResponse.json(
        {
          success: false,
          message: "Account name is required.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{11}$/.test(bvn)) {
      return NextResponse.json(
        {
          success: false,
          message: "BVN must contain exactly 11 digits.",
        },
        { status: 400 }
      );
    }

    /* ========================================================
       GUARANTOR VALIDATION
    ======================================================== */

    if (!guarantor1Name) {
      return NextResponse.json(
        {
          success: false,
          message: "First guarantor name is required.",
        },
        { status: 400 }
      );
    }

    if (!guarantor1Phone) {
      return NextResponse.json(
        {
          success: false,
          message: "First guarantor phone number is required.",
        },
        { status: 400 }
      );
    }

    if (!guarantor1Address) {
      return NextResponse.json(
        {
          success: false,
          message: "First guarantor address is required.",
        },
        { status: 400 }
      );
    }

    if (!guarantor2Name) {
      return NextResponse.json(
        {
          success: false,
          message: "Second guarantor name is required.",
        },
        { status: 400 }
      );
    }

    if (!guarantor2Phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Second guarantor phone number is required.",
        },
        { status: 400 }
      );
    }

    if (!guarantor2Address) {
      return NextResponse.json(
        {
          success: false,
          message: "Second guarantor address is required.",
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
          message: "Selected member was not found.",
        },
        { status: 404 }
      );
    }

    /* ========================================================
       CHECK FOR EXISTING ACTIVE APPLICATION
    ======================================================== */

    const [existingRows] = await connection.query(
      `
      SELECT loan_id
      FROM loans
      WHERE member_id = ?
        AND LOWER(COALESCE(loan_status, '')) IN (
          'pending',
          'submitted',
          'forwarded_to_auditor',
          'forwarded_to_manager',
          'forwarded_to_accountant',
          'forwarded_to_admin2',
          'approved',
          'processing',
          'disbursed'
        )
      LIMIT 1
      `,
      [memberId]
    );

    if ((existingRows as any[]).length > 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "This member already has an active loan application or loan.",
        },
        { status: 409 }
      );
    }

    /* ========================================================
       INSERT LOAN APPLICATION
    ======================================================== */

    const [result] = await connection.query(
      `
      INSERT INTO loans (
        member_id,
        loan_amount,
        tenure_month,
        interest_rate,
        loan_type,
        loan_category,
        purpose,
        repayment_source,
        bank_name,
        account_number,
        account_name,
        bvn,
        guarantor1_name,
        guarantor1_phone,
        guarantor1_email,
        guarantor1_address,
        guarantor2_name,
        guarantor2_phone,
        guarantor2_email,
        guarantor2_address,
        loan_status
      )
      VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        'forwarded_to_auditor'
      )
      `,
      [
        memberId,
        loanAmount,
        tenureMonth,
        interestRate,
        loanType,
        loanCategory,
        purpose,
        repaymentSource,
        bankName,
        accountNumber,
        accountName,
        bvn,
        guarantor1Name,
        guarantor1Phone,
        guarantor1Email || null,
        guarantor1Address,
        guarantor2Name,
        guarantor2Phone,
        guarantor2Email || null,
        guarantor2Address,
      ]
    );

    const insertResult = result as {
      insertId: number;
    };

    const loanId = insertResult.insertId;

    /* ========================================================
       COMMIT
    ======================================================== */

    await connection.commit();

    return NextResponse.json(
      {
        success: true,
        message:
          "Loan application submitted successfully and forwarded to the Auditor.",
        loan_id: loanId,
        member_id: memberId,
        member_name: member.full_name,
        loan_status: "forwarded_to_auditor",
      },
      { status: 201 }
    );
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Loan application rollback error:",
          rollbackError
        );
      }
    }

    console.error(
      "POST /api/admin_staff/relationship-officer1/loan-application/submit error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to submit loan application.",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
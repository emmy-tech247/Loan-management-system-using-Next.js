import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function numberValue(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
}

export async function POST(request: NextRequest) {
  let connection: any = null;

  try {
    // ============================================================
    // 1. Read JSON
    // ============================================================

    const body = await request.json();

    const memberId = numberValue(body.member_id);
    const loanAmount = numberValue(body.loan_amount);
    const tenureMonth = numberValue(body.tenure_month);
    const interestRate = numberValue(body.interest_rate);

    const loanType = clean(body.loan_type);
    const loanCategory = clean(body.loan_category);
    const purpose = clean(body.purpose);
    const repaymentSource = clean(body.repayment_source);

    const bankName = clean(body.bank_name);
    const accountNumber = clean(body.account_number);
    const accountName = clean(body.account_name);
    const bvn = clean(body.bvn);

    const guarantor1Name = clean(body.guarantor1_name);
    const guarantor1Phone = clean(body.guarantor1_phone);
    const guarantor1Email = clean(body.guarantor1_email);
    const guarantor1Address = clean(body.guarantor1_address);

    const guarantor2Name = clean(body.guarantor2_name);
    const guarantor2Phone = clean(body.guarantor2_phone);
    const guarantor2Email = clean(body.guarantor2_email);
    const guarantor2Address = clean(body.guarantor2_address);

    // ============================================================
    // 2. Validate member
    // ============================================================

    if (!Number.isInteger(memberId) || memberId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select a valid member.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 3. Validate loan amount
    // ============================================================

    if (!Number.isFinite(loanAmount) || loanAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Loan amount must be greater than zero.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 4. Validate tenure
    // ============================================================

    if (
      !Number.isInteger(tenureMonth) ||
      tenureMonth <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Tenure must be a valid number of months.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 5. Validate interest rate
    // ============================================================

    if (!Number.isFinite(interestRate) || interestRate < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Interest rate must be a valid percentage.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 6. Validate loan type
    // ============================================================

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

    // ============================================================
    // 7. Validate loan category
    // ============================================================

    const allowedCategories = [
      "monthly_saver",
      "borrower",
    ];

    if (!allowedCategories.includes(loanCategory)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid loan category.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 8. Required text fields
    // ============================================================

    if (!purpose) {
      return NextResponse.json(
        {
          success: false,
          message: "Purpose of loan is required.",
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

    // ============================================================
    // 9. Banking validation
    // ============================================================

    if (!bankName) {
      return NextResponse.json(
        {
          success: false,
          message: "Bank name is required.",
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

    // ============================================================
    // 10. Guarantor 1 validation
    // ============================================================

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

    // ============================================================
    // 11. Guarantor 2 validation
    // ============================================================

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

    // ============================================================
    // 12. Get database connection
    // ============================================================

    connection = await db.getConnection();

    await connection.beginTransaction();

    // ============================================================
    // 13. Verify member exists
    // ============================================================

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

    // ============================================================
    // 14. Check for existing active loan
    // ============================================================

    const [existingLoanRows] = await connection.query(
      `
      SELECT
        loan_id,
        loan_status
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
          'processing'
        )
      LIMIT 1
      FOR UPDATE
      `,
      [memberId]
    );

    const existingLoan = (existingLoanRows as any[])[0];

    if (existingLoan) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: `This member already has an active loan application (#${existingLoan.loan_id}).`,
        },
        { status: 409 }
      );
    }

    // ============================================================
    // 15. Insert loan application
    // ============================================================

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
        ?
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
        "forwarded_to_auditor",
      ]
    );

    const loanId = (result as any).insertId;

    // ============================================================
    // 16. Commit
    // ============================================================

    await connection.commit();

    // ============================================================
    // 17. Return response
    // ============================================================

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
  } catch (error: any) {
    if (connection) {
      try {
        await connection.rollback();
      } catch {}
    }

    console.error(
      "POST /api/relationship-officer/loan-application/submit error:",
      error
    );

    // Helpful MySQL error response during development
    if (error?.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        {
          success: false,
          message: "A duplicate loan application was detected.",
        },
        { status: 409 }
      );
    }

    if (error?.code === "ER_NO_SUCH_TABLE") {
      return NextResponse.json(
        {
          success: false,
          message: "The loans or members table does not exist.",
        },
        { status: 500 }
      );
    }

    if (error?.code === "ER_BAD_FIELD_ERROR") {
      return NextResponse.json(
        {
          success: false,
          message:
            "One or more loan application columns do not exist in your database. Check the loans table structure.",
          mysql_error: error.message,
        },
        { status: 500 }
      );
    }

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
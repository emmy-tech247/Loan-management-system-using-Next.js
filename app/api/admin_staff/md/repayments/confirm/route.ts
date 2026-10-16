import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";

/**
 * ============================================================
 * MD FINAL REPAYMENT APPROVAL API
 * ============================================================
 *
 * GET:
 *   Returns loan repayments awaiting MD final approval.
 *
 * POST:
 *   Approves one repayment.
 *   Updates:
 *      - loan_repayments status
 *      - loans.amount_paid
 *      - loans.loan_balance
 *      - loans.loan_status when fully paid
 *
 * Authentication:
 *   MD must be logged in using the admin2Id cookie.
 */

/* ============================================================
   MD AUTHENTICATION
============================================================ */

async function authenticateMD() {
  const cookieStore = await import("next/headers").then((m) =>
    m.cookies()
  );

  const admin2Id = cookieStore.get("admin2Id")?.value;

  if (!admin2Id) {
    return {
      authenticated: false,
      staffId: null,
    };
  }

  const [rows]: any = await db.query(
    `
      SELECT staff_id, full_name, email, role
      FROM staff
      WHERE staff_id = ?
        AND role = 'md'
      LIMIT 1
    `,
    [admin2Id]
  );

  if (!rows || rows.length === 0) {
    return {
      authenticated: false,
      staffId: null,
    };
  }

  return {
    authenticated: true,
    staffId: rows[0].staff_id,
  };
}

/* ============================================================
   GET
   LOAD REPAYMENTS AWAITING FINAL APPROVAL
============================================================ */

export async function GET() {
  try {
    const auth = await authenticateMD();

    if (!auth.authenticated) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. MD login required.",
        },
        { status: 401 }
      );
    }

    /*
     * We use LEFT JOIN so that a repayment can still appear
     * even if member/loan information has an issue.
     *
     * The API returns the exact properties expected by the
     * ConfirmRepaymentsPage component.
     */

    const [rows]: any = await db.query(
      `
        SELECT
          lr.loan_repayments_id,
          lr.member_id,
          lr.loan_id,
          lr.amount_paid,
          lr.receipt_file,

          m.full_name,
          m.email,

          l.loan_amount,
          l.amount_paid AS loan_amount_paid,
          l.loan_balance,
          l.loan_status

        FROM loan_repayments lr

        LEFT JOIN members m
          ON m.member_id = lr.member_id

        LEFT JOIN loans l
          ON l.loan_id = lr.loan_id

        WHERE
          (
            lr.status = 'pending'
            OR lr.status = 'pending_admin2'
            OR lr.status = 'forwarded_to_admin2'
          )

        ORDER BY lr.created_at DESC
      `
    );

    return NextResponse.json(
      {
        success: true,
        data: rows || [],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(
      "GET /api/admin_staff/md/repayments/confirm error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load pending loan repayments.",
        error:
          process.env.NODE_ENV === "development"
            ? error?.message
            : undefined,
      },
      { status: 500 }
    );
  }
}

/* ============================================================
   POST
   APPROVE REPAYMENT
============================================================ */

export async function POST(request: NextRequest) {
  let connection: any = null;

  try {
    /* --------------------------------------------------------
       1. AUTHENTICATE MD
    -------------------------------------------------------- */

    const auth = await authenticateMD();

    if (!auth.authenticated || !auth.staffId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. MD login required.",
        },
        { status: 401 }
      );
    }

    /* --------------------------------------------------------
       2. READ REQUEST
    -------------------------------------------------------- */

    const body = await request.json();

    const approve_id = Number(body?.approve_id);

    if (!approve_id || !Number.isInteger(approve_id)) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid repayment ID is required.",
        },
        { status: 400 }
      );
    }

    /* --------------------------------------------------------
       3. GET A CONNECTION
    -------------------------------------------------------- */

    connection = await db.getConnection();

    await connection.beginTransaction();

    /* --------------------------------------------------------
       4. FIND REPAYMENT
    -------------------------------------------------------- */

    const [repaymentRows]: any = await connection.query(
      `
        SELECT
          loan_repayments_id,
          member_id,
          loan_id,
          amount_paid,
          receipt_file,
          status

        FROM loan_repayments

        WHERE loan_repayments_id = ?

        LIMIT 1

        FOR UPDATE
      `,
      [approve_id]
    );

    if (!repaymentRows || repaymentRows.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Repayment record was not found.",
        },
        { status: 404 }
      );
    }

    const repayment = repaymentRows[0];

    /* --------------------------------------------------------
       5. PREVENT DOUBLE APPROVAL
    -------------------------------------------------------- */

    const currentStatus = String(repayment.status || "").toLowerCase();

    if (
      currentStatus === "approved" ||
      currentStatus === "confirmed" ||
      currentStatus === "completed"
    ) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "This repayment has already been approved.",
        },
        { status: 409 }
      );
    }

    const memberId = Number(repayment.member_id);
    const loanId = Number(repayment.loan_id);
    const repaymentAmount = Number(repayment.amount_paid);

    if (!memberId || !loanId || !repaymentAmount || repaymentAmount <= 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Invalid repayment information.",
        },
        { status: 400 }
      );
    }

    /* --------------------------------------------------------
       6. GET CURRENT LOAN
    -------------------------------------------------------- */

    const [loanRows]: any = await connection.query(
      `
        SELECT
          loan_id,
          member_id,
          loan_amount,
          amount_paid,
          loan_balance,
          loan_status

        FROM loans

        WHERE loan_id = ?
          AND member_id = ?

        LIMIT 1

        FOR UPDATE
      `,
      [loanId, memberId]
    );

    if (!loanRows || loanRows.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "The loan associated with this repayment was not found.",
        },
        { status: 404 }
      );
    }

    const loan = loanRows[0];

    /* --------------------------------------------------------
       7. CALCULATE NEW LOAN TOTALS
    -------------------------------------------------------- */

    const currentAmountPaid = Number(loan.amount_paid || 0);
    const loanAmount = Number(loan.loan_amount || 0);

    let currentBalance =
      loan.loan_balance !== null &&
      loan.loan_balance !== undefined
        ? Number(loan.loan_balance)
        : Math.max(loanAmount - currentAmountPaid, 0);

    const newAmountPaid = currentAmountPaid + repaymentAmount;

    let newLoanBalance = Math.max(
      currentBalance - repaymentAmount,
      0
    );

    /*
     * Protect against floating-point rounding.
     */
    newLoanBalance = Number(newLoanBalance.toFixed(2));

    let newLoanStatus = loan.loan_status;

    /*
     * If the repayment clears the loan, mark it disbursed
     * only if your existing status workflow requires it.
     *
     * Since your loans table does not have a "completed"
     * enum value, we do NOT invent one.
     *
     * We simply keep the existing loan_status.
     */

    /* --------------------------------------------------------
       8. UPDATE REPAYMENT
    -------------------------------------------------------- */

    await connection.query(
      `
        UPDATE loan_repayments

        SET
          status = 'approved',
          confirmed_by = ?,
          confirmed_at = NOW()

        WHERE loan_repayments_id = ?
      `,
      [auth.staffId, approve_id]
    );

    /* --------------------------------------------------------
       9. UPDATE LOAN
    -------------------------------------------------------- */

    await connection.query(
      `
        UPDATE loans

        SET
          amount_paid = ?,
          loan_balance = ?,
          updated_at = NOW()

        WHERE loan_id = ?
          AND member_id = ?
      `,
      [
        newAmountPaid,
        newLoanBalance,
        loanId,
        memberId,
      ]
    );

    /* --------------------------------------------------------
       10. UPDATE MEMBER LOAN INFORMATION
    --------------------------------------------------------
    
       Your members table also contains:
         amount_paid
         loan_balance
         loan_status

       We synchronize these fields with the approved loan.
    */

    await connection.query(
      `
        UPDATE members

        SET
          amount_paid = ?,
          loan_balance = ?,
          loan_status = ?

        WHERE member_id = ?
      `,
      [
        newAmountPaid,
        newLoanBalance,
        newLoanStatus,
        memberId,
      ]
    );

    /* --------------------------------------------------------
       11. COMMIT
    -------------------------------------------------------- */

    await connection.commit();

    return NextResponse.json(
      {
        success: true,
        message: "Loan repayment approved successfully.",
        data: {
          loan_repayments_id: approve_id,
          member_id: memberId,
          loan_id: loanId,
          amount_paid: repaymentAmount,
          new_amount_paid: newAmountPaid,
          new_loan_balance: newLoanBalance,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    /* --------------------------------------------------------
       ROLLBACK IF SOMETHING FAILED
    -------------------------------------------------------- */

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError);
      }
    }

    console.error(
      "POST /api/admin_staff/md/repayments/confirm error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to approve loan repayment.",
        error:
          process.env.NODE_ENV === "development"
            ? error?.message
            : undefined,
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let connection;

  try {
    // ============================================================
    // 1. Check authentication
    // ============================================================

    const cookieStore = await cookies();

    const admin2Id = cookieStore.get("admin2Id")?.value;
    const staffId = cookieStore.get("staff_id")?.value;

    const approvingStaffId = admin2Id || staffId;

    if (!approvingStaffId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login again.",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // 2. Read request body
    // ============================================================

    const body = await request.json();

    const repaymentId = Number(body?.repaymentId);

    if (!repaymentId || !Number.isInteger(repaymentId)) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid repaymentId is required.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 3. Get database connection
    // ============================================================

    connection = await db.getConnection();

    await connection.beginTransaction();

    // ============================================================
    // 4. Lock the repayment row
    // ============================================================

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
      FOR UPDATE
      `,
      [repaymentId]
    );

    if (!repaymentRows || repaymentRows.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Loan repayment not found.",
        },
        { status: 404 }
      );
    }

    const repayment = repaymentRows[0];

    // ============================================================
    // 5. Make sure it is still acknowledged
    // ============================================================

    if (repayment.status !== "acknowledged") {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "This repayment has already been processed and cannot be approved again.",
        },
        { status: 409 }
      );
    }

    const loanId = Number(repayment.loan_id);
    const amountPaid = Number(repayment.amount_paid);

    if (!loanId || !Number.isFinite(amountPaid) || amountPaid <= 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Invalid loan repayment data.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 6. Lock the loan
    // ============================================================

    const [loanRows]: any = await connection.query(
      `
      SELECT
        loan_id,
        loan_balance
      FROM loans
      WHERE loan_id = ?
      FOR UPDATE
      `,
      [loanId]
    );

    if (!loanRows || loanRows.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "The corresponding loan was not found.",
        },
        { status: 404 }
      );
    }

    const loan = loanRows[0];

    const currentBalance = Number(loan.loan_balance);

    if (!Number.isFinite(currentBalance)) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "The current loan balance is invalid.",
        },
        { status: 500 }
      );
    }

    // ============================================================
    // 7. Prevent overpayment
    // ============================================================

    if (amountPaid > currentBalance) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "The repayment amount cannot be greater than the outstanding loan balance.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 8. Calculate new balance
    // ============================================================

    const newBalance = Math.max(
      0,
      currentBalance - amountPaid
    );

    // ============================================================
    // 9. Update loan balance
    // ============================================================

    await connection.query(
      `
      UPDATE loans
      SET loan_balance = ?
      WHERE loan_id = ?
      `,
      [newBalance, loanId]
    );

    // ============================================================
    // 10. Mark repayment as approved
    // ============================================================

    await connection.query(
      `
      UPDATE loan_repayments
      SET
        status = 'approved'
      WHERE
        loan_repayments_id = ?
        AND status = 'acknowledged'
      `,
      [repaymentId]
    );

    // ============================================================
    // 11. If balance reaches zero, mark loan as paid
    // ============================================================

    if (newBalance === 0) {
      await connection.query(
        `
        UPDATE loans
        SET loan_status = 'paid'
        WHERE loan_id = ?
        `,
        [loanId]
      );
    }

    // ============================================================
    // 12. Commit transaction
    // ============================================================

    await connection.commit();

    return NextResponse.json(
      {
        success: true,
        message:
          "Loan repayment approved and balance updated.",
        repaymentId,
        loanId,
        amountPaid,
        previousBalance: currentBalance,
        newBalance,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Approve loan repayment error:",
      error
    );

    // ============================================================
    // Rollback if transaction is active
    // ============================================================

    try {
      if (connection) {
        await connection.rollback();
      }
    } catch (rollbackError) {
      console.error(
        "Rollback error:",
        rollbackError
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to approve the loan repayment.",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================
   JSON ERROR
============================================================ */

function jsonError(message: string, status = 500) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    }
  );
}

/* ============================================================
   POST
   ACCOUNTANT ACKNOWLEDGES LOAN
============================================================ */

export async function POST(request: NextRequest) {
  let connection;

  try {
    /*
     * ========================================================
     * 1. READ REQUEST BODY
     * ========================================================
     */

    let body: { loanId?: number };

    try {
      body = await request.json();
    } catch {
      return jsonError(
        "Invalid JSON request body.",
        400
      );
    }

    const loanId = Number(body.loanId);

    if (!Number.isInteger(loanId) || loanId <= 0) {
      return jsonError(
        "A valid loan ID is required.",
        400
      );
    }

    /*
     * ========================================================
     * 2. GET DATABASE CONNECTION
     * ========================================================
     */

    connection = await db.getConnection();

    /*
     * ========================================================
     * 3. START TRANSACTION
     * ========================================================
     */

    await connection.beginTransaction();

    /*
     * ========================================================
     * 4. FIND LOAN
     * ========================================================
     */

    const [loanRows] = await connection.execute(
      `
      SELECT
        loan_id,
        loan_status,
        accountant_status
      FROM loans
      WHERE loan_id = ?
      LIMIT 1
      `,
      [loanId]
    );

    const loan = (
      loanRows as Array<{
        loan_id: number;
        loan_status: string | null;
        accountant_status: string | null;
      }>
    )[0];

    /*
     * ========================================================
     * LOAN DOES NOT EXIST
     * ========================================================
     */

    if (!loan) {
      await connection.rollback();

      return jsonError(
        "Loan request not found.",
        404
      );
    }

    /*
     * ========================================================
     * 5. PREVENT DUPLICATE ACKNOWLEDGEMENT
     * ========================================================
     */

    if (loan.accountant_status === "acknowledged") {
      await connection.rollback();

      return jsonError(
        "This loan has already been acknowledged.",
        409
      );
    }

    /*
     * ========================================================
     * 6. VERIFY CURRENT STATUS
     * ========================================================
     *
     * Accountant should only acknowledge loans that were
     * forwarded to the accountant.
     */

    if (loan.loan_status !== "forwarded_to_accountant") {
      await connection.rollback();

      return jsonError(
        `This loan cannot be acknowledged because its current status is "${loan.loan_status}".`,
        409
      );
    }

    /*
     * ========================================================
     * 7. UPDATE LOAN
     * ========================================================
     *
     * Accountant acknowledgement:
     *
     * accountant_status
     *        ↓
     * acknowledged
     *
     * loan_status
     *        ↓
     * forwarded_to_admin2
     *
     * This sends the loan to the MD/Admin2 approval queue.
     */

    await connection.execute(
      `
      UPDATE loans
      SET
        accountant_status = ?,
        loan_status = ?
      WHERE loan_id = ?
      `,
      [
        "acknowledged",
        "forwarded_to_admin2",
        loanId,
      ]
    );

    /*
     * ========================================================
     * 8. COMMIT
     * ========================================================
     */

    await connection.commit();

    /*
     * ========================================================
     * 9. SUCCESS RESPONSE
     * ========================================================
     */

    return NextResponse.json(
      {
        success: true,
        message:
          "Loan acknowledged and forwarded to the Managing Director successfully.",

        loan: {
          loan_id: loanId,
          accountant_status: "acknowledged",
          loan_status: "forwarded_to_admin2",
        },
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    /*
     * ========================================================
     * ROLLBACK IF SOMETHING FAILED
     * ========================================================
     */

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
      "POST /api/admin_staff/accountant/loan-requests/acknowledge error:",
      error
    );

    return jsonError(
      "Failed to acknowledge and forward the loan.",
      500
    );
  } finally {
    /*
     * ========================================================
     * RELEASE CONNECTION
     * ========================================================
     */

    if (connection) {
      connection.release();
    }
  }
}
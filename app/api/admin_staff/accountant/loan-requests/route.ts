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
      loans: [],
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
   GET
   LOAD ACCOUNTANT LOAN QUEUE
============================================================ */

export async function GET(request: NextRequest) {
  try {
    /*
     * ========================================================
     * 1. LOAD LOANS
     * ========================================================
     *
     * Only loans forwarded to the accountant are returned.
     *
     * members provides:
     * - full_name
     * - phone_number
     */

    const [rows] = await db.execute(
      `
      SELECT
        l.loan_id,
        l.loan_amount,
        l.tenure_month,
        l.interest_rate,
        l.loan_status,
        l.accountant_status,

        m.member_id,
        m.full_name,
        m.phone_number

      FROM loans AS l

      LEFT JOIN members AS m
        ON CAST(m.member_id AS CHAR) = CAST(l.member_id AS CHAR)

      WHERE l.loan_status = ?
        AND (
          l.accountant_status IS NULL
          OR l.accountant_status <> ?
        )

      ORDER BY l.loan_id DESC
      `,
      [
        "forwarded_to_accountant",
        "acknowledged",
      ]
    );

    /*
     * ========================================================
     * 2. FORMAT RESPONSE
     * ========================================================
     */

    const loans = (
      rows as Array<{
        loan_id: number;
        loan_amount: number | string | null;
        tenure_month: number | null;
        interest_rate: number | string | null;
        loan_status: string | null;
        accountant_status: string | null;

        member_id: number | string | null;
        full_name: string | null;
        phone_number: string | null;
      }>
    ).map((row) => ({
      loan_id: Number(row.loan_id),

      member_id:
        row.member_id !== null
          ? String(row.member_id)
          : null,

      full_name:
        row.full_name || "Unknown Member",

      phone_number:
        row.phone_number || "",

      loan_amount:
        row.loan_amount !== null
          ? Number(row.loan_amount)
          : 0,

      tenure_month:
        row.tenure_month !== null
          ? Number(row.tenure_month)
          : 0,

      interest_rate:
        row.interest_rate !== null
          ? Number(row.interest_rate)
          : 0,

      loan_status:
        row.loan_status || "unknown",

      accountant_status:
        row.accountant_status || "pending",
    }));

    /*
     * ========================================================
     * 3. SUCCESS RESPONSE
     * ========================================================
     */

    return NextResponse.json(
      {
        success: true,
        message: "Accountant loan queue loaded successfully.",
        loans,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "GET /api/admin_staff/accountant/loan-requests error:",
      error
    );

    return jsonError(
      "Unable to load accountant loan requests.",
      500
    );
  }
}

/* ============================================================
   POST
   ACCOUNTANT ACKNOWLEDGES LOAN
============================================================ */

export async function POST(request: NextRequest) {
  let connection: Awaited<
    ReturnType<typeof db.getConnection>
  > | null = null;

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
     * 5. LOAN DOES NOT EXIST
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
     * 6. PREVENT DUPLICATE ACKNOWLEDGEMENT
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
     * 7. VERIFY CURRENT STATUS
     * ========================================================
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
     * 8. UPDATE LOAN
     * ========================================================
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
     * 9. COMMIT
     * ========================================================
     */

    await connection.commit();

    /*
     * ========================================================
     * 10. SUCCESS RESPONSE
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
     * ROLLBACK
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
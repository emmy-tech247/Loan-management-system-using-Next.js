import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================
   JSON ERROR HELPER
============================================================ */

function jsonError(message: string, status = 500) {
  return NextResponse.json(
    {
      success: false,
      message,
      accountantName: "Accountant",
      forwardedLoans: [],
      disbursedLoans: [],
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
   GET ACCOUNTANT DASHBOARD
============================================================ */

export async function GET(request: NextRequest) {
  try {
    /*
     * ========================================================
     * 1. GET ACCOUNTANT NAME
     * ========================================================
     *
     * This assumes the logged-in staff ID is stored in a
     * cookie called "staff_id".
     *
     * If your login system uses another cookie name,
     * change it here.
     */

    const staffIdCookie = request.cookies.get("staff_id")?.value;

    let accountantName = "Accountant";

    if (staffIdCookie) {
      const staffId = Number(staffIdCookie);

      if (Number.isInteger(staffId) && staffId > 0) {
        const [staffRows] = await db.execute(
          `
          SELECT full_name, role
          FROM staff
          WHERE staff_id = ?
          LIMIT 1
          `,
          [staffId]
        );

        const staff = (staffRows as Array<{
          full_name: string | null;
          role: string | null;
        }>)[0];

        if (!staff) {
          return jsonError("Accountant session is invalid.", 401);
        }

        if (staff.role !== "accountant") {
          return jsonError(
            "You are not authorized to access the accountant dashboard.",
            403
          );
        }

        accountantName = staff.full_name || "Accountant";
      }
    }

    /*
     * ========================================================
     * 2. GET LOANS FORWARDED TO ACCOUNTANT
     * ========================================================
     *
     * These are loans whose status is:
     *
     * forwarded_to_accountant
     *
     * The manager has forwarded them for accountant processing.
     */

    const [forwardedRows] = await db.execute(
      `
      SELECT
        l.loan_id,
        l.loan_amount,
        l.tenure_month,
        l.loan_status,
        l.created_at,
        l.disbursed_at,
        m.full_name
      FROM loans l
      LEFT JOIN members m
        ON m.member_id = l.member_id
      WHERE l.loan_status = 'forwarded_to_accountant'
      ORDER BY l.created_at DESC
      `
    );

    /*
     * ========================================================
     * 3. GET DISBURSED LOANS
     * ========================================================
     */

    const [disbursedRows] = await db.execute(
      `
      SELECT
        l.loan_id,
        l.loan_amount,
        l.tenure_month,
        l.loan_status,
        l.created_at,
        l.disbursed_at,
        m.full_name
      FROM loans l
      LEFT JOIN members m
        ON m.member_id = l.member_id
      WHERE l.loan_status = 'disbursed'
      ORDER BY l.disbursed_at DESC, l.loan_id DESC
      `
    );

    /*
     * ========================================================
     * 4. FORMAT RESPONSE
     * ========================================================
     */

    const forwardedLoans = (
      forwardedRows as Array<Record<string, unknown>>
    ).map((loan) => ({
      loan_id: Number(loan.loan_id),
      loan_amount: Number(loan.loan_amount) || 0,
      tenure_month: Number(loan.tenure_month) || 0,
      loan_status: String(loan.loan_status || ""),
      created_at: loan.created_at
        ? new Date(loan.created_at as string | number | Date).toISOString()
        : null,
      disbursed_at: loan.disbursed_at
        ? new Date(
            loan.disbursed_at as string | number | Date
          ).toISOString()
        : null,
      full_name: String(loan.full_name || "Unknown Member"),
    }));

    const disbursedLoans = (
      disbursedRows as Array<Record<string, unknown>>
    ).map((loan) => ({
      loan_id: Number(loan.loan_id),
      loan_amount: Number(loan.loan_amount) || 0,
      tenure_month: Number(loan.tenure_month) || 0,
      loan_status: String(loan.loan_status || ""),
      created_at: loan.created_at
        ? new Date(loan.created_at as string | number | Date).toISOString()
        : null,
      disbursed_at: loan.disbursed_at
        ? new Date(
            loan.disbursed_at as string | number | Date
          ).toISOString()
        : null,
      full_name: String(loan.full_name || "Unknown Member"),
    }));

    /*
     * ========================================================
     * 5. RETURN JSON
     * ========================================================
     */

    return NextResponse.json(
      {
        success: true,
        accountantName,
        forwardedLoans,
        disbursedLoans,
        counts: {
          forwarded: forwardedLoans.length,
          disbursed: disbursedLoans.length,
        },
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "GET /api/admin_staff/accountant/dashboard error:",
      error
    );

    return jsonError(
      "Failed to retrieve accountant dashboard information.",
      500
    );
  }
}
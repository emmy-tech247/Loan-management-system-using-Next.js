import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================
   TYPES
============================================================ */

type LoanRow = {
  loan_id: number;
  full_name: string | null;
  loan_amount: number | string | null;
  tenure_month: number | null;
  loan_status: string | null;
  created_at: string | Date | null;
};

/* ============================================================
   GET - RELATIONSHIP OFFICER 2 DASHBOARD
============================================================ */

export async function GET(request: NextRequest) {
  try {
    /* ========================================================
       1. GET STAFF ID FROM LOGIN COOKIE
    ======================================================== */

    const staffIdCookie = request.cookies.get("staff_id")?.value;

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

    /* ========================================================
       2. VERIFY STAFF ACCOUNT
       
       Your actual staff table is admin_panel.
    ======================================================== */

    const [staffRows] = await db.query(
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

    const staffList = staffRows as Array<{
      staff_id: number;
      full_name: string;
      role: string;
    }>;

    if (staffList.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff account was not found.",
        },
        { status: 401 }
      );
    }

    const staff = staffList[0];

    /* ========================================================
       3. VERIFY ROLE

       This dashboard belongs specifically to
       relationship_officer2.
    ======================================================== */

    if (
      String(staff.role).trim().toLowerCase() !==
      "relationship_officer2"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Access denied. This dashboard is only available to Relationship Officer 2.",
        },
        { status: 403 }
      );
    }

    /* ========================================================
       4. LOAD LOANS ASSIGNED TO THIS OFFICER

       loans.assigned_to is an INT and should contain the
       admin_panel.staff_id of the assigned officer.
    ======================================================== */

    const [loanRows] = await db.query(
      `
        SELECT
          l.loan_id,
          COALESCE(m.full_name, 'Unknown Member') AS full_name,
          l.loan_amount,
          COALESCE(l.tenure_month, l.tenure, 0) AS tenure_month,
          l.loan_status,
          l.created_at
        FROM loans AS l
        LEFT JOIN members AS m
          ON m.member_id = l.member_id
        WHERE l.assigned_to = ?
        ORDER BY l.created_at DESC, l.loan_id DESC
      `,
      [staffId]
    );

    const loans = (loanRows as LoanRow[]).map((loan) => ({
      loan_id: Number(loan.loan_id),

      full_name:
        loan.full_name
          ? String(loan.full_name)
          : "Unknown Member",

      loan_amount:
        loan.loan_amount === null ||
        loan.loan_amount === undefined
          ? 0
          : Number(loan.loan_amount),

      tenure_month:
        loan.tenure_month === null ||
        loan.tenure_month === undefined
          ? 0
          : Number(loan.tenure_month),

      loan_status:
        loan.loan_status
          ? String(loan.loan_status)
          : "submitted",

      created_at:
        loan.created_at instanceof Date
          ? loan.created_at.toISOString()
          : String(
              loan.created_at ??
                new Date().toISOString()
            ),
    }));

    /* ========================================================
       5. RETURN DASHBOARD DATA
    ======================================================== */

    return NextResponse.json(
      {
        success: true,
        fullName:
          staff.full_name ||
          "Relationship Officer 2",
        staffId: Number(staff.staff_id),
        role: staff.role,
        loans,
        count: loans.length,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: unknown) {
    console.error(
      "GET /api/relationship-officer2/dashboard error:",
      error
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : String(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load Relationship Officer 2 dashboard.",
        error: errorMessage,
        loans: [],
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
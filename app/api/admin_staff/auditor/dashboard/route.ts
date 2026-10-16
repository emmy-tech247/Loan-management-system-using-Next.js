import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================
   GET - AUDITOR DASHBOARD
============================================================ */

export async function GET(request: NextRequest) {
  try {
    /* ==========================================================
       1. GET LOGGED-IN STAFF ID
    ========================================================== */

    const staffIdCookie = request.cookies.get("staff_id")?.value;

    if (!staffIdCookie) {
      return NextResponse.json(
        {
          success: false,
          message: "Auditor session not found. Please log in again.",
          auditor: null,
          loans: [],
        },
        { status: 401 }
      );
    }

    const staffId = Number(staffIdCookie);

    if (!Number.isInteger(staffId) || staffId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid auditor session. Please log in again.",
          auditor: null,
          loans: [],
        },
        { status: 401 }
      );
    }

    /* ==========================================================
       2. VERIFY STAFF FROM admin_panel
    ========================================================== */

    const [staffRows] = await db.query(
      `
        SELECT
          staff_id,
          full_name,
          email,
          phone,
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
      email: string;
      phone: string;
      role: string;
    }>;

    const staff = staffList[0];

    if (!staff) {
      return NextResponse.json(
        {
          success: false,
          message: "Auditor account not found. Please log in again.",
          auditor: null,
          loans: [],
        },
        { status: 401 }
      );
    }

    /* ==========================================================
       3. VERIFY AUDITOR ROLE
    ========================================================== */

    if (staff.role !== "auditor") {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. Auditor account required.",
          auditor: null,
          loans: [],
        },
        { status: 403 }
      );
    }

    /* ==========================================================
       4. GET LOANS FORWARDED TO AUDITOR
    ========================================================== */

    const [loanRows] = await db.query(`
      SELECT
        l.loan_id,
        l.member_id,
        l.loan_amount,
        l.tenure_month,
        l.tenure,
        l.loan_status,
        l.purpose,
        l.loan_type,
        l.facility_type,
        l.loan_category,
        l.interest_rate,
        l.assigned_to,
        l.relationship_officer,
        l.created_at,
        l.updated_at,
        m.full_name
      FROM loans l
      LEFT JOIN members m
        ON m.member_id = l.member_id
      WHERE l.loan_status = 'forwarded_to_auditor'
      ORDER BY l.created_at DESC
    `);

    /* ==========================================================
       5. RETURN DASHBOARD DATA
    ========================================================== */

    return NextResponse.json(
      {
        success: true,

        auditor: {
          auditorId: staff.staff_id,
          full_name: staff.full_name,
          email: staff.email,
          role: staff.role,
        },

        loans: loanRows,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error(
      "GET /api/admin_staff/auditor/dashboard error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load auditor dashboard.",
        auditor: null,
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
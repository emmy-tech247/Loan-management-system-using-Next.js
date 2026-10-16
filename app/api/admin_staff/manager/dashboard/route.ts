import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // ============================================================
    // 1. Get logged-in staff ID from session cookie
    // ============================================================

    const staffIdCookie = request.cookies.get("staff_id")?.value;

    if (!staffIdCookie) {
      return NextResponse.json(
        {
          success: false,
          message: "Manager session not found.",
        },
        { status: 401 }
      );
    }

    const managerId = Number(staffIdCookie);

    if (!Number.isInteger(managerId) || managerId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid manager session.",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // 2. Get manager account from admin_panel
    // ============================================================

    const [adminRows] = await db.query(
      `
      SELECT
        staff_id,
        full_name,
        role
      FROM admin_panel
      WHERE staff_id = ?
      LIMIT 1
      `,
      [managerId]
    );

    const manager = (adminRows as any[])[0];

    if (!manager) {
      return NextResponse.json(
        {
          success: false,
          message: "Manager account not found.",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // 3. Confirm the account is a manager
    // ============================================================

    if (manager.role !== "manager") {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. Manager account required.",
        },
        { status: 403 }
      );
    }

    // ============================================================
    // 4. Get loans awaiting manager final approval
    // ============================================================

    const [loanRows] = await db.query(
      `
      SELECT
        l.loan_id,
        l.loan_amount,
        l.tenure_month,
        l.loan_status,
        l.created_at,
        m.full_name
      FROM loans l
      LEFT JOIN members m
        ON m.member_id = l.member_id
      WHERE l.loan_status = 'forwarded_to_manager'
      ORDER BY l.created_at DESC
      `
    );

    // ============================================================
    // 5. Return dashboard data
    // ============================================================

    return NextResponse.json(
      {
        success: true,

        manager: {
          managerId: manager.staff_id,
          full_name: manager.full_name,
        },

        loans: loanRows,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "GET /api/admin_staff/manager/dashboard error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        manager: null,
        loans: [],
        message: "Failed to load manager dashboard.",
      },
      { status: 500 }
    );
  }
}
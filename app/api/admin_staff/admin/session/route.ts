import { NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    /*
     * ============================================================
     * GET LOGGED-IN ADMIN
     * ============================================================
     *
     * This version expects the admin ID to be stored in a cookie
     * called "staff_id".
     *
     * If your login system uses another cookie name, change it
     * below.
     */

    const cookieStore = await import("next/headers").then(
      (mod) => mod.cookies()
    );

    const staffId = cookieStore.get("staff_id")?.value;

    if (!staffId) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin session not found.",
        },
        { status: 401 }
      );
    }

    const numericStaffId = Number(staffId);

    if (!Number.isInteger(numericStaffId) || numericStaffId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid staff session.",
        },
        { status: 401 }
      );
    }

    /*
     * ============================================================
     * FIND STAFF
     * ============================================================
     */

    const [rows] = await db.query(
      `
      SELECT
        staff_id,
        full_name,
        email,
        phone,
        role
      FROM staff
      WHERE staff_id = ?
      LIMIT 1
      `,
      [numericStaffId]
    );

    const staff = Array.isArray(rows) ? rows[0] : null;

    if (!staff) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin account not found.",
        },
        { status: 404 }
      );
    }

    /*
     * ============================================================
     * SECURITY CHECK
     * ============================================================
     *
     * Only allow admin-type accounts to access this dashboard.
     */

    const allowedRoles = ["admin", "md"];

    if (
      !allowedRoles.includes(
        String((staff as any).role || "").toLowerCase()
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to access this dashboard.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        staff_id: (staff as any).staff_id,
        full_name: (staff as any).full_name,
        email: (staff as any).email,
        phone: (staff as any).phone,
        role: (staff as any).role,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "GET /api/admin_staff/admin/session error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load admin session.",
      },
      { status: 500 }
    );
  }
}
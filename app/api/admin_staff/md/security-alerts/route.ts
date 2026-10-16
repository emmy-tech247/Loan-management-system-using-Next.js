// app/api/admin_staff/md/security-alerts/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

export const runtime = "nodejs";

// ============================================================
// GET SECURITY ALERTS
// GET /api/admin_staff/md/security-alerts
// ============================================================
export async function GET(request: NextRequest) {
  try {
    // ----------------------------------------------------------
    // 1. Get logged-in MD from cookie
    // ----------------------------------------------------------
    const cookieStore = await cookies();

    const admin2Id =
      cookieStore.get("admin2Id")?.value ||
      cookieStore.get("staff_id")?.value;

    if (!admin2Id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in again.",
        },
        { status: 401 }
      );
    }

    const staffId = Number(admin2Id);

    if (!Number.isInteger(staffId) || staffId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid staff session.",
        },
        { status: 401 }
      );
    }

    // ----------------------------------------------------------
    // 2. Verify that the logged-in staff is the MD
    // ----------------------------------------------------------
    const [staffRows] = await db.execute(
      `
      SELECT staff_id, full_name, email, role
      FROM staff
      WHERE staff_id = ?
      LIMIT 1
      `,
      [staffId]
    );

    const staff = (staffRows as any[])[0];

    if (!staff) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff account not found.",
        },
        { status: 401 }
      );
    }

    if (staff.role !== "md") {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. Only the Managing Director can view security alerts.",
        },
        { status: 403 }
      );
    }

    // ----------------------------------------------------------
    // 3. Get failed login attempts
    //
    // IMPORTANT:
    // This assumes:
    //
    // login_attempts
    //   id
    //   email
    //   ip_address
    //   attempt_time
    //   success
    //
    // ----------------------------------------------------------
    const [loginRows] = await db.execute(
      `
      SELECT
        id,
        email,
        ip_address,
        attempt_time,
        success
      FROM login_attempts
      WHERE success = 0
        AND email IN (
          SELECT email
          FROM login_attempts
          WHERE success = 0
          GROUP BY email
          HAVING COUNT(*) >= 5
        )
      ORDER BY attempt_time DESC
      `,
    );

    // ----------------------------------------------------------
    // 4. Get password reset requests
    //
    // Assumes:
    //
    // password_resets
    //   id
    //   email
    //   request_time
    //
    // ----------------------------------------------------------
    const [resetRows] = await db.execute(
      `
      SELECT
        id,
        email,
        request_time
      FROM password_resets
      ORDER BY request_time DESC
      `,
    );

    // ----------------------------------------------------------
    // 5. Return data
    // ----------------------------------------------------------
    return NextResponse.json(
      {
        success: true,
        failedLogins: loginRows,
        passwordResets: resetRows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Security alerts API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve security monitoring data.",
      },
      { status: 500 }
    );
  }
}
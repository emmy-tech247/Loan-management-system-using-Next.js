// app/api/admin_staff/logs/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    // ============================================================
    // 1. AUTHENTICATION
    // ============================================================

    const cookieStore = await cookies();

    const admin2Id = cookieStore.get("admin2Id")?.value;
    const staffId = cookieStore.get("staff_id")?.value;

    const currentStaffId = admin2Id || staffId;

    if (!currentStaffId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login.",
        },
        { status: 401 }
      );
    }

    const parsedStaffId = Number(currentStaffId);

    if (!Number.isInteger(parsedStaffId) || parsedStaffId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid staff session.",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // 2. VERIFY THAT USER IS MD
    // ============================================================

    const [staffRows] = await db.execute(
      `
        SELECT staff_id, full_name, role
        FROM staff
        WHERE staff_id = ?
        LIMIT 1
      `,
      [parsedStaffId]
    );

    const staff = staffRows as Array<{
      staff_id: number;
      full_name: string;
      role: string;
    }>;

    if (staff.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff account not found.",
        },
        { status: 401 }
      );
    }

    if (staff[0].role !== "md") {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. MD authorization required.",
        },
        { status: 403 }
      );
    }

    // ============================================================
    // 3. GET DATE FILTERS
    // ============================================================

    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get("start_date")?.trim() || "";
    const endDate = searchParams.get("end_date")?.trim() || "";

    // ============================================================
    // 4. VALIDATE DATE FORMAT
    // ============================================================

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (startDate && !dateRegex.test(startDate)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid start_date format. Use YYYY-MM-DD.",
        },
        { status: 400 }
      );
    }

    if (endDate && !dateRegex.test(endDate)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid end_date format. Use YYYY-MM-DD.",
        },
        { status: 400 }
      );
    }

    if (startDate && endDate && startDate > endDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Start date cannot be later than end date.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 5. AUTOMATICALLY DELETE LOGS OLDER THAN 3 MONTHS
    // ============================================================

    try {
      await db.execute(
        `
          DELETE FROM admin1_activity_logs
          WHERE created_at < DATE_SUB(NOW(), INTERVAL 3 MONTH)
        `
      );
    } catch (cleanupError) {
      // Do not stop the request if cleanup fails.
      console.error(
        "Unable to clean old admin activity logs:",
        cleanupError
      );
    }

    // ============================================================
    // 6. BUILD QUERY
    // ============================================================

    let sql = `
      SELECT
        log_id,
        user_id,
        role,
        action,
        ip_address,
        created_at
      FROM admin1_activity_logs
      WHERE 1 = 1
    `;

    const values: string[] = [];

    // Start date
    if (startDate) {
      sql += `
        AND created_at >= ?
      `;

      values.push(`${startDate} 00:00:00`);
    }

    // End date
    if (endDate) {
      sql += `
        AND created_at < DATE_ADD(?, INTERVAL 1 DAY)
      `;

      values.push(endDate);
    }

    // Newest records first
    sql += `
      ORDER BY created_at DESC, log_id DESC
      LIMIT 1000
    `;

    // ============================================================
    // 7. EXECUTE QUERY
    // ============================================================

    const [rows] = await db.execute(sql, values);

    // ============================================================
    // 8. FORMAT RESPONSE
    // ============================================================

    const logs = (
      rows as Array<{
        log_id: number;
        user_id: number;
        role: string;
        action: string;
        ip_address: string | null;
        created_at: Date | string;
      }>
    ).map((row) => ({
      log_id: Number(row.log_id),
      user_id: Number(row.user_id),
      role: row.role || "",
      action: row.action || "",
      ip_address: row.ip_address || "Unknown",
      created_at:
        row.created_at instanceof Date
          ? row.created_at.toISOString().replace("T", " ").slice(0, 19)
          : String(row.created_at),
    }));

    return NextResponse.json({
      success: true,
      data: logs,
      count: logs.length,
      filters: {
        start_date: startDate || null,
        end_date: endDate || null,
      },
    });
  } catch (error) {
    console.error("Admin activity logs API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve activity logs.",
      },
      { status: 500 }
    );
  }
}
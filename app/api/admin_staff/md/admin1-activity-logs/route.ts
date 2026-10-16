import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  let connection;

  try {
    // ============================================================
    // 1. Read query parameters
    // ============================================================

    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get("start_date")?.trim() || "";
    const endDate = searchParams.get("end_date")?.trim() || "";

    // ============================================================
    // 2. Validate date range
    // ============================================================

    if ((startDate && !endDate) || (!startDate && endDate)) {
      return NextResponse.json(
        {
          success: false,
          message: "Both start_date and end_date are required.",
          logs: [],
        },
        { status: 400 }
      );
    }

    if (startDate && endDate && startDate > endDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Start date cannot be after end date.",
          logs: [],
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 3. Validate date format
    // ============================================================

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (startDate && !dateRegex.test(startDate)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid start date format.",
          logs: [],
        },
        { status: 400 }
      );
    }

    if (endDate && !dateRegex.test(endDate)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid end date format.",
          logs: [],
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 4. Get database connection
    // ============================================================

    connection = await db.getConnection();

    // ============================================================
    // 5. Build query
    // ============================================================

    let sql = `
      SELECT
        id AS log_id,
        user_id,
        role,
        activity AS action,
        COALESCE(ip_address, '') AS ip_address,
        created_at
      FROM full_activity_logs
      WHERE 1 = 1
    `;

    const params: (string | number)[] = [];

    // ============================================================
    // 6. Restrict records to Admin1
    // ============================================================
    //
    // Change "admin1" below if your database stores the role
    // differently, for example "admin".
    //
    // ============================================================

    sql += `
      AND LOWER(role) = LOWER(?)
    `;

    params.push("admin1");

    // ============================================================
    // 7. Date filtering
    // ============================================================

    if (startDate && endDate) {
      sql += `
        AND created_at >= ?
        AND created_at < DATE_ADD(?, INTERVAL 1 DAY)
      `;

      params.push(startDate);
      params.push(endDate);
    }

    // ============================================================
    // 8. Latest records first
    // ============================================================

    sql += `
      ORDER BY created_at DESC, id DESC
    `;

    // ============================================================
    // 9. Execute query
    // ============================================================

    const [rows] = await connection.execute(sql, params);

    // ============================================================
    // 10. Return response
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        logs: rows,
        total: Array.isArray(rows) ? rows.length : 0,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error) {
    console.error(
      "GET /api/admin_staff/admin1-activity-logs error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load Admin1 activity logs.",
        logs: [],
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
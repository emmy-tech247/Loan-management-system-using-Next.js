import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FilterType = "daily" | "monthly" | "quarterly";

export async function GET(request: NextRequest) {
  let connection;

  try {
    // ============================================================
    // 1. Get filter
    // ============================================================

    const { searchParams } = new URL(request.url);

    const filter = searchParams.get("filter") as FilterType | null;

    const selectedFilter: FilterType =
      filter === "monthly" || filter === "quarterly"
        ? filter
        : "daily";

    // ============================================================
    // 2. Get database connection
    // ============================================================

    connection = await db.getConnection();

    // ============================================================
    // 3. Automatically remove logs older than 3 months
    // ============================================================

    await connection.execute(`
      DELETE FROM full_activity_logs
      WHERE created_at < DATE_SUB(NOW(), INTERVAL 3 MONTH)
    `);

    // ============================================================
    // 4. Build date filter
    // ============================================================

    let dateCondition = "";

    switch (selectedFilter) {
      case "daily":
        dateCondition = `
          created_at >= CURDATE()
          AND created_at < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
        `;
        break;

      case "monthly":
        dateCondition = `
          created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
          AND created_at < DATE_ADD(
            DATE_FORMAT(CURDATE(), '%Y-%m-01'),
            INTERVAL 1 MONTH
          )
        `;
        break;

      case "quarterly":
        dateCondition = `
          created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
        `;
        break;

      default:
        dateCondition = `
          created_at >= CURDATE()
          AND created_at < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
        `;
    }

    // ============================================================
    // 5. Fetch activity logs
    // ============================================================

    const [rows] = await connection.execute(
      `
        SELECT
          id,
          user_id,
          role,
          activity,
          ip_address,
          created_at
        FROM full_activity_logs
        WHERE ${dateCondition}
        ORDER BY created_at DESC, id DESC
      `
    );

    // ============================================================
    // 6. Return JSON
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        filter: selectedFilter,
        logs: rows,
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
      "GET /api/admin_staff/md/activity-logs error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load activity logs.",
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
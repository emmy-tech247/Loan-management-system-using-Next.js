import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  let connection;

  try {
    connection = await db.getConnection();

    // ============================================================
    // 1. LOAN SUMMARY
    // ============================================================

    const [loanRows]: any = await connection.execute(`
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(loan_amount), 0) AS amount
      FROM loans
    `);

    // ============================================================
    // 2. SAVINGS SUMMARY
    // ============================================================

    const [savingsRows]: any = await connection.execute(`
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(amount), 0) AS amount
      FROM savings
    `);

    // ============================================================
    // 3. RECENT SYSTEM LOGS
    // ============================================================

    const [logRows]: any = await connection.execute(`
      SELECT
        l.member_id,
        ap.email AS username,
        ap.role,
        l.action,
        l.created_at
      FROM logs l
      LEFT JOIN admin_panel ap
        ON ap.staff_id = l.member_id
      ORDER BY l.created_at DESC
      LIMIT 20
    `);

    // ============================================================
    // 4. ACTIVITY GROUPED BY ROLE
    // ============================================================

    const [roleRows]: any = await connection.execute(`
      SELECT
        ap.role,
        COUNT(*) AS actions
      FROM logs l
      LEFT JOIN admin_panel ap
        ON ap.staff_id = l.member_id
      WHERE ap.role IS NOT NULL
        AND ap.role <> ''
      GROUP BY ap.role
      ORDER BY actions DESC
    `);

    // ============================================================
    // 5. RETURN DATA
    // ============================================================

    return NextResponse.json(
      {
        success: true,

        loans: {
          total: Number(loanRows?.[0]?.total || 0),
          amount: Number(loanRows?.[0]?.amount || 0),
        },

        savings: {
          total: Number(savingsRows?.[0]?.total || 0),
          amount: Number(savingsRows?.[0]?.amount || 0),
        },

        logs: Array.isArray(logRows)
          ? logRows.map((log: any) => ({
              member_id: log.member_id,
              username: log.username || "Unknown User",
              role: log.role || "Unknown",
              action: log.action || "—",
              created_at: log.created_at,
            }))
          : [],

        roleActivities: Array.isArray(roleRows)
          ? roleRows.map((row: any) => ({
              role: row.role || "Unknown",
              actions: Number(row.actions || 0),
            }))
          : [],
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error(
      "GET /api/admin_staff/md/backup-recovery error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load backup and recovery data.",

        loans: {
          total: 0,
          amount: 0,
        },

        savings: {
          total: 0,
          amount: 0,
        },

        logs: [],
        roleActivities: [],
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
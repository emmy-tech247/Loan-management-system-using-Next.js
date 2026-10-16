import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin_staff/md/badges
 *
 * Returns notification counts for the Managing Director dashboard.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();

    // Support the session names used by the MD pages
    const admin2Id = cookieStore.get("admin2Id")?.value;
    const staffId = cookieStore.get("staff_id")?.value;

    if (!admin2Id && !staffId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // 1. Confirm Top-up Savings
    // ============================================================
    const [topupRows] = await db.query(
      `
      SELECT COUNT(*) AS count
      FROM savings_transactions
      WHERE type = 'deposit'
        AND status = 'acknowledged'
      `
    );

    // ============================================================
    // 2. Confirm Accountant Transactions
    // ============================================================
    const [transactionRows] = await db.query(
      `
      SELECT COUNT(*) AS count
      FROM transactions
      WHERE status = 'pending_admin2'
      `
    );

    // ============================================================
    // 3. Confirm Fixed Deposits
    // ============================================================
    const [fixedDepositRows] = await db.query(
      `
      SELECT COUNT(*) AS count
      FROM approvals
      WHERE status = 'acknowledged'
      `
    );

    // ============================================================
    // 4. Pending Withdrawals
    //
    // Based on your MD withdrawal workflow:
    // type = withdrawal
    // status = acknowledged
    // ============================================================
    const [withdrawalRows] = await db.query(
      `
      SELECT COUNT(*) AS count
      FROM savings_transactions
      WHERE type = 'withdrawal'
        AND status = 'acknowledged'
      `
    );

    // ============================================================
    // 5. Unread Member Messages
    // ============================================================
    const [messageRows] = await db.query(
      `
      SELECT COUNT(*) AS count
      FROM messages
      WHERE is_read = 0
        AND receiver_type = 'admin'
      `
    );

    // ============================================================
    // Convert database COUNT values to JavaScript numbers
    // ============================================================

    const topups =
      Number((topupRows as { count: number }[])[0]?.count) || 0;

    const transactions =
      Number((transactionRows as { count: number }[])[0]?.count) || 0;

    const fixedDeposits =
      Number((fixedDepositRows as { count: number }[])[0]?.count) || 0;

    const withdrawals =
      Number((withdrawalRows as { count: number }[])[0]?.count) || 0;

    const messages =
      Number((messageRows as { count: number }[])[0]?.count) || 0;

    // ============================================================
    // Return badge counts
    // ============================================================

    return NextResponse.json({
      success: true,

      // Main names
      confirm_topups: topups,
      confirm_transactions: transactions,
      confirm_fixed_deposits: fixedDeposits,
      withdrawals,
      messages,

      // Common alternative names that can be used by adminActions
      topups,
      pending_transactions: transactions,
      fixed_deposits: fixedDeposits,
      pending_withdrawals: withdrawals,
      unread_messages: messages,
    });
  } catch (error) {
    console.error("MD badges API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load notification counts",
      },
      { status: 500 }
    );
  }
}
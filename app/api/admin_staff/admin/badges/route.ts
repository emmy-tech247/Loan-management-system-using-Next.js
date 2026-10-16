import { NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    /*
     * ============================================================
     * 1. PENDING DEPOSITS
     * ============================================================
     */

    let deposits = 0;

    try {
      const [rows] = await db.query(`
        SELECT COUNT(*) AS total
        FROM monthly_savings
        WHERE LOWER(status) = 'pending'
      `);

      deposits = Number((rows as any[])[0]?.total || 0);
    } catch (error) {
      console.error("Badge error - deposits:", error);
    }

    /*
     * ============================================================
     * 2. PENDING FIXED DEPOSITS
     * ============================================================
     */

    let fixedDeposits = 0;

    try {
      const [rows] = await db.query(`
        SELECT COUNT(*) AS total
        FROM fd_actions
        WHERE LOWER(status) = 'pending'
      `);

      fixedDeposits = Number((rows as any[])[0]?.total || 0);
    } catch (error) {
      console.error(
        "Badge error - fixed deposits:",
        error
      );
    }

    /*
     * ============================================================
     * 3. PENDING TOP-UPS
     * ============================================================
     */

    let topups = 0;

    try {
      const [rows] = await db.query(`
        SELECT COUNT(*) AS total
        FROM monthly_savings
        WHERE LOWER(status) = 'pending'
      `);

      topups = Number((rows as any[])[0]?.total || 0);
    } catch (error) {
      console.error("Badge error - topups:", error);
    }

    /*
     * ============================================================
     * 4. PENDING WITHDRAWALS
     * ============================================================
     */

    let withdrawals = 0;

    try {
      const [rows] = await db.query(`
        SELECT COUNT(*) AS total
        FROM withdrawals
        WHERE LOWER(status) IN (
          'pending',
          'pending_acknowledgement',
          'pending_acknowledgment',
          'approved'
        )
      `);

      withdrawals = Number((rows as any[])[0]?.total || 0);
    } catch (error) {
      console.error(
        "Badge error - withdrawals:",
        error
      );
    }

    /*
     * ============================================================
     * 5. PENDING REPAYMENTS
     * ============================================================
     *
     * This assumes loan repayment records are stored in
     * savings_transactions.
     *
     * If your repayment table is different, change this query.
     */

    let repayment = 0;

    try {
      const [rows] = await db.query(`
        SELECT COUNT(*) AS total
        FROM savings_transactions
        WHERE LOWER(type) = 'loan_repayment'
          AND LOWER(status) IN (
            'pending',
            'pending_verification'
          )
      `);

      repayment = Number((rows as any[])[0]?.total || 0);
    } catch (error) {
      console.error(
        "Badge error - repayment:",
        error
      );
    }

    /*
     * ============================================================
     * 6. PENDING DOCUMENTS
     * ============================================================
     *
     * Only run this if your documents table exists.
     */

    let documents = 0;

    try {
      const [rows] = await db.query(`
        SELECT COUNT(*) AS total
        FROM documents
        WHERE LOWER(status) = 'pending'
      `);

      documents = Number((rows as any[])[0]?.total || 0);
    } catch (error) {
      console.error(
        "Badge error - documents:",
        error
      );
    }

    /*
     * ============================================================
     * 7. PENDING SIGNATURES
     * ============================================================
     */

    let signatures = 0;

    try {
      const [rows] = await db.query(`
        SELECT COUNT(*) AS total
        FROM approvals
        WHERE LOWER(status) = 'pending'
      `);

      signatures = Number((rows as any[])[0]?.total || 0);
    } catch (error) {
      console.error(
        "Badge error - signatures:",
        error
      );
    }

    /*
     * ============================================================
     * 8. FIXED DEPOSIT WITHDRAWALS
     * ============================================================
     */

    let fdWithdrawal = 0;

    try {
      const [rows] = await db.query(`
        SELECT COUNT(*) AS total
        FROM fd_withdrawals
        WHERE LOWER(status) IN (
          'pending',
          'pending_acknowledgement',
          'pending_acknowledgment',
          'approved'
        )
      `);

      fdWithdrawal = Number((rows as any[])[0]?.total || 0);
    } catch (error) {
      console.error(
        "Badge error - FD withdrawal:",
        error
      );
    }

    /*
     * ============================================================
     * 9. UNREAD MEMBER CHATS
     * ============================================================
     */

    let chat = 0;

    try {
      const [rows] = await db.query(`
        SELECT COUNT(*) AS total
        FROM messages
        WHERE is_read = 0
          AND sender_type = 'member'
      `);

      chat = Number((rows as any[])[0]?.total || 0);
    } catch (error) {
      console.error(
        "Badge error - chat:",
        error
      );
    }

    /*
     * ============================================================
     * 10. RETURN BADGES
     * ============================================================
     *
     * The keys MUST match the IDs in adminActions.
     */

    return NextResponse.json(
      {
        members: 0,

        deposits,

        reports: 0,

        announcements: 0,

        backup: 0,

        "fixed-deposits": fixedDeposits,

        topups,

        documents,

        withdrawals,

        repayment,

        signatures,

        chat,

        "fd-withdrawal": fdWithdrawal,

        transactions: 0,

        "loan-report": 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "GET /api/admin_staff/admin/badges error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load dashboard badges.",
      },
      { status: 500 }
    );
  }
}
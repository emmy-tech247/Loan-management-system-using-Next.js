import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    /*
     * Replace this with your actual Next.js authentication/session
     * implementation.
     *
     * The important point is:
     * NEVER accept member_id directly from the browser.
     */
    const memberId = request.cookies.get("member_id")?.value;

    if (!memberId) {
      return NextResponse.json(
        {
          error: "Unauthorized. Please log in.",
        },
        {
          status: 401,
        }
      );
    }

    const member_id = Number(memberId);

    if (!Number.isInteger(member_id) || member_id <= 0) {
      return NextResponse.json(
        {
          error: "Invalid member session.",
        },
        {
          status: 401,
        }
      );
    }

    // ============================================================
    // FETCH RECENT TRANSACTIONS
    // ============================================================

    const [transactionRows]: any = await db.execute(
      `
      SELECT
        saved_id,
        amount_saved,
        type,
        reference,
        status,
        created_at
      FROM savings_transactions
      WHERE member_id = ?
      ORDER BY created_at DESC
      LIMIT 10
      `,
      [member_id]
    );

    // ============================================================
    // FETCH SUMMARY
    // ============================================================

    const [summaryRows]: any = await db.execute(
      `
      SELECT

        COALESCE(
          SUM(
            CASE
              WHEN type = 'deposit'
              AND status = 'approved'
              THEN amount_saved
              ELSE 0
            END
          ),
          0
        ) AS total_deposits,

        COALESCE(
          SUM(
            CASE
              WHEN type = 'withdrawal'
              AND status = 'approved'
              THEN amount_saved
              ELSE 0
            END
          ),
          0
        ) AS total_withdrawals

      FROM savings_transactions
      WHERE member_id = ?
      `,
      [member_id]
    );

    const totalDeposits = Number(
      summaryRows?.[0]?.total_deposits || 0
    );

    const totalWithdrawals = Number(
      summaryRows?.[0]?.total_withdrawals || 0
    );

    const netBalance =
      totalDeposits - totalWithdrawals;

    return NextResponse.json({
      transactions: transactionRows || [],

      summary: {
        total_deposits: totalDeposits,
        total_withdrawals: totalWithdrawals,
        net_balance: netBalance,
      },
    });
  } catch (error) {
    console.error(
      "Savings transactions API error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load savings transactions.",
      },
      {
        status: 500,
      }
    );
  }
}
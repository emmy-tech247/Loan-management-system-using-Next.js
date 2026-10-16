import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    /*
     * Get logged-in member.
     *
     * This assumes your authentication system stores the
     * member ID in a cookie/session that can be read here.
     *
     * Replace this section with your existing authentication
     * helper if you already have one.
     */

    const memberIdCookie = request.cookies.get("member_id")?.value;

    if (!memberIdCookie) {
      return NextResponse.json(
        {
          message: "Unauthorized. Please log in.",
        },
        {
          status: 401,
        }
      );
    }

    const memberId = Number(memberIdCookie);

    if (!Number.isInteger(memberId) || memberId <= 0) {
      return NextResponse.json(
        {
          message: "Invalid member session.",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const amount = Number(body.amount);
    const reason = String(body.reason || "").trim();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        {
          message: "Please enter a valid withdrawal amount.",
        },
        {
          status: 400,
        }
      );
    }

    if (!reason) {
      return NextResponse.json(
        {
          message: "Please provide a reason for the withdrawal.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Calculate available balance.
     *
     * Approved deposits
     * MINUS
     * pending + approved withdrawals
     */

    const [balanceRows]: any = await db.execute(
      `
      SELECT
        (
          SELECT IFNULL(SUM(amount_saved), 0)
          FROM savings_transactions
          WHERE member_id = ?
            AND type = 'deposit'
            AND status = 'approved'
        )
        -
        (
          SELECT IFNULL(SUM(amount_saved), 0)
          FROM savings_transactions
          WHERE member_id = ?
            AND type = 'withdrawal'
            AND status IN ('pending', 'approved')
        ) AS balance
      `,
      [memberId, memberId]
    );

    const balance = Number(balanceRows?.[0]?.balance || 0);

    /*
     * Check available balance
     */

    if (amount > balance) {
      return NextResponse.json(
        {
          message: `Insufficient funds. Your available balance is ₦${balance.toLocaleString(
            "en-NG",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )}.`,
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Generate withdrawal reference
     */

    const reference =
      "wd_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).substring(2, 10);

    /*
     * Insert withdrawal request
     */

    await db.execute(
      `
      INSERT INTO savings_transactions
      (
        member_id,
        type,
        amount_saved,
        reference,
        reason,
        status
      )
      VALUES (?, 'withdrawal', ?, ?, ?, 'pending')
      `,
      [
        memberId,
        amount,
        reference,
        reason,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Withdrawal request submitted.",
        reference,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Withdrawal API error:", error);

    return NextResponse.json(
      {
        message: "Error submitting withdrawal request.",
      },
      {
        status: 500,
      }
    );
  }
}
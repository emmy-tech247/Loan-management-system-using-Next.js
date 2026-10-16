import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let connection;

  try {
    const body = await request.json();

    const savedId = Number(body?.saved_id);

    if (!Number.isInteger(savedId) || savedId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid withdrawal ID.",
        },
        { status: 400 }
      );
    }

    /*
     * Get the MD/staff ID from the request.
     *
     * This assumes your staff authentication stores staff_id
     * in a cookie named "staff_id".
     */
    const staffIdCookie = request.cookies.get("staff_id")?.value;

    const staffId = staffIdCookie
      ? Number(staffIdCookie)
      : null;

    if (!staffId || !Number.isInteger(staffId) || staffId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "MD authentication required.",
        },
        { status: 401 }
      );
    }

    connection = await db.getConnection();

    await connection.beginTransaction();

    // ============================================================
    // 1. Get the pending withdrawal
    // ============================================================

    const [withdrawalRows]: any = await connection.execute(
      `
      SELECT
        saved_id,
        member_id,
        amount_saved,
        reason,
        status,
        type
      FROM savings_transactions
      WHERE saved_id = ?
        AND type = 'withdrawal'
      FOR UPDATE
      `,
      [savedId]
    );

    if (!withdrawalRows || withdrawalRows.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Withdrawal request was not found.",
        },
        { status: 404 }
      );
    }

    const withdrawal = withdrawalRows[0];

    // ============================================================
    // 2. Make sure it is still awaiting MD approval
    // ============================================================

    if (withdrawal.status !== "acknowledged") {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "This withdrawal has already been processed or is no longer awaiting MD approval.",
        },
        { status: 409 }
      );
    }

    const memberId = Number(withdrawal.member_id);
    const withdrawalAmount = Number(withdrawal.amount_saved);

    if (!memberId || !Number.isFinite(withdrawalAmount)) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Invalid withdrawal information.",
        },
        { status: 400 }
      );
    }

    if (withdrawalAmount <= 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Withdrawal amount must be greater than zero.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 3. Calculate member's approved savings balance
    // ============================================================

    const [balanceRows]: any = await connection.execute(
      `
      SELECT
        COALESCE(
          SUM(
            CASE
              WHEN type != 'withdrawal'
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
      [memberId]
    );

    const totalDeposits = Number(
      balanceRows?.[0]?.total_deposits || 0
    );

    const totalWithdrawals = Number(
      balanceRows?.[0]?.total_withdrawals || 0
    );

    const availableBalance =
      totalDeposits - totalWithdrawals;

    // ============================================================
    // 4. Prevent overdrawing
    // ============================================================

    if (withdrawalAmount > availableBalance) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: `Insufficient savings balance. Available balance is ₦${availableBalance.toLocaleString(
            "en-NG",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )}.`,
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 5. Approve the withdrawal
    // ============================================================

    await connection.execute(
      `
      UPDATE savings_transactions
      SET
        status = 'approved',
        approved_by = ?,
        approved_at = NOW()
      WHERE saved_id = ?
        AND type = 'withdrawal'
        AND status = 'acknowledged'
      `,
      [staffId, savedId]
    );

    // ============================================================
    // 6. Commit
    // ============================================================

    await connection.commit();

    return NextResponse.json(
      {
        success: true,
        message: "Withdrawal approved successfully.",
        withdrawal: {
          saved_id: savedId,
          member_id: memberId,
          amount: withdrawalAmount,
          previous_balance: availableBalance,
          remaining_balance:
            availableBalance - withdrawalAmount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError);
      }
    }

    console.error(
      "POST /api/admin_staff/md/approve-withdrawals/approve error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to approve withdrawal.",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
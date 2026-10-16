import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WithdrawalRow = {
  withdrawal_id: number;
  member_id: number;
  amount: number | string | null;
  reason: string | null;
  requested_at: string | Date | null;
  status: string | null;
};

export async function POST(request: NextRequest) {
  let connection:
    | Awaited<ReturnType<typeof db.getConnection>>
    | null = null;

  try {
    // ============================================================
    // Read request body
    // ============================================================
    const body = await request.json();

    const savedId = Number(body?.saved_id);

    if (!Number.isInteger(savedId) || savedId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid withdrawal request ID.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // Get database connection
    // ============================================================
    connection = await db.getConnection();

    await connection.beginTransaction();

    // ============================================================
    // Get and lock the withdrawal
    // ============================================================
    const [rows] = await connection.query(
      `
        SELECT
          withdrawal_id,
          member_id,
          amount,
          reason,
          requested_at,
          status
        FROM withdrawals
        WHERE withdrawal_id = ?
        LIMIT 1
        FOR UPDATE
      `,
      [savedId]
    );

    const withdrawalRows = rows as WithdrawalRow[];

    // ============================================================
    // Withdrawal not found
    // ============================================================
    if (withdrawalRows.length === 0) {
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

    const currentStatus = String(
      withdrawal.status ?? ""
    )
      .trim()
      .toLowerCase();

    // ============================================================
    // Prevent duplicate acknowledgement
    // ============================================================
    if (currentStatus === "acknowledged") {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "This withdrawal has already been acknowledged.",
        },
        { status: 409 }
      );
    }

    // ============================================================
    // Rejected withdrawals cannot be acknowledged
    // ============================================================
    if (currentStatus === "rejected") {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "This withdrawal request has been rejected and cannot be acknowledged.",
        },
        { status: 409 }
      );
    }

    // ============================================================
    // Only pending or approved withdrawals can be acknowledged
    // ============================================================
    const allowedStatuses = [
      "pending",
      "approved",
    ];

    if (!allowedStatuses.includes(currentStatus)) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: `This withdrawal cannot be acknowledged. Current status: ${
            withdrawal.status ?? "unknown"
          }`,
        },
        { status: 409 }
      );
    }

    // ============================================================
    // Get administrator ID from cookie
    // ============================================================
    const staffIdCookie = request.cookies.get("staff_id")?.value;

    const acknowledgedBy = staffIdCookie
      ? Number(staffIdCookie)
      : null;

    // ============================================================
    // Update withdrawal
    //
    // acknowledged_by is nullable in your database, so if the
    // staff cookie is unavailable we can still acknowledge it.
    // ============================================================
    if (
      acknowledgedBy !== null &&
      Number.isInteger(acknowledgedBy) &&
      acknowledgedBy > 0
    ) {
      await connection.query(
        `
          UPDATE withdrawals
          SET
            status = 'acknowledged',
            acknowledged_by = ?
          WHERE withdrawal_id = ?
        `,
        [acknowledgedBy, savedId]
      );
    } else {
      await connection.query(
        `
          UPDATE withdrawals
          SET
            status = 'acknowledged'
          WHERE withdrawal_id = ?
        `,
        [savedId]
      );
    }

    // ============================================================
    // Confirm transaction
    // ============================================================
    await connection.commit();

    // ============================================================
    // Return successful response
    // ============================================================
    return NextResponse.json(
      {
        success: true,
        message: "Withdrawal acknowledged successfully.",

        withdrawal: {
          saved_id: Number(
            withdrawal.withdrawal_id
          ),

          member_id: Number(
            withdrawal.member_id
          ),

          amount:
            withdrawal.amount !== null &&
            withdrawal.amount !== undefined
              ? String(withdrawal.amount)
              : "0.00",

          reason:
            withdrawal.reason !== null &&
            withdrawal.reason !== undefined
              ? String(withdrawal.reason)
              : "No reason provided",

          status: "acknowledged",

          created_at:
            withdrawal.requested_at !== null &&
            withdrawal.requested_at !== undefined
              ? String(withdrawal.requested_at)
              : "",
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    // ============================================================
    // Roll back transaction on error
    // ============================================================
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Withdrawal rollback error:",
          rollbackError
        );
      }
    }

    console.error(
      "POST /api/admin_staff/admin/acknowledge-withdrawals/action error:",
      error
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : String(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to acknowledge withdrawal request.",
        error: errorMessage,
      },
      { status: 500 }
    );
  } finally {
    // ============================================================
    // Release database connection
    // ============================================================
    if (connection) {
      connection.release();
    }
  }
}
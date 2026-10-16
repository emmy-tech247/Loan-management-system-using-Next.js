import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST
 * ------------------------------------------------------------
 * Acknowledge a pending FD withdrawal / rollover request.
 *
 * URL:
 * /api/admin_staff/admin/fd-withdrawals/[id]/acknowledge
 */
export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  let connection: Awaited<ReturnType<typeof db.getConnection>> | null =
    null;

  try {
    const { id } = await params;

    const withdrawalId = Number(id);

    // ----------------------------------------------------------
    // Validate ID
    // ----------------------------------------------------------
    if (!Number.isInteger(withdrawalId) || withdrawalId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid withdrawal request ID.",
        },
        { status: 400 }
      );
    }

    // ----------------------------------------------------------
    // Get database connection
    // ----------------------------------------------------------
    connection = await db.getConnection();

    await connection.beginTransaction();

    // ----------------------------------------------------------
    // Lock the request so two admins cannot acknowledge it
    // simultaneously.
    // ----------------------------------------------------------
    const [rows] = await connection.query(
      `
      SELECT
        withdrawal_id,
        member_id,
        action_type,
        status
      FROM fd_withdrawals
      WHERE withdrawal_id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [withdrawalId]
    );

    const withdrawal = (rows as any[])[0];

    // ----------------------------------------------------------
    // Request does not exist
    // ----------------------------------------------------------
    if (!withdrawal) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "FD withdrawal request not found.",
        },
        { status: 404 }
      );
    }

    // ----------------------------------------------------------
    // Already acknowledged
    // ----------------------------------------------------------
    if (String(withdrawal.status).toLowerCase() === "acknowledged") {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "This request has already been acknowledged.",
        },
        { status: 409 }
      );
    }

    // ----------------------------------------------------------
    // Only pending requests can be acknowledged
    // ----------------------------------------------------------
    if (String(withdrawal.status).toLowerCase() !== "pending") {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: `This request cannot be acknowledged because its current status is "${withdrawal.status}".`,
        },
        { status: 409 }
      );
    }

    // ----------------------------------------------------------
    // Update status
    // ----------------------------------------------------------
    await connection.query(
      `
      UPDATE fd_withdrawals
      SET status = 'acknowledged'
      WHERE withdrawal_id = ?
      `,
      [withdrawalId]
    );

    // ----------------------------------------------------------
    // Commit
    // ----------------------------------------------------------
    await connection.commit();

    return NextResponse.json(
      {
        success: true,
        message: "FD withdrawal request acknowledged successfully.",
        withdrawal: {
          id: withdrawalId,
          member_id: withdrawal.member_id,
          action_type: withdrawal.action_type,
          status: "acknowledged",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // ----------------------------------------------------------
    // Rollback if transaction was started
    // ----------------------------------------------------------
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "FD withdrawal rollback error:",
          rollbackError
        );
      }
    }

    console.error(
      "POST /api/admin_staff/admin/fd-withdrawals/[id]/acknowledge error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to acknowledge FD withdrawal request.",
      },
      { status: 500 }
    );
  } finally {
    // ----------------------------------------------------------
    // Release connection
    // ----------------------------------------------------------
    if (connection) {
      connection.release();
    }
  }
}
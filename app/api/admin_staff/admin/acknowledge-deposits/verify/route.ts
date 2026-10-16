import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let connection: any = null;

  try {
    const body = await request.json();

    const savedId = Number(body.saved_id);
    const action = String(body.action || "")
      .trim()
      .toLowerCase();

    if (!Number.isInteger(savedId) || savedId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid deposit ID.",
        },
        { status: 400 }
      );
    }

    if (action !== "acknowledge") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid deposit action.",
        },
        { status: 400 }
      );
    }

    connection = await db.getConnection();

    await connection.beginTransaction();

    /*
     * Lock the deposit record while processing it.
     * This prevents two administrators from acknowledging
     * the same pending deposit at the same time.
     */
    const [depositRows]: any =
      await connection.query(
        `
        SELECT
          saved_id,
          member_id,
          amount_saved,
          status
        FROM savings_transactions
        WHERE saved_id = ?
        LIMIT 1
        FOR UPDATE
        `,
        [savedId]
      );

    if (!depositRows || depositRows.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Deposit record was not found.",
        },
        { status: 404 }
      );
    }

    const deposit = depositRows[0];

    /*
     * Do not acknowledge an already processed
     * transaction.
     */
    if (String(deposit.status).toLowerCase() !== "pending") {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            `This deposit has already been processed. Current status: ${deposit.status}.`,
        },
        { status: 409 }
      );
    }

    /*
     * Acknowledge the savings transaction.
     */
    await connection.query(
      `
      UPDATE savings_transactions
      SET
        status = 'acknowledged',
        accountant_status = 'acknowledged'
      WHERE saved_id = ?
        AND status = 'pending'
      `,
      [savedId]
    );

    await connection.commit();

    return NextResponse.json(
      {
        success: true,
        message:
          "Deposit acknowledged successfully.",
        saved_id: savedId,
        member_id: deposit.member_id,
        amount: deposit.amount_saved,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "POST acknowledge deposit error:",
      error
    );

    try {
      if (connection) {
        await connection.rollback();
      }
    } catch (rollbackError) {
      console.error(
        "Rollback error:",
        rollbackError
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to acknowledge the deposit.",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
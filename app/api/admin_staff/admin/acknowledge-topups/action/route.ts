import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let connection;

  try {
    const body = await request.json();

    const savedId = Number(body.saved_id);

    /*
     * ============================================================
     * VALIDATE SAVED ID
     * ============================================================
     */

    if (!Number.isInteger(savedId) || savedId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid savings transaction ID.",
        },
        { status: 400 }
      );
    }

    /*
     * ============================================================
     * DATABASE CONNECTION
     * ============================================================
     */

    connection = await db.getConnection();

    await connection.beginTransaction();

    /*
     * ============================================================
     * FIND THE TRANSACTION
     * ============================================================
     */

    const [transactionRows]: any = await connection.query(
      `
      SELECT
        saved_id,
        member_id,
        amount_saved,
        receipt_file,
        status,
        created_at
      FROM monthly_savings
      WHERE saved_id = ?
      FOR UPDATE
      `,
      [savedId]
    );

    if (!transactionRows || transactionRows.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Savings transaction was not found.",
        },
        { status: 404 }
      );
    }

    const transaction = transactionRows[0];

    /*
     * ============================================================
     * PREVENT DUPLICATE ACKNOWLEDGMENT
     * ============================================================
     */

    const currentStatus = String(
      transaction.status || ""
    ).toLowerCase();

    if (currentStatus !== "pending") {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: `This transaction has already been processed. Current status: ${transaction.status}`,
        },
        { status: 409 }
      );
    }

    /*
     * ============================================================
     * ACKNOWLEDGE TRANSACTION
     * ============================================================
     *
     * After Admin1 acknowledges the payment, it is moved out
     * of the pending queue.
     *
     * Change "acknowledged" below if your database uses another
     * status such as "verified" or "approved".
     */

    await connection.query(
      `
      UPDATE monthly_savings
      SET status = 'acknowledged'
      WHERE saved_id = ?
      `,
      [savedId]
    );

    /*
     * ============================================================
     * COMMIT TRANSACTION
     * ============================================================
     */

    await connection.commit();

    return NextResponse.json(
      {
        success: true,
        message: "Savings transaction acknowledged successfully.",
        transaction: {
          saved_id: transaction.saved_id,
          member_id: transaction.member_id,
          amount_saved: transaction.amount_saved,
          status: "acknowledged",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    /*
     * ============================================================
     * ROLLBACK ON ERROR
     * ============================================================
     */

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Rollback error:",
          rollbackError
        );
      }
    }

    console.error(
      "POST /api/admin_staff/admin/acknowledge-topups/action error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to acknowledge savings transaction.",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
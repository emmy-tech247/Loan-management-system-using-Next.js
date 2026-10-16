import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let connection;

  try {
    // ============================================================
    // 1. Check authentication
    // ============================================================

    const cookieStore = await cookies();

    const admin2Id = cookieStore.get("admin2Id")?.value;
    const staffId = cookieStore.get("staff_id")?.value;

    const approvingStaffId = admin2Id || staffId;

    if (!approvingStaffId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login again.",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // 2. Read request body
    // ============================================================

    const body = await request.json();

    const id = Number(body?.id);

    if (!id || !Number.isInteger(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid transaction ID is required.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 3. Get database connection
    // ============================================================

    connection = await db.getConnection();

    await connection.beginTransaction();

    // ============================================================
    // 4. Lock the savings transaction
    // ============================================================

    const [transactionRows]: any = await connection.query(
      `
      SELECT
        saved_id,
        member_id,
        amount_saved,
        receipt_file,
        type,
        status
      FROM savings_transactions
      WHERE saved_id = ?
      FOR UPDATE
      `,
      [id]
    );

    if (
      !transactionRows ||
      transactionRows.length === 0
    ) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Savings transaction not found.",
        },
        { status: 404 }
      );
    }

    const transaction = transactionRows[0];

    // ============================================================
    // 5. Verify transaction type
    // ============================================================

    if (transaction.type !== "deposit") {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "This transaction is not a savings top-up.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 6. Verify current status
    // ============================================================

    if (transaction.status !== "acknowledged") {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "This savings transaction has already been processed.",
        },
        { status: 409 }
      );
    }

    // ============================================================
    // 7. Validate amount
    // ============================================================

    const amountSaved = Number(
      transaction.amount_saved
    );

    if (
      !Number.isFinite(amountSaved) ||
      amountSaved <= 0
    ) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "The savings transaction amount is invalid.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 8. Approve the savings transaction
    // ============================================================

    const [updateResult]: any = await connection.query(
      `
      UPDATE savings_transactions
      SET
        status = 'approved',
        approved_by = ?,
        approved_at = NOW()
      WHERE
        saved_id = ?
        AND type = 'deposit'
        AND status = 'acknowledged'
      `,
      [approvingStaffId, id]
    );

    if (
      !updateResult ||
      updateResult.affectedRows !== 1
    ) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "The savings transaction could not be approved.",
        },
        { status: 409 }
      );
    }

    // ============================================================
    // 9. Commit
    // ============================================================

    await connection.commit();

    return NextResponse.json(
      {
        success: true,
        message:
          "Savings transaction approved successfully.",
        transaction: {
          id: transaction.saved_id,
          member_id: transaction.member_id,
          amount_saved: amountSaved,
          status: "approved",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Approve savings top-up error:",
      error
    );

    // ============================================================
    // Rollback
    // ============================================================

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
          "Failed to approve savings transaction.",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
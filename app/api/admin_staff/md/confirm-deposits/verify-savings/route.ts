import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let connection;

  try {
    // ============================================================
    // 1. Check session
    // ============================================================

    const cookieStore = await cookies();

    const admin2Id = cookieStore.get("admin2Id");
    const staffId = cookieStore.get("staff_id");

    const currentStaffId = admin2Id?.value || staffId?.value;

    if (!currentStaffId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in again.",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // 2. Read request
    // ============================================================

    const body = await request.json();

    const savedId = Number(body.saved_id);
    const action = String(body.action || "").trim().toLowerCase();

    // ============================================================
    // 3. Validate request
    // ============================================================

    if (!Number.isInteger(savedId) || savedId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid deposit ID.",
        },
        { status: 400 }
      );
    }

    if (action !== "confirm") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid action.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 4. Start transaction
    // ============================================================

    connection = await db.getConnection();

    await connection.beginTransaction();

    // ============================================================
    // 5. Lock the deposit row
    // ============================================================

    const [rows]: any = await connection.execute(
      `
      SELECT
        saved_id,
        member_id,
        amount_saved,
        type,
        status
      FROM savings_transactions
      WHERE saved_id = ?
      FOR UPDATE
      `,
      [savedId]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Deposit record not found.",
        },
        { status: 404 }
      );
    }

    const deposit = rows[0];

    // ============================================================
    // 6. Make sure this is a savings deposit
    // ============================================================

    if (deposit.type !== "deposit") {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "This transaction is not a savings deposit.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 7. Make sure it is still awaiting confirmation
    // ============================================================

    if (deposit.status !== "acknowledged") {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "This deposit has already been processed or is no longer awaiting confirmation.",
        },
        { status: 409 }
      );
    }

    // ============================================================
    // 8. Confirm deposit
    //
    // Move:
    // acknowledged -> approved
    //
    // This means the deposit becomes part of the member's
    // approved savings balance.
    // ============================================================

    const [updateResult]: any = await connection.execute(
      `
      UPDATE savings_transactions
      SET
        status = 'approved',
        approved_by = ?,
        approved_at = NOW()
      WHERE saved_id = ?
        AND type = 'deposit'
        AND status = 'acknowledged'
      `,
      [currentStaffId, savedId]
    );

    if (!updateResult || updateResult.affectedRows !== 1) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "The deposit could not be confirmed.",
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
        message: "Deposit confirmed successfully.",
        saved_id: savedId,
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
      "POST /api/admin_staff/md/confirm-deposits/verify-savings error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to confirm deposit. Please try again.",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
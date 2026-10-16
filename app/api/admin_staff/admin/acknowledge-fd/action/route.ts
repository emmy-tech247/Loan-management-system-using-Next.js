import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let connection;

  try {
    const body = await request.json();

    const action = String(body.action || "").trim().toLowerCase();
    const approvalId = Number(body.approval_id);
    const fdId = Number(body.fd_id);

    /*
     * ============================================================
     * VALIDATION
     * ============================================================
     */

    if (action !== "acknowledge") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid action.",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(approvalId) || approvalId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid approval ID.",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(fdId) || fdId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid fixed deposit ID.",
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
     * VERIFY FIXED DEPOSIT
     * ============================================================
     */

    const [fdRows]: any = await connection.query(
      `
      SELECT
        fd_id,
        amount_deposited,
        tenure_months,
        interest_rate,
        start_date
      FROM fixed_deposits
      WHERE fd_id = ?
      FOR UPDATE
      `,
      [fdId]
    );

    if (!fdRows || fdRows.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Fixed deposit application was not found.",
        },
        { status: 404 }
      );
    }

    /*
     * ============================================================
     * VERIFY APPROVAL RECORD
     * ============================================================
     */

    const [approvalRows]: any = await connection.query(
      `
      SELECT
        approval_id,
        fd_id,
        status
      FROM fd_actions
      WHERE approval_id = ?
        AND fd_id = ?
      FOR UPDATE
      `,
      [approvalId, fdId]
    );

    if (!approvalRows || approvalRows.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Fixed deposit approval record was not found.",
        },
        { status: 404 }
      );
    }

    const approval = approvalRows[0];

    /*
     * ============================================================
     * PREVENT DUPLICATE ACKNOWLEDGMENT
     * ============================================================
     */

    const currentStatus = String(
      approval.status || ""
    ).toLowerCase();

    if (
      currentStatus === "acknowledged" ||
      currentStatus === "approved" ||
      currentStatus === "completed"
    ) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "This fixed deposit has already been acknowledged.",
        },
        { status: 409 }
      );
    }

    /*
     * ============================================================
     * UPDATE APPROVAL
     * ============================================================
     */

    await connection.query(
      `
      UPDATE fd_actions
      SET status = 'acknowledged'
      WHERE approval_id = ?
        AND fd_id = ?
      `,
      [approvalId, fdId]
    );

    /*
     * ============================================================
     * COMMIT
     * ============================================================
     */

    await connection.commit();

    return NextResponse.json(
      {
        success: true,
        message: "Fixed deposit acknowledged successfully.",
        approval_id: approvalId,
        fd_id: fdId,
        status: "acknowledged",
      },
      { status: 200 }
    );
  } catch (error) {
    /*
     * ============================================================
     * ROLLBACK
     * ============================================================
     */

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Fixed deposit rollback error:",
          rollbackError
        );
      }
    }

    console.error(
      "POST /api/admin_staff/admin/acknowledge-fd/action error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to acknowledge fixed deposit.",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
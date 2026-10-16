import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
| Fetch active fixed deposits belonging to the logged-in member.
*/
export async function GET(request: NextRequest) {
  try {
    /*
     * This assumes your login system stores member_id
     * in a cookie named "member_id".
     *
     * If your authentication uses another cookie/session,
     * replace this section with your existing session logic.
     */
    const memberCookie = request.cookies.get("member_id")?.value;

    if (!memberCookie || !/^\d+$/.test(memberCookie)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login again.",
        },
        { status: 401 }
      );
    }

    const memberId = Number(memberCookie);

    const [rows] = await db.execute(
      `
      SELECT
        fd_id,
        amount_deposited,
        tenure_months,
        interest_rate,
        start_date
      FROM fixed_deposits
      WHERE member_id = ?
        AND status = 'active'
      ORDER BY start_date DESC
      `,
      [memberId]
    );

    return NextResponse.json({
      success: true,
      deposits: rows,
    });
  } catch (error) {
    console.error(
      "GET /api/member/fixed-deposit-actions error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load fixed deposits.",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
| Submit withdrawal or rollover request.
*/
export async function POST(request: NextRequest) {
  try {
    /*
     * Authentication
     */
    const memberCookie = request.cookies.get("member_id")?.value;

    if (!memberCookie || !/^\d+$/.test(memberCookie)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login again.",
        },
        { status: 401 }
      );
    }

    const memberId = Number(memberCookie);

    /*
     * Read request body
     */
    const body = await request.json();

    const fdId = Number(body.fd_id);
    const actionType = String(body.action_type || "");
    const note = String(body.note || "").trim();

    /*
     * Validate FD ID
     */
    if (!Number.isInteger(fdId) || fdId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select a valid fixed deposit.",
        },
        { status: 400 }
      );
    }

    /*
     * Validate action
     */
    if (!["withdraw", "rollover"].includes(actionType)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid action selected.",
        },
        { status: 400 }
      );
    }

    /*
     * Verify that the fixed deposit belongs to
     * the logged-in member and is currently active.
     */
    const [fdRows]: any = await db.execute(
      `
      SELECT
        fd_id,
        member_id,
        amount_deposited,
        tenure_months,
        interest_rate,
        start_date,
        status
      FROM fixed_deposits
      WHERE fd_id = ?
        AND member_id = ?
        AND status = 'active'
      LIMIT 1
      `,
      [fdId, memberId]
    );

    if (!fdRows || fdRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The selected fixed deposit was not found or is no longer active.",
        },
        { status: 404 }
      );
    }

    /*
     * Determine the new fixed-deposit status.
     */
    const pendingStatus =
      actionType === "withdraw"
        ? "pending_withdrawal"
        : "pending_rollover";

    /*
     * Start transaction
     */
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      /*
       * Insert request
       */
      await connection.execute(
        `
        INSERT INTO fd_withdrawals
        (
          fd_id,
          member_id,
          action_type,
          note,
          status
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          fdId,
          memberId,
          actionType,
          note,
          "pending",
        ]
      );

      /*
       * Update fixed deposit status
       */
      await connection.execute(
        `
        UPDATE fixed_deposits
        SET status = ?
        WHERE fd_id = ?
          AND member_id = ?
          AND status = 'active'
        `,
        [
          pendingStatus,
          fdId,
          memberId,
        ]
      );

      /*
       * Commit
       */
      await connection.commit();

      const actionLabel =
        actionType === "withdraw"
          ? "withdraw"
          : "rollover";

      return NextResponse.json({
        success: true,
        message: `Your request to ${actionLabel} has been submitted successfully.`,
      });
    } catch (error) {
      await connection.rollback();

      console.error(
        "Fixed deposit transaction error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Failed to submit your request. Please try again.",
        },
        { status: 500 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(
      "POST /api/member/fixed-deposit-actions error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "An unexpected error occurred while submitting your request.",
      },
      { status: 500 }
    );
  }
}
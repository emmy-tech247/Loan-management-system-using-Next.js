import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET
 * /api/admin_staff/md/deposits/confirm
 *
 * Returns deposits acknowledged by Admin 1
 * and waiting for MD final confirmation.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();

    const admin2Id = cookieStore.get("admin2Id")?.value;
    const staffId = cookieStore.get("staff_id")?.value;

    // ============================================================
    // Authentication
    // ============================================================

    if (!admin2Id && !staffId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in again.",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // Get acknowledged deposits
    // ============================================================

    const [rows] = await db.query(
      `
      SELECT
        st.saved_id,
        st.member_id,
        m.full_name,
        st.amount_saved,

        /*
         * Your current savings_transactions schema does not have
         * a confirmed reference column in the information available.
         * NULL keeps the API compatible with the frontend.
         */
        NULL AS reference,

        st.approved_at AS acknowledged_at

      FROM savings_transactions st

      INNER JOIN members m
        ON m.member_id = st.member_id

      WHERE st.type = 'deposit'
        AND st.status = 'acknowledged'

      ORDER BY st.saved_id DESC
      `
    );

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("GET /api/admin_staff/md/deposits/confirm error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load deposits awaiting confirmation.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST
 * /api/admin_staff/md/deposits/confirm
 *
 * Body:
 * {
 *   saved_id: number,
 *   action: "confirm"
 * }
 */
export async function POST(request: Request) {
  let connection;

  try {
    const cookieStore = await cookies();

    const admin2Id = cookieStore.get("admin2Id")?.value;
    const staffId = cookieStore.get("staff_id")?.value;

    // ============================================================
    // Authentication
    // ============================================================

    if (!admin2Id && !staffId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in again.",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // Read request body
    // ============================================================

    let body: {
      saved_id?: number;
      action?: string;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request body.",
        },
        { status: 400 }
      );
    }

    const saved_id = Number(body.saved_id);
    const action = String(body.action || "").trim().toLowerCase();

    // ============================================================
    // Validate input
    // ============================================================

    if (!Number.isInteger(saved_id) || saved_id <= 0) {
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
    // Get database connection
    // ============================================================

    connection = await db.getConnection();

    await connection.beginTransaction();

    // ============================================================
    // Lock the deposit row
    // ============================================================

    const [depositRows] = await connection.query(
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
      [saved_id]
    );

    const deposits = depositRows as Array<{
      saved_id: number;
      member_id: number;
      amount_saved: number;
      type: string;
      status: string;
    }>;

    if (deposits.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Deposit transaction not found.",
        },
        { status: 404 }
      );
    }

    const deposit = deposits[0];

    // ============================================================
    // Verify that this is an acknowledged deposit
    // ============================================================

    if (
      deposit.type !== "deposit" ||
      deposit.status !== "acknowledged"
    ) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "This deposit is no longer awaiting final confirmation.",
        },
        { status: 409 }
      );
    }

    // ============================================================
    // Determine approving staff ID
    // ============================================================

    const approvingStaffId = Number(admin2Id || staffId);

    if (!Number.isInteger(approvingStaffId) || approvingStaffId <= 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Invalid administrator session.",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // Final confirmation
    // ============================================================

    await connection.query(
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
      [approvingStaffId, saved_id]
    );

    // ============================================================
    // Commit
    // ============================================================

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: "Deposit successfully confirmed.",
    });
  } catch (error) {
    console.error("POST /md/deposits/confirm error:", error);

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError);
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to confirm deposit.",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
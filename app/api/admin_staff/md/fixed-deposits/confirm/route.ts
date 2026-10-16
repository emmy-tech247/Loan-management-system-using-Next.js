import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

export const runtime = "nodejs";

/**
 * MD - Confirm Fixed Deposits
 *
 * GET:
 * Returns fixed-deposit applications that have been approved
 * at the previous level and forwarded to Admin 2 / MD.
 *
 * POST:
 * Confirm or reject a pending fixed-deposit application.
 */

export async function GET(_request: NextRequest) {
  try {
    // ============================================================
    // 1. Get logged-in staff ID
    // ============================================================

    const cookieStore = await cookies();

    const staffIdValue =
      cookieStore.get("admin2Id")?.value ||
      cookieStore.get("staff_id")?.value;

    if (!staffIdValue) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in.",
        },
        { status: 401 }
      );
    }

    const staffId = Number(staffIdValue);

    if (!Number.isInteger(staffId) || staffId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid staff session.",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // 2. Verify MD role
    // ============================================================

    const [staffRows] = await db.execute(
      `
      SELECT staff_id, full_name, role
      FROM staff
      WHERE staff_id = ?
      LIMIT 1
      `,
      [staffId]
    );

    const staff = (staffRows as any[])[0];

    if (!staff) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff account not found.",
        },
        { status: 401 }
      );
    }

    if (staff.role !== "md") {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. MD authorization required.",
        },
        { status: 403 }
      );
    }

    // ============================================================
    // 3. Get pending FD approvals
    // ============================================================
    //
    // approvals.item_id = fixed_deposits.fd_id
    // approvals.item_type = 'fixed_deposit'
    // forwarded_to_admin2 = 1
    //
    // We use status = 'approved' because the FD has already
    // passed the previous approval stage and has been forwarded
    // to the MD for final confirmation.
    // ============================================================

    const [rows] = await db.execute(`
      SELECT
        a.approver_id AS approval_id,
        a.item_id AS fd_id,
        a.member_id,

        fd.amount_deposited,
        fd.tenure_months,
        fd.interest_rate,
        fd.start_date,
        fd.maturity_date,
        fd.end_date,
        fd.status AS fd_status,

        a.status AS approval_status,
        a.level,
        a.step,
        a.forwarded_to_admin2,
        a.approved_by,
        a.approved_at,
        a.created_at,

        m.full_name,
        m.email,
        m.phone_number

      FROM approvals a

      INNER JOIN fixed_deposits fd
        ON fd.fd_id = a.item_id

      INNER JOIN members m
        ON m.member_id = a.member_id

      WHERE a.item_type = 'fixed_deposit'
        AND a.forwarded_to_admin2 = 1
        AND a.status = 'approved'
        AND m.deleted = 0
        AND fd.status NOT IN ('withdrawn', 'cancelled')

      ORDER BY a.created_at ASC
    `);

    // ============================================================
    // 4. Format response for PendingFD[]
    // ============================================================

    const deposits = (rows as any[]).map((row) => ({
      approval_id: Number(row.approval_id),
      fd_id: Number(row.fd_id),
      member_id: Number(row.member_id),

      amount_deposited: Number(row.amount_deposited || 0),
      tenure_months: Number(row.tenure_months || 0),
      interest_rate: Number(row.interest_rate || 0),

      start_date: row.start_date
        ? formatDate(row.start_date)
        : null,

      maturity_date: row.maturity_date
        ? formatDate(row.maturity_date)
        : null,

      end_date: row.end_date
        ? formatDate(row.end_date)
        : null,

      fd_status: row.fd_status,

      approval_status: row.approval_status,
      level: row.level,
      step: row.step,

      full_name: row.full_name,
      email: row.email,
      phone_number: row.phone_number,

      created_at: row.created_at,
    }));

    return NextResponse.json(
      {
        success: true,
        data: deposits,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "❌ GET /api/admin_staff/md/fixed-deposits/confirm:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load pending fixed deposits.",
      },
      { status: 500 }
    );
  }
}

// ================================================================
// POST - Confirm / Reject FD
// ================================================================

export async function POST(request: NextRequest) {
  let connection: any = null;

  try {
    // ============================================================
    // 1. Get logged-in MD
    // ============================================================

    const cookieStore = await cookies();

    const staffIdValue =
      cookieStore.get("admin2Id")?.value ||
      cookieStore.get("staff_id")?.value;

    if (!staffIdValue) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in.",
        },
        { status: 401 }
      );
    }

    const staffId = Number(staffIdValue);

    if (!Number.isInteger(staffId) || staffId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid staff session.",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // 2. Verify MD
    // ============================================================

    const [staffRows] = await db.execute(
      `
      SELECT staff_id, full_name, role
      FROM staff
      WHERE staff_id = ?
      LIMIT 1
      `,
      [staffId]
    );

    const staff = (staffRows as any[])[0];

    if (!staff) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff account not found.",
        },
        { status: 401 }
      );
    }

    if (staff.role !== "md") {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. MD authorization required.",
        },
        { status: 403 }
      );
    }

    // ============================================================
    // 3. Read request body
    // ============================================================

    const body = await request.json();

    const approvalId = Number(body.approval_id);
    const fdId = Number(body.fd_id);
    const action = String(body.action || "").trim().toLowerCase();

    if (
      !Number.isInteger(approvalId) ||
      approvalId <= 0
    ) {
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
          message: "Invalid fixed-deposit ID.",
        },
        { status: 400 }
      );
    }

    if (action !== "confirm" && action !== "reject") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid action. Use confirm or reject.",
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
    // 5. Lock approval record
    // ============================================================

    const [approvalRows] = await connection.execute(
      `
      SELECT
        approver_id,
        item_id,
        member_id,
        level,
        status,
        item_type,
        step,
        forwarded_to_admin2
      FROM approvals
      WHERE approver_id = ?
        AND item_id = ?
        AND item_type = 'fixed_deposit'
      LIMIT 1
      FOR UPDATE
      `,
      [approvalId, fdId]
    );

    const approval = (approvalRows as any[])[0];

    if (!approval) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Fixed-deposit approval record not found.",
        },
        { status: 404 }
      );
    }

    // ============================================================
    // 6. Verify this is actually forwarded to MD
    // ============================================================

    if (Number(approval.forwarded_to_admin2) !== 1) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "This fixed-deposit application has not been forwarded to the MD.",
        },
        { status: 409 }
      );
    }

    // ============================================================
    // 7. Prevent duplicate processing
    // ============================================================

    if (approval.status !== "approved") {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "This fixed-deposit application has already been processed or is not awaiting MD confirmation.",
        },
        { status: 409 }
      );
    }

    // ============================================================
    // 8. Lock fixed deposit
    // ============================================================

    const [fdRows] = await connection.execute(
      `
      SELECT
        fd_id,
        member_id,
        amount_deposited,
        status
      FROM fixed_deposits
      WHERE fd_id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [fdId]
    );

    const fd = (fdRows as any[])[0];

    if (!fd) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Fixed-deposit record not found.",
        },
        { status: 404 }
      );
    }

    // Ensure the approval belongs to the same member/FD.
    if (Number(fd.member_id) !== Number(approval.member_id)) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Approval and fixed-deposit records do not match.",
        },
        { status: 409 }
      );
    }

    // ============================================================
    // 9. CONFIRM
    // ============================================================

    if (action === "confirm") {
      // Update approval record
      await connection.execute(
        `
        UPDATE approvals
        SET
          status = 'approved',
          approved_by = ?,
          approved_at = NOW(),
          decision_date = NOW()
        WHERE approver_id = ?
          AND item_id = ?
          AND item_type = 'fixed_deposit'
        `,
        [staffId, approvalId, fdId]
      );

      // Make FD active
      await connection.execute(
        `
        UPDATE fixed_deposits
        SET
          status = 'active',
          action_taken = 'none',
          updated_at = NOW()
        WHERE fd_id = ?
        `,
        [fdId]
      );

      await connection.commit();

      return NextResponse.json(
        {
          success: true,
          message:
            "Fixed deposit confirmed successfully.",
        },
        { status: 200 }
      );
    }

    // ============================================================
    // 10. REJECT
    // ============================================================

    await connection.execute(
      `
      UPDATE approvals
      SET
        status = 'rejected',
        approved_by = ?,
        approved_at = NOW(),
        decision_date = NOW()
      WHERE approver_id = ?
        AND item_id = ?
        AND item_type = 'fixed_deposit'
      `,
      [staffId, approvalId, fdId]
    );

    // Cancel the fixed deposit
    await connection.execute(
      `
      UPDATE fixed_deposits
      SET
        status = 'cancelled',
        action_taken = 'none',
        action_date = NULL,
        updated_at = NOW()
      WHERE fd_id = ?
      `,
      [fdId]
    );

    await connection.commit();

    return NextResponse.json(
      {
        success: true,
        message:
          "Fixed deposit application rejected successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "❌ POST /api/admin_staff/md/fixed-deposits/confirm:",
      error
    );

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

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to process fixed-deposit application.",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// ================================================================
// Helper
// ================================================================

function formatDate(value: any): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toISOString().split("T")[0];
}
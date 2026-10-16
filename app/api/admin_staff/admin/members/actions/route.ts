import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================
// POST — Approve, suspend, reject or delete a member
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const member_id = Number(body.member_id);
    const action = String(body.action || "")
      .trim()
      .toLowerCase();

    // ========================================================
    // VALIDATE MEMBER ID
    // ========================================================

    if (!member_id || Number.isNaN(member_id)) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid member_id is required.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // VALIDATE ACTION
    // ========================================================

    if (!action) {
      return NextResponse.json(
        {
          success: false,
          message: "An action is required.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // CHECK MEMBER EXISTS
    // ========================================================

    const [memberRows]: any = await db.query(
      `
      SELECT
        member_id,
        full_name,
        status,
        deleted
      FROM members
      WHERE member_id = ?
      LIMIT 1
      `,
      [member_id]
    );

    if (!Array.isArray(memberRows) || memberRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Member not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ========================================================
    // APPROVE MEMBER
    // ========================================================

    if (action === "approve") {
      await db.query(
        `
        UPDATE members
        SET
          status = 'approved',
          admin2_approved = 1,
          updated_at = CURRENT_TIMESTAMP
        WHERE member_id = ?
        `,
        [member_id]
      );

      return NextResponse.json(
        {
          success: true,
          message: "Member approved successfully.",
        },
        {
          status: 200,
        }
      );
    }

    // ========================================================
    // SUSPEND MEMBER
    // ========================================================

    if (action === "suspend") {
      await db.query(
        `
        UPDATE members
        SET
          status = 'suspended',
          updated_at = CURRENT_TIMESTAMP
        WHERE member_id = ?
        `,
        [member_id]
      );

      return NextResponse.json(
        {
          success: true,
          message: "Member suspended successfully.",
        },
        {
          status: 200,
        }
      );
    }

    // ========================================================
    // REJECT MEMBER
    // ========================================================

    if (action === "reject") {
      await db.query(
        `
        UPDATE members
        SET
          status = 'rejected',
          updated_at = CURRENT_TIMESTAMP
        WHERE member_id = ?
        `,
        [member_id]
      );

      return NextResponse.json(
        {
          success: true,
          message: "Member rejected successfully.",
        },
        {
          status: 200,
        }
      );
    }

    // ========================================================
    // DELETE MEMBER — SOFT DELETE
    // ========================================================

    if (action === "delete") {
      await db.query(
        `
        UPDATE members
        SET
          deleted = 1,
          updated_at = CURRENT_TIMESTAMP
        WHERE member_id = ?
        `,
        [member_id]
      );

      return NextResponse.json(
        {
          success: true,
          message: "Member deleted successfully.",
        },
        {
          status: 200,
        }
      );
    }

    // ========================================================
    // INVALID ACTION
    // ========================================================

    return NextResponse.json(
      {
        success: false,
        message:
          "Invalid action. Use approve, suspend, reject, or delete.",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/admin_staff/admin/members/action ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update member.",
      },
      {
        status: 500,
      }
    );
  }
}
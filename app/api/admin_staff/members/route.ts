import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================
// GET
// /api/admin_staff/md/members
// ============================================================
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        member_id,
        full_name,
        email,
        nin,
        phone_number,

        state_of_origin,
        lga_of_origin,
        permanent_address,
        residential_address,

        bank_name,
        account_type,
        account_number,
        account_name,

        place_of_work,
        type_of_business_work,
        monthly_earning,
        annual_income,

        full_name_of_next_of_kin,
        relationship_with_next_of_kin,
        phone_number_of_next_of_kin,
        address_of_next_of_kin,

        expected_monthly_contribution_amount,
        fixed_deposit_amount,
        fixed_deposit_years,

        id_document,
        passport,
        payment_receipt,

        status,
        created_at

      FROM members

      WHERE deleted = 0 OR deleted IS NULL

      ORDER BY created_at DESC
    `);

    // ---------------------------------------------------------
    // mysql2 returns an array of rows.
    // Explicitly guarantee that members is an array.
    // ---------------------------------------------------------
    const members = Array.isArray(rows) ? rows : [];

    return NextResponse.json(
      {
        success: true,
        members,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET /api/admin_staff/md/members error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        members: [],
        message: "Failed to retrieve members",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// POST
// /api/admin_staff/md/members
//
// Actions:
// approve
// suspend
// delete
// ============================================================
export async function POST(request: NextRequest) {
  try {
    // ---------------------------------------------------------
    // Read JSON
    // ---------------------------------------------------------
    let body: {
      member_id?: number | string;
      action?: string;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request body",
        },
        {
          status: 400,
        }
      );
    }

    // ---------------------------------------------------------
    // Member ID
    // ---------------------------------------------------------
    const memberId = Number(body.member_id);

    if (
      !Number.isInteger(memberId) ||
      memberId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid member ID",
        },
        {
          status: 400,
        }
      );
    }

    // ---------------------------------------------------------
    // Action
    // ---------------------------------------------------------
    const action = String(
      body.action || ""
    )
      .trim()
      .toLowerCase();

    const allowedActions = [
      "approve",
      "suspend",
      "delete",
    ];

    if (!allowedActions.includes(action)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid member action",
        },
        {
          status: 400,
        }
      );
    }

    // ---------------------------------------------------------
    // Check member exists
    // ---------------------------------------------------------
    const [memberRows] = await db.query(
      `
        SELECT
          member_id,
          full_name,
          status
        FROM members
        WHERE member_id = ?
        LIMIT 1
      `,
      [memberId]
    );

    const members = Array.isArray(memberRows)
      ? memberRows
      : [];

    if (members.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Member not found",
        },
        {
          status: 404,
        }
      );
    }

    // ========================================================
    // APPROVE
    // ========================================================
    if (action === "approve") {
      await db.query(
        `
          UPDATE members
          SET
            status = ?,
            admin2_approved = 1
          WHERE member_id = ?
        `,
        ["approved", memberId]
      );

      return NextResponse.json(
        {
          success: true,
          message: "Member approved successfully",
          member_id: memberId,
          status: "approved",
        },
        {
          status: 200,
        }
      );
    }

    // ========================================================
    // SUSPEND
    // ========================================================
    if (action === "suspend") {
      await db.query(
        `
          UPDATE members
          SET status = ?
          WHERE member_id = ?
        `,
        ["suspended", memberId]
      );

      return NextResponse.json(
        {
          success: true,
          message: "Member suspended successfully",
          member_id: memberId,
          status: "suspended",
        },
        {
          status: 200,
        }
      );
    }

    // ========================================================
    // DELETE
    // ========================================================
    if (action === "delete") {
      await db.query(
        `
          DELETE FROM members
          WHERE member_id = ?
        `,
        [memberId]
      );

      return NextResponse.json(
        {
          success: true,
          message: "Member deleted successfully",
          member_id: memberId,
        },
        {
          status: 200,
        }
      );
    }

    // ---------------------------------------------------------
    // Fallback
    // ---------------------------------------------------------
    return NextResponse.json(
      {
        success: false,
        message: "Unsupported action",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/admin_staff/md/members error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to execute member action",
      },
      {
        status: 500,
      }
    );
  }
}
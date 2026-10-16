import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================
// GET — Fetch all members from MySQL
// ============================================================
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        member_id,
        full_name,
        nin,
        state_of_origin,
        lga_of_origin,
        permanent_address,
        residential_address,
        phone_number,
        email,
        bank_name,
        account_number,
        account_name,
        account_type,
        place_of_work,
        type_of_business_work,
        monthly_earning,
        annual_income,
        expected_monthly_contribution_amount,
        fixed_deposit_amount,
        fixed_deposit_years,
        contribution_start_date,
        full_name_of_next_of_kin,
        address_of_next_of_kin,
        phone_number_of_next_of_kin,
        relationship_with_next_of_kin,
        id_document,
        passport,
        payment_receipt,
        payment_reference,
        payment_verified,
        status,
        savings_balance,
        loan_balance,
        amount_saved,
        amount_paid,
        loan_status,
        due_date,
        admin1_acknowledged,
        admin2_approved,
        forwarded_to_admin2,
        created_at,
        updated_at
      FROM members
      WHERE deleted = 0
      ORDER BY created_at DESC
    `);

    return NextResponse.json(
      {
        success: true,
        members: rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET MEMBERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve members from database.",
      },
      { status: 500 }
    );
  }
}

// ============================================================
// POST — Approve, suspend or delete a member
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const member_id = Number(body.member_id);
    const action = String(body.action || "").trim().toLowerCase();

    if (!member_id || Number.isNaN(member_id)) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid member_id is required.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------------
    // APPROVE MEMBER
    // --------------------------------------------------------
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
        { status: 200 }
      );
    }

    // --------------------------------------------------------
    // SUSPEND MEMBER
    // --------------------------------------------------------
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
        { status: 200 }
      );
    }

    // --------------------------------------------------------
    // DELETE MEMBER
    // --------------------------------------------------------
    if (action === "delete") {
      // Soft delete — keeps the database record
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
        { status: 200 }
      );
    }

    // --------------------------------------------------------
    // INVALID ACTION
    // --------------------------------------------------------
    return NextResponse.json(
      {
        success: false,
        message:
          "Invalid action. Use approve, suspend, or delete.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("MEMBER ACTION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update member.",
      },
      { status: 500 }
    );
  }
}
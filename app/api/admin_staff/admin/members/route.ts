import { NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================
// GET — Fetch all active members from MySQL
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
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "GET /api/admin_staff/admin/members ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve members from database.",
        members: [],
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const memberId = req.nextUrl.searchParams.get("member_id");

    if (!memberId) {
      return NextResponse.json(
        {
          success: false,
          message: "Member ID is required",
        },
        { status: 400 }
      );
    }

    const [rows]: any = await db.query(
      `
      SELECT
        m.member_id,
        CONCAT(m.surname, ' ', m.firstname) AS full_name,

        COALESCE((
          SELECT SUM(amount)
          FROM savings_transactions
          WHERE member_id = m.member_id
        ), 0) AS savings_balance,

        COALESCE((
          SELECT SUM(balance)
          FROM loans
          WHERE member_id = m.member_id
          AND status = 'active'
        ), 0) AS loan_balance,

        COALESCE((
          SELECT SUM(amount)
          FROM fixed_deposits
          WHERE member_id = m.member_id
          AND status='active'
        ), 0) AS fixed_balance,

        COALESCE((
          SELECT SUM(expected_amount)
          FROM monthly_contributions
          WHERE member_id = m.member_id
        ), 0) AS monthly_balance

      FROM members m
      WHERE m.member_id = ?
      LIMIT 1
      `,
      [memberId]
    );

    if (rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Member not found",
      });
    }

    return NextResponse.json({
      success: true,
      ...rows[0],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}
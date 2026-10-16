import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = Number(searchParams.get("member_id"));

    if (!memberId || memberId <= 0) {
      return NextResponse.json({
        success: false,
        message: "Invalid member ID",
      });
    }

    // Get member
    const [members] = await db.execute(
      `
      SELECT id, full_name
      FROM members
      WHERE id = ?
      LIMIT 1
      `,
      [memberId]
    );

    const memberRows = members as any[];

    if (memberRows.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Member not found",
      });
    }

    const fullName = memberRows[0].full_name;

    // Savings / deposits
    const [savings] = await db.execute(
      `
      SELECT COALESCE(SUM(amount_saved), 0) AS balance
      FROM savings_transactions
      WHERE member_id = ?
      AND type = 'deposit'
      AND status = 'approved'
      `,
      [memberId]
    );

    // Loan repayments
    const [repayments] = await db.execute(
      `
      SELECT COALESCE(SUM(amount_paid), 0) AS balance
      FROM loan_repayments
      WHERE member_id = ?
      AND status = 'approved'
      `,
      [memberId]
    );

    // Fixed deposits
    const [fixedDeposits] = await db.execute(
      `
      SELECT COALESCE(SUM(amount_deposited), 0) AS balance
      FROM fixed_deposits
      WHERE member_id = ?
      AND status = 'confirmed'
      `,
      [memberId]
    );

    // Expected monthly contribution
    const [monthly] = await db.execute(
      `
      SELECT COALESCE(SUM(auto_amount), 0) AS balance
      FROM monthly_savings
      WHERE member_id = ?
      AND status = 'approved'
      `,
      [memberId]
    );

    return NextResponse.json({
      success: true,
      full_name: fullName,
      savings_balance: Number((savings as any[])[0].balance),
      loan_balance: Number((repayments as any[])[0].balance),
      fixed_balance: Number((fixedDeposits as any[])[0].balance),
      monthly_balance: Number((monthly as any[])[0].balance),
    });
  } catch (error) {
    console.error("Member details error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}
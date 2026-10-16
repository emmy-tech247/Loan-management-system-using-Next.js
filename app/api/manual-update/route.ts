import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const memberId = Number(body.member_id);
    const fullName = String(body.full_name || "").trim();
    const amount = Number(body.amount);
    const type = String(body.type || "");

    if (!memberId || memberId <= 0 || !type || !amount || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "❌ Invalid input. Please fill all required fields.",
        },
        { status: 400 }
      );
    }

    const date = new Date();

    switch (type) {
      case "deposit": {
        await db.execute(
          `
          INSERT INTO savings_transactions
            (member_id, amount_saved, type, status, created_at)
          VALUES (?, ?, 'deposit', 'approved', ?)
          `,
          [memberId, amount, date]
        );

        return NextResponse.json({
          success: true,
          message: `✅ Deposit of ₦${amount.toLocaleString("en-NG", {
            minimumFractionDigits: 2,
          })} added successfully for ${fullName}.`,
        });
      }

      case "repayment": {
        await db.execute(
          `
          INSERT INTO loan_repayments
            (member_id, amount_paid, status, created_at)
          VALUES (?, ?, 'approved', ?)
          `,
          [memberId, amount, date]
        );

        return NextResponse.json({
          success: true,
          message: `✅ Loan repayment of ₦${amount.toLocaleString("en-NG", {
            minimumFractionDigits: 2,
          })} recorded successfully for ${fullName}.`,
        });
      }

      case "fixed_deposit": {
        await db.execute(
          `
          INSERT INTO fixed_deposits
            (member_id, amount_deposited, status, created_at)
          VALUES (?, ?, 'confirmed', ?)
          `,
          [memberId, amount, date]
        );

        return NextResponse.json({
          success: true,
          message: `✅ Fixed Deposit of ₦${amount.toLocaleString("en-NG", {
            minimumFractionDigits: 2,
          })} added successfully for ${fullName}.`,
        });
      }

      case "monthly_contribution": {
        await db.execute(
          `
          INSERT INTO monthly_savings
            (member_id, auto_amount, status, created_at)
          VALUES (?, ?, 'approved', ?)
          `,
          [memberId, amount, date]
        );

        return NextResponse.json({
          success: true,
          message: `✅ Monthly Contribution of ₦${amount.toLocaleString(
            "en-NG",
            {
              minimumFractionDigits: 2,
            }
          )} recorded successfully for ${fullName}.`,
        });
      }

      default:
        return NextResponse.json(
          {
            success: false,
            message: "❌ Invalid transaction type selected.",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Manual update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "❌ Failed to update member account.",
      },
      { status: 500 }
    );
  }
}
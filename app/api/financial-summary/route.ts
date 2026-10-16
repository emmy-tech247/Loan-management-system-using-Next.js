import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // ===========================
    // LOANS
    // ===========================
    const [loanRows] = await db.execute(`
      SELECT 
        COUNT(DISTINCT member_id) AS loan_members,
        COALESCE(SUM(loan_amount), 0) AS total_loans
      FROM loans
      WHERE loan_status IN ('approved', 'disbursed')
    `);

    // ===========================
    // SAVINGS
    // ===========================
    const [savingsRows] = await db.execute(`
      SELECT 
        COUNT(DISTINCT member_id) AS savings_members,
        COALESCE(
          SUM(
            CASE
              WHEN type = 'deposit' THEN amount_saved
              ELSE 0
            END
          )
          -
          SUM(
            CASE
              WHEN type = 'withdrawal' THEN amount_saved
              ELSE 0
            END
          ),
          0
        ) AS total_savings
      FROM savings_transactions
      WHERE status = 'approved'
    `);

    // ===========================
    // FIXED DEPOSITS
    // ===========================
    const [fdRows] = await db.execute(`
      SELECT 
        COUNT(DISTINCT member_id) AS fd_members,
        COALESCE(SUM(amount_deposited), 0) AS total_fd
      FROM fixed_deposits
      WHERE status = 'confirmed'
    `);

    const loans = (loanRows as any[])[0] || {};
    const savings = (savingsRows as any[])[0] || {};
    const fixedDeposits = (fdRows as any[])[0] || {};

    const response = {
      loans: {
        members: Number(loans.loan_members ?? 0),
        amount: Number(loans.total_loans ?? 0),
      },

      savings: {
        members: Number(savings.savings_members ?? 0),
        amount: Number(savings.total_savings ?? 0),
      },

      fixedDeposits: {
        members: Number(fixedDeposits.fd_members ?? 0),
        amount: Number(fixedDeposits.total_fd ?? 0),
      },
    };

    console.log("Financial summary:", response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Financial summary API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load financial summary",
      },
      {
        status: 500,
      }
    );
  }
}
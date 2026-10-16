import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // ===========================
    // LOAN STATISTICS
    // ===========================
    const [loanRows] = await db.query(`
      SELECT 
        COUNT(DISTINCT member_id) AS loan_members,
        COALESCE(SUM(loan_amount), 0) AS total_loans
      FROM loans
      WHERE loan_status IN ('approved', 'disbursed')
    `);

    // ===========================
    // SAVINGS STATISTICS
    // ===========================
    const [savingsRows] = await db.query(`
      SELECT 
        COUNT(DISTINCT member_id) AS savings_members,
        COALESCE(
          SUM(
            CASE 
              WHEN type = 'deposit' THEN amount_saved 
              ELSE 0 
            END
          ) -
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
    // FIXED DEPOSIT STATISTICS
    // ===========================
    const [fdRows] = await db.query(`
      SELECT 
        COUNT(DISTINCT member_id) AS fd_members,
        COALESCE(SUM(amount_deposited), 0) AS total_fd
      FROM fixed_deposits
      WHERE status = 'confirmed'
    `);

    const loanData = (loanRows as any[])[0];
    const savingsData = (savingsRows as any[])[0];
    const fdData = (fdRows as any[])[0];

    return NextResponse.json({
      loans: {
        members: Number(loanData.loan_members || 0),
        amount: Number(loanData.total_loans || 0),
      },

      savings: {
        members: Number(savingsData.savings_members || 0),
        amount: Number(savingsData.total_savings || 0),
      },

      fixedDeposits: {
        members: Number(fdData.fd_members || 0),
        amount: Number(fdData.total_fd || 0),
      },
    });
  } catch (error) {
    console.error("Financial summary error:", error);

    return NextResponse.json(
      {
        error: "Failed to load financial summary",
      },
      {
        status: 500,
      }
    );
  }
}
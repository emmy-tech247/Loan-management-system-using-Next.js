import { NextResponse } from "next/server";
import {
  RawLoanItem,
  CalculatedLoanItem,
  LoanTotals,
  AdminLoanDashboardApiResponse,
} from "@/types/adminLoanDashboard";

export async function GET() {
  try {
    // ----------------------------------------------------
    // Production SQL Query Reference
    // ----------------------------------------------------
    /*
      SELECT m.member_id, m.full_name, 
             l.loan_id AS loan_id, l.loan_amount, l.amount_paid, l.start_date, l.due_date, l.loan_category
      FROM members m
      JOIN loans l ON m.member_id = l.member_id
      ORDER BY l.start_date DESC;
    */

    const mockRawLoans: RawLoanItem[] = [
      {
        loan_id: 101,
        member_id: "MEM-2026-012",
        full_name: "Olanrewaju Adebayo",
        loan_category: "monthly_saver",
        loan_amount: 500000.0,
        amount_paid: 200000.0,
        start_date: "2026-01-01",
        due_date: "2026-06-30",
      },
      {
        loan_id: 102,
        member_id: "MEM-2026-045",
        full_name: "Fatima Ibrahim",
        loan_category: "borrower",
        loan_amount: 300000.0,
        amount_paid: 50000.0,
        start_date: "2026-01-15",
        due_date: "2026-07-15",
      },
      {
        loan_id: 103,
        member_id: "MEM-2026-088",
        full_name: "Chukwudi Okafor",
        loan_category: "borrower",
        loan_amount: 150000.0,
        amount_paid: 0.0,
        start_date: "2025-11-01",
        due_date: "2026-05-01", // Overdue
      },
    ];

    const today = new Date();
    const totals: LoanTotals = {
      loanCollected: 0,
      outstanding: 0,
      defaultCharges: 0,
      dueWithCharges: 0,
    };

    const calculatedLoans: CalculatedLoanItem[] = mockRawLoans.map((row) => {
      const loanAmount = typeof row.loan_amount === "string" ? parseFloat(row.loan_amount) : row.loan_amount;
      const amountPaid = typeof row.amount_paid === "string" ? parseFloat(row.amount_paid) : row.amount_paid;
      const dueDate = new Date(row.due_date);
      const outstanding = loanAmount - amountPaid;

      let daysOverdue = 0;
      if (today > dueDate && outstanding > 0) {
        const diffTime = Math.abs(today.getTime() - dueDate.getTime());
        daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      }

      let defaultCharge = 0;
      let dailyGrowth = 0;

      if (row.loan_category === "monthly_saver") {
        defaultCharge = today > dueDate && outstanding > 0 ? 0.05 * outstanding : 0;
        dailyGrowth = outstanding * 0.002 * daysOverdue;
      } else {
        // borrower or default
        defaultCharge = today > dueDate && outstanding > 0 ? 0.1 * outstanding : 0;
        dailyGrowth = outstanding * 0.004 * daysOverdue;
      }

      const totalDue = outstanding + defaultCharge + dailyGrowth;

      // Accumulate totals
      totals.loanCollected += loanAmount;
      totals.outstanding += outstanding;
      totals.defaultCharges += defaultCharge;
      totals.dueWithCharges += totalDue;

      return {
        loan_id: row.loan_id,
        member_id: row.member_id,
        full_name: row.full_name,
        loan_category: row.loan_category,
        loan_amount: loanAmount,
        amount_paid: amountPaid,
        outstanding,
        start_date: row.start_date,
        due_date: row.due_date,
        daysOverdue,
        defaultCharge,
        dailyGrowth,
        totalDue,
      };
    });

    const response: AdminLoanDashboardApiResponse = {
      success: true,
      message: "Admin loan dashboard data computed successfully.",
      loans: calculatedLoans,
      totals,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to process loan dashboard data." },
      { status: 500 }
    );
  }
}

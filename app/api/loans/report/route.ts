import { NextResponse } from "next/server";

export interface LoanItem {
  loan_id: number;
  loan_amount: number;
  amount_paid: number;
  start_date: string;
  due_date: string;
  loan_category: string;
  outstanding: number;
  defaultRate: number;
  dailyRate: number;
  defaultCharge: number;
  daysOverdue: number;
  dailyGrowth: number;
  totalDue: number;
  progressPercent: number;
}

export interface ChartDataPoint {
  month: string;
  outstanding: number;
  paid: number;
}

export interface LoanReportResponse {
  memberName: string;
  loans: LoanItem[];
  totals: {
    totalLoanCollected: number;
    totalOutstanding: number;
    totalDefaultCharges: number;
    totalDueWithCharges: number;
  };
  chartData: ChartDataPoint[];
}

// Helper to simulate authentication session
async function getAuthSession() {
  // Replace with your actual auth session provider (e.g., NextAuth, Clerk)
  return { memberId: 101 };
}

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.memberId) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // 1. Fetch Member Name
    /*
    const [memberRows] = await db.execute(
      "SELECT full_name FROM members WHERE member_id = ?",
      [session.memberId]
    );
    const memberName = memberRows[0]?.full_name || "Member";
    */
    const memberName = "John Doe";

    // 2. Fetch Loans
    /*
    const [loanRows] = await db.execute(
      "SELECT loan_id, loan_amount, amount_paid, start_date, due_date, loan_category FROM loans WHERE member_id = ? ORDER BY start_date DESC",
      [session.memberId]
    );
    */

    // Mock SQL Query Results
    const rawLoans = [
      {
        loan_id: 1001,
        loan_amount: 500000.0,
        amount_paid: 200000.0,
        start_date: "2025-09-01",
        due_date: "2026-03-01",
        loan_category: "loan_borrowers",
      },
      {
        loan_id: 1002,
        loan_amount: 150000.0,
        amount_paid: 150000.0,
        start_date: "2025-11-01",
        due_date: "2026-05-01",
        loan_category: "loan_savers",
      },
    ];

    const today = new Date();
    let totalLoanCollected = 0;
    let totalOutstanding = 0;
    let totalDefaultCharges = 0;
    let totalDueWithCharges = 0;

    const chartDataMap: Record<string, { outstanding: number; paid: number }> = {};

    const processedLoans: LoanItem[] = rawLoans.map((loan) => {
      const loanAmount = Number(loan.loan_amount);
      const amountPaid = Number(loan.amount_paid);
      const dueDate = new Date(loan.due_date);
      const outstanding = Math.max(0, loanAmount - amountPaid);
      const category = loan.loan_category.toLowerCase();

      totalLoanCollected += loanAmount;

      // Rate rules based on category
      const isSavers = category === "loan_savers" || category === "saver";
      const defaultRate = isSavers ? 0.05 : 0.1;
      const dailyRate = isSavers ? 0.002 : 0.004;

      let defaultCharge = 0;
      let daysOverdue = 0;

      // Check overdue criteria
      if (today > dueDate && outstanding > 0) {
        defaultCharge = defaultRate * outstanding;
        const diffTime = Math.abs(today.getTime() - dueDate.getTime());
        daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      }

      const dailyGrowth = outstanding * dailyRate * daysOverdue;
      const totalDue = outstanding + defaultCharge + dailyGrowth;

      totalOutstanding += outstanding;
      totalDefaultCharges += defaultCharge;
      totalDueWithCharges += totalDue;

      const progressPercent =
        loanAmount > 0 ? (amountPaid / loanAmount) * 100 : 0;

      // Aggregate chart points by due date month
      const monthLabel = dueDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      if (!chartDataMap[monthLabel]) {
        chartDataMap[monthLabel] = { outstanding: 0, paid: 0 };
      }
      chartDataMap[monthLabel].outstanding += outstanding;
      chartDataMap[monthLabel].paid += amountPaid;

      return {
        loan_id: loan.loan_id,
        loan_amount: loanAmount,
        amount_paid: amountPaid,
        start_date: loan.start_date,
        due_date: loan.due_date,
        loan_category: loan.loan_category,
        outstanding,
        defaultRate,
        dailyRate,
        defaultCharge,
        daysOverdue,
        dailyGrowth,
        totalDue,
        progressPercent,
      };
    });

    const chartData: ChartDataPoint[] = Object.entries(chartDataMap).map(
      ([month, values]) => ({
        month,
        outstanding: values.outstanding,
        paid: values.paid,
      })
    );

    const responseData: LoanReportResponse = {
      memberName,
      loans: processedLoans,
      totals: {
        totalLoanCollected,
        totalOutstanding,
        totalDefaultCharges,
        totalDueWithCharges,
      },
      chartData,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Error generating loan report:", error);
    return NextResponse.json(
      { message: "Failed to generate loan report." },
      { status: 500 }
    );
  }
}

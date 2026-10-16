export interface RawLoanItem {
  loan_id: number;
  member_id: string;
  full_name: string;
  loan_category: "monthly_saver" | "borrower" | string;
  loan_amount: number | string;
  amount_paid: number | string;
  start_date: string;
  due_date: string;
}

export interface CalculatedLoanItem {
  loan_id: number;
  member_id: string;
  full_name: string;
  loan_category: string;
  loan_amount: number;
  amount_paid: number;
  outstanding: number;
  start_date: string;
  due_date: string;
  daysOverdue: number;
  defaultCharge: number;
  dailyGrowth: number;
  totalDue: number;
}

export interface LoanTotals {
  loanCollected: number;
  outstanding: number;
  defaultCharges: number;
  dueWithCharges: number;
}

export interface AdminLoanDashboardApiResponse {
  success: boolean;
  message: string;
  loans?: CalculatedLoanItem[];
  totals?: LoanTotals;
}

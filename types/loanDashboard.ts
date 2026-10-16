export interface LoanRecord {
  loan_id: number;
  member_id: number;
  full_name: string;
  loan_amount: number;
  amount_paid: number;
  start_date: string;
  due_date: string;
  loan_category: "monthly_saver" | "borrower" | string;
  outstanding: number;
  days_overdue: number;
  default_charge: number;
  daily_growth: number;
  total_due: number;
}

export interface LoanDashboardTotals {
  loanCollected: number;
  outstanding: number;
  defaultCharges: number;
  dueWithCharges: number;
}

export interface LoanDashboardApiResponse {
  success: boolean;
  loans: LoanRecord[];
  totals: LoanDashboardTotals;
  message?: string;
}

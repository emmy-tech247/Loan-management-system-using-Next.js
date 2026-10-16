export type LoanFilterPeriod = "all" | "day" | "month" | "3months";

export type LoanStatus = "active" | "completed font" | "defaulted" | "pending";

export interface LoanSummary {
  total_loan_given: number;
  total_repaid: number;
  total_outstanding: number;
  total_defaulted: number;
}

export interface LoanRecord {
  loan_id: number;
  member_id: number;
  full_name: string;
  loan_amount: number;
  interest_rate: number;
  start_date: string;
  end_date: string;
  loan_status: LoanStatus;
  purpose: string;
  guarantor_name: string;
  monthly_repayment: number;
  amount_paid: number;
  loan_balance: number;
}

export interface AdminLoansApiResponse {
  success: boolean;
  filter: LoanFilterPeriod;
  summary: LoanSummary;
  data: LoanRecord[];
  message?: string;
}

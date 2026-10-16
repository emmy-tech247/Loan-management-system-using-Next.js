export interface AccountantLoanItem {
  loan_id: number;
  loan_amount: number | string;
  tenure_month: number | string;
  loan_status: string;
  created_at?: string;
  disbursed_at?: string;
  full_name: string;
}

export interface AccountantDashboardApiResponse {
  success: boolean;
  message: string;
  accountantName?: string;
  forwardedLoans?: AccountantLoanItem[];
  disbursedLoans?: AccountantLoanItem[];
}

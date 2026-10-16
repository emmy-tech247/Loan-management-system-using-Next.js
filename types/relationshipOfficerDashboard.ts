export interface OfficerLoanItem {
  loan_id: number;
  full_name: string;
  loan_amount: number | string;
  tenure_month: number | string;
  loan_status: string;
  created_at: string;
}

export interface OfficerDashboardApiResponse {
  success: boolean;
  message: string;
  officerName?: string;
  loans?: OfficerLoanItem[];
}

export interface AuditorLoanItem {
  loan_id: number;
  full_name: string;
  loan_amount: number | string;
  tenure_month: number | string;
  loan_status: string;
  created_at: string;
}

export interface AuditorDashboardApiResponse {
  success: boolean;
  message: string;
  auditorName?: string;
  loans?: AuditorLoanItem[];
}

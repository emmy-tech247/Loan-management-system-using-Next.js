export interface ManagerLoanItem {
  loan_id: number;
  loan_amount: number | string;
  tenure_month: number | string;
  loan_status: string;
  created_at: string;
  full_name: string;
}

export interface ManagerDashboardApiResponse {
  success: boolean;
  message: string;
  managerName?: string;
  loans?: ManagerLoanItem[];
}

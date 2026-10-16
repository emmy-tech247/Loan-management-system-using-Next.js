export interface SystemLog {
  log_id?: number;
  username: string;
  role: string;
  action: string;
  created_at: string;
}

export interface LoanSummary {
  total_loans: number;
  total_loan_amount: number | string | null;
}

export interface SavingsSummary {
  total_savings: number;
  total_savings_amount: number | string | null;
}

export interface RoleActivity {
  role: string;
  actions: number | string;
}

export interface BackupRecoveryApiResponse {
  success: boolean;
  loanSummary: LoanSummary;
  savingsSummary: SavingsSummary;
  logs: SystemLog[];
  roleActivities: RoleActivity[];
  message?: string;
}

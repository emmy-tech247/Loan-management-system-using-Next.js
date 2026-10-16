export interface LogItem {
  id: number;
  username: string;
  role: string;
  action: string;
  created_at: string;
}

export interface FinancialSummary {
  total_loans: number;
  total_loan_amount: number;
  total_savings: number;
  total_savings_amount: number;
}

export interface RoleActivity {
  role: string;
  actions: number;
}

export interface BackupRecoveryData {
  financialSummary: FinancialSummary;
  logs: LogItem[];
  roleActivities: RoleActivity[];
}

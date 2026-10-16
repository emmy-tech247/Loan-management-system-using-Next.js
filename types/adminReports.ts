export interface MemberStatusSummary {
  status: string;
  count: number | string;
}

export interface LoanStats {
  total_loans: number;
  total_amount: number | string | null;
}

export interface SavingStats {
  total_savers: number;
  total_saved: number | string | null;
}

export interface FixedDepositStats {
  total_fds: number;
  total_fd_amount: number | string | null;
}

export interface RecentPayment {
  id: number;
  amount_paid: number | string;
  created_at: string;
  full_name: string;
}

export interface AdminReportsApiResponse {
  success: boolean;
  membersSummary: MemberStatusSummary[];
  loanStats: LoanStats;
  savingStats: SavingStats;
  fdStats: FixedDepositStats | null;
  payments: RecentPayment[];
  message?: string;
}

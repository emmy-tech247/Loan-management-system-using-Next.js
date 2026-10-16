// types/adminReports.ts

/**
 * Member status summary
 *
 * Used by:
 * membersSummary: MemberStatusSummary[]
 */
export interface MemberStatusSummary {
  status: string;
  count: number | string;
}

/**
 * Loan statistics
 *
 * Used by:
 * loanStats: LoanStats | null
 */
export interface LoanStats {
  total_loans: number | string;
  total_amount: number | string;
}

/**
 * Savings statistics
 *
 * Used by:
 * savingStats: SavingStats | null
 */
export interface SavingStats {
  total_savers: number | string;
  total_saved: number | string;
}

/**
 * Fixed deposit statistics
 *
 * Used by:
 * fdStats: FixedDepositStats | null
 */
export interface FixedDepositStats {
  total_fds: number | string;
  total_fd_amount: number | string;
}

/**
 * Recent payment transaction
 *
 * Used by:
 * payments: RecentPayment[]
 */
export interface RecentPayment {
  id: number | string;
  full_name: string;
  amount_paid: number | string;
  created_at: string;
}
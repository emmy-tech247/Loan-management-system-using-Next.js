export interface FinancialSummaryData {
  loanMembers: number;
  totalLoans: number;
  savingsMembers: number;
  totalSavings: number;
  fdMembers: number;
  totalFd: number;
}

export interface FinancialSummaryApiResponse {
  success: boolean;
  data: FinancialSummaryData;
  message?: string;
}

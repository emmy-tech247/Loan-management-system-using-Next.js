export interface LoanRepaymentItem {
  loan_repayments_id: number;
  member_id: number | string;
  loan_id: number;
  amount_paid: number | string;
  receipt_file: string | null;
}

export interface AcknowledgeRepaymentApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  pendingRepayments?: LoanRepaymentItem[];
}
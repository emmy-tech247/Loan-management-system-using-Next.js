export interface PendingRepayment {
  loan_repayments_id: number;
  member_id: number;
  loan_id: number;
  amount_paid: number;
  receipt_file: string | null;
}

export interface ApproveRepaymentPayload {
  approve_id: number;
}

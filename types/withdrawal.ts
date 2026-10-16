export interface PendingWithdrawal {
  saved_id: number;
  full_name: string;
  amount: number;
  reason: string;
  created_at: string;
}

export interface ApproveWithdrawalPayload {
  approve_id: number;
}

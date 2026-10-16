export interface WithdrawalRequest {
  saved_id: number;
  member_id: number;
  full_name: string;
  amount: number | string;
  reason: string;
  status: string;
  created_at: string;
}

export interface AcknowledgeWithdrawalsApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  withdrawals?: WithdrawalRequest[];
  count?: number;
}
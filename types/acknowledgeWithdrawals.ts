export interface WithdrawalRequest {
  saved_id: number;
  full_name: string;
  amount: number | string;
  reason: string;
  created_at: string;
}

export interface AcknowledgeWithdrawalsApiResponse {
  success: boolean;
  message: string;
  withdrawals?: WithdrawalRequest[];
}

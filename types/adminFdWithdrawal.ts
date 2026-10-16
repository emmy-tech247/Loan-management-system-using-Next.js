export interface FdWithdrawalRequest {
  id: number;
  member_id: string;
  full_name: string;
  action_type: string;
  status: string;
  created_at: string;
}

export interface FdWithdrawalApiResponse {
  success: boolean;
  message: string;
  requests?: FdWithdrawalRequest[];
}

export interface FixedDepositApprovalItem {
  approval_id: number;
  fd_id: number;
  member_id: string;
  amount_deposited: number | string;
  tenure_months: number | string;
  interest_rate: number | string;
  start_date: string;
}

export interface AcknowledgeFdApiResponse {
  success: boolean;
  message: string;
  pendingApprovals?: FixedDepositApprovalItem[];
}

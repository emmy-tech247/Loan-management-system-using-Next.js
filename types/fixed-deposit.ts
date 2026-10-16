export interface FixedDepositRecord {
  id: number;
  member_id: number;
  amount_deposited: number;
  tenure_months: number;
  interest_rate: number;
  start_date: string;
  maturity_date: string | null;
  status: "pending" | "active" | "matured" | "closed" | string;
  created_at?: string;
}

export interface ComputedFDRecord extends FixedDepositRecord {
  interest: number;
  daysLeft: number;
  isMatured: boolean;
}

export interface PendingFD {
  approval_id: number;
  fd_id: number;
  amount_deposited: number;
  tenure_months: number;
  interest_rate: number;
  maturity_date: string;
}

export interface FDApprovalActionPayload {
  approval_id: number;
  fd_id: number;
  action: "confirm" | "reject";
}

export interface FDActionLogRecord {
  fd_id: number;
  full_name: string;
  email: string;
  amount_deposited: number;
  tenure_months: number;
  interest_rate: number;
  status: "active" | "matured" | "closed" | "pending_withdrawal" | "pending_rollover" | string;
  action_type?: "withdraw" | "rollover" | string | null;
  action_date?: string | null;
  approval_status?: "approved" | "rejected" | "pending" | string | null;
  approved_at?: string | null;
  note?: string | null;
}

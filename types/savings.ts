export interface SavingsTransaction {
  id: number;
  member_id: number;
  amount_saved: number;
  receipt_file: string;
  status: "acknowledged" | "approved" | "rejected";
  created_at?: string;
}

export interface ApproveSavingsPayload {
  approve_id: number;
}

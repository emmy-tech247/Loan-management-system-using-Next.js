export interface PendingDeposit {
  saved_id: number;
  member_id: number;
  full_name: string;
  amount_saved: number;
  reference: string;
  acknowledged_at: string;
}

export interface VerifySavingsPayload {
  saved_id: number;
  action: "confirm" | "reject";
}

export interface PendingFDRequest {
  id: number;
  member_id: number;
  full_name: string;
  action_type: "withdraw" | "rollover";
  status: string;
  amount?: number;
  created_at: string;
}

export interface VerifyFDRequestPayload {
  id: number;
  action: "confirm" | "reject";
}

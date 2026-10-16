export interface SavingsHistoryRecord {
  type: string;
  amount_saved: number;
  narration: string | null;
  created_at: string;
  member_name: string;
  cumulative: number;
}

export interface SavingsHistoryApiResponse {
  success: boolean;
  memberId: string;
  memberName: string;
  from: string;
  to: string;
  memberFullName: string;
  data: SavingsHistoryRecord[];
  message?: string;
}

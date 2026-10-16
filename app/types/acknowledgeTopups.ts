export interface SavingsTransaction {
  saved_id: number;
  member_id: string;
  amount_saved: number | string;
  receipt_file: string;
  status: string;
  created_at?: string;
}

export interface AcknowledgeTopupsApiResponse {
  success: boolean;
  message: string;
  pendingTransactions?: SavingsTransaction[];
}

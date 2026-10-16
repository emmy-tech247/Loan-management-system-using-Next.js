export interface PendingPayment {
  saved_id: number;
  member_id: number;
  amount: number | string;
  reference: string;
  created_at: string;
  full_name: string;
  receipt_file: string | null;
}

export interface AcknowledgeDepositsApiResponse {
  success: boolean;
  payments: PendingPayment[];
  message?: string;
}

export interface PendingPayment {
  saved_id: number;
  member_id: number | string;
  full_name: string;
  email?: string | null;
  phone_number?: string | null;
  amount: number | string;
  reference: string;
  created_at: string;
  receipt_file?: string | null;
}


export interface TransactionRow {
  member_id: number;
  full_name: string | null;
  type: string;
  amount: number;
  payment_method: string;
  reference: string;
  payment_date: string;
  status: string;
}

export interface OfficerDashboardData {
  success: boolean;
  transactions: TransactionRow[];
}

export interface PaymentFormData {
  member_id: number | "";
  type: string;
  amount: number | "";
  payment_method: string;
  reference: string;
  payment_date: string;
}

export interface FinancialTransaction {
  transaction_id: number;
  member_id: number;
  full_name: string;
  transaction_type: string;
  amount: number;
  transaction_date: string;
  reference: string;
}

export interface AdminTransactionsApiResponse {
  success: boolean;
  filter: string;
  data: FinancialTransaction[];
  message?: string;
}

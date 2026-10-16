export interface TransactionItem {
  member_id: number;
  full_name: string;
  type: string;
  amount: number | string;
  payment_method: string;
  reference: string;
  payment_date: string;
  status: string;
}

export interface AccountantPaymentApiResponse {
  success: boolean;
  message: string;
  memberName?: string;
  transactions?: TransactionItem[];
}


export type TransactionType =
  | "loan_repayment"
  | "monthly_contribution"
  | string;

export type PaymentMethod =
  | "cash"
  | "bank_transfer"
  | "pos"
  | string;

export type TransactionStatus =
  | "pending"
  | "pending_verification"
  | "verified"
  | "approved"
  | "rejected"
  | "cancelled"
  | string;

export interface TransactionItem {
  transaction_id?: number;

  member_id: number;

  full_name: string | null;

  type: TransactionType;

  amount: number | string;

  payment_method: PaymentMethod;

  reference: string;

  payment_date: string;

  status: TransactionStatus;

  created_at?: string | null;

  updated_at?: string | null;
}

/**
 * API response returned by:
 * GET /api/admin_staff/accountant/payment
 */
export interface AccountantPaymentApiResponse {
  success: boolean;

  transactions: TransactionItem[];

  message?: string;

  error?: string;
}
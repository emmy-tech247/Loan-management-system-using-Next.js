export type TransactionType =
  | "deposit"
  | "repayment"
  | "fixed_deposit"
  | "monthly_contribution";

export interface PendingTransaction {
  id: number;
  member_id: number;
  full_name: string;
  amount: number;
  type: TransactionType;
  created_at: string;
}

export interface TransactionActionPayload {
  id: number;
  action: "approve" | "reject";
}

export type TransactionType =
  | "deposit"
  | "repayment"
  | "fixed_deposit"
  | "monthly_contribution";

export interface MemberBalanceOverview {
  member_id: number;
  full_name: string;
  savings_balance: number;
  loan_balance: number;
  fixed_balance: number;
  monthly_balance: number;
}

export interface ManualTransactionInput {
  member_id: number;
  full_name: string;
  amount: number;
  type: TransactionType;
}
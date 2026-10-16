export interface AccountantLoanRequestItem {
  loan_id: number;
  member_id: number;
  loan_amount: number | string;
  tenure_month: number | string;
  interest_rate: number | string;
  loan_status: string;
  accountant_status: string;
  assigned_to: string;
  full_name: string;
  phone_number: string;
}

export interface AccountantLoanAcknowledgeResponse {
  success: boolean;
  message: string;
  loans?: AccountantLoanRequestItem[];
}

export interface MemberOption {
  member_id: number;
  full_name: string;
}

export interface LoanApplicationPayload {
  member_id: number;
  loan_amount: number;
  tenure_month: number;
  interest_rate: number;
  loan_type: string;
  loan_category: string;
  purpose: string;
  repayment_source: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  bvn: string;
  guarantor1_name: string;
  guarantor1_phone: string;
  guarantor1_email?: string;
  guarantor1_address: string;
  guarantor2_name: string;
  guarantor2_phone: string;
  guarantor2_email?: string;
  guarantor2_address: string;
}

export interface LoanApplicationApiResponse {
  success: boolean;
  message: string;
  loan_id?: number;
  member_name?: string;
  members?: MemberOption[];
}

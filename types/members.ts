export type MemberStatus =
  | "pending"
  | "approved"
  | "suspended";

export interface Member {
  member_id: number;
  full_name: string;
  email: string;
  nin: string;
  phone_number: string;

  state_of_origin: string;
  lga_of_origin: string;
  permanent_address: string;
  residential_address: string;

  bank_name: string;
  account_type: string;
  account_number: string;
  account_name: string;

  place_of_work: string;
  type_of_business_work: string;
  monthly_earning: number;
  annual_income: number;

  full_name_of_next_of_kin: string;
  relationship_with_next_of_kin: string;
  phone_number_of_next_of_kin: string;
  address_of_next_of_kin: string;

  expected_monthly_contribution_amount: number;
  fixed_deposit_amount: number;
  fixed_deposit_years: number;

  id_document: string | null;
  passport: string | null;
  payment_receipt: string | null;

  status: MemberStatus;
  created_at: string;
}
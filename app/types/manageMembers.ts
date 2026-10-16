export interface MemberRecord {
  member_id: number;
  full_name: string;
  nin: string;
  state_of_origin: string;
  lga_of_origin: string;
  permanent_address: string;
  residential_address: string;
  phone_number: string;
  email: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  account_type: string;
  place_of_work: string;
  type_of_business_work: string;
  monthly_earning: number | string;
  annual_income: number | string;
  expected_monthly_contribution_amount: number;
  fixed_deposit_amount: number;
  fixed_deposit_years: number;
  contribution_start_date: string;
  full_name_of_next_of_kin: string;
  address_of_next_of_kin: string;
  phone_number_of_next_of_kin: string;
  relationship_with_next_of_kin: string;
  id_document: string | null;
  passport: string | null;
  payment_receipt: string | null;
  status: "pending" | "approved" | "suspended" | string;
  created_at: string;
}

export interface ManageMembersApiResponse {
  success: boolean;
  members: MemberRecord[];
  message?: string;
}

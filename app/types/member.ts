import type {
  AccountType,
  MonthlyEarning,
  AnnualIncome,
} from "./common";

/*Registration Form
==============================================================*/

export interface MemberRegistrationForm {

  /* Personal */

  surname: string;

  firstname: string;

  othername: string;

  nin: string;

  password: string;

  state_of_origin: string;

  lga_of_origin: string;

  permanent_address: string;

  residential_address: string;

  phone_number: string;

  email: string;

  /* Bank */

  bank_name: string;

  account_number: string;

  account_name: string;

  account_type: AccountType;

  /* Employment */

  place_of_work: string;

  type_of_business_work: string;

  monthly_earning: MonthlyEarning;

  annual_income: AnnualIncome;

  /* Contribution */

  expected_monthly_contribution_amount: number;

  fixed_deposit_amount: number;

  fixed_deposit_years: number;

  contribution_start_date: string;

  /* Next Of Kin */

  full_name_of_next_of_kin: string;

  address_of_next_of_kin: string;

  phone_number_of_next_of_kin: string;

  relationship_with_next_of_kin: string;

}

/*==============================================================
Uploaded Files
==============================================================*/

export interface MemberUploads {
  passport: File | null;
  id_document: File | null;
  payment_receipt: File | null;
}


/*==============================================================
Combined Form
==============================================================*/

export interface RegistrationData
  extends MemberRegistrationForm,
    MemberUploads {}

    
/*==============================================================
Database Member Record
==============================================================*/

export interface Member {
  // ...
}


/*==============================================================
Registration Summary
==============================================================*/

export interface RegistrationSummary {
  full_name: string;
  email: string;
  phone_number: string;
  expected_monthly_contribution_amount: number;
  fixed_deposit_amount: number;
  contribution_start_date: string;
}

export type MemberStatus = "pending" | "approved" | "suspended";

export interface Member {
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
  monthly_earning: string;
  annual_income: string;
  expected_monthly_contribution_amount: number;
  fixed_deposit_amount: number;
  fixed_deposit_years: number;
  contribution_start_date: string;
  full_name_of_next_of_kin: string;
  address_of_next_of_kin: string;
  phone_number_of_next_of_kin: string;
  relationship_with_next_of_kin: string;
  id_document?: string;
  passport?: string;
  payment_receipt?: string;
  status: MemberStatus;
  created_at: string;
}

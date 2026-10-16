export interface MemberProfileItem {
  member_id: string;
  full_name: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  phone_number: string;
  passport: string;
}

export interface MembersDirectoryApiResponse {
  success: boolean;
  message: string;
  members?: MemberProfileItem[];
}

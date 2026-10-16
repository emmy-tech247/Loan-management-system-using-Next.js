export type StaffRole =
  | "relationship_officer1"
  | "relationship_officer2"
  | "auditor"
  | "manager"
  | "accountant"
  | "admin"
  | "md";

export interface Staff {
  staff_id: number;
  full_name: string;
  role: StaffRole;
  email: string;
  phone: string;
  created_at?: string;
}

export interface LoggedInStaff {
  staffId: number;
  fullName: string;
  email: string;
  phone: string;
  role: StaffRole;
}

export interface StaffLoginResponse {
  success: boolean;
  message: string;
  staff?: LoggedInStaff;
}

export interface NewStaffInput {
  full_name: string;
  email: string;
  phone: string;
  role: StaffRole;
  password: string;
}
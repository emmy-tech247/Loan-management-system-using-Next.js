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
  email: string;
  phone: string;
  role: StaffRole;
  created_at?: string;
}

export interface NewStaffInput {
  full_name: string;
  email: string;
  phone: string;
  role: StaffRole;
  password: string;
}

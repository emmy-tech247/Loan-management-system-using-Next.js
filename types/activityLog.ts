export type LogRole =
  | "member"
  | "relationship_officer"
  | "admin"
  | "manager"
  | "accountant"
  | "auditor"
  | "md";

export type LogFilterPeriod = "daily" | "monthly" | "quarterly";

export interface ActivityLog {
  id: number;
  user_id: string | number;
  role: LogRole;
  activity: string;
  ip_address: string;
  created_at: string;
}

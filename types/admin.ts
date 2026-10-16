export interface AdminAction {
  id: string;
  title: string;
  href: string;
  iconName: string;
  category: "management" | "financials" | "approvals" | "logs_reports";
  notifType?: string;
  description?: string;
}

export interface NotificationCounts {
  members?: number;
  staff?: number;
  update?: number;
  edit?: number;
  announcement?: number;
  backup?: number;
  fd?: number;
  confirm?: number;
  topup?: number;
  docs?: number;
  withdrawal?: number;
  sequence?: number;
  deposits?: number;
  repayment?: number;
  signature?: number;
  chat?: number;
  fd_withdrawal?: number;
  logs?: number;
  loan?: number;
  member?: number;
  activities?: number;
  transactions?: number;
  login?: number;
  savings_history?: number;
  loan_report?: number;
  reports?: number;
  bank?: number;
  dividend?: number;
}

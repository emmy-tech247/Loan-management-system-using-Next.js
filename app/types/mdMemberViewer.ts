export interface MemberProfile {
  member_id: number;
  full_name: string;
  email: string;
  phone_number: string;
  passport: string;
}

export interface MemberFinancials {
  loanBalance: number;
  savingsBalance: number;
  monthlySavings: number;
  repayTotal: number;
}

export interface FixedDepositRecord {
  fd_id: number;
  amount_deposited: number;
  tenure_months: number;
  interest_rate: number;
  status: "confirmed" | "pending" | "matured" | "cancelled";
  maturity_date: string;
}

export interface LoanDueDate {
  due_date: string;
  amount_due: number;
  status: "pending" | "paid" | "overdue";
}

export interface ApprovalItem {
  item_type: "loan" | "fixed_deposit";
  status: "approved" | "pending" | "rejected" | "checked";
}

export interface Announcement {
  id: number;
  title: string;
  message: string;
  created_at: string;
}

export interface MDMemberViewerResponse {
  success: boolean;
  member?: MemberProfile;
  financials?: MemberFinancials;
  fdRecords?: FixedDepositRecord[];
  dueDates?: LoanDueDate[];
  loanApprovals?: ApprovalItem[];
  fdApprovals?: ApprovalItem[];
  announcements?: Announcement[];
  message?: string;
}

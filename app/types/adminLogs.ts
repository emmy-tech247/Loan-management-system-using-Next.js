export interface ActivityLog {
  log_id: number;
  user_id: number;
  role: string;
  action: string;
  ip_address: string;
  created_at: string;
}

export interface AdminLogsApiResponse {
  success: boolean;
  startDate: string;
  endDate: string;
  data: ActivityLog[];
  message?: string;
}

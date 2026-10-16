export interface AdminDashboardSession {
  admin1Id: string | number;
  fullName: string;
}

export interface AdminDashboardApiResponse {
  success: boolean;
  admin: AdminDashboardSession;
  message?: string;
}

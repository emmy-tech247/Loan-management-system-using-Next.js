export interface LoginAttemptRecord {
  id: number;
  email: string;
  ip_address: string;
  attempt_time: string;
  success: number; // 0 or 1
}

export interface PasswordResetRecord {
  id: number;
  email: string;
  request_time: string;
}

export interface SecurityAlertsApiResponse {
  success: boolean;
  failedLogins: LoginAttemptRecord[];
  passwordResets: PasswordResetRecord[];
  message?: string;
}

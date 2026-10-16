export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordApiResponse {
  success: boolean;
  message: string;
}

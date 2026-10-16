export interface ManualTransactionRequest {
  memberId: number;
  fullName: string;
  amount: number;
  type: string;
}

export interface ManualTransactionApiResponse {
  success: boolean;
  message: string;
}

export interface MemberLookupApiResponse {
  success: boolean;
  full_name?: string;
  message?: string;
}

export interface SignedMandate {
  signature_id: number;
  member_id: string;
  full_name: string;
  purpose: string;
  signed_at: string;
  signature_path: string;
}

export interface ViewSignaturesApiResponse {
  success: boolean;
  message: string;
  signatures?: SignedMandate[];
}

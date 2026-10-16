export interface SignedMandate {
  id: string; // Unique identifier for mapping
  full_name: string;
  purpose: string;
  signed_at: string;
  signature_path: string;
}

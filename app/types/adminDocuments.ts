export interface CooperativeDocument {
  document_id: number;
  file_name: string;
  file_path: string;
  type: string;
  uploaded_at: string;
  admin1_acknowledged: boolean | number;
}

export interface AdminDocumentsApiResponse {
  success: boolean;
  message: string;
  documents?: CooperativeDocument[];
}

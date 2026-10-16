export interface DocumentItem {
  id: number;
  file_name: string;
  file_path: string;
  type: string;
  acknowledged_at: string;
  admin1_acknowledged: boolean;
  admin2_confirmed: boolean;
}

export interface ConfirmDocumentPayload {
  document_id: number;
}

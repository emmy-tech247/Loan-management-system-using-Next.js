/*==============================================================
Server Action Result
==============================================================*/

export interface ActionResult {
  success: boolean;
  message: string;
  memberId?: number;
}

/*==============================================================
API Response
==============================================================*/

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

/*==============================================================
File Upload Result
==============================================================*/

export interface UploadResult {
  success: boolean;
  filename: string;
  path: string;
  error?: string;
}
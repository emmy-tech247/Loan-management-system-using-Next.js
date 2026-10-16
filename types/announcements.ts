export interface AnnouncementInput {
  title: string;
  content: string;
  expiry_option: "1_day" | "1_week" | "1_month" | "1_year" | "custom";
  custom_date?: string;
}

export interface AnnouncementApiResponse {
  success: boolean;
  message: string;
}

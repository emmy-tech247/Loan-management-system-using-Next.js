export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  expiry_date: string | null;
  priority?: "normal" | "urgent";
}

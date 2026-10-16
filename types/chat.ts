export interface ChatMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  sender_type: "member" | "admin";
  message: string;
  created_at: string;
}

export interface AdminUser {
  id: number;
  name: string;
  role: string;
  status: "online" | "offline";
}

export interface MemberChatListItem {
  member_id: number;
  full_name: string;
  email?: string;
  unread_count?: number;
  last_message_at?: string;
}

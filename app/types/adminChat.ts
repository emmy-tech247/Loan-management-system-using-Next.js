export type ChatSenderType =
  | "member"
  | "admin1"
  | "admin2";

export interface AdminChatListItem {
  member_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  last_message: string | null;
  last_time: string | null;
  unread_count: number;
}

export interface AdminChatMessage {
  id: number;
  sender_id: string;
  receiver_id: string;
  sender_type: ChatSenderType;
  receiver_type: ChatSenderType;
  message: string;
  is_read: number;
  created_at: string;
}

export interface AdminChatListResponse {
  success: boolean;
  message: string;
  chats?: AdminChatListItem[];
}

export interface AdminChatResponse {
  success: boolean;
  message: string;
  member?: {
    member_id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
  };
  messages?: AdminChatMessage[];
}
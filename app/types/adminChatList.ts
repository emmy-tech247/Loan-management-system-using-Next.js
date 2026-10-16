export interface ChatListItem {
  member_id: string;
  full_name: string;
  last_message: string | null;
  last_time: string | null;
  unread_count: number | string;
}

export interface AdminChatListApiResponse {
  success: boolean;
  message: string;
  chats?: ChatListItem[];
}

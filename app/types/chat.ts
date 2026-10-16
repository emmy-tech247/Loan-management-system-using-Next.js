export type ChatUserType =
  | "member"
  | "admin1"
  | "admin2";

export interface ChatMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  sender_type: ChatUserType;
  receiver_type: ChatUserType;
  message: string;
  is_read: number;
  created_at: string | Date;
}

export interface SendChatMessageInput {
  sender_id: number;
  receiver_id: number;
  sender_type: ChatUserType;
  receiver_type: ChatUserType;
  message: string;
}

export interface ChatApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ChatMessagesResponse {
  success: boolean;
  data?: ChatMessage[];
  message?: string;
}

export interface SendMessageResponse {
  success: boolean;
  data?: ChatMessage;
  message?: string;
}
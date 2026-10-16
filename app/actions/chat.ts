"use server";

import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import type {
  ChatUserType,
  SendChatMessageInput,
} from "@/types/chat";

const VALID_TYPES: ChatUserType[] = [
  "member",
  "admin1",
  "admin2",
];

function isValidType(
  value: unknown
): value is ChatUserType {
  return (
    typeof value === "string" &&
    VALID_TYPES.includes(
      value as ChatUserType
    )
  );
}

function parsePositiveId(
  value: unknown
): number | null {
  const id = Number(value);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    return null;
  }

  return id;
}

/*
 * ============================================================
 * SEND CHAT MESSAGE
 * ============================================================
 */
export async function sendChatMessage(
  input: SendChatMessageInput
) {
  try {
    const senderId =
      parsePositiveId(input.sender_id);

    const receiverId =
      parsePositiveId(input.receiver_id);

    const senderType =
      input.sender_type;

    const receiverType =
      input.receiver_type;

    const message =
      typeof input.message === "string"
        ? input.message.trim()
        : "";

    if (!senderId) {
      return {
        success: false,
        error: "Invalid sender ID.",
      };
    }

    if (!receiverId) {
      return {
        success: false,
        error: "Invalid receiver ID.",
      };
    }

    if (!isValidType(senderType)) {
      return {
        success: false,
        error:
          "Invalid sender_type.",
      };
    }

    if (!isValidType(receiverType)) {
      return {
        success: false,
        error:
          "Invalid receiver_type.",
      };
    }

    if (!message) {
      return {
        success: false,
        error:
          "Message content cannot be empty.",
      };
    }

    if (message.length > 10000) {
      return {
        success: false,
        error:
          "Message is too long. Maximum length is 10,000 characters.",
      };
    }

    const [result] =
      await pool.execute(
        `
          INSERT INTO \`chat-messages\`
          (
            sender_id,
            receiver_id,
            sender_type,
            receiver_type,
            message,
            is_read,
            created_at
          )
          VALUES (?, ?, ?, ?, ?, 0, NOW())
        `,
        [
          senderId,
          receiverId,
          senderType,
          receiverType,
          message,
        ]
      );

    const insertResult =
      result as {
        insertId: number;
      };

    revalidatePath("/chat");
    revalidatePath(
      "/admin_staff/md/chat"
    );

    return {
      success: true,
      insertId:
        insertResult.insertId,
    };
  } catch (error) {
    console.error(
      "sendChatMessage error:",
      error
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to send message.",
    };
  }
}

/*
 * ============================================================
 * MARK MESSAGES AS READ
 * ============================================================
 */
export async function markMessagesAsRead(
  receiverId: number,
  receiverType: ChatUserType,
  senderId: number,
  senderType: ChatUserType
) {
  try {
    if (
      !parsePositiveId(receiverId) ||
      !parsePositiveId(senderId)
    ) {
      return {
        success: false,
        error:
          "Invalid participant ID.",
      };
    }

    if (
      !isValidType(receiverType) ||
      !isValidType(senderType)
    ) {
      return {
        success: false,
        error:
          "Invalid participant type.",
      };
    }

    await pool.execute(
      `
        UPDATE \`chat-messages\`
        SET is_read = 1
        WHERE receiver_id = ?
          AND receiver_type = ?
          AND sender_id = ?
          AND sender_type = ?
          AND is_read = 0
      `,
      [
        receiverId,
        receiverType,
        senderId,
        senderType,
      ]
    );

    revalidatePath("/chat");
    revalidatePath(
      "/admin_staff/md/chat"
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "markMessagesAsRead error:",
      error
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to mark messages as read.",
    };
  }
}
import {
  NextRequest,
  NextResponse,
} from "next/server";

import pool from "@/lib/db";

import type {
  ChatUserType,
} from "@/types/chat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const receiverId =
      Number(body.receiver_id);

    const senderId =
      Number(body.sender_id);

    const receiverType =
      body.receiver_type;

    const senderType =
      body.sender_type;

    if (
      !Number.isInteger(receiverId) ||
      receiverId <= 0 ||
      !Number.isInteger(senderId) ||
      senderId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid participant ID.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !isValidType(receiverType) ||
      !isValidType(senderType)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid participant type.",
        },
        {
          status: 400,
        }
      );
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

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "POST /api/admin_staff/md/messages/read error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to mark messages as read.",
      },
      {
        status: 500,
      }
    );
  }
}
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

function parseId(
  value: string | null
): number | null {
  if (!value) {
    return null;
  }

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
 * GET CHAT HISTORY
 *
 * Example:
 *
 * /api/messages?
 * user1=101&
 * user1Type=member&
 * user2=2&
 * user2Type=admin2
 * ============================================================
 */
export async function GET(
  request: NextRequest
) {
  try {
    const searchParams =
      request.nextUrl.searchParams;

    const user1 =
      parseId(
        searchParams.get("user1")
      );

    const user2 =
      parseId(
        searchParams.get("user2")
      );

    const user1Type =
      searchParams.get("user1Type");

    const user2Type =
      searchParams.get("user2Type");

    if (!user1 || !user2) {
      return NextResponse.json(
        {
          success: false,
          message:
            "user1 and user2 are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!isValidType(user1Type)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid user1Type.",
        },
        {
          status: 400,
        }
      );
    }

    if (!isValidType(user2Type)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid user2Type.",
        },
        {
          status: 400,
        }
      );
    }

    const [rows] =
      await pool.execute(
        `
          SELECT
            id,
            sender_id,
            receiver_id,
            sender_type,
            receiver_type,
            message,
            is_read,
            created_at
          FROM \`chat-messages\`
          WHERE
            (
              sender_id = ?
              AND sender_type = ?
              AND receiver_id = ?
              AND receiver_type = ?
            )
            OR
            (
              sender_id = ?
              AND sender_type = ?
              AND receiver_id = ?
              AND receiver_type = ?
            )
          ORDER BY created_at ASC, id ASC
          LIMIT 100
        `,
        [
          user1,
          user1Type,
          user2,
          user2Type,

          user2,
          user2Type,
          user1,
          user1Type,
        ]
      );

    return NextResponse.json(
      {
        success: true,
        data: rows,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "GET /api/admin_staff/md/messages error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load chat messages.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * ============================================================
 * POST MESSAGE
 * ============================================================
 */
export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const senderId =
      Number(body.sender_id);

    const receiverId =
      Number(body.receiver_id);

    const senderType =
      body.sender_type;

    const receiverType =
      body.receiver_type;

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    if (
      !Number.isInteger(senderId) ||
      senderId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid sender_id.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(receiverId) ||
      receiverId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid receiver_id.",
        },
        {
          status: 400,
        }
      );
    }

    if (!isValidType(senderType)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid sender_type.",
        },
        {
          status: 400,
        }
      );
    }

    if (!isValidType(receiverType)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid receiver_type.",
        },
        {
          status: 400,
        }
      );
    }

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Message content cannot be empty.",
        },
        {
          status: 400,
        }
      );
    }

    if (message.length > 10000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Message is too long.",
        },
        {
          status: 400,
        }
      );
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

    const [rows] =
      await pool.execute(
        `
          SELECT
            id,
            sender_id,
            receiver_id,
            sender_type,
            receiver_type,
            message,
            is_read,
            created_at
          FROM \`chat-messages\`
          WHERE id = ?
          LIMIT 1
        `,
        [
          insertResult.insertId,
        ]
      );

    return NextResponse.json(
      {
        success: true,
        data:
          Array.isArray(rows) &&
          rows.length
            ? rows[0]
            : null,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/admin_staff/md/messages error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to send message.",
      },
      {
        status: 500,
      }
    );
  }
}
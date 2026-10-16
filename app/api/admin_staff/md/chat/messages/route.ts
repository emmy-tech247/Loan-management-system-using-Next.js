import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";

/**
 * GET
 * Load conversation between MD and a member.
 */
export async function GET(request: NextRequest) {
  try {
    const staffRole = request.cookies.get("staff_role")?.value;

    if (!staffRole) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please log in again.",
        },
        { status: 401 }
      );
    }

    if (staffRole !== "md") {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied.",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    const memberId = Number(searchParams.get("member_id"));

    if (!memberId || Number.isNaN(memberId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid member ID is required.",
        },
        { status: 400 }
      );
    }

    const [rows] = await db.execute(
      `
      SELECT
        message_id,
        member_id,
        sender_type,
        sender_id,
        message,
        is_read,
        created_at
      FROM member_messages
      WHERE member_id = ?
      ORDER BY created_at ASC, message_id ASC
      `,
      [memberId]
    );

    /*
     * Mark member messages as read when MD opens the conversation.
     */
    await db.execute(
      `
      UPDATE member_messages
      SET is_read = 1
      WHERE member_id = ?
        AND sender_type = 'member'
        AND is_read = 0
      `,
      [memberId]
    );

    return NextResponse.json({
      success: true,
      messages: rows,
    });
  } catch (error) {
    console.error("MD GET MESSAGES ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load messages.",
      },
      { status: 500 }
    );
  }
}


/**
 * POST
 * Send a message from MD to a member.
 */
export async function POST(request: NextRequest) {
  try {
    const staffRole = request.cookies.get("staff_role")?.value;
    const staffId = request.cookies.get("staff_id")?.value;

    if (!staffRole || !staffId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please log in again.",
        },
        { status: 401 }
      );
    }

    if (staffRole !== "md") {
      return NextResponse.json(
        {
          success: false,
          error: "Only the Managing Director can send messages here.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const memberId = Number(body.member_id);
    const message = String(body.message || "").trim();

    if (!memberId || Number.isNaN(memberId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid member ID is required.",
        },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          error: "Message cannot be empty.",
        },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          error: "Message is too long. Maximum 5000 characters.",
        },
        { status: 400 }
      );
    }

    /*
     * Confirm that the member exists and is approved.
     */
    const [memberRows] = await db.execute(
      `
      SELECT member_id
      FROM members
      WHERE member_id = ?
        AND status = 'approved'
      LIMIT 1
      `,
      [memberId]
    );

    const members = memberRows as Array<{
      member_id: number;
    }>;

    if (members.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Member not found or not approved.",
        },
        { status: 404 }
      );
    }

    /*
     * Insert the message.
     */
    const [result] = await db.execute(
      `
      INSERT INTO member_messages
      (
        member_id,
        sender_type,
        sender_id,
        message,
        is_read
      )
      VALUES (?, 'md', ?, ?, 0)
      `,
      [
        memberId,
        Number(staffId),
        message,
      ]
    );

    const insertResult = result as {
      insertId: number;
    };

    /*
     * Return the newly created message.
     */
    const [newMessageRows] = await db.execute(
      `
      SELECT
        message_id,
        member_id,
        sender_type,
        sender_id,
        message,
        is_read,
        created_at
      FROM member_messages
      WHERE message_id = ?
      LIMIT 1
      `,
      [insertResult.insertId]
    );

    return NextResponse.json({
      success: true,
      message: (newMessageRows as unknown[])[0],
    });
  } catch (error) {
    console.error("MD SEND MESSAGE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to send message.",
      },
      { status: 500 }
    );
  }
}
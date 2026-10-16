import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================
// GET CONVERSATION
// ============================================================

export async function GET(request: NextRequest) {
  try {
    // ============================================================
    // AUTHENTICATION
    // ============================================================

    const staffId = request.cookies.get("staff_id")?.value;
    const staffRole = request.cookies.get("staff_role")?.value;

    if (!staffId || !staffRole) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized. Staff login session was not found. Please log in again.",
        },
        { status: 401 }
      );
    }

    if (staffRole.toLowerCase() !== "md") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Managing Director access is required.",
        },
        { status: 403 }
      );
    }

    // ============================================================
    // MEMBER ID
    // ============================================================

    const memberId =
      request.nextUrl.searchParams.get("member_id");

    if (!memberId) {
      return NextResponse.json(
        {
          success: false,
          message: "Member ID is required.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // FIND MEMBER
    // ============================================================

    const [memberRows] = await db.execute(
      `
      SELECT
        member_id,
        full_name,
        email,
        phone
      FROM members
      WHERE member_id = ?
      LIMIT 1
      `,
      [memberId]
    );

    const members = memberRows as any[];

    if (members.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Member not found.",
        },
        { status: 404 }
      );
    }

    // ============================================================
    // MARK MEMBER MESSAGES AS READ
    // ============================================================

    await db.execute(
      `
      UPDATE messages
      SET is_read = 1
      WHERE
        sender_id = ?
        AND sender_type = 'member'
        AND receiver_id = ?
        AND receiver_type = 'admin2'
        AND is_read = 0
      `,
      [memberId, staffId]
    );

    // ============================================================
    // LOAD MESSAGES
    // ============================================================

    const [messageRows] = await db.execute(
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
      FROM messages
      WHERE
        (
          sender_id = ?
          AND sender_type = 'member'
          AND receiver_id = ?
          AND receiver_type = 'admin2'
        )
        OR
        (
          sender_id = ?
          AND sender_type = 'admin2'
          AND receiver_id = ?
          AND receiver_type = 'member'
        )
      ORDER BY
        created_at ASC,
        id ASC
      `,
      [
        memberId,
        staffId,
        staffId,
        memberId,
      ]
    );

    const messages: AdminChatMessage[] = (
      messageRows as any[]
    ).map((row) => ({
      id: Number(row.id),
      sender_id: String(row.sender_id),
      receiver_id: String(row.receiver_id),
      sender_type: row.sender_type,
      receiver_type: row.receiver_type,
      message: row.message,
      is_read: Number(row.is_read || 0),
      created_at: row.created_at,
    }));

    return NextResponse.json(
      {
        success: true,
        message: "Conversation loaded successfully.",
        member: {
          member_id: String(members[0].member_id),
          full_name: members[0].full_name,
          email: members[0].email ?? null,
          phone: members[0].phone ?? null,
        },
        messages,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("MD GET CHAT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load conversation.",
      },
      { status: 500 }
    );
  }
}

// ============================================================
// SEND MESSAGE
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // ============================================================
    // AUTHENTICATION
    // ============================================================

    const staffId = request.cookies.get("staff_id")?.value;
    const staffRole = request.cookies.get("staff_role")?.value;

    if (!staffId || !staffRole) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized. Staff login session was not found. Please log in again.",
        },
        { status: 401 }
      );
    }

    if (staffRole.toLowerCase() !== "md") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Managing Director access is required.",
        },
        { status: 403 }
      );
    }

    // ============================================================
    // REQUEST BODY
    // ============================================================

    const body = await request.json();

    const memberId = String(body.member_id || "").trim();
    const message = String(body.message || "").trim();

    if (!memberId) {
      return NextResponse.json(
        {
          success: false,
          message: "Member ID is required.",
        },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message: "Message cannot be empty.",
        },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          message: "Message cannot exceed 5000 characters.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // VERIFY MEMBER
    // ============================================================

    const [memberRows] = await db.execute(
      `
      SELECT member_id
      FROM members
      WHERE member_id = ?
      LIMIT 1
      `,
      [memberId]
    );

    if ((memberRows as any[]).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Member not found.",
        },
        { status: 404 }
      );
    }

    // ============================================================
    // INSERT INTO YOUR messages TABLE
    // ============================================================

    const [result] = await db.execute(
      `
      INSERT INTO messages
      (
        sender_id,
        receiver_id,
        sender_type,
        receiver_type,
        message,
        is_read,
        created_at
      )
      VALUES
      (?, ?, 'admin2', 'member', ?, 0, NOW())
      `,
      [
        staffId,
        memberId,
        message,
      ]
    );

    const insertResult = result as any;

    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully.",
        message_id: insertResult.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("MD SEND CHAT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send message.",
      },
      { status: 500 }
    );
  }
}
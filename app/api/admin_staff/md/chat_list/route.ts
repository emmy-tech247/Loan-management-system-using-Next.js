import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    // MD uses admin2 in the messages table
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
    // SEARCH
    // ============================================================

    const search =
      request.nextUrl.searchParams.get("search")?.trim() || "";

    let searchCondition = "";
    const params: any[] = [];

    if (search) {
      searchCondition = `
        AND (
          m.full_name LIKE ?
          OR CAST(m.member_id AS CHAR) LIKE ?
          OR m.email LIKE ?
          OR m.phone LIKE ?
        )
      `;

      const searchValue = `%${search}%`;

      params.push(
        searchValue,
        searchValue,
        searchValue,
        searchValue
      );
    }

    // ============================================================
    // IMPORTANT
    //
    // Parameters are added in exactly the same order as the
    // ? placeholders appear in the SQL query.
    // ============================================================

    const sqlParams: any[] = [
      staffId,
      staffId,

      staffId,
      staffId,

      staffId,

      ...params,

      staffId,
      staffId,
    ];

    // ============================================================
    // LOAD CHAT LIST
    // ============================================================

    const [rows] = await db.execute(
      `
      SELECT
        m.member_id,
        m.full_name,
        m.email,
        m.phone,

        (
          SELECT msg.message
          FROM messages msg
          WHERE
            (
              msg.sender_id = m.member_id
              AND msg.sender_type = 'member'
              AND msg.receiver_id = ?
              AND msg.receiver_type = 'admin2'
            )
            OR
            (
              msg.sender_id = ?
              AND msg.sender_type = 'admin2'
              AND msg.receiver_id = m.member_id
              AND msg.receiver_type = 'member'
            )
          ORDER BY msg.created_at DESC, msg.id DESC
          LIMIT 1
        ) AS last_message,

        (
          SELECT msg.created_at
          FROM messages msg
          WHERE
            (
              msg.sender_id = m.member_id
              AND msg.sender_type = 'member'
              AND msg.receiver_id = ?
              AND msg.receiver_type = 'admin2'
            )
            OR
            (
              msg.sender_id = ?
              AND msg.sender_type = 'admin2'
              AND msg.receiver_id = m.member_id
              AND msg.receiver_type = 'member'
            )
          ORDER BY msg.created_at DESC, msg.id DESC
          LIMIT 1
        ) AS last_time,

        (
          SELECT COUNT(*)
          FROM messages msg
          WHERE
            msg.sender_id = m.member_id
            AND msg.sender_type = 'member'
            AND msg.receiver_id = ?
            AND msg.receiver_type = 'admin2'
            AND msg.is_read = 0
        ) AS unread_count

      FROM members m

      WHERE
        m.status = 'approved'

        ${searchCondition}

        AND EXISTS (
          SELECT 1
          FROM messages msg
          WHERE
            (
              msg.sender_id = m.member_id
              AND msg.sender_type = 'member'
              AND msg.receiver_id = ?
              AND msg.receiver_type = 'admin2'
            )
            OR
            (
              msg.sender_id = ?
              AND msg.sender_type = 'admin2'
              AND msg.receiver_id = m.member_id
              AND msg.receiver_type = 'member'
            )
        )

      ORDER BY
        last_time DESC,
        m.full_name ASC
      `,
      sqlParams
    );

    // ============================================================
    // FORMAT RESULT
    // ============================================================

    const chats: AdminChatListItem[] = (
      rows as any[]
    ).map((row) => ({
      member_id: String(row.member_id),
      full_name: row.full_name,
      email: row.email ?? null,
      phone: row.phone ?? null,
      last_message: row.last_message ?? null,
      last_time: row.last_time ?? null,
      unread_count: Number(row.unread_count || 0),
    }));

    return NextResponse.json(
      {
        success: true,
        message: "Chat list loaded successfully.",
        chats,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("MD CHAT LIST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load chat list.",
      },
      { status: 500 }
    );
  }
}
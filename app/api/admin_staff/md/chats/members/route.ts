import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  try {
    // ============================================================
    // 1. Check MD/Admin session
    // ============================================================

    const cookieStore = await cookies();

    const admin2Id = cookieStore.get("admin2Id");
    const staffId = cookieStore.get("staff_id");

    if (!admin2Id && !staffId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in again.",
          data: [],
        },
        { status: 401 }
      );
    }

    // ============================================================
    // 2. Get members who have participated in chats
    //
    // A member is included when they are either:
    // - sender_id
    // - receiver_id
    //
    // ============================================================

    const [rows]: any = await db.query(`
      SELECT
        m.member_id,
        m.full_name,

        /* Member email */
        m.email,

        /* Unread messages received by admin */
        (
          SELECT COUNT(*)
          FROM messages unread_msg
          WHERE unread_msg.sender_id = m.member_id
            AND unread_msg.is_read = 0
            AND unread_msg.receiver_type = 'admin'
        ) AS unread_count

      FROM members m

      INNER JOIN messages msg
        ON m.member_id = msg.sender_id
        OR m.member_id = msg.receiver_id

      GROUP BY
        m.member_id,
        m.full_name,
        m.email

      ORDER BY
        m.full_name ASC
    `);

    // ============================================================
    // 3. Format response
    // ============================================================

    const data = Array.isArray(rows)
      ? rows.map((member: any) => ({
          member_id: member.member_id,
          full_name: member.full_name || "Unknown Member",
          email: member.email || null,
          unread_count: Number(member.unread_count || 0),
        }))
      : [];

    // ============================================================
    // 4. Return successful response
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        data,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error(
      "GET /api/admin_staff/md/chats/members error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load chat conversations.",
        data: [],
      },
      { status: 500 }
    );
  }
}
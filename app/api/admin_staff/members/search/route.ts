import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const memberId = request.nextUrl.searchParams.get(
      "member_id"
    );

    /*
     * ----------------------------------------------------------
     * VALIDATE MEMBER ID
     * ----------------------------------------------------------
     */

    if (!memberId || !memberId.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Member ID is required.",
          member: null,
        },
        { status: 400 }
      );
    }

    const id = Number(memberId);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid member ID.",
          member: null,
        },
        { status: 400 }
      );
    }

    /*
     * ----------------------------------------------------------
     * FIND MEMBER
     * ----------------------------------------------------------
     */

    const [rows] = await db.query(
      `
      SELECT
        member_id,
        full_name
      FROM members
      WHERE member_id = ?
      LIMIT 1
      `,
      [id]
    );

    const member = (rows as any[])[0];

    /*
     * ----------------------------------------------------------
     * MEMBER NOT FOUND
     * ----------------------------------------------------------
     */

    if (!member) {
      return NextResponse.json(
        {
          success: false,
          message: "Member not found.",
          member: null,
        },
        { status: 404 }
      );
    }

    /*
     * ----------------------------------------------------------
     * SUCCESS
     * ----------------------------------------------------------
     */

    return NextResponse.json(
      {
        success: true,
        member: {
          member_id: Number(member.member_id),
          full_name: member.full_name || "",
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "GET /api/members/search error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to search for member.",
        member: null,
      },
      { status: 500 }
    );
  }
}
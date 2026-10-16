import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      memberId: string;
    }>;
  }
) {
  try {
    // ============================================================
    // GET ROUTE PARAMETER
    // ============================================================

    const { memberId } = await context.params;

    const id = Number(memberId);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid member ID.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // CHECK MD SESSION
    // ============================================================

    const cookieStore = await cookies();

    const staffId = cookieStore.get("staff_id")?.value;
    const staffRole = cookieStore.get("staff_role")?.value;

    if (!staffId || !staffRole) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Staff login session was not found. Please log in again.",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // ONLY MD CAN USE THIS ENDPOINT
    // ============================================================

    if (staffRole.toLowerCase() !== "md") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized. Managing Director access is required.",
        },
        { status: 403 }
      );
    }

    // ============================================================
    // FIND MEMBER
    // ============================================================

    const [rows] = await db.query(
      `
      SELECT
        member_id,
        full_name,
        email,
        phone_number,
        status
      FROM members
      WHERE member_id = ?
      LIMIT 1
      `,
      [id]
    );

    const members = rows as Array<{
      member_id: number;
      full_name: string;
      email?: string | null;
      phone_number?: string | null;
      status?: string | null;
    }>;

    if (members.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Member not found.",
        },
        { status: 404 }
      );
    }

    const member = members[0];

    // ============================================================
    // OPTIONAL: ONLY APPROVED MEMBERS
    // ============================================================

    if (
      member.status &&
      member.status.toLowerCase() !== "approved"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This member has not been approved for chat.",
        },
        { status: 403 }
      );
    }

    // ============================================================
    // SUCCESS
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        message: "Member found.",
        data: {
          member_id: Number(member.member_id),
          full_name: member.full_name,
          email: member.email ?? null,
          phone_number: member.phone_number ?? null,
          status: member.status ?? null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "GET /api/members/[memberId] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal server error.",
      },
      { status: 500 }
    );
  }
}
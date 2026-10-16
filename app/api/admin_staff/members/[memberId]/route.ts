import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface MemberRow {
  member_id: number;
  full_name: string | null;
}

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      memberId: string;
    }>;
  }
) {
  try {
    /* ============================================================
       STAFF SESSION
    ============================================================ */

    const staffId =
      request.cookies.get("staff_id")?.value?.trim() || "";

    const staffRole =
      request.cookies.get("staff_role")?.value?.trim().toLowerCase() ||
      "";

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

    /* ============================================================
       ADMIN ACCESS

       Your staff table uses:
       admin
       md
       accountant
       auditor
       relationship_officer1
       relationship_officer2
       manager

       This page is for normal ADMIN.
    ============================================================ */

    if (staffRole !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized. Admin access is required.",
        },
        { status: 403 }
      );
    }

    /* ============================================================
       MEMBER ID
    ============================================================ */

    const { memberId } = await context.params;

    const id = Number(memberId);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Member ID.",
        },
        { status: 400 }
      );
    }

    /* ============================================================
       FIND MEMBER
    ============================================================ */

    const [rows] = await db.execute(
      `
      SELECT
        member_id,
        full_name
      FROM members
      WHERE member_id = ?
        AND status = 'approved'
        AND deleted = 0
      LIMIT 1
      `,
      [id]
    );

    const members = rows as MemberRow[];

    if (!members.length) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Approved member was not found.",
        },
        { status: 404 }
      );
    }

    const member = members[0];

    return NextResponse.json(
      {
        success: true,
        data: {
          member_id: member.member_id,
          full_name: member.full_name || "Unnamed Member",
        },
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
      "ADMIN MEMBER SEARCH ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to find member.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
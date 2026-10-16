import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getStaffId(
  request: NextRequest
): number | null {
  const value =
    request.cookies.get("staff_id")?.value;

  if (!value) {
    return null;
  }

  const staffId = Number(value);

  if (!Number.isInteger(staffId) || staffId <= 0) {
    return null;
  }

  return staffId;
}

async function verifyAccountant(
  request: NextRequest
): Promise<boolean> {
  const staffId = getStaffId(request);

  if (!staffId) {
    return false;
  }

  const [rows] = await db.execute(
    `
      SELECT staff_id, role
      FROM admin_panel
      WHERE staff_id = ?
      LIMIT 1
    `,
    [staffId]
  );

  const staff = rows as Array<{
    staff_id: number;
    role: string;
  }>;

  if (staff.length === 0) {
    return false;
  }

  return (
    String(staff[0].role || "")
      .trim()
      .toLowerCase() === "accountant"
  );
}

export async function GET(
  request: NextRequest
) {
  try {
    const authorized =
      await verifyAccountant(request);

    if (!authorized) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const memberIdValue =
      request.nextUrl.searchParams.get(
        "member_id"
      );

    const memberId = Number(memberIdValue);

    if (
      !Number.isInteger(memberId) ||
      memberId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid member ID.",
        },
        { status: 400 }
      );
    }

    const [rows] = await db.execute(
      `
        SELECT
          member_id,
          full_name,
          status,
          deleted
        FROM members
        WHERE member_id = ?
        LIMIT 1
      `,
      [memberId]
    );

    const members = rows as Array<{
      member_id: number;
      full_name: string | null;
      status: string | null;
      deleted: number | null;
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

    if (Number(member.deleted) === 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Member account has been deleted.",
        },
        { status: 400 }
      );
    }

    if (
      String(member.status || "")
        .trim()
        .toLowerCase() !== "approved"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Member account is not approved.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      member_id: member.member_id,
      name: member.full_name || "Unknown Member",
    });
  } catch (error) {
    console.error(
      "ACCOUNTANT MEMBER SEARCH ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to search member.",
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    /* ============================================================
       1. VERIFY ACCOUNTANT LOGIN
    ============================================================ */

    const staffIdCookie = request.cookies.get("staff_id")?.value;

    if (!staffIdCookie) {
      return NextResponse.json(
        {
          success: false,
          message: "Accountant login session not found.",
        },
        { status: 401 }
      );
    }

    const staffId = Number(staffIdCookie);

    if (!Number.isInteger(staffId) || staffId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid accountant session.",
        },
        { status: 401 }
      );
    }

    /* ============================================================
       2. VERIFY ACCOUNTANT FROM admin_panel
    ============================================================ */

    const [staffRows] = await db.execute(
      `
      SELECT
        staff_id,
        full_name,
        role
      FROM admin_panel
      WHERE staff_id = ?
      LIMIT 1
      `,
      [staffId]
    );

    const staff = staffRows as Array<{
      staff_id: number;
      full_name: string;
      role: string;
    }>;

    if (staff.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff account not found.",
        },
        { status: 403 }
      );
    }

    if (staff[0].role !== "accountant") {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. Accountant access required.",
        },
        { status: 403 }
      );
    }

    /* ============================================================
       3. GET MEMBER ID
    ============================================================ */

    const memberId = request.nextUrl.searchParams.get("member_id")?.trim();

    if (!memberId) {
      return NextResponse.json(
        {
          success: false,
          message: "Member ID is required.",
        },
        { status: 400 }
      );
    }

    const numericMemberId = Number(memberId);

    if (!Number.isInteger(numericMemberId) || numericMemberId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid member ID.",
        },
        { status: 400 }
      );
    }

    /* ============================================================
       4. LOOK UP MEMBER
    ============================================================ */

    const [memberRows] = await db.execute(
      `
      SELECT
        member_id,
        full_name
      FROM members
      WHERE member_id = ?
        AND deleted = 0
      LIMIT 1
      `,
      [numericMemberId]
    );

    const members = memberRows as Array<{
      member_id: number;
      full_name: string;
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

    /* ============================================================
       5. RETURN MEMBER
    ============================================================ */

    return NextResponse.json({
      success: true,
      member_id: members[0].member_id,
      full_name: members[0].full_name,
    });
  } catch (error) {
    console.error("ACCOUNTANT MEMBER LOOKUP ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve member information.",
      },
      { status: 500 }
    );
  }
}
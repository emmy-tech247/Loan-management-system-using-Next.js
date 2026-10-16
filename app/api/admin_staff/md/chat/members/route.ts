import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const staffRole = request.cookies.get("staff_role")?.value;

    if (!staffRole) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in again." },
        { status: 401 }
      );
    }

    if (staffRole !== "md") {
      return NextResponse.json(
        { error: "Access denied. Managing Director only." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") || "").trim();

    let query = `
      SELECT
        member_id,
        full_name,
        email,
        phone,
        status
      FROM members
      WHERE status = 'approved'
    `;

    const params: string[] = [];

    if (search) {
      query += `
        AND (
          full_name LIKE ?
          OR email LIKE ?
          OR phone LIKE ?
          OR CAST(member_id AS CHAR) LIKE ?
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

    query += `
      ORDER BY full_name ASC
      LIMIT 100
    `;

    const [rows] = await db.execute(query, params);

    return NextResponse.json({
      success: true,
      members: rows,
    });
  } catch (error) {
    console.error("MD MEMBERS CHAT API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load members.",
      },
      { status: 500 }
    );
  }
}
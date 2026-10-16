import { NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET
 * Load members for the Relationship Officer loan application form.
 */
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        member_id,
        full_name
      FROM members
      ORDER BY full_name ASC
    `);

    return NextResponse.json(
      {
        success: true,
        members: rows,
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
      "GET /api/admin_staff/relationship-officer1/loan-application error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load members.",
        members: [],
      },
      { status: 500 }
    );
  }
}
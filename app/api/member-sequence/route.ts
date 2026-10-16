import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        member_id,
        full_name,
        email,
        phone_number,
        account_type,
        created_at,
        account_number,
        bank_name
      FROM members
      ORDER BY member_id ASC
    `);

    return NextResponse.json({
      success: true,
      members: rows,
    });
  } catch (error) {
    console.error("Error fetching members:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch members",
      },
      { status: 500 }
    );
  }
}
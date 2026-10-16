import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // ============================================================
    // 1. Check MD/staff authentication
    // ============================================================

    const cookieStore = await cookies();

    const admin2Id = cookieStore.get("admin2Id")?.value;
    const staffId = cookieStore.get("staff_id")?.value;

    if (!admin2Id && !staffId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login again.",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // 2. Get acknowledged savings top-ups
    // ============================================================

    const [rows] = await db.query(
      `
      SELECT
        saved_id AS id,
        member_id,
        amount_saved,
        receipt_file,
        status
      FROM savings_transactions
      WHERE type = 'deposit'
        AND status = 'acknowledged'
      ORDER BY saved_id DESC
      `
    );

    // ============================================================
    // 3. Return transactions
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        transactions: rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "GET acknowledged savings top-ups error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load acknowledged savings transactions.",
      },
      { status: 500 }
    );
  }
}
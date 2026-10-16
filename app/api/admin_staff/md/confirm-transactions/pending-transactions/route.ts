import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // ============================================================
    // 1. Check authentication
    // ============================================================

    const cookieStore = await cookies();

    const admin2Id = cookieStore.get("admin2Id")?.value;
    const staffId = cookieStore.get("staff_id")?.value;

    if (!admin2Id && !staffId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please login again.",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // 2. Get accountant transactions awaiting MD approval
    // ============================================================

    const [rows] = await db.query(
      `
      SELECT
        t.transaction_id AS id,
        t.member_id,
        m.full_name,
        t.amount,
        t.type,
        t.status,
        t.created_at
      FROM transactions t
      INNER JOIN members m
        ON m.member_id = t.member_id
      WHERE t.status = 'pending_admin2'
      ORDER BY t.created_at DESC
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
      "GET pending MD transactions error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load pending transactions.",
      },
      { status: 500 }
    );
  }
}
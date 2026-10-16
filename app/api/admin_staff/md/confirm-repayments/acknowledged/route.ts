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
          message: "Unauthorized. Please login again.",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // 2. Get acknowledged loan repayments
    // ============================================================

    const [rows] = await db.query(
      `
      SELECT
        loan_repayments_id,
        member_id,
        loan_id,
        amount_paid,
        receipt_file,
        status
      FROM loan_repayments
      WHERE status = 'acknowledged'
      ORDER BY loan_repayments_id DESC
      `
    );

    // ============================================================
    // 3. Return data
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        repayments: rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "GET acknowledged loan repayments error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load acknowledged loan repayments.",
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        member_id,
        amount_saved,
        receipt_file,
        status
      FROM savings_transactions
      WHERE status = 'acknowledged'
      ORDER BY id DESC
    `);

    return NextResponse.json({
      transactions: rows,
    });
  } catch (error) {
    console.error(
      "Failed to fetch acknowledged savings:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to load acknowledged savings transactions.",
      },
      {
        status: 500,
      }
    );
  }
}
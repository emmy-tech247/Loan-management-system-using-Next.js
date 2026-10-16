import { NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WithdrawalRow = {
  saved_id: number;
  member_id: number;
  full_name: string | null;
  amount: number | string | null;
  reason: string | null;
  status: string | null;
  requested_at: string | Date | null;
};

export async function GET() {
  try {
    const sql = `
      SELECT
        w.withdrawal_id AS saved_id,
        w.member_id,
        COALESCE(m.full_name, 'Unknown Member') AS full_name,
        w.amount,
        COALESCE(w.reason, 'No reason provided') AS reason,
        w.status,
        w.requested_at
      FROM withdrawals AS w
      LEFT JOIN members AS m
        ON m.member_id = w.member_id
      WHERE LOWER(TRIM(COALESCE(w.status, ''))) IN (
        'pending',
        'acknowledged',
        'approved'
      )
      ORDER BY
        w.requested_at DESC,
        w.withdrawal_id DESC
    `;

    const [rows] = await db.query(sql);

    const withdrawals = (rows as WithdrawalRow[]).map((row) => ({
      saved_id: Number(row.saved_id),
      member_id: Number(row.member_id),
      full_name: String(row.full_name ?? "Unknown Member"),
      amount: String(row.amount ?? "0.00"),
      reason: String(row.reason ?? "No reason provided"),
      status: String(row.status ?? "pending"),
      created_at: row.requested_at
        ? new Date(row.requested_at).toISOString()
        : "",
    }));

    return NextResponse.json(
      {
        success: true,
        withdrawals,
        count: withdrawals.length,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error: unknown) {
    console.error(
      "GET /api/admin_staff/admin/acknowledge-withdrawals error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load pending withdrawal requests.",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}
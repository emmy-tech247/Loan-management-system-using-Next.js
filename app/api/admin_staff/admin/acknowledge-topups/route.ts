import { NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================
// TYPES
// ============================================================

type DbRow = Record<string, unknown>;

// ============================================================
// GET PENDING SAVINGS TRANSACTIONS
// ============================================================

export async function GET() {
  try {
    // ----------------------------------------------------------
    // Get pending manual savings transactions
    //
    // Your confirmed monthly_savings columns are:
    // saved_id
    // member_id
    // amount_saved
    // receipt_file
    // status
    // created_at
    // acknowledged_by_admin1
    // forwarded_to_admin2
    // ----------------------------------------------------------

    const sql = `
      SELECT
        saved_id,
        member_id,
        amount_saved,
        receipt_file,
        status,
        created_at,
        acknowledged_by_admin1,
        forwarded_to_admin2

      FROM monthly_savings

      WHERE
        status = 'pending'
        AND COALESCE(acknowledged_by_admin1, 0) = 0

      ORDER BY
        created_at DESC,
        saved_id DESC
    `;

    console.log(
      "GET /api/admin_staff/admin/acknowledge-topups"
    );

    const [rows] = await db.query(sql);

    // ----------------------------------------------------------
    // NORMALIZE MYSQL RESULTS
    // ----------------------------------------------------------

    const transactions = (rows as DbRow[]).map((row) => ({
      saved_id: Number(row.saved_id),

      member_id: Number(row.member_id),

      amount_saved:
        row.amount_saved !== null &&
        row.amount_saved !== undefined
          ? String(row.amount_saved)
          : "0.00",

      receipt_file:
        row.receipt_file !== null &&
        row.receipt_file !== undefined
          ? String(row.receipt_file)
          : "",

      status:
        row.status !== null &&
        row.status !== undefined
          ? String(row.status)
          : "pending",

      created_at:
        row.created_at !== null &&
        row.created_at !== undefined
          ? String(row.created_at)
          : "",

      acknowledged_by_admin1: Number(
        row.acknowledged_by_admin1 ?? 0
      ),

      forwarded_to_admin2: Number(
        row.forwarded_to_admin2 ?? 0
      ),
    }));

    // ----------------------------------------------------------
    // SUCCESS
    // ----------------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        transactions,
        count: transactions.length,
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
      "GET /api/admin_staff/admin/acknowledge-topups error:",
      error
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : String(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load pending savings transactions.",
        error: errorMessage,
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
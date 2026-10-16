import { NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RepaymentRow = {
  loan_repayments_id: number;
  member_id: number | string;
  loan_id: number;
  amount_paid: number | string;
  receipt_file: string | null;
  status: string | null;
};

export async function GET() {
  try {
    const sql = `
      SELECT
        lr.loan_repayments_id,
        lr.member_id,
        lr.loan_id,
        lr.amount_paid,
        lr.receipt_file,
        lr.status
      FROM loan_repayments AS lr
      WHERE LOWER(TRIM(COALESCE(lr.status, ''))) = 'pending'
      ORDER BY lr.loan_repayments_id DESC
    `;

    const [rows] = await db.query(sql);

    const pendingRepayments = (
      rows as RepaymentRow[]
    ).map((row) => ({
      loan_repayments_id: Number(
        row.loan_repayments_id
      ),

      member_id: row.member_id,

      loan_id: Number(row.loan_id),

      amount_paid: String(
        row.amount_paid ?? "0.00"
      ),

      receipt_file:
        row.receipt_file
          ? String(row.receipt_file)
          : "",

    }));

    return NextResponse.json(
      {
        success: true,
        message:
          "Pending loan repayments retrieved successfully.",
        pendingRepayments,
        count: pendingRepayments.length,
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
      "GET /api/admin_staff/admin/acknowledge-repayment error:",
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
          "Failed to retrieve pending loan repayments.",
        error: errorMessage,
        pendingRepayments: [],
      },
      { status: 500 }
    );
  }
}
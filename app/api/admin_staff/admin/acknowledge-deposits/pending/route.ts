import { NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        st.saved_id,
        st.member_id,
        m.full_name,
        m.email,
        m.phone_number,
        st.amount_saved AS amount,
        st.reference,
        st.created_at,
        st.receipt_file
      FROM savings_transactions st
      INNER JOIN members m
        ON m.member_id = st.member_id
      WHERE st.status = 'pending'
      ORDER BY st.created_at DESC
    `);

    return NextResponse.json(
      {
        success: true,
        payments: rows,
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
      "GET pending deposits error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to retrieve pending deposit records.",
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
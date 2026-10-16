import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  let connection;

  try {
    connection = await db.getConnection();

    const [rows] = await connection.execute(
      `
      SELECT
        st.saved_id,
        st.member_id,
        m.full_name,
        st.amount_saved AS amount,
        st.reason,
        st.created_at
      FROM savings_transactions st
      INNER JOIN members m
        ON m.member_id = st.member_id
      WHERE st.type = 'withdrawal'
        AND st.status = 'acknowledged'
      ORDER BY st.created_at DESC, st.saved_id DESC
      `
    );

    return NextResponse.json(
      {
        success: true,
        withdrawals: rows,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "GET /api/admin_staff/md/approve-withdrawals error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load pending withdrawals.",
        withdrawals: [],
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
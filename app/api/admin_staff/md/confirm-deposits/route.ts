import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  try {
    // ============================================================
    // 1. Check MD/Admin session
    // ============================================================

    const cookieStore = await cookies();

    const admin2Id = cookieStore.get("admin2Id");
    const staffId = cookieStore.get("staff_id");

    if (!admin2Id && !staffId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in again.",
          payments: [],
        },
        { status: 401 }
      );
    }

    // ============================================================
    // 2. Get deposits awaiting final confirmation
    //
    // Based on the savings_transactions workflow:
    //
    // type   = deposit
    // status = acknowledged
    //
    // If your system uses another value for deposit type,
    // change the type condition accordingly.
    // ============================================================

    const [rows]: any = await db.query(`
      SELECT
        st.saved_id,
        st.member_id,
        st.amount_saved,

        /*
         * Your currently confirmed schema does not establish
         * a reference column, so return NULL for now.
         */
        NULL AS reference,

        /*
         * Use approved_at as the available timestamp.
         * If acknowledgement has its own column, replace this.
         */
        st.approved_at AS acknowledged_at,

        m.full_name

      FROM savings_transactions st

      INNER JOIN members m
        ON m.member_id = st.member_id

      WHERE st.type = 'deposit'
        AND st.status = 'acknowledged'

      ORDER BY
        st.created_at DESC,
        st.saved_id DESC
    `);

    // ============================================================
    // 3. Format response
    // ============================================================

    const payments = Array.isArray(rows)
      ? rows.map((payment: any) => ({
          saved_id: Number(payment.saved_id),
          member_id: Number(payment.member_id),
          amount_saved: Number(payment.amount_saved || 0),
          reference: payment.reference || "",
          acknowledged_at: payment.acknowledged_at || "",
          full_name: payment.full_name || "Unknown Member",
        }))
      : [];

    // ============================================================
    // 4. Return response
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        payments,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error(
      "GET /api/admin_staff/md/confirm-deposits error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load deposits awaiting confirmation.",
        payments: [],
      },
      { status: 500 }
    );
  }
}
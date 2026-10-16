import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    /*
     * IMPORTANT:
     * Replace this section with your actual authentication/session
     * implementation.
     *
     * For example, if your login system stores member_id in a cookie,
     * retrieve it here.
     */

    const memberIdCookie = request.cookies.get("member_id")?.value;

    if (!memberIdCookie || !/^\d+$/.test(memberIdCookie)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const member_id = Number(memberIdCookie);

    const [rows] = await db.execute(
      `
      SELECT 
        f.fd_id,
        m.full_name,
        m.email,
        f.amount_deposited,
        f.tenure_months,
        f.interest_rate,
        f.status,
        a.action_type,
        a.action_date,
        a.note,
        ap.status AS approval_status,
        ap.approved_at
      FROM fixed_deposits f

      JOIN members m
        ON f.member_id = m.member_id

      LEFT JOIN fd_withdrawals a
        ON f.fd_id = a.fd_id

      LEFT JOIN approvals ap
        ON ap.item_type = 'fixed_deposit'
        AND ap.item_id = f.fd_id

      WHERE f.member_id = ?

      ORDER BY COALESCE(
        a.action_date,
        ap.approved_at,
        f.created_at
      ) DESC
      `,
      [member_id]
    );

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Fixed deposit actions error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load fixed deposit actions.",
      },
      { status: 500 }
    );
  }
}
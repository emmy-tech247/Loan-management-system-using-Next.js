import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

type Repayment = {
  id?: number;
  member_id: number;
  loan_id: number;
  amount_paid: number | string;
  created_at: string;
  receipt_file: string | null;
  status: string;
};

export async function GET(request: NextRequest) {
  try {
    // Prevent unused parameter warning if request isn't otherwise needed.
    void request;

    /*
     * --------------------------------------------------
     * GET AUTHENTICATED SESSION COOKIES
     * --------------------------------------------------
     *
     * These replace the old PHP:
     *
     * $_SESSION['member_id']
     * $_SESSION['adminId']
     */

    const cookieStore = await cookies();

    const memberIdCookie = cookieStore.get("member_id")?.value;
    const adminIdCookie = cookieStore.get("adminId")?.value;

    const memberId = memberIdCookie
      ? Number(memberIdCookie)
      : null;

    const isAdmin = Boolean(adminIdCookie);

    /*
     * --------------------------------------------------
     * AUTHENTICATION CHECK
     * --------------------------------------------------
     */

    if (!memberId && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * --------------------------------------------------
     * ADMIN REQUEST
     * --------------------------------------------------
     *
     * Admin can see all repayment records.
     */

    if (isAdmin) {
      const [rows] = await db.execute<Repayment[]>(
        `
          SELECT
            id,
            member_id,
            loan_id,
            amount_paid,
            created_at,
            receipt_file,
            status
          FROM loan_repayments
          ORDER BY created_at DESC
        `
      );

      return NextResponse.json({
        success: true,
        repayments: rows,
      });
    }

    /*
     * --------------------------------------------------
     * VALIDATE MEMBER ID
     * --------------------------------------------------
     */

    if (
      !memberId ||
      !Number.isInteger(memberId) ||
      memberId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid member authentication",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * --------------------------------------------------
     * MEMBER REQUEST
     * --------------------------------------------------
     *
     * A member can only see their own repayments.
     */

    const [rows] = await db.execute<Repayment[]>(
      `
        SELECT
          id,
          member_id,
          loan_id,
          amount_paid,
          created_at,
          receipt_file,
          status
        FROM loan_repayments
        WHERE member_id = ?
        ORDER BY created_at DESC
      `,
      [memberId]
    );

    return NextResponse.json({
      success: true,
      repayments: rows,
    });
  } catch (error) {
    console.error("Loan repayment API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch loan repayment records",
      },
      {
        status: 500,
      }
    );
  }
}
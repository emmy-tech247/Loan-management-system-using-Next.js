import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

type RepaymentRow = {
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
    const cookieStore = await cookies();

    /*
     * ----------------------------------------------------
     * AUTHENTICATION
     * ----------------------------------------------------
     *
     * Your old PHP application used:
     *
     * $_SESSION['member_id']
     * $_SESSION['adminId']
     *
     * In Next.js, we read these values from cookies.
     */

    const memberIdCookie = cookieStore.get("member_id")?.value;
    const adminIdCookie = cookieStore.get("adminId")?.value;

    const memberId = memberIdCookie
      ? Number(memberIdCookie)
      : null;

    const isAdmin = Boolean(adminIdCookie);

    console.log("Loan repayment authentication:", {
      memberId,
      isAdmin,
    });

    /*
     * ----------------------------------------------------
     * AUTHORIZATION CHECK
     * ----------------------------------------------------
     */

    if (!memberId && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    /*
     * ----------------------------------------------------
     * ADMIN
     * ----------------------------------------------------
     *
     * Admins can see all repayment records.
     */

    if (isAdmin) {
      const [rows] = await db.execute<RepaymentRow[]>(
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
     * ----------------------------------------------------
     * MEMBER VALIDATION
     * ----------------------------------------------------
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
        { status: 401 }
      );
    }

    /*
     * ----------------------------------------------------
     * MEMBER REPAYMENTS
     * ----------------------------------------------------
     *
     * A member can only see their own repayment records.
     */

    const [rows] = await db.execute<RepaymentRow[]>(
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
      { status: 500 }
    );
  }
}
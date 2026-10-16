import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mysql from "mysql2/promise";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";



export async function GET() {
  try {
    // =========================================================
    // GET COOKIES
    // =========================================================

    const cookieStore = await cookies();

    /*
     * IMPORTANT:
     * This must be the cookie created when the member logs in.
     *
     * If your login system uses another cookie name,
     * change "member_id" below.
     */
    const memberCookie = cookieStore.get("member_id");

    if (!memberCookie?.value) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please log in again.",
        },
        {
          status: 401,
        }
      );
    }

    // =========================================================
    // VALIDATE MEMBER ID
    // =========================================================

    const memberId = Number(memberCookie.value);

    if (!Number.isInteger(memberId) || memberId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid member session.",
        },
        {
          status: 401,
        }
      );
    }

    // =========================================================
    // TEST DATABASE CONNECTION
    // =========================================================

    const connection = await pool.getConnection();

    try {
      await connection.ping();
    } finally {
      connection.release();
    }

    // =========================================================
    // GET MEMBER
    // =========================================================

    const [memberRows] = await pool.execute(
      `
        SELECT
          member_id,
          full_name
        FROM members
        WHERE member_id = ?
        LIMIT 1
      `,
      [memberId]
    );

    const members = memberRows as Array<{
      member_id: number;
      full_name: string;
    }>;

    if (members.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Member account was not found.",
        },
        {
          status: 404,
        }
      );
    }

    const memberName = members[0].full_name || "Member";

    // =========================================================
    // GET MEMBER LOANS
    // =========================================================

    const [loanRows] = await pool.execute(
      `
        SELECT
          loan_id,
          loan_amount,
          amount_paid,
          start_date,
          due_date,
          loan_category
        FROM loans
        WHERE member_id = ?
        ORDER BY start_date DESC, loan_id DESC
      `,
      [memberId]
    );

    const loans = loanRows as Array<{
      loan_id: number;
      loan_amount: number | string;
      amount_paid: number | string;
      start_date: string;
      due_date: string;
      loan_category: string;
    }>;

    // =========================================================
    // RETURN JSON
    // =========================================================

    return NextResponse.json(
      {
        success: true,
        memberName,
        loans,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("=================================");
    console.error("LOAN REPORT API ERROR");
    console.error(error);
    console.error("=================================");

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve loan report.",
      },
      {
        status: 500,
      }
    );
  }
}
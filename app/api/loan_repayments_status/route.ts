import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const memberId = cookieStore.get("member_id")?.value;
    const adminId = cookieStore.get("adminId")?.value;

    // Security check
    if (!memberId && !adminId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    let rows;

    // Admin: retrieve all repayments
    if (adminId) {
      const [result] = await db.query(`
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
      `);

      rows = result;
    } else {
      // Member: retrieve only their own repayments
      const [result] = await db.query(
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

      rows = result;
    }

    return NextResponse.json(
      {
        success: true,
        repayments: rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("LOAN REPAYMENTS API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database error while loading loan repayments.",
        error:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}
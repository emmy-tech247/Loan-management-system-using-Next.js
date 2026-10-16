import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    /*
     * IMPORTANT:
     * Replace this section with the session implementation
     * already used by your project.
     *
     * The member ID MUST come from the authenticated session.
     */

    const memberIdCookie = request.cookies.get("member_id")?.value;

    if (!memberIdCookie) {
      return NextResponse.json(
        {
          error: "Unauthorized. Please log in again.",
        },
        {
          status: 401,
        }
      );
    }

    const memberId = Number(memberIdCookie);

    if (!Number.isInteger(memberId) || memberId <= 0) {
      return NextResponse.json(
        {
          error: "Invalid member session.",
        },
        {
          status: 401,
        }
      );
    }

    const { searchParams } = new URL(request.url);

    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";

    let query = `
      SELECT
        type,
        amount_saved,
        narration,
        created_at
      FROM savings_transactions
      WHERE member_id = ?
        AND status = 'approved'
    `;

    const params: (string | number)[] = [memberId];

    if (from && to) {
      query += `
        AND DATE(created_at) BETWEEN ? AND ?
      `;

      params.push(from, to);
    }

    query += `
      ORDER BY created_at ASC
    `;

    const [rows] = await db.execute(query, params);

    const savingsRows = rows as Array<{
      type: string;
      amount_saved: number | string;
      narration: string | null;
      created_at: string;
    }>;

    let cumulative = 0;

    const formattedRows = savingsRows.map((row) => {
      const amount = Number(row.amount_saved);

      if (row.type === "deposit") {
        cumulative += amount;
      } else {
        cumulative -= amount;
      }

      return {
        type: row.type,
        amount_saved: amount,
        narration: row.narration,
        created_at: row.created_at,
        cumulative,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedRows,
    });
  } catch (error) {
    console.error("Savings history API error:", error);

    return NextResponse.json(
      {
        error: "Failed to retrieve savings history.",
      },
      {
        status: 500,
      }
    );
  }
}
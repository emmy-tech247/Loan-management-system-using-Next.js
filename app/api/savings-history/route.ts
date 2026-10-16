import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

type SavingsRow = {
  type: string;
  amount_saved: number;
  narration: string | null;
  created_at: string;
  member_name: string;
};

const ALLOWED_TYPES = ["deposit", "withdrawal"];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const memberId = searchParams.get("member_id")?.trim() || "";
    const memberName = searchParams.get("member_name")?.trim() || "";
    const from = searchParams.get("from")?.trim() || "";
    const to = searchParams.get("to")?.trim() || "";

    /*
     * The PHP version does not query until either
     * member_id or member_name has been supplied.
     */
    if (!memberId && !memberName) {
      return NextResponse.json({
        memberName: "",
        rows: [],
        cumulative: 0,
      });
    }

    const conditions: string[] = [
      "s.status = 'approved'",
      `(s.member_id = ? OR m.full_name LIKE ?)`,
    ];

    const params: (string | number)[] = [
      memberId ? Number(memberId) : 0,
      `%${memberName}%`,
    ];

    /*
     * Match the PHP behavior:
     * date filtering is applied when both dates are supplied.
     */
    if (from && to) {
      conditions.push("DATE(s.created_at) BETWEEN ? AND ?");
      params.push(from, to);
    }

    const sql = `
      SELECT
        s.type,
        s.amount_saved,
        s.narration,
        s.created_at,
        m.full_name AS member_name
      FROM savings_transactions s
      INNER JOIN members m
        ON m.member_id = s.member_id
      WHERE ${conditions.join(" AND ")}
      ORDER BY s.created_at ASC
    `;

    const [rows] = await pool.query(sql, params);

    const savingsRows = rows as SavingsRow[];

    let cumulative = 0;
    let memberFullName = "";

    const formattedRows = savingsRows.map((row) => {
      const amount = Number(row.amount_saved) || 0;

      if (row.type === "deposit") {
        cumulative += amount;
      } else if (ALLOWED_TYPES.includes(row.type)) {
        cumulative -= amount;
      } else {
        // Preserve the PHP behavior of treating non-deposit
        // transactions as deductions.
        cumulative -= amount;
      }

      if (!memberFullName) {
        memberFullName = row.member_name;
      }

      return {
        type: row.type,
        amount_saved: amount,
        narration: row.narration || capitalize(row.type),
        created_at: row.created_at,
        member_name: row.member_name,
        cumulative,
      };
    });

    return NextResponse.json({
      memberName: memberFullName,
      rows: formattedRows,
      cumulative,
    });
  } catch (error) {
    console.error("Savings history API error:", error);

    return NextResponse.json(
      {
        error: "Failed to load savings history",
      },
      { status: 500 }
    );
  }
}

function capitalize(value: string) {
  if (!value) return "";

  return value.charAt(0).toUpperCase() + value.slice(1);
}
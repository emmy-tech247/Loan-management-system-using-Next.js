import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";

export const runtime = "nodejs";

type SavingsRow = {
  type: string;
  amount_saved: number;
  narration: string | null;
  created_at: string;
  member_name: string;
};

type StaffRow = {
  staff_id: number;
  full_name: string;
  role: string;
  email: string;
};

const ALLOWED_TYPES = ["deposit", "withdrawal"];

/**
 * Verify that the current session belongs to an MD.
 *
 * The staff login creates:
 *   staff_id
 *   staff_name
 *   staff_email
 *   staff_role
 *
 * The database source is admin_panel.
 */
async function verifyMD() {
  const cookieStore = await cookies();

  const staffIdCookie =
    cookieStore.get("staff_id")?.value?.trim() || "";

  const staffRoleCookie =
    cookieStore.get("staff_role")?.value?.trim().toLowerCase() || "";

  /*
   * No staff session
   */
  if (!staffIdCookie) {
    return {
      authorized: false,
      status: 401,
      message: "Unauthorized. MD login required.",
    };
  }

  const staffId = Number(staffIdCookie);

  if (!Number.isInteger(staffId) || staffId <= 0) {
    return {
      authorized: false,
      status: 401,
      message: "Unauthorized. MD login required.",
    };
  }

  /*
   * Optional quick cookie check.
   * The database check below remains authoritative.
   */
  if (staffRoleCookie && staffRoleCookie !== "md") {
    return {
      authorized: false,
      status: 403,
      message: "Unauthorized. MD access only.",
    };
  }

  /*
   * IMPORTANT:
   * Your login uses admin_panel, not staff.
   */
  const [staffRows] = await pool.execute(
    `
    SELECT
      staff_id,
      full_name,
      role,
      email
    FROM admin_panel
    WHERE staff_id = ?
    LIMIT 1
    `,
    [staffId]
  );

  const staff = staffRows as StaffRow[];

  if (staff.length === 0) {
    return {
      authorized: false,
      status: 401,
      message:
        "Your MD login session is missing or has expired. Please login again.",
    };
  }

  const currentStaff = staff[0];

  const databaseRole = String(
    currentStaff.role || ""
  )
    .trim()
    .toLowerCase();

  if (databaseRole !== "md") {
    return {
      authorized: false,
      status: 403,
      message: "Unauthorized. MD access only.",
    };
  }

  return {
    authorized: true,
    staff: currentStaff,
  };
}

export async function GET(request: NextRequest) {
  try {
    /*
     * =====================================================
     * MD AUTHENTICATION
     * =====================================================
     */
    const auth = await verifyMD();

    if (!auth.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: auth.message,
          code:
            auth.status === 401
              ? "MD_SESSION_EXPIRED"
              : "MD_ACCESS_DENIED",
        },
        {
          status: auth.status,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    /*
     * =====================================================
     * QUERY PARAMETERS
     * =====================================================
     */
    const { searchParams } = new URL(request.url);

    const memberId =
      searchParams.get("member_id")?.trim() || "";

    const memberName =
      searchParams.get("member_name")?.trim() || "";

    const from =
      searchParams.get("from")?.trim() || "";

    const to =
      searchParams.get("to")?.trim() || "";

    /*
     * No member supplied.
     */
    if (!memberId && !memberName) {
      return NextResponse.json(
        {
          success: true,
          memberName: "",
          rows: [],
          cumulative: 0,
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    /*
     * =====================================================
     * BUILD MEMBER CONDITION
     *
     * Avoid this dangerous condition:
     *
     *   member_id = ? OR full_name LIKE '%%'
     *
     * because an empty member name would match EVERY member.
     * =====================================================
     */
    const conditions: string[] = [
      "s.status = 'approved'",
    ];

    const params: (string | number)[] = [];

    if (memberId) {
      const numericMemberId = Number(memberId);

      if (
        !Number.isInteger(numericMemberId) ||
        numericMemberId <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid member ID.",
          },
          { status: 400 }
        );
      }

      conditions.push("s.member_id = ?");
      params.push(numericMemberId);
    } else if (memberName) {
      conditions.push("m.full_name LIKE ?");
      params.push(`%${memberName}%`);
    }

    /*
     * =====================================================
     * DATE FILTER
     * =====================================================
     */
    if (from && to) {
      conditions.push(
        "DATE(s.created_at) BETWEEN ? AND ?"
      );

      params.push(from, to);
    } else if (from) {
      conditions.push("DATE(s.created_at) >= ?");
      params.push(from);
    } else if (to) {
      conditions.push("DATE(s.created_at) <= ?");
      params.push(to);
    }

    /*
     * =====================================================
     * SAVINGS QUERY
     * =====================================================
     */
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

      const transactionType = String(
        row.type || ""
      )
        .trim()
        .toLowerCase();

      if (transactionType === "deposit") {
        cumulative += amount;
      } else if (
        ALLOWED_TYPES.includes(transactionType)
      ) {
        cumulative -= amount;
      } else {
        /*
         * Preserve your existing behavior:
         * any non-deposit transaction is treated
         * as a deduction.
         */
        cumulative -= amount;
      }

      if (!memberFullName) {
        memberFullName = row.member_name;
      }

      return {
        type: row.type,
        amount_saved: amount,
        narration:
          row.narration ||
          capitalize(transactionType),
        created_at: row.created_at,
        member_name: row.member_name,
        cumulative,
      };
    });

    return NextResponse.json(
      {
        success: true,
        memberName: memberFullName,
        rows: formattedRows,
        cumulative,
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
      "================================="
    );

    console.error(
      "MD SAVINGS HISTORY API ERROR:"
    );

    console.error(error);

    console.error(
      "================================="
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load savings history.",
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

function capitalize(value: string) {
  if (!value) return "";

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();

    // Change this cookie name to whatever your authentication system uses.
    const managerId = cookieStore.get("managerId")?.value;

    if (!managerId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * Fetch manager
     */
    const [managers]: any = await db.query(
      `
      SELECT manager_id, full_name
      FROM managers
      WHERE manager_id = ?
      LIMIT 1
      `,
      [managerId]
    );

    if (!managers || managers.length === 0) {
      return NextResponse.json(
        {
          error: "Manager account not found",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * Fetch loans forwarded to manager
     */
    const [loans]: any = await db.query(
      `
      SELECT
        l.loan_id,
        l.loan_amount,
        l.tenure_month,
        l.loan_status,
        l.created_at,
        m.full_name
      FROM loans l
      INNER JOIN members m
        ON l.member_id = m.member_id
      WHERE l.loan_status = ?
      ORDER BY l.created_at DESC
      `,
      ["forwarded_to_manager"]
    );

    return NextResponse.json({
      manager: {
        managerId: managers[0].manager_id,
        full_name: managers[0].full_name,
      },
      loans,
    });
  } catch (error) {
    console.error("Manager dashboard error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}
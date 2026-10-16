import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonResponse(
  data: Record<string, unknown>,
  status = 200
) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control":
        "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

export async function GET(
  _request: NextRequest
) {
  let connection:
    | Awaited<ReturnType<typeof db.getConnection>>
    | null = null;

  try {
    connection = await db.getConnection();

    /*
     * =========================================================
     * FIXED DEPOSIT APPROVALS
     * =========================================================
     *
     * approvals.item_id = fixed_deposits.fd_id
     *
     * approvals.item_type = 'fixed_deposit'
     *
     * Your approvals table does NOT have:
     *   - approval_id
     *   - fd_id
     *   - acknowledged status
     *
     * Available approval statuses are:
     *   pending
     *   reviewed
     *   checked
     *   approved
     *   rejected
     *
     * For the MD confirmation screen we retrieve records
     * that have reached the reviewed/checked stage.
     */

    const [rows] = await connection.execute(`
      SELECT
        a.item_id AS approval_id,
        fd.fd_id,
        fd.amount_deposited,
        fd.tenure_months,
        fd.interest_rate,
        fd.maturity_date

      FROM approvals a

      INNER JOIN fixed_deposits fd
        ON fd.fd_id = a.item_id

      WHERE a.item_type = 'fixed_deposit'
        AND a.status IN ('reviewed', 'checked')

      ORDER BY
        a.created_at DESC,
        fd.fd_id DESC
    `);

    const fixedDeposits = Array.isArray(rows)
      ? rows.map((fd: any) => ({
          approval_id: Number(
            fd.approval_id
          ),
          fd_id: Number(fd.fd_id),
          amount_deposited: Number(
            fd.amount_deposited || 0
          ),
          tenure_months: Number(
            fd.tenure_months || 0
          ),
          interest_rate: Number(
            fd.interest_rate || 0
          ),
          maturity_date:
            fd.maturity_date || "",
        }))
      : [];

    console.log(
      "PENDING FIXED DEPOSITS:",
      fixedDeposits
    );

    return jsonResponse({
      success: true,
      fixedDeposits,
    });
  } catch (error) {
    console.error(
      "GET /api/admin_staff/confirm-fixed-deposits ERROR:",
      error
    );

    return jsonResponse(
      {
        success: false,
        message:
          "Unable to load pending fixed deposits.",
        fixedDeposits: [],
        error:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      500
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
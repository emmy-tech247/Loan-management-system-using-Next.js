import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================
   GET SUBMITTED TRANSACTIONS
   ============================================================ */

export async function GET(request: NextRequest) {
  try {
    /*
     * ----------------------------------------------------------
     * 1. CHECK STAFF SESSION
     * ----------------------------------------------------------
     */

    const staffIdCookie = request.cookies.get("staff_id")?.value;

    if (!staffIdCookie) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 }
      );
    }

    const staffId = Number(staffIdCookie);

    if (!Number.isInteger(staffId) || staffId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid staff session.",
        },
        { status: 401 }
      );
    }

    /*
     * ----------------------------------------------------------
     * 2. VERIFY STAFF
     * ----------------------------------------------------------
     */

    const [staffRows] = await db.query(
      `
      SELECT
        staff_id,
        full_name,
        role
      FROM staff
      WHERE staff_id = ?
      LIMIT 1
      `,
      [staffId]
    );

    const staff = (staffRows as any[])[0];

    if (!staff) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff account not found.",
        },
        { status: 401 }
      );
    }

    /*
     * ----------------------------------------------------------
     * 3. CHECK ROLE
     * ----------------------------------------------------------
     */

    if (
      String(staff.role).toLowerCase() !==
      "relationship_officer2"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Access denied. Relationship Officer 2 access required.",
        },
        { status: 403 }
      );
    }

    /*
     * ----------------------------------------------------------
     * 4. GET TRANSACTIONS
     *
     * Show transactions submitted by this officer and
     * currently waiting for Accountant acknowledgement.
     *
     * If your transactions table does not have staff_id,
     * this query instead shows all pending accountant
     * transactions.
     * ----------------------------------------------------------
     */

    let rows: any[] = [];

    try {
      const [transactionRows] = await db.query(
        `
        SELECT
          t.transaction_id,
          t.member_id,
          m.full_name,
          t.type,
          t.amount,
          t.payment_method,
          t.reference,
          t.month,
          t.year,
          t.payment_date,
          t.status
        FROM transactions t
        LEFT JOIN members m
          ON m.member_id = t.member_id
        WHERE LOWER(COALESCE(t.status, '')) =
              'pending_accountant'
        ORDER BY t.transaction_id DESC
        `,
      );

      rows = transactionRows as any[];
    } catch (queryError) {
      console.error(
        "Transaction query failed:",
        queryError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to load submitted transactions. Check the transactions table structure.",
          transactions: [],
        },
        { status: 500 }
      );
    }

    /*
     * ----------------------------------------------------------
     * 5. RETURN RESPONSE
     * ----------------------------------------------------------
     */

    return NextResponse.json(
      {
        success: true,
        transactions: rows.map((transaction) => ({
          transaction_id: Number(
            transaction.transaction_id
          ),
          member_id: Number(transaction.member_id),
          full_name:
            transaction.full_name || null,
          type: transaction.type || "",
          amount: Number(transaction.amount || 0),
          payment_method:
            transaction.payment_method || "",
          reference:
            transaction.reference || "",
          month: transaction.month || "",
          year: Number(transaction.year || 0),
          payment_date:
            transaction.payment_date || "",
          status: transaction.status || "",
        })),
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
      "GET /api/relationship-officer2/transactions error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load submitted transactions.",
        transactions: [],
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type FilterType = "all" | "daily" | "monthly" | "3months";

interface AdminPanelStaffRow {
  staff_id: number;
  full_name: string;
  email: string;
  role: string;
}

interface TransactionRow {
  transaction_id: number | string;
  member_id: number | string;
  full_name: string | null;

  transaction_type: string | null;
  amount: number | string | null;

  type: string | null;
  status: string | null;

  transaction_date: string | Date | null;
  reference: string | null;
  created_at: string | Date | null;

  payment_method: string | null;
  accountant_id: number | string | null;
  payment_date: string | Date | null;
}

function jsonResponse(
  data: Record<string, unknown>,
  status = 200
) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control":
        "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

function toNumber(value: unknown): number {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function normalizeDate(
  value: string | Date | null
): string {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}

function normalizeFilter(
  value: string | null
): FilterType {
  switch (String(value || "").trim().toLowerCase()) {
    case "daily":
    case "day":
      return "daily";

    case "monthly":
    case "month":
      return "monthly";

    case "3months":
    case "3-months":
    case "three_months":
      return "3months";

    case "all":
    default:
      return "all";
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log(
      "================================================"
    );

    console.log(
      "FINANCIAL TRANSACTIONS API START"
    );

    console.log("URL:", request.url);

    // ============================================================
    // 1. READ STAFF SESSION
    // ============================================================

    const cookieStore = await cookies();

    /*
     * Current staff login uses staff_id.
     *
     * admin2Id is retained only as a compatibility fallback
     * for older sessions.
     */
    const staffCookie =
      cookieStore.get("staff_id")?.value ||
      cookieStore.get("admin2Id")?.value ||
      "";

    console.log(
      "staff_id cookie:",
      cookieStore.get("staff_id")?.value
        ? "FOUND"
        : "NOT FOUND"
    );

    console.log(
      "admin2Id fallback:",
      cookieStore.get("admin2Id")?.value
        ? "FOUND"
        : "NOT FOUND"
    );

    if (!staffCookie) {
      return jsonResponse(
        {
          success: false,
          message:
            "Staff login session was not found. Please log in again.",
        },
        401
      );
    }

    const staffId = Number(
      String(staffCookie).trim()
    );

    if (
      !Number.isInteger(staffId) ||
      staffId <= 0
    ) {
      return jsonResponse(
        {
          success: false,
          message:
            "Invalid staff login session. Please log in again.",
        },
        401
      );
    }

    console.log(
      "Resolved staff ID:",
      staffId
    );

    // ============================================================
    // 2. VERIFY STAFF AGAINST admin_panel
    // ============================================================

    /*
     * IMPORTANT:
     *
     * The current staff login writes/reads staff accounts
     * from admin_panel.
     *
     * Do NOT query:
     *
     *     FROM staff
     *
     * because that is not the staff table being used by
     * the current authentication system.
     */

    const [staffRows] = await db.execute(
      `
      SELECT
        staff_id,
        full_name,
        email,
        role
      FROM admin_panel
      WHERE staff_id = ?
      LIMIT 1
      `,
      [staffId]
    );

    const staff =
      (staffRows as AdminPanelStaffRow[])[0];

    if (!staff) {
      console.error(
        "STAFF SESSION ID DOES NOT EXIST IN admin_panel:",
        staffId
      );

      return jsonResponse(
        {
          success: false,
          message:
            "Staff account was not found. Please log in again.",
        },
        401
      );
    }

    const role = String(
      staff.role || ""
    )
      .trim()
      .toLowerCase();

    console.log(
      "Authenticated staff:",
      {
        staff_id: staff.staff_id,
        full_name: staff.full_name,
        email: staff.email,
        role,
      }
    );

    // ============================================================
    // 3. CHECK STAFF AUTHORIZATION
    // ============================================================

    const allowedRoles = [
      "md",
      "admin",
      "manager",
      "accountant",
      "auditor",
      "relationship_officer1",
      "relationship_officer2",
    ];

    if (!allowedRoles.includes(role)) {
      return jsonResponse(
        {
          success: false,
          message:
            "Access denied. You are not authorized to view financial transactions.",
        },
        403
      );
    }

    // ============================================================
    // 4. READ FILTER
    // ============================================================

    const { searchParams } =
      new URL(request.url);

    const filter = normalizeFilter(
      searchParams.get("filter")
    );

    console.log(
      "Transaction filter:",
      filter
    );

    // ============================================================
    // 5. BUILD DATE FILTER
    // ============================================================

    let dateCondition = "";

    switch (filter) {
      case "daily":
        dateCondition = `
          AND DATE(
            COALESCE(
              t.transaction_date,
              t.created_at
            )
          ) = CURDATE()
        `;
        break;

      case "monthly":
        dateCondition = `
          AND YEAR(
            COALESCE(
              t.transaction_date,
              t.created_at
            )
          ) = YEAR(CURDATE())

          AND MONTH(
            COALESCE(
              t.transaction_date,
              t.created_at
            )
          ) = MONTH(CURDATE())
        `;
        break;

      case "3months":
        dateCondition = `
          AND COALESCE(
            t.transaction_date,
            t.created_at
          ) >= DATE_SUB(
            NOW(),
            INTERVAL 3 MONTH
          )
        `;
        break;

      case "all":
      default:
        dateCondition = "";
        break;
    }

    // ============================================================
    // 6. FETCH TRANSACTIONS
    // ============================================================

    const sql = `
      SELECT
        CAST(
          t.transaction_id AS UNSIGNED
        ) AS transaction_id,

        CAST(
          t.member_id AS UNSIGNED
        ) AS member_id,

        COALESCE(
          m.full_name,
          'Unknown Member'
        ) AS full_name,

        COALESCE(
          t.transaction_type,
          t.type,
          'unknown'
        ) AS transaction_type,

        COALESCE(
          t.amount,
          0
        ) AS amount,

        COALESCE(
          t.type,
          'unknown'
        ) AS type,

        COALESCE(
          t.status,
          'Pending'
        ) AS status,

        t.transaction_date,

        t.reference,

        t.created_at,

        t.payment_method,

        t.accountant_id,

        t.payment_date

      FROM transactions t

      LEFT JOIN members m
        ON m.member_id = t.member_id

      WHERE
        COALESCE(m.deleted, 0) = 0

        ${dateCondition}

      ORDER BY
        COALESCE(
          t.transaction_date,
          t.created_at
        ) DESC,

        t.transaction_id DESC
    `;

    console.log(
      "Executing financial transactions query..."
    );

    const [rows] =
      await db.execute(sql);

    const rawTransactions =
      rows as TransactionRow[];

    console.log(
      "Transactions found:",
      rawTransactions.length
    );

    // ============================================================
    // 7. NORMALIZE DATABASE VALUES
    // ============================================================

    const transactions =
      rawTransactions.map(
        (transaction) => ({
          transaction_id:
            Number(
              transaction.transaction_id
            ),

          member_id:
            Number(
              transaction.member_id
            ),

          full_name:
            transaction.full_name ||
            "Unknown Member",

          transaction_type:
            transaction.transaction_type ||
            transaction.type ||
            "unknown",

          amount:
            toNumber(
              transaction.amount
            ),

          type:
            transaction.type ||
            "unknown",

          status:
            transaction.status ||
            "Pending",

          transaction_date:
            normalizeDate(
              transaction.transaction_date
            ),

          reference:
            transaction.reference ||
            "",

          created_at:
            normalizeDate(
              transaction.created_at
            ),

          payment_method:
            transaction.payment_method ||
            "",

          accountant_id:
            transaction.accountant_id ===
              null ||
            transaction.accountant_id ===
              undefined
              ? null
              : Number(
                  transaction.accountant_id
                ),

          payment_date:
            normalizeDate(
              transaction.payment_date
            ),
        })
      );

    // ============================================================
    // 8. FINANCIAL SUMMARY
    // ============================================================

    let totalTransactions = 0;
    let totalAmount = 0;

    let totalLoans = 0;
    let totalRepayments = 0;
    let totalSavings = 0;
    let totalWithdrawals = 0;

    for (const transaction of transactions) {
      const amount =
        toNumber(
          transaction.amount
        );

      totalTransactions += 1;
      totalAmount += amount;

      const transactionType =
        String(
          transaction.transaction_type
        )
          .trim()
          .toLowerCase();

      switch (transactionType) {
        case "loan":
        case "loan_disbursement":
          totalLoans += amount;
          break;

        case "repayment":
        case "loan_repayment":
          totalRepayments += amount;
          break;

        case "savings":
        case "deposit":
        case "monthly_contribution":
          totalSavings += amount;
          break;

        case "withdrawal":
        case "savings_withdrawal":
          totalWithdrawals += amount;
          break;

        default:
          break;
      }
    }

    const summary = {
      total_transactions:
        totalTransactions,

      total_amount:
        Math.round(
          totalAmount * 100
        ) / 100,

      total_loans:
        Math.round(
          totalLoans * 100
        ) / 100,

      total_repayments:
        Math.round(
          totalRepayments * 100
        ) / 100,

      total_savings:
        Math.round(
          totalSavings * 100
        ) / 100,

      total_withdrawals:
        Math.round(
          totalWithdrawals * 100
        ) / 100,
    };

    // ============================================================
    // 9. SUCCESS
    // ============================================================

    console.log(
      "Financial transactions loaded successfully."
    );

    console.log(
      "================================================"
    );

    return jsonResponse(
      {
        success: true,

        filter,

        staff: {
          staff_id:
            Number(
              staff.staff_id
            ),

          full_name:
            staff.full_name,

          email:
            staff.email,

          role,
        },

        summary,

        transactions,
      },
      200
    );
  } catch (error) {
    console.error(
      "================================================"
    );

    console.error(
      "FINANCIAL TRANSACTIONS API ERROR"
    );

    console.error(error);

    console.error(
      "================================================"
    );

    return jsonResponse(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to load financial transactions.",

        error:
          process.env.NODE_ENV ===
          "development"
            ? String(error)
            : undefined,
      },
      500
    );
  }
}


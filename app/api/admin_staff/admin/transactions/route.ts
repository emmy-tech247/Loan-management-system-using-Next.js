import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type TransactionRow = {
  transaction_id: number | string;
  member_id: number | string;
  full_name: string | null;
  transaction_type: string | null;
  amount: number | string | null;
  transaction_date: string | Date | null;
  reference: string | null;
};

type DbError = {
  code?: string;
  errno?: number;
  sqlMessage?: string;
  message?: string;
};

/* ============================================================
   JSON RESPONSE HELPER
   ============================================================ */

function jsonResponse(
  body: unknown,
  status = 200
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control":
        "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

/* ============================================================
   FORMAT DATE
   ============================================================ */

function formatDate(
  value: string | Date | null
): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return "";
    }

    const year = value.getFullYear();

    const month = String(
      value.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      value.getDate()
    ).padStart(2, "0");

    const hours = String(
      value.getHours()
    ).padStart(2, "0");

    const minutes = String(
      value.getMinutes()
    ).padStart(2, "0");

    const seconds = String(
      value.getSeconds()
    ).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  return "";
}

/* ============================================================
   MONEY
   ============================================================ */

function money(value: unknown): number {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Number(number.toFixed(2));
}

/* ============================================================
   GET FINANCIAL TRANSACTIONS
   ============================================================ */

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const requestedFilter =
      searchParams.get("filter") || "all";

    const allowedFilters = [
      "all",
      "daily",
      "monthly",
      "3months",
    ] as const;

    const filter = allowedFilters.includes(
      requestedFilter as
        (typeof allowedFilters)[number]
    )
      ? requestedFilter
      : "all";

    /* ========================================================
       DATE FILTER
       ======================================================== */

    let whereClause = "";

    switch (filter) {
      case "daily":
        whereClause = `
          WHERE t.transaction_date IS NOT NULL
          AND DATE(t.transaction_date) = CURDATE()
        `;
        break;

      case "monthly":
        whereClause = `
          WHERE t.transaction_date IS NOT NULL
          AND YEAR(t.transaction_date) = YEAR(CURDATE())
          AND MONTH(t.transaction_date) = MONTH(CURDATE())
        `;
        break;

      case "3months":
        whereClause = `
          WHERE t.transaction_date IS NOT NULL
          AND t.transaction_date >= DATE_SUB(
            CURDATE(),
            INTERVAL 3 MONTH
          )
        `;
        break;

      case "all":
      default:
        whereClause = "";
        break;
    }

    /* ========================================================
       COMBINE ALL FINANCIAL TRANSACTIONS
       ========================================================

       1. savings_transactions
       2. loans
       3. loan_repayments
       4. fixed_deposits
    */

    const sql = `
      SELECT
        t.transaction_id,
        t.member_id,
        m.full_name,
        t.transaction_type,
        t.amount,
        t.transaction_date,
        t.reference

      FROM (

        /* ====================================================
           SAVINGS TRANSACTIONS
           ==================================================== */

        SELECT
          saved_id AS transaction_id,
          member_id,

          CASE
            WHEN type = 'deposit'
              THEN 'savings_deposit'

            WHEN type = 'withdrawal'
              THEN 'savings_withdrawal'

            ELSE 'savings'
          END AS transaction_type,

          amount_saved AS amount,

          COALESCE(
            saved_at,
            created_at
          ) AS transaction_date,

          reference AS reference

        FROM savings_transactions


        UNION ALL


        /* ====================================================
           LOAN DISBURSEMENTS
           ==================================================== */

        SELECT
          loan_id AS transaction_id,
          member_id,

          'loan_disbursement'
            AS transaction_type,

          loan_amount AS amount,

          COALESCE(
            disbursed_at,
            CAST(disbursement_date AS DATETIME),
            created_at
          ) AS transaction_date,

          CONCAT(
            'LOAN-',
            loan_id
          ) AS reference

        FROM loans

        WHERE loan_status = 'disbursed'


        UNION ALL


        /* ====================================================
           LOAN REPAYMENTS
           ==================================================== */

        SELECT
          loan_repayments_id
            AS transaction_id,

          member_id,

          'loan_repayment'
            AS transaction_type,

          amount_paid AS amount,

          COALESCE(
            CAST(payment_date AS DATETIME),
            CAST(repayment_date AS DATETIME),
            uploaded_at,
            created_at
          ) AS transaction_date,

          CONCAT(
            'REPAY-',
            loan_repayments_id
          ) AS reference

        FROM loan_repayments


        UNION ALL


        /* ====================================================
           FIXED DEPOSITS
           ==================================================== */

        SELECT
          fd_id AS transaction_id,

          member_id,

          'fixed_deposit'
            AS transaction_type,

          amount_deposited AS amount,

          CAST(start_date AS DATETIME)
            AS transaction_date,

          COALESCE(
            reference,
            CONCAT(
              'FD-',
              fd_id
            )
          ) AS reference

        FROM fixed_deposits

      ) AS t

      LEFT JOIN members AS m
        ON t.member_id = m.member_id

      ${whereClause}

      ORDER BY
        t.transaction_date DESC
    `;

    /* ========================================================
       DATABASE QUERY
       ======================================================== */

    const [rows] =
      await db.query<TransactionRow[]>(sql);

    /* ========================================================
       NORMALIZE DATA
       ======================================================== */

    const transactions = rows.map(
      (row) => ({
        transaction_id: Number(
          row.transaction_id
        ),

        member_id: Number(
          row.member_id
        ),

        full_name:
          row.full_name ||
          "Unknown Member",

        transaction_type:
          row.transaction_type ||
          "unknown",

        amount: money(
          row.amount
        ),

        transaction_date:
          formatDate(
            row.transaction_date
          ),

        reference:
          row.reference || "",
      })
    );

    /* ========================================================
       TOTAL AMOUNT
       ======================================================== */

    const totalAmount =
      transactions.reduce(
        (total, transaction) =>
          total +
          transaction.amount,
        0
      );

    /* ========================================================
       SUCCESS
       ======================================================== */

    return jsonResponse(
      {
        success: true,
        filter,
        count: transactions.length,
        totalAmount: money(
          totalAmount
        ),
        transactions,
      },
      200
    );

  } catch (error) {
    console.error(
      "========================================"
    );

    console.error(
      "FINANCIAL TRANSACTIONS API ERROR"
    );

    console.error(
      "========================================"
    );

    console.error(error);

    const dbError =
      error as DbError;

    console.error(
      "Error code:",
      dbError?.code
    );

    console.error(
      "Error number:",
      dbError?.errno
    );

    console.error(
      "SQL message:",
      dbError?.sqlMessage
    );

    let message =
      "Failed to load financial transactions.";

    if (
      dbError?.code ===
      "ECONNREFUSED"
    ) {
      message =
        "Unable to connect to MySQL. Start MySQL in XAMPP and verify DB_HOST and DB_PORT.";

    } else if (
      dbError?.code ===
      "ER_ACCESS_DENIED_ERROR"
    ) {
      message =
        "MySQL access denied. Check DB_USER and DB_PASSWORD.";

    } else if (
      dbError?.code ===
      "ER_BAD_DB_ERROR"
    ) {
      message =
        "The configured MySQL database does not exist. Check DB_NAME.";

    } else if (
      dbError?.code ===
      "ER_NO_SUCH_TABLE"
    ) {
      message =
        dbError.sqlMessage ||
        "One of the required transaction tables does not exist.";

    } else if (
      dbError?.code ===
      "ER_BAD_FIELD_ERROR"
    ) {
      message =
        dbError.sqlMessage ||
        "One of the required database columns does not exist.";

    } else if (
      dbError?.code ===
      "ER_PARSE_ERROR"
    ) {
      message =
        dbError.sqlMessage ||
        "There is an SQL syntax error in the transaction query.";

    } else if (
      dbError?.sqlMessage
    ) {
      message =
        dbError.sqlMessage;

    } else if (
      dbError?.message
    ) {
      message =
        dbError.message;
    }

    /* ========================================================
       ALWAYS RETURN JSON
       ======================================================== */

    return jsonResponse(
      {
        success: false,
        message,
        transactions: [],
        count: 0,
        totalAmount: 0,
      },
      500
    );
  }
}
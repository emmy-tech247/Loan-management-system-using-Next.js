import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

/* ============================================================
   NEXT.JS CONFIGURATION
============================================================ */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================
   MYSQL CONNECTION POOL
============================================================ */

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",

  port: Number(process.env.DB_PORT || 3306),

  user: process.env.DB_USER || "root",

  password: process.env.DB_PASSWORD || "",

  database:
    process.env.DB_NAME || "pluwkiho_loan_system",

  waitForConnections: true,

  connectionLimit: 10,

  queueLimit: 0,

  connectTimeout: 10000,
});

/* ============================================================
   TYPES
============================================================ */

type LoanRow = {
  member_id: number;
  full_name: string | null;

  loan_id: number;

  loan_amount: number | string | null;

  amount_paid: number | string | null;

  start_date: string | Date | null;

  due_date: string | Date | null;

  loan_category: string | null;

  loan_status: string | null;
};

type LoanReportItem = {
  member_id: number;

  full_name: string;

  loan_id: number;

  loan_amount: number;

  amount_paid: number;

  start_date: string;

  due_date: string;

  loan_category: string;

  loan_status: string;

  outstanding: number;

  days_overdue: number;

  default_charge: number;

  daily_growth: number;

  total_due: number;
};

/* ============================================================
   DATABASE ERROR TYPE
============================================================ */

type DatabaseError = {
  code?: string;

  errno?: number;

  sqlMessage?: string;

  message?: string;
};

/* ============================================================
   DATE FORMATTER
============================================================ */

function formatDate(
  value: string | Date | null
): string {
  if (!value) {
    return "";
  }

  /*
   * MySQL may return DATE/DATETIME values as strings
   * or JavaScript Date objects depending on configuration.
   */

  if (typeof value === "string") {
    return value.substring(0, 10);
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return "";
    }

    /*
     * Use local date components instead of
     * toISOString() to avoid timezone shifts.
     */

    const year = value.getFullYear();

    const month = String(
      value.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      value.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  return "";
}

/* ============================================================
   CALCULATE DAYS OVERDUE
============================================================ */

function calculateDaysOverdue(
  dueDateValue: string | Date | null,
  outstanding: number
): number {
  /*
   * No due date means there cannot be an overdue calculation.
   */

  if (!dueDateValue || outstanding <= 0) {
    return 0;
  }

  const dueDateString =
    formatDate(dueDateValue);

  if (!dueDateString) {
    return 0;
  }

  /*
   * Create both dates at midnight.
   */

  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  /*
   * YYYY-MM-DD is converted to local midnight.
   */

  const dueDate = new Date(
    `${dueDateString}T00:00:00`
  );

  if (
    Number.isNaN(
      dueDate.getTime()
    )
  ) {
    return 0;
  }

  dueDate.setHours(
    0,
    0,
    0,
    0
  );

  /*
   * Loan is not overdue yet.
   */

  if (today <= dueDate) {
    return 0;
  }

  const difference =
    today.getTime() -
    dueDate.getTime();

  return Math.max(
    0,
    Math.floor(
      difference /
        (1000 * 60 * 60 * 24)
    )
  );
}

/* ============================================================
   ROUND MONEY
============================================================ */

function roundMoney(
  value: number
): number {
  return Number(
    value.toFixed(2)
  );
}

/* ============================================================
   GET LOAN REPORT
============================================================ */

export async function GET(
  _request: NextRequest
) {
  let connection:
    | mysql.PoolConnection
    | null = null;

  try {
    console.log(
      "================================================"
    );

    console.log(
      "GET /api/admin_staff/admin/loan-report"
    );

    console.log(
      "================================================"
    );

    /* ========================================================
       CHECK ENVIRONMENT VARIABLES
    ======================================================== */

    const dbHost =
      process.env.DB_HOST ||
      "127.0.0.1";

    const dbPort = Number(
      process.env.DB_PORT || 3306
    );

    const dbUser =
      process.env.DB_USER ||
      "root";

    const dbPassword =
      process.env.DB_PASSWORD || "";

    const dbName =
      process.env.DB_NAME ||
      "pluwkiho_loan_system";

    console.log(
      "Database configuration:",
      {
        host: dbHost,

        port: dbPort,

        user: dbUser,

        database: dbName,

        passwordConfigured:
          Boolean(dbPassword),
      }
    );

    /*
     * DB_NAME must exist.
     */

    if (!dbName) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Database name is not configured. Check DB_NAME in .env.local.",
        },
        {
          status: 500,
        }
      );
    }

    /* ========================================================
       GET DATABASE CONNECTION
    ======================================================== */

    connection =
      await pool.getConnection();

    console.log(
      "MySQL connection established."
    );

    /* ========================================================
       TEST DATABASE
    ======================================================== */

    await connection.query(
      "SELECT 1 AS database_connection"
    );

    console.log(
      "MySQL connection test successful."
    );

    /* ========================================================
       CHECK REQUIRED TABLES
    ======================================================== */

    const [memberTable] =
      await connection.query<
        Array<{
          count: number;
        }>
      >(
        `
          SELECT COUNT(*) AS count
          FROM information_schema.tables
          WHERE table_schema = ?
          AND table_name = 'members'
        `,
        [dbName]
      );

    const [loanTable] =
      await connection.query<
        Array<{
          count: number;
        }>
      >(
        `
          SELECT COUNT(*) AS count
          FROM information_schema.tables
          WHERE table_schema = ?
          AND table_name = 'loans'
        `,
        [dbName]
      );

    if (
      Number(
        memberTable[0]?.count || 0
      ) === 0
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "The members table does not exist in the configured database.",
        },
        {
          status: 500,
        }
      );
    }

    if (
      Number(
        loanTable[0]?.count || 0
      ) === 0
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "The loans table does not exist in the configured database.",
        },
        {
          status: 500,
        }
      );
    }

    /* ========================================================
       GET LOANS
    ======================================================== */

    const [rows] =
      await connection.query<LoanRow[]>(
        `
          SELECT
            m.member_id,
            m.full_name,

            l.loan_id,
            l.loan_amount,
            l.amount_paid,

            l.start_date,
            l.due_date,

            l.loan_category,
            l.loan_status

          FROM members AS m

          INNER JOIN loans AS l
            ON m.member_id = l.member_id

          ORDER BY
            l.start_date DESC,
            l.loan_id DESC
        `
      );

    console.log(
      "Loan records found:",
      rows.length
    );

    /* ========================================================
       PROCESS LOANS
    ======================================================== */

    const loans: LoanReportItem[] =
      rows.map((row) => {
        /* ----------------------------------------------------
           LOAN AMOUNT
        ---------------------------------------------------- */

        const loanAmount =
          Number(
            row.loan_amount ?? 0
          );

        /* ----------------------------------------------------
           AMOUNT PAID
        ---------------------------------------------------- */

        const amountPaid =
          Number(
            row.amount_paid ?? 0
          );

        /* ----------------------------------------------------
           OUTSTANDING
        ---------------------------------------------------- */

        const outstanding =
          Math.max(
            loanAmount -
              amountPaid,
            0
          );

        /* ----------------------------------------------------
           DAYS OVERDUE
        ---------------------------------------------------- */

        const daysOverdue =
          calculateDaysOverdue(
            row.due_date,
            outstanding
          );

        /* ----------------------------------------------------
           CATEGORY
        ---------------------------------------------------- */

        const category =
          row.loan_category ||
          "borrower";

        /* ----------------------------------------------------
           DEFAULT CHARGE
        ---------------------------------------------------- */

        let defaultCharge = 0;

        /* ----------------------------------------------------
           DAILY GROWTH
        ---------------------------------------------------- */

        let dailyGrowth = 0;

        /* ====================================================
           MONTHLY SAVER
        ==================================================== */

        if (
          category ===
          "monthly_saver"
        ) {
          if (
            daysOverdue > 0 &&
            outstanding > 0
          ) {
            /*
             * 5% default charge.
             */

            defaultCharge =
              outstanding *
              0.05;

            /*
             * 0.2% per overdue day.
             */

            dailyGrowth =
              outstanding *
              0.002 *
              daysOverdue;
          }
        }

        /* ====================================================
           BORROWER
        ==================================================== */

        else {
          if (
            daysOverdue > 0 &&
            outstanding > 0
          ) {
            /*
             * 10% default charge.
             */

            defaultCharge =
              outstanding *
              0.10;

            /*
             * 0.4% per overdue day.
             */

            dailyGrowth =
              outstanding *
              0.004 *
              daysOverdue;
          }
        }

        /* ----------------------------------------------------
           TOTAL DUE
        ---------------------------------------------------- */

        const totalDue =
          outstanding +
          defaultCharge +
          dailyGrowth;

        return {
          member_id:
            Number(
              row.member_id
            ),

          full_name:
            row.full_name ||
            "Unknown Member",

          loan_id:
            Number(
              row.loan_id
            ),

          loan_amount:
            roundMoney(
              loanAmount
            ),

          amount_paid:
            roundMoney(
              amountPaid
            ),

          start_date:
            formatDate(
              row.start_date
            ),

          due_date:
            formatDate(
              row.due_date
            ),

          loan_category:
            category,

          loan_status:
            row.loan_status ||
            "submitted",

          outstanding:
            roundMoney(
              outstanding
            ),

          days_overdue:
            daysOverdue,

          default_charge:
            roundMoney(
              defaultCharge
            ),

          daily_growth:
            roundMoney(
              dailyGrowth
            ),

          total_due:
            roundMoney(
              totalDue
            ),
        };
      });

    /* ========================================================
       CALCULATE TOTALS
    ======================================================== */

    const totals =
      loans.reduce(
        (acc, loan) => {
          acc.loanCollected +=
            loan.loan_amount;

          acc.outstanding +=
            loan.outstanding;

          acc.defaultCharges +=
            loan.default_charge;

          acc.dueWithCharges +=
            loan.total_due;

          return acc;
        },
        {
          loanCollected: 0,

          outstanding: 0,

          defaultCharges: 0,

          dueWithCharges: 0,
        }
      );

    /* ========================================================
       ROUND TOTALS
    ======================================================== */

    totals.loanCollected =
      roundMoney(
        totals.loanCollected
      );

    totals.outstanding =
      roundMoney(
        totals.outstanding
      );

    totals.defaultCharges =
      roundMoney(
        totals.defaultCharges
      );

    totals.dueWithCharges =
      roundMoney(
        totals.dueWithCharges
      );

    /* ========================================================
       RELEASE CONNECTION
    ======================================================== */

    connection.release();

    connection = null;

    /* ========================================================
       SUCCESS RESPONSE
    ======================================================== */

    return NextResponse.json(
      {
        success: true,

        message:
          "Loan report loaded successfully.",

        loans,

        totals,

        count: loans.length,
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    /* ========================================================
       RELEASE CONNECTION IF NECESSARY
    ======================================================== */

    if (connection) {
      try {
        connection.release();
      } catch {
        // Ignore release errors.
      }

      connection = null;
    }

    /* ========================================================
       LOG ERROR
    ======================================================== */

    console.error(
      "================================================"
    );

    console.error(
      "LOAN REPORT API ERROR"
    );

    console.error(error);

    console.error(
      "================================================"
    );

    /* ========================================================
       DATABASE ERROR INFORMATION
    ======================================================== */

    let errorMessage =
      "Failed to load loan information.";

    if (
      error &&
      typeof error === "object"
    ) {
      const dbError =
        error as DatabaseError;

      console.error(
        "MySQL error code:",
        dbError.code
      );

      console.error(
        "MySQL errno:",
        dbError.errno
      );

      console.error(
        "MySQL SQL message:",
        dbError.sqlMessage
      );

      if (
        dbError.message
      ) {
        errorMessage =
          dbError.message;
      }

      if (
        dbError.sqlMessage
      ) {
        errorMessage =
          dbError.sqlMessage;
      }

      /* ======================================================
         CONNECTION REFUSED
      ====================================================== */

      if (
        dbError.code ===
        "ECONNREFUSED"
      ) {
        errorMessage =
          "Unable to connect to MySQL. Make sure MySQL is running in XAMPP and that DB_HOST/DB_PORT in .env.local are correct.";
      }

      /* ======================================================
         ACCESS DENIED
      ====================================================== */

      else if (
        dbError.code ===
        "ER_ACCESS_DENIED_ERROR"
      ) {
        errorMessage =
          "MySQL access denied. Check DB_USER and DB_PASSWORD in .env.local.";
      }

      /* ======================================================
         UNKNOWN DATABASE
      ====================================================== */

      else if (
        dbError.code ===
        "ER_BAD_DB_ERROR"
      ) {
        errorMessage =
          "The configured MySQL database does not exist. Check DB_NAME in .env.local.";
      }

      /* ======================================================
         UNKNOWN TABLE
      ====================================================== */

      else if (
        dbError.code ===
        "ER_NO_SUCH_TABLE"
      ) {
        errorMessage =
          "A required database table was not found. Check that members and loans tables exist.";
      }

      /* ======================================================
         UNKNOWN COLUMN
      ====================================================== */

      else if (
        dbError.code ===
        "ER_BAD_FIELD_ERROR"
      ) {
        errorMessage =
          `A required database column was not found: ${
            dbError.sqlMessage ||
            "unknown column"
          }`;
      }
    }

    /* ========================================================
       DEVELOPMENT ERROR RESPONSE
    ======================================================== */

    if (
      process.env.NODE_ENV ===
      "development"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            errorMessage,

          error:
            error instanceof Error
              ? error.message
              : String(error),

          timestamp:
            new Date().toISOString(),
        },
        {
          status: 500,

          headers: {
            "Cache-Control":
              "no-store",
          },
        }
      );
    }

    /* ========================================================
       PRODUCTION ERROR RESPONSE
    ======================================================== */

    return NextResponse.json(
      {
        success: false,

        message:
          "Failed to load loan information.",
      },
      {
        status: 500,

        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  }
}
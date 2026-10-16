import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FilterType = "all" | "day" | "month" | "3months";

function jsonError(message: string, status = 500) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatDate(value: unknown): string {
  if (!value) return "";

  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  return String(value).slice(0, 10);
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * ============================================================
 * GET /api/admin_staff/md/loans?filter=all
 * ============================================================
 */
export async function GET(request: NextRequest) {
  try {
    /* ==========================================================
       1. Authenticate staff
       ========================================================== */

    const cookieStore = await cookies();

    const staffIdCookie =
      cookieStore.get("admin2Id")?.value ||
      cookieStore.get("staff_id")?.value;

    if (!staffIdCookie) {
      return jsonError(
        "Unauthorized. Please log in again.",
        401
      );
    }

    const staffId = Number(staffIdCookie);

    if (!Number.isInteger(staffId) || staffId <= 0) {
      return jsonError(
        "Invalid staff session.",
        401
      );
    }

    /* ==========================================================
       2. Verify staff
       ========================================================== */

    const [staffRows]: any = await db.query(
      `
      SELECT
        staff_id,
        full_name,
        email,
        role
      FROM staff
      WHERE staff_id = ?
      LIMIT 1
      `,
      [staffId]
    );

    if (!staffRows || staffRows.length === 0) {
      return jsonError(
        "Staff account not found.",
        401
      );
    }

    const staff = staffRows[0];

    /*
     * This page is the MD loan records page.
     */

    if (String(staff.role).toLowerCase() !== "md") {
      return jsonError(
        "Access denied. Managing Director authorization is required.",
        403
      );
    }

    /* ==========================================================
       3. Get requested filter
       ========================================================== */

    const searchParams = request.nextUrl.searchParams;

    const requestedFilter =
      searchParams.get("filter") || "all";

    const filter: FilterType =
      requestedFilter === "day" ||
      requestedFilter === "month" ||
      requestedFilter === "3months"
        ? requestedFilter
        : "all";

    /* ==========================================================
       4. Build date condition
       ========================================================== */

    let dateCondition = "";

    switch (filter) {
      case "day":
        dateCondition = `
          AND DATE(
            COALESCE(
              l.start_date,
              DATE(l.created_at)
            )
          ) = CURDATE()
        `;
        break;

      case "month":
        dateCondition = `
          AND YEAR(
            COALESCE(
              l.start_date,
              DATE(l.created_at)
            )
          ) = YEAR(CURDATE())

          AND MONTH(
            COALESCE(
              l.start_date,
              DATE(l.created_at)
            )
          ) = MONTH(CURDATE())
        `;
        break;

      case "3months":
        dateCondition = `
          AND COALESCE(
            l.start_date,
            DATE(l.created_at)
          ) >= DATE_SUB(
            CURDATE(),
            INTERVAL 3 MONTH
          )
        `;
        break;

      case "all":
      default:
        dateCondition = "";
        break;
    }

    /* ==========================================================
       5. Fetch loan records
       ========================================================== */

    const [rows]: any = await db.query(`
      SELECT
        l.loan_id,
        l.member_id,

        m.full_name,

        l.loan_amount,
        l.interest_rate,

        l.start_date,
        l.end_date,

        l.loan_status,

        l.purpose,
        l.guarantor_name,

        l.monthly_repayment,
        l.amount_paid,

        l.loan_balance

      FROM loans l

      INNER JOIN members m
        ON m.member_id = l.member_id

      WHERE COALESCE(m.deleted, 0) = 0

      ${dateCondition}

      ORDER BY
        COALESCE(
          l.start_date,
          DATE(l.created_at)
        ) DESC,

        l.loan_id DESC
    `);

    /* ==========================================================
       6. Convert database records
       ========================================================== */

    const loans = rows.map((row: any) => {
      const loanAmount = toNumber(
        row.loan_amount
      );

      const amountPaid = toNumber(
        row.amount_paid
      );

      /*
       * Calculate balance from amount given and amount paid.
       *
       * This avoids displaying a negative balance.
       */

      const calculatedBalance = Math.max(
        loanAmount - amountPaid,
        0
      );

      /*
       * Prefer the stored loan_balance if it is a valid
       * positive value. Otherwise calculate it.
       */

      const databaseBalance =
        row.loan_balance !== null &&
        row.loan_balance !== undefined
          ? toNumber(row.loan_balance)
          : calculatedBalance;

      const loanBalance = Math.max(
        databaseBalance,
        0
      );

      return {
        loan_id: Number(row.loan_id),

        member_id: Number(row.member_id),

        full_name:
          row.full_name ||
          "Unknown Member",

        loan_amount:
          roundMoney(loanAmount),

        interest_rate:
          roundMoney(
            toNumber(row.interest_rate)
          ),

        start_date:
          formatDate(row.start_date),

        end_date:
          formatDate(row.end_date),

        loan_status:
          row.loan_status ||
          "unknown",

        purpose:
          row.purpose || "",

        guarantor_name:
          row.guarantor_name || "",

        monthly_repayment:
          roundMoney(
            toNumber(
              row.monthly_repayment
            )
          ),

        amount_paid:
          roundMoney(amountPaid),

        loan_balance:
          roundMoney(loanBalance),
      };
    });

    /* ==========================================================
       7. Calculate summary
       ========================================================== */

    let totalLoanGiven = 0;
    let totalRepaid = 0;
    let totalOutstanding = 0;
    let totalDefaulted = 0;

    /*
     * Only loans that are actually disbursed should contribute
     * to "Total Loan Given Out".
     *
     * Therefore we calculate the summary from disbursed loans.
     */

    for (const loan of loans) {
      /*
       * Loan given
       */
      if (
        loan.loan_status.toLowerCase() ===
        "disbursed"
      ) {
        totalLoanGiven +=
          loan.loan_amount;
      }

      /*
       * Amount repaid
       */
      totalRepaid +=
        loan.amount_paid;

      /*
       * Current outstanding
       */
      totalOutstanding +=
        loan.loan_balance;

      /*
       * Defaulted amount
       *
       * A loan is defaulted when:
       *
       * - balance is greater than zero
       * - end date has passed
       */

      if (
        loan.loan_balance > 0 &&
        loan.end_date
      ) {
        const endDate = new Date(
          `${loan.end_date}T00:00:00`
        );

        const today = new Date();

        endDate.setHours(
          0,
          0,
          0,
          0
        );

        today.setHours(
          0,
          0,
          0,
          0
        );

        if (
          !Number.isNaN(
            endDate.getTime()
          ) &&
          today > endDate
        ) {
          totalDefaulted +=
            loan.loan_balance;
        }
      }
    }

    /* ==========================================================
       8. Summary
       ========================================================== */

    const summary = {
      total_loan_given:
        roundMoney(
          totalLoanGiven
        ),

      total_repaid:
        roundMoney(
          totalRepaid
        ),

      total_outstanding:
        roundMoney(
          totalOutstanding
        ),

      total_defaulted:
        roundMoney(
          totalDefaulted
        ),
    };

    /* ==========================================================
       9. Return response
       ========================================================== */

    return NextResponse.json(
      {
        success: true,
        filter,
        summary,
        loans,
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
    console.error(
      "GET /api/admin_staff/md/loans error:",
      error
    );

    return jsonError(
      error instanceof Error
        ? error.message
        : "Failed to load loan records.",
      500
    );
  }
}
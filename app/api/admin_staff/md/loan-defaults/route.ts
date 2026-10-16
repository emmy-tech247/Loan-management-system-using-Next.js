import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentStaff } from "@/lib/staff-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LoanRow = {
  loan_id: number;
  member_id: number;
  full_name: string | null;
  loan_amount: number | string | null;
  amount_paid: number | string | null;
  start_date: string | Date | null;
  due_date: string | Date | null;
  loan_category: string | null;
};

type LoanRecord = {
  member_id: number;
  full_name: string;
  loan_id: number;
  loan_amount: number;
  amount_paid: number;
  start_date: string | null;
  due_date: string | null;
  loan_category: string;
  outstanding: number;
  days_overdue: number;
  default_charge: number;
  daily_growth: number;
  total_due: number;
};

function jsonResponse(
  body: Record<string, unknown>,
  status = 200
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
    },
  });
}

function toNumber(value: unknown): number {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function formatDate(
  value: string | Date | null
): string | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return null;
    }

    return value.toISOString();
  }

  return String(value);
}

function calculateDaysOverdue(
  dueDate: string | Date | null,
  outstanding: number
): number {
  if (!dueDate || outstanding <= 0) {
    return 0;
  }

  const due = new Date(dueDate);

  if (Number.isNaN(due.getTime())) {
    return 0;
  }

  const today = new Date();

  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const dueDateOnly = new Date(
    due.getFullYear(),
    due.getMonth(),
    due.getDate()
  );

  if (dueDateOnly >= todayDate) {
    return 0;
  }

  const difference =
    todayDate.getTime() -
    dueDateOnly.getTime();

  return Math.floor(
    difference / (1000 * 60 * 60 * 24)
  );
}

function getLoanRates(category: string) {
  const normalizedCategory = category
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  const monthlySaverCategories = [
    "monthly_saver",
    "monthly_savings",
    "monthly_saver_loan",
  ];

  const borrowerCategories = [
    "borrower",
    "borrow",
  ];

  if (
    borrowerCategories.includes(
      normalizedCategory
    )
  ) {
    return {
      defaultRate: 0.1,
      dailyGrowthRate: 0.004,
    };
  }

  if (
    monthlySaverCategories.includes(
      normalizedCategory
    )
  ) {
    return {
      defaultRate: 0.05,
      dailyGrowthRate: 0.002,
    };
  }

  return {
    defaultRate: 0.05,
    dailyGrowthRate: 0.002,
  };
}

export async function GET(
  request: NextRequest
) {
  try {
    // ============================================================
    // 1. VERIFY CURRENT STAFF SESSION
    // ============================================================

    /*
     * IMPORTANT:
     *
     * Your login system uses:
     *   - admin_panel
     *   - staff_id cookie
     *   - staff_name cookie
     *   - staff_email cookie
     *   - staff_role cookie
     *
     * Therefore, do NOT use:
     *   - staff table
     *   - admin2Id cookie
     *
     * getCurrentStaff() already handles the correct
     * staff_id/staff_email authentication.
     */

    const currentStaff =
      await getCurrentStaff(request);

    if (!currentStaff) {
      return jsonResponse(
        {
          success: false,
          message:
            "Staff login session was not found. Please log in again.",
        },
        401
      );
    }

    // ============================================================
    // 2. VERIFY STAFF ROLE
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

    const currentRole = String(
      currentStaff.role || ""
    )
      .trim()
      .toLowerCase();

    if (!allowedRoles.includes(currentRole)) {
      console.warn(
        "LOAN DEFAULTS ACCESS DENIED:",
        {
          staffId: currentStaff.staff_id,
          role: currentRole,
        }
      );

      return jsonResponse(
        {
          success: false,
          message:
            "Access denied. You are not authorized to view loan default records.",
        },
        403
      );
    }

    // ============================================================
    // 3. GET DISBURSED LOANS
    // ============================================================

    const [rows] = await db.execute(
      `
      SELECT
        l.loan_id,
        l.member_id,
        m.full_name,
        l.loan_amount,
        l.amount_paid,
        l.start_date,
        l.due_date,
        l.loan_category
      FROM loans l
      INNER JOIN members m
        ON m.member_id = l.member_id
      WHERE
        l.loan_status = 'disbursed'
        AND COALESCE(m.deleted, 0) = 0
      ORDER BY
        CASE
          WHEN
            l.due_date IS NOT NULL
            AND l.due_date < CURDATE()
            AND (
              COALESCE(l.loan_amount, 0)
              -
              COALESCE(l.amount_paid, 0)
            ) > 0
          THEN 0
          ELSE 1
        END,
        l.due_date ASC,
        l.loan_id DESC
      `
    );

    const loanRows = rows as LoanRow[];

    // ============================================================
    // 4. CALCULATE DEFAULTS
    // ============================================================

    const loanRecords: LoanRecord[] =
      loanRows.map((loan) => {
        const loanAmount = Math.max(
          toNumber(loan.loan_amount),
          0
        );

        const amountPaid = Math.max(
          toNumber(loan.amount_paid),
          0
        );

        const outstanding = Math.max(
          loanAmount - amountPaid,
          0
        );

        const category =
          loan.loan_category?.trim() ||
          "monthly_saver";

        const rates =
          getLoanRates(category);

        const daysOverdue =
          calculateDaysOverdue(
            loan.due_date,
            outstanding
          );

        let defaultCharge = 0;
        let dailyGrowth = 0;

        if (
          daysOverdue > 0 &&
          outstanding > 0
        ) {
          defaultCharge =
            outstanding *
            rates.defaultRate;

          dailyGrowth =
            outstanding *
            rates.dailyGrowthRate *
            daysOverdue;
        }

        const totalDue =
          outstanding +
          defaultCharge +
          dailyGrowth;

        return {
          member_id: Number(
            loan.member_id
          ),

          full_name:
            loan.full_name?.trim() ||
            "Unknown Member",

          loan_id: Number(
            loan.loan_id
          ),

          loan_amount: Number(
            loanAmount.toFixed(2)
          ),

          amount_paid: Number(
            amountPaid.toFixed(2)
          ),

          start_date:
            formatDate(
              loan.start_date
            ),

          due_date:
            formatDate(
              loan.due_date
            ),

          loan_category:
            category,

          outstanding: Number(
            outstanding.toFixed(2)
          ),

          days_overdue:
            daysOverdue,

          default_charge: Number(
            defaultCharge.toFixed(2)
          ),

          daily_growth: Number(
            dailyGrowth.toFixed(2)
          ),

          total_due: Number(
            totalDue.toFixed(2)
          ),
        };
      });

    // ============================================================
    // 5. CALCULATE TOTALS
    // ============================================================

    const totals = loanRecords.reduce(
      (accumulator, loan) => {
        accumulator.loanCollected +=
          loan.amount_paid;

        accumulator.outstanding +=
          loan.outstanding;

        accumulator.defaultCharges +=
          loan.default_charge +
          loan.daily_growth;

        accumulator.dueWithCharges +=
          loan.total_due;

        return accumulator;
      },
      {
        loanCollected: 0,
        outstanding: 0,
        defaultCharges: 0,
        dueWithCharges: 0,
      }
    );

    totals.loanCollected = Number(
      totals.loanCollected.toFixed(2)
    );

    totals.outstanding = Number(
      totals.outstanding.toFixed(2)
    );

    totals.defaultCharges = Number(
      totals.defaultCharges.toFixed(2)
    );

    totals.dueWithCharges = Number(
      totals.dueWithCharges.toFixed(2)
    );

    // ============================================================
    // 6. RETURN RESPONSE
    // ============================================================

    return jsonResponse({
      success: true,

      message:
        "Loan records loaded successfully.",

      staff: {
        staff_id:
          currentStaff.staff_id,

        full_name:
          currentStaff.full_name || "",

        email:
          currentStaff.email || "",

        role:
          currentStaff.role || "",
      },

      loans: loanRecords,

      totals,

      count:
        loanRecords.length,
    });
  } catch (error) {
    console.error(
      "❌ LOAN DEFAULTS API ERROR:",
      error
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : String(error);

    return jsonResponse(
      {
        success: false,

        message:
          "Unable to load loan records.",

        error:
          process.env.NODE_ENV ===
            "development"
            ? errorMessage
            : undefined,
      },
      500
    );
  }
}


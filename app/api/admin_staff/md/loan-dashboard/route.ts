import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

export const runtime = "nodejs";

interface LoanRow {
  loan_id: number;
  member_id: number;
  full_name: string;
  loan_category: string | null;
  loan_amount: number | string;
  amount_paid: number | string;
  start_date: string | Date | null;
  due_date: string | Date | null;
}

interface CalculatedLoan {
  loan_id: number;
  member_id: number;
  full_name: string;
  loan_category: string;
  loan_amount: number;
  amount_paid: number;
  outstanding: number;
  start_date: string | null;
  due_date: string | null;
  daysOverdue: number;
  defaultCharge: number;
  dailyGrowth: number;
  totalDue: number;
}

function toNumber(value: unknown): number {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function formatDate(value: string | Date | null): string | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const valueString = String(value);

  // MySQL DATE: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(valueString)) {
    return valueString;
  }

  const date = new Date(valueString);

  if (Number.isNaN(date.getTime())) {
    return valueString;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function calculateDaysOverdue(
  dueDate: string | Date | null,
  outstanding: number
): number {
  if (!dueDate || outstanding <= 0) {
    return 0;
  }

  const dueDateString = formatDate(dueDate);

  if (!dueDateString) {
    return 0;
  }

  // Use midnight to avoid timezone/hour differences.
  const due = new Date(`${dueDateString}T00:00:00`);

  const today = new Date();

  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  if (Number.isNaN(due.getTime())) {
    return 0;
  }

  if (todayMidnight <= due) {
    return 0;
  }

  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return Math.floor(
    (todayMidnight.getTime() - due.getTime()) / millisecondsPerDay
  );
}

export async function GET(_request: NextRequest) {
  try {
    // ============================================================
    // 1. Authenticate staff
    // ============================================================

    const cookieStore = await cookies();

    const staffIdValue =
      cookieStore.get("admin2Id")?.value ||
      cookieStore.get("staff_id")?.value;

    if (!staffIdValue) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in.",
        },
        { status: 401 }
      );
    }

    const staffId = Number(staffIdValue);

    if (!Number.isInteger(staffId) || staffId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid staff session.",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // 2. Verify staff account
    // ============================================================

    const [staffRows] = await db.execute(
      `
      SELECT staff_id, full_name, role
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

    // This dashboard is intended for the MD/Executive portal.
    if (staff.role !== "md") {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. MD authorization required.",
        },
        { status: 403 }
      );
    }

    // ============================================================
    // 3. Get all active/disbursed loans
    // ============================================================
    //
    // We use the confirmed loans schema:
    //
    // loan_id
    // member_id
    // loan_category
    // loan_amount
    // amount_paid
    // start_date
    // due_date
    // loan_status
    //
    // Only disbursed loans are included.
    // ============================================================

    const [rows] = await db.execute(`
      SELECT
        l.loan_id,
        l.member_id,
        m.full_name,
        l.loan_category,
        l.loan_amount,
        l.amount_paid,
        l.start_date,
        l.due_date

      FROM loans l

      INNER JOIN members m
        ON m.member_id = l.member_id

      WHERE l.loan_status = 'disbursed'
        AND m.deleted = 0

      ORDER BY
        CASE
          WHEN l.due_date IS NOT NULL
               AND l.due_date < CURDATE()
               AND GREATEST(
                 COALESCE(l.loan_amount, 0) -
                 COALESCE(l.amount_paid, 0),
                 0
               ) > 0
          THEN 0
          ELSE 1
        END,
        l.due_date ASC,
        l.loan_id DESC
    `);

    const loanRows = rows as LoanRow[];

    // ============================================================
    // 4. Calculate individual loan metrics
    // ============================================================

    const calculatedLoans: CalculatedLoan[] = loanRows.map((loan) => {
      const loanAmount = Math.max(
        toNumber(loan.loan_amount),
        0
      );

      const amountPaid = Math.max(
        toNumber(loan.amount_paid),
        0
      );

      // Outstanding cannot be negative.
      const outstanding = Math.max(
        loanAmount - amountPaid,
        0
      );

      const daysOverdue = calculateDaysOverdue(
        loan.due_date,
        outstanding
      );

      const category = String(
        loan.loan_category || ""
      )
        .trim()
        .toLowerCase();

      // ==========================================================
      // Default rules
      //
      // monthly_saver:
      //   5% default charge
      //   0.2% daily growth
      //
      // borrower:
      //   10% default charge
      //   0.4% daily growth
      // ==========================================================

      let defaultRate = 0;
      let dailyGrowthRate = 0;

      if (
        category === "monthly_saver" ||
        category === "monthly saver"
      ) {
        defaultRate = 0.05;
        dailyGrowthRate = 0.002;
      } else if (
        category === "borrower" ||
        category === "borrow"
      ) {
        defaultRate = 0.10;
        dailyGrowthRate = 0.004;
      }

      // ==========================================================
      // Default charge
      // Only applied when overdue.
      // ==========================================================

      const defaultCharge =
        daysOverdue > 0
          ? outstanding * defaultRate
          : 0;

      // ==========================================================
      // Daily growth
      // ==========================================================

      const dailyGrowth =
        daysOverdue > 0
          ? outstanding *
            dailyGrowthRate *
            daysOverdue
          : 0;

      // ==========================================================
      // Total amount currently due
      // ==========================================================

      const totalDue =
        outstanding +
        defaultCharge +
        dailyGrowth;

      return {
        loan_id: Number(loan.loan_id),
        member_id: Number(loan.member_id),

        full_name: loan.full_name || "Unknown Member",

        loan_category:
          loan.loan_category || "Unknown",

        loan_amount: Number(
          loanAmount.toFixed(2)
        ),

        amount_paid: Number(
          amountPaid.toFixed(2)
        ),

        outstanding: Number(
          outstanding.toFixed(2)
        ),

        start_date: formatDate(
          loan.start_date
        ),

        due_date: formatDate(
          loan.due_date
        ),

        daysOverdue,

        defaultCharge: Number(
          defaultCharge.toFixed(2)
        ),

        dailyGrowth: Number(
          dailyGrowth.toFixed(2)
        ),

        totalDue: Number(
          totalDue.toFixed(2)
        ),
      };
    });

    // ============================================================
    // 5. Calculate overall totals
    // ============================================================

    let loanCollected = 0;
    let outstanding = 0;
    let defaultCharges = 0;
    let dueWithCharges = 0;

    for (const loan of calculatedLoans) {
      loanCollected += loan.loan_amount;
      outstanding += loan.outstanding;
      defaultCharges += loan.defaultCharge;
      dueWithCharges += loan.totalDue;
    }

    const totals = {
      loanCollected: Number(
        loanCollected.toFixed(2)
      ),

      outstanding: Number(
        outstanding.toFixed(2)
      ),

      defaultCharges: Number(
        defaultCharges.toFixed(2)
      ),

      dueWithCharges: Number(
        dueWithCharges.toFixed(2)
      ),
    };

    // ============================================================
    // 6. Return response
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        loans: calculatedLoans,
        totals,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "❌ Loan Dashboard API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load loan dashboard data.",
      },
      { status: 500 }
    );
  }
}
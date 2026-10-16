import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * ============================================================
 * GET
 *
 * /api/admn_staff/md/loans/dashboard
 *
 * Returns:
 * {
 *   success: true,
 *   loans: [...],
 *   totals: {
 *     loanCollected,
 *     outstanding,
 *     defaultCharges,
 *     dueWithCharges
 *   }
 * }
 * ============================================================
 */

export async function GET() {
  try {
    /* ==========================================================
       1. Check authentication
       ========================================================== */

    const cookieStore = await cookies();

    const staffId =
      cookieStore.get("admin2Id")?.value ||
      cookieStore.get("staff_id")?.value;

    if (!staffId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in again.",
        },
        { status: 401 }
      );
    }

    const numericStaffId = Number(staffId);

    if (
      !Number.isInteger(numericStaffId) ||
      numericStaffId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid staff session.",
        },
        { status: 401 }
      );
    }

    /* ==========================================================
       2. Verify staff account
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
      [numericStaffId]
    );

    if (!staffRows || staffRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff account not found.",
        },
        { status: 401 }
      );
    }

    const staff = staffRows[0];

    /* ==========================================================
       3. Only MD can access this dashboard
       ========================================================== */

    if (
      String(staff.role).toLowerCase() !== "md"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Access denied. Managing Director authorization is required.",
        },
        { status: 403 }
      );
    }

    /* ==========================================================
       4. Get active/disbursed loans
       ========================================================== */

    const [rows]: any = await db.query(`
      SELECT
        l.loan_id,
        l.member_id,

        m.full_name,

        l.loan_amount,
        l.amount_paid,

        l.due_date,

        l.loan_category,

        l.loan_status

      FROM loans l

      INNER JOIN members m
        ON m.member_id = l.member_id

      WHERE l.loan_status = 'disbursed'
        AND COALESCE(m.deleted, 0) = 0

      ORDER BY
        l.due_date ASC,
        l.loan_id DESC
    `);

    /* ==========================================================
       5. Prepare totals
       ========================================================== */

    let loanCollected = 0;
    let outstandingTotal = 0;
    let defaultChargesTotal = 0;
    let dueWithChargesTotal = 0;

    /* ==========================================================
       6. Calculate individual loan records
       ========================================================== */

    const loans = rows.map((row: any) => {
      const loanAmount = Number(
        row.loan_amount || 0
      );

      const amountPaid = Number(
        row.amount_paid || 0
      );

      /* --------------------------------------------------------
         Outstanding balance
         -------------------------------------------------------- */

      const outstanding = Math.max(
        loanAmount - amountPaid,
        0
      );

      loanCollected += loanAmount;
      outstandingTotal += outstanding;

      /* --------------------------------------------------------
         Determine overdue days
         -------------------------------------------------------- */

      let daysOverdue = 0;

      if (
        row.due_date &&
        outstanding > 0
      ) {
        const dueDate = new Date(
          row.due_date
        );

        const today = new Date();

        /*
         * Remove time portion so that only calendar dates
         * are compared.
         */

        dueDate.setHours(
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

        if (today > dueDate) {
          const difference =
            today.getTime() -
            dueDate.getTime();

          daysOverdue = Math.floor(
            difference /
              (1000 * 60 * 60 * 24)
          );
        }
      }

      /* --------------------------------------------------------
         Loan category
         -------------------------------------------------------- */

      const loanCategory =
        String(
          row.loan_category || ""
        ).toLowerCase();

      /* --------------------------------------------------------
         Default charge
         --------------------------------------------------------
         
         Monthly Saver:
           5% of outstanding

         Borrower:
           10% of outstanding
         -------------------------------------------------------- */

      let defaultCharge = 0;

      if (
        loanCategory === "monthly_saver"
      ) {
        defaultCharge =
          outstanding * 0.05;
      } else if (
        loanCategory === "borrower"
      ) {
        defaultCharge =
          outstanding * 0.10;
      }

      /* --------------------------------------------------------
         Daily growth
         --------------------------------------------------------
         
         Monthly Saver:
           0.2% × outstanding × overdue days

         Borrower:
           0.4% × outstanding × overdue days
         -------------------------------------------------------- */

      let dailyGrowth = 0;

      if (
        daysOverdue > 0 &&
        outstanding > 0
      ) {
        if (
          loanCategory === "monthly_saver"
        ) {
          dailyGrowth =
            outstanding *
            0.002 *
            daysOverdue;
        } else if (
          loanCategory === "borrower"
        ) {
          dailyGrowth =
            outstanding *
            0.004 *
            daysOverdue;
        }
      }

      /* --------------------------------------------------------
         Total amount currently due
         -------------------------------------------------------- */

      const totalDue =
        outstanding +
        defaultCharge +
        dailyGrowth;

      defaultChargesTotal +=
        defaultCharge;

      dueWithChargesTotal +=
        totalDue;

      /* --------------------------------------------------------
         Return JSON-safe record
         -------------------------------------------------------- */

      return {
        loan_id: Number(row.loan_id),

        member_id: Number(
          row.member_id
        ),

        full_name:
          row.full_name ||
          "Unknown Member",

        loan_amount:
          Math.round(
            loanAmount * 100
          ) / 100,

        amount_paid:
          Math.round(
            amountPaid * 100
          ) / 100,

        outstanding:
          Math.round(
            outstanding * 100
          ) / 100,

        due_date:
          row.due_date
            ? formatDate(row.due_date)
            : "",

        loan_category:
          loanCategory,

        loan_status:
          row.loan_status ||
          "disbursed",

        days_overdue:
          daysOverdue,

        default_charge:
          Math.round(
            defaultCharge * 100
          ) / 100,

        daily_growth:
          Math.round(
            dailyGrowth * 100
          ) / 100,

        total_due:
          Math.round(
            totalDue * 100
          ) / 100,
      };
    });

    /* ==========================================================
       7. Round totals
       ========================================================== */

    const totals = {
      loanCollected:
        Math.round(
          loanCollected * 100
        ) / 100,

      outstanding:
        Math.round(
          outstandingTotal * 100
        ) / 100,

      defaultCharges:
        Math.round(
          defaultChargesTotal * 100
        ) / 100,

      dueWithCharges:
        Math.round(
          dueWithChargesTotal * 100
        ) / 100,
    };

    /* ==========================================================
       8. Return response
       ========================================================== */

    return NextResponse.json(
      {
        success: true,
        loans,
        totals,
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
      "Loan Dashboard API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load loan dashboard.",
      },
      { status: 500 }
    );
  }
}

/**
 * ============================================================
 * Format MySQL date
 * ============================================================
 */

function formatDate(value: any): string {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    const year =
      value.getFullYear();

    const month = String(
      value.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      value.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  return String(value).slice(0, 10);
}
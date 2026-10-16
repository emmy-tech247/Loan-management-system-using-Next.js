import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================
   TYPES
============================================================ */

interface StaffRow {
  staff_id: number;
  full_name: string;
  email: string;
  role: string;
}

interface MemberRow {
  member_id: number;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  passport: string | null;

  expected_monthly_contribution_amount:
    | string
    | number
    | null;
}

/* ============================================================
   VERIFY MANAGING DIRECTOR
   ------------------------------------------------------------
   IMPORTANT:
   Staff login uses the `admin_panel` table.

   Cookies:
   - staff_id     = current staff session
   - admin2Id     = legacy fallback
============================================================ */

async function verifyMD(): Promise<StaffRow | null> {
  try {
    const cookieStore = await cookies();

    const staffIdCookie =
      cookieStore.get("staff_id")?.value?.trim();

    const legacyAdmin2Id =
      cookieStore.get("admin2Id")?.value?.trim();

    /*
     * Prefer the current staff_id cookie.
     * Keep admin2Id as a legacy fallback.
     */
    const currentStaffId =
      staffIdCookie || legacyAdmin2Id;

    if (!currentStaffId) {
      console.warn(
        "MD AUTH: No staff_id or admin2Id cookie found."
      );

      return null;
    }

    const numericStaffId = Number(currentStaffId);

    if (
      !Number.isInteger(numericStaffId) ||
      numericStaffId <= 0
    ) {
      console.warn(
        "MD AUTH: Invalid staff ID:",
        currentStaffId
      );

      return null;
    }

    /*
     * IMPORTANT:
     * The current login API authenticates against admin_panel,
     * NOT staff.
     */
    const [rows] = await db.execute(
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
      [numericStaffId]
    );

    const staffRows = rows as StaffRow[];

    if (!staffRows || staffRows.length === 0) {
      console.warn(
        "MD AUTH: Staff account not found in admin_panel:",
        numericStaffId
      );

      return null;
    }

    const staff = staffRows[0];

    /*
     * Normalize the database role.
     *
     * Your admin_panel ENUM is:
     * relationship_officer1
     * relationship_officer2
     * auditor
     * manager
     * accountant
     * admin
     * md
     */
    const role = String(staff.role || "")
      .trim()
      .toLowerCase();

    console.log("MD AUTH CHECK:", {
      staffId: numericStaffId,
      fullName: staff.full_name,
      email: staff.email,
      role,
    });

    if (role !== "md") {
      console.warn(
        "MD AUTH: Staff is not Managing Director:",
        {
          staffId: numericStaffId,
          role,
        }
      );

      return null;
    }

    return {
      ...staff,
      role,
    };
  } catch (error) {
    console.error(
      "MD AUTH VERIFICATION ERROR:",
      error
    );

    return null;
  }
}

/* ============================================================
   GET MEMBER VIEWER DATA

   GET:
   /api/admin_staff/md/member-viewer?member_id=101
============================================================ */

export async function GET(request: NextRequest) {
  try {
    /* ========================================================
       1. VERIFY MANAGING DIRECTOR
    ======================================================== */

    const staff = await verifyMD();

    if (!staff) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized. Managing Director access required.",
        },
        {
          status: 401,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    /* ========================================================
       2. GET MEMBER ID
    ======================================================== */

    const { searchParams } =
      new URL(request.url);

    const memberIdParam =
      searchParams.get("member_id");

    if (!memberIdParam) {
      return NextResponse.json(
        {
          success: false,
          message: "Member ID is required.",
        },
        { status: 400 }
      );
    }

    const memberId = Number(memberIdParam);

    if (
      !Number.isInteger(memberId) ||
      memberId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Member ID.",
        },
        { status: 400 }
      );
    }

    /* ========================================================
       3. FIND MEMBER
    ======================================================== */

    const [memberRowsResult] =
      await db.execute(
        `
          SELECT
            member_id,
            full_name,
            email,
            phone_number,
            passport,
            expected_monthly_contribution_amount
          FROM members
          WHERE member_id = ?
            AND COALESCE(deleted, 0) = 0
          LIMIT 1
        `,
        [memberId]
      );

    const memberRows =
      memberRowsResult as MemberRow[];

    if (
      !memberRows ||
      memberRows.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No member found with the supplied Member ID.",
        },
        { status: 404 }
      );
    }

    const member = memberRows[0];

    /* ========================================================
       4. LOAN BALANCE
       --------------------------------------------------------
       Outstanding balance =
       loan_balance OR loan_amount - amount_paid

       Only disbursed loans are included.
    ======================================================== */

    const [loanBalanceRowsResult] =
      await db.execute(
        `
          SELECT
            COALESCE(
              SUM(
                GREATEST(
                  COALESCE(
                    loan_balance,
                    loan_amount -
                    COALESCE(amount_paid, 0)
                  ),
                  0
                )
              ),
              0
            ) AS loan_balance
          FROM loans
          WHERE member_id = ?
            AND loan_status = 'disbursed'
        `,
        [memberId]
      );

    const loanBalanceRows =
      loanBalanceRowsResult as Array<{
        loan_balance: string | number | null;
      }>;

    const loanBalance = Number(
      loanBalanceRows?.[0]?.loan_balance || 0
    );

    /* ========================================================
       5. SAVINGS BALANCE
       --------------------------------------------------------
       Approved deposits
       MINUS
       Approved withdrawals
    ======================================================== */

    const [savingsRowsResult] =
      await db.execute(
        `
          SELECT
            COALESCE(
              SUM(
                CASE
                  WHEN type = 'deposit'
                    THEN amount_saved

                  WHEN type = 'withdrawal'
                    THEN -amount_saved

                  ELSE 0
                END
              ),
              0
            ) AS savings_balance
          FROM savings_transactions
          WHERE member_id = ?
            AND status = 'approved'
        `,
        [memberId]
      );

    const savingsRows =
      savingsRowsResult as Array<{
        savings_balance:
          | string
          | number
          | null;
      }>;

    const savingsBalance = Number(
      savingsRows?.[0]?.savings_balance || 0
    );

    /* ========================================================
       6. EXPECTED MONTHLY CONTRIBUTION
    ======================================================== */

    const monthlySavings = Number(
      member.expected_monthly_contribution_amount ||
        0
    );

    /* ========================================================
       7. TOTAL LOAN REPAYMENT
    ======================================================== */

    const [repaymentRowsResult] =
      await db.execute(
        `
          SELECT
            COALESCE(
              SUM(amount_paid),
              0
            ) AS total_repaid
          FROM loan_repayments
          WHERE member_id = ?
        `,
        [memberId]
      );

    const repaymentRows =
      repaymentRowsResult as Array<{
        total_repaid:
          | string
          | number
          | null;
      }>;

    const repayTotal = Number(
      repaymentRows?.[0]?.total_repaid || 0
    );

    /* ========================================================
       8. FIXED DEPOSITS
    ======================================================== */

    const [fdRowsResult] =
      await db.execute(
        `
          SELECT
            fd_id,
            amount_deposited,
            tenure_months,
            interest_rate,
            status,
            maturity_date
          FROM fixed_deposits
          WHERE member_id = ?
            AND status IN (
              'active',
              'matured',
              'pending_withdrawal',
              'pending_rollover'
            )
          ORDER BY fd_id DESC
        `,
        [memberId]
      );

    const fdRows = fdRowsResult as Array<{
      fd_id: number;
      amount_deposited:
        | string
        | number
        | null;
      tenure_months:
        | string
        | number
        | null;
      interest_rate:
        | string
        | number
        | null;
      status: string | null;
      maturity_date: string | null;
    }>;

    const fdRecords = (
      fdRows || []
    ).map((fd) => ({
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
      status: fd.status || "",
      maturity_date:
        fd.maturity_date || null,
    }));

    /* ========================================================
       9. LOAN DUE DATES
       --------------------------------------------------------
       First try due_dates.

       If due_dates does not exist, use loans.due_date.
    ======================================================== */

    let dueDates: Array<{
      due_date: string | null;
      amount_due: number;
      status: string;
    }> = [];

    try {
      const [dueRowsResult] =
        await db.execute(
          `
            SELECT
              due_date,
              amount_due,
              status
            FROM due_dates
            WHERE member_id = ?
            ORDER BY due_date ASC
          `,
          [memberId]
        );

      const dueRows =
        dueRowsResult as Array<{
          due_date: string | null;
          amount_due:
            | string
            | number
            | null;
          status: string | null;
        }>;

      dueDates = (
        dueRows || []
      ).map((due) => ({
        due_date: due.due_date,
        amount_due: Number(
          due.amount_due || 0
        ),
        status:
          due.status || "pending",
      }));
    } catch (dueDateError) {
      console.warn(
        "due_dates table query failed. Falling back to loans:",
        dueDateError
      );

      try {
        const [loanDueRowsResult] =
          await db.execute(
            `
              SELECT
                due_date,
                monthly_repayment AS amount_due,
                loan_status AS status
              FROM loans
              WHERE member_id = ?
                AND due_date IS NOT NULL
                AND loan_status = 'disbursed'
              ORDER BY due_date ASC
            `,
            [memberId]
          );

        const loanDueRows =
          loanDueRowsResult as Array<{
            due_date: string | null;
            amount_due:
              | string
              | number
              | null;
            status: string | null;
          }>;

        dueDates = (
          loanDueRows || []
        ).map((due) => ({
          due_date: due.due_date,
          amount_due: Number(
            due.amount_due || 0
          ),
          status:
            due.status || "disbursed",
        }));
      } catch (fallbackError) {
        console.error(
          "Loan due-date fallback failed:",
          fallbackError
        );

        dueDates = [];
      }
    }

    /* ========================================================
       10. LOAN APPROVALS
       --------------------------------------------------------
       approvals.item_type = 'loan'
       approvals.item_id = loans.loan_id
    ======================================================== */

    const [loanApprovalRowsResult] =
      await db.execute(
        `
          SELECT
            a.item_type,
            a.status
          FROM approvals a
          INNER JOIN loans l
            ON l.loan_id = a.item_id
          WHERE a.member_id = ?
            AND a.item_type = 'loan'
          ORDER BY a.decision_date DESC
        `,
        [memberId]
      );

    const loanApprovalRows =
      loanApprovalRowsResult as Array<{
        item_type: string;
        status: string;
      }>;

    const loanApprovals =
      (loanApprovalRows || []).map(
        (approval) => ({
          item_type:
            approval.item_type,
          status: approval.status,
        })
      );

    /* ========================================================
       11. FIXED DEPOSIT APPROVALS
       --------------------------------------------------------
       approvals.item_type = 'fixed_deposit'
       approvals.item_id = fixed_deposits.fd_id
    ======================================================== */

    const [fdApprovalRowsResult] =
      await db.execute(
        `
          SELECT
            a.item_type,
            a.status
          FROM approvals a
          INNER JOIN fixed_deposits fd
            ON fd.fd_id = a.item_id
          WHERE a.member_id = ?
            AND a.item_type = 'fixed_deposit'
          ORDER BY a.decision_date DESC
        `,
        [memberId]
      );

    const fdApprovalRows =
      fdApprovalRowsResult as Array<{
        item_type: string;
        status: string;
      }>;

    const fdApprovals =
      (fdApprovalRows || []).map(
        (approval) => ({
          item_type:
            approval.item_type,
          status: approval.status,
        })
      );

    /* ========================================================
       12. ANNOUNCEMENTS
    ======================================================== */

    const [announcementRowsResult] =
      await db.execute(
        `
          SELECT
            title,
            content AS message
          FROM announcements
          ORDER BY created_at DESC
          LIMIT 5
        `
      );

    const announcementRows =
      announcementRowsResult as Array<{
        title: string | null;
        message: string | null;
      }>;

    const announcements =
      (announcementRows || []).map(
        (announcement) => ({
          title:
            announcement.title || "",
          message:
            announcement.message || "",
        })
      );

    /* ========================================================
       13. RETURN RESPONSE
    ======================================================== */

    return NextResponse.json(
      {
        success: true,

        member: {
          member_id: Number(
            member.member_id
          ),
          full_name:
            member.full_name || "",
          email:
            member.email || "",
          phone_number:
            member.phone_number || "",
          passport:
            member.passport || null,
          expected_monthly_contribution_amount:
            Number(
              member.expected_monthly_contribution_amount ||
                0
            ),
        },

        loanBalance,
        savingsBalance,
        monthlySavings,
        repayTotal,

        fdRecords,
        dueDates,
        loanApprovals,
        fdApprovals,
        announcements,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "================================="
    );

    console.error(
      "MEMBER VIEWER API ERROR:"
    );

    console.error(error);

    console.error(
      "================================="
    );

    return NextResponse.json(
      {
        success: false,
        message:
          process.env.NODE_ENV ===
            "development" &&
          error instanceof Error
            ? error.message
            : "Unable to load member information.",
      },
      { status: 500 }
    );
  }
}
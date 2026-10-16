import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ============================================================
// TYPES
// ============================================================

interface StaffRow {
  staff_id: number;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string | null;
}

interface CountAmountRow {
  members: number | string | null;
  amount: number | string | null;
}

// ============================================================
// GET FINANCIAL SUMMARY
// ============================================================

export async function GET(request: NextRequest) {
  try {
    console.log("================================================");
    console.log("FINANCIAL SUMMARY API: GET REQUEST RECEIVED");
    console.log("URL:", request.url);
    console.log("================================================");

    // ========================================================
    // 1. READ STAFF SESSION
    // ========================================================

    const cookieStore = await cookies();

    const staffIdCookie =
      cookieStore.get("staff_id")?.value;

    const admin2IdCookie =
      cookieStore.get("admin2Id")?.value;

    const staffId =
      staffIdCookie || admin2IdCookie;

    console.log(
      "FINANCIAL SUMMARY SESSION:",
      {
        staffIdCookie,
        admin2IdCookie,
        resolvedStaffId: staffId,
      }
    );

    if (!staffId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized. Staff login session was not found. Please log in again.",
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
          message:
            "Unauthorized. Invalid staff session.",
        },
        { status: 401 }
      );
    }

    // ========================================================
    // 2. FIND STAFF
    // ========================================================

    const [staffRows] = await db.execute(
      `
      SELECT
        staff_id,
        full_name,
        email,
        phone,
        role
      FROM admin_panel
      WHERE staff_id = ?
      LIMIT 1
      `,
      [numericStaffId]
    );

    const staffList =
      staffRows as StaffRow[];

    if (staffList.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Staff account not found. Please log in again.",
        },
        { status: 401 }
      );
    }

    const staff = staffList[0];

    const role = String(
      staff.role || ""
    )
      .trim()
      .toLowerCase();

    console.log(
      "FINANCIAL SUMMARY STAFF:",
      {
        staff_id: staff.staff_id,
        full_name: staff.full_name,
        email: staff.email,
        role,
      }
    );

    // ========================================================
    // 3. MD AUTHORIZATION
    // ========================================================
    //
    // Your supplied admin_panel/staff schema uses:
    //
    // relationship_officer1
    // relationship_officer2
    // auditor
    // manager
    // accountant
    // admin
    // md
    //
    // Therefore "md" is the valid MD role.
    // ========================================================

    if (role !== "md") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Access denied. MD authorization is required.",
        },
        { status: 403 }
      );
    }

    // ========================================================
    // 4. LOANS
    // ========================================================
    //
    // Your loans table does NOT contain:
    //
    // approved_amount
    // status
    //
    // It DOES contain:
    //
    // loan_amount
    // loan_status
    //
    // loan_status enum:
    //
    // submitted
    // forwarded_to_auditor
    // forwarded_to_manager
    // forwarded_to_accountant
    // disbursed
    // rejected
    //
    // Therefore the reliable completed-loan condition
    // available from this schema is:
    //
    // loan_status = 'disbursed'
    //
    // ========================================================

    const [loanRows] = await db.execute(
      `
      SELECT
        COUNT(DISTINCT l.member_id) AS members,

        COALESCE(
          SUM(
            COALESCE(l.loan_amount, 0)
          ),
          0
        ) AS amount

      FROM loans l

      LEFT JOIN members m
        ON m.member_id = l.member_id

      WHERE
        LOWER(
          TRIM(
            COALESCE(l.loan_status, '')
          )
        ) = 'disbursed'

        AND (
          m.member_id IS NULL
          OR COALESCE(m.deleted, 0) = 0
        )
      `
    );

    const loanResult =
      (loanRows as CountAmountRow[])[0] || {
        members: 0,
        amount: 0,
      };

    console.log(
      "LOAN SUMMARY:",
      loanResult
    );

    // ========================================================
    // 5. SAVINGS
    // ========================================================
    //
    // Your savings_transactions table uses:
    //
    // type:
    //   deposit
    //   withdrawal
    //
    // transaction_type:
    //   monthly
    //   topup
    //   bonus
    //
    // status:
    //   pending
    //   acknowledged
    //   approved
    //   rejected
    //
    // Therefore use "type" for deposit/withdrawal.
    // ========================================================

    const [savingsRows] = await db.execute(
      `
      SELECT

        COUNT(
          DISTINCT CASE
            WHEN LOWER(
              TRIM(
                COALESCE(type, '')
              )
            ) = 'deposit'
            THEN member_id
          END
        ) AS members,

        COALESCE(
          SUM(
            CASE

              WHEN LOWER(
                TRIM(
                  COALESCE(type, '')
                )
              ) = 'deposit'
              THEN COALESCE(amount_saved, 0)

              WHEN LOWER(
                TRIM(
                  COALESCE(type, '')
                )
              ) = 'withdrawal'
              THEN -COALESCE(amount_saved, 0)

              ELSE 0

            END
          ),
          0
        ) AS amount

      FROM savings_transactions

      WHERE LOWER(
        TRIM(
          COALESCE(status, '')
        )
      ) = 'approved'
      `
    );

    const savingsResult =
      (savingsRows as CountAmountRow[])[0] || {
        members: 0,
        amount: 0,
      };

    console.log(
      "SAVINGS SUMMARY:",
      savingsResult
    );

    // ========================================================
    // 6. FIXED DEPOSITS
    // ========================================================
    //
    // Your fixed_deposits.status enum is:
    //
    // active
    // matured
    // withdrawn
    // pending_withdrawal
    // pending_rollover
    // cancelled
    //
    // There is NO "confirmed" status.
    //
    // Therefore count active and matured deposits.
    // ========================================================

    const [fixedDepositRows] =
      await db.execute(
        `
        SELECT

          COUNT(
            DISTINCT member_id
          ) AS members,

          COALESCE(
            SUM(
              COALESCE(
                amount_deposited,
                0
              )
            ),
            0
          ) AS amount

        FROM fixed_deposits

        WHERE LOWER(
          TRIM(
            COALESCE(status, '')
          )
        ) IN (
          'active',
          'matured'
        )
        `
      );

    const fixedDepositResult =
      (
        fixedDepositRows as CountAmountRow[]
      )[0] || {
        members: 0,
        amount: 0,
      };

    console.log(
      "FIXED DEPOSIT SUMMARY:",
      fixedDepositResult
    );

    // ========================================================
    // 7. NORMALIZE NUMBERS
    // ========================================================

    const result = {
      loans: {
        members: Number(
          loanResult.members ?? 0
        ),

        amount: Number(
          loanResult.amount ?? 0
        ),
      },

      savings: {
        members: Number(
          savingsResult.members ?? 0
        ),

        amount: Number(
          savingsResult.amount ?? 0
        ),
      },

      fixedDeposits: {
        members: Number(
          fixedDepositResult.members ?? 0
        ),

        amount: Number(
          fixedDepositResult.amount ?? 0
        ),
      },
    };

    // ========================================================
    // 8. LOG RESULT
    // ========================================================

    console.log(
      "================================================"
    );

    console.log(
      "FINANCIAL SUMMARY RESULT:"
    );

    console.log(
      JSON.stringify(
        result,
        null,
        2
      )
    );

    console.log(
      "FINANCIAL SUMMARY API: SUCCESS"
    );

    console.log(
      "================================================"
    );

    // ========================================================
    // 9. RETURN JSON
    // ========================================================

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/json; charset=utf-8",

          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",

          Pragma: "no-cache",

          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error(
      "================================================"
    );

    console.error(
      "FINANCIAL SUMMARY API ERROR:"
    );

    console.error(error);

    console.error(
      "================================================"
    );

    let message =
      "Unable to load financial summary.";

    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json(
      {
        success: false,
        message,
        loans: {
          members: 0,
          amount: 0,
        },
        savings: {
          members: 0,
          amount: 0,
        },
        fixedDeposits: {
          members: 0,
          amount: 0,
        },
      },
      {
        status: 500,

        headers: {
          "Content-Type":
            "application/json; charset=utf-8",

          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  }
}
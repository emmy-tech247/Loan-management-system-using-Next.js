import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ============================================================
// VERIFY MANAGING DIRECTOR
// ============================================================
async function verifyMD() {
  const cookieStore = await cookies();

  const admin2Id =
    cookieStore.get("admin2Id")?.value ||
    cookieStore.get("staff_id")?.value;

  if (!admin2Id) {
    return {
      authorized: false,
      status: 401,
      message:
        "Your MD login session is missing or has expired. Please login again.",
    };
  }

  const staffId = Number(admin2Id);

  if (!Number.isInteger(staffId) || staffId <= 0) {
    return {
      authorized: false,
      status: 401,
      message:
        "Invalid MD login session. Please login again.",
    };
  }

  const [rows] = await db.execute(
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

  const staffRows = rows as any[];

  if (!staffRows.length) {
    return {
      authorized: false,
      status: 401,
      message:
        "Staff login session was not found. Please login again.",
    };
  }

  const staff = staffRows[0];

  const role = String(staff.role || "").toLowerCase();

  /*
   * Accept the role names used by your project.
   *
   * If your database uses only "admin2" for MD,
   * this will work.
   *
   * If it uses "md", this will also work.
   */
  if (role !== "md" && role !== "admin2") {
    return {
      authorized: false,
      status: 403,
      message:
        "Only the Managing Director is authorized to access this page.",
    };
  }

  return {
    authorized: true,
    staff,
  };
}

// ============================================================
// GET MEMBER + FINANCIAL OVERVIEW
// ============================================================
export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ memberId: string }>;
  }
) {
  try {
    const auth = await verifyMD();

    if (!auth.authorized) {
      return NextResponse.json(
        {
          success: false,
          message: auth.message,
        },
        { status: auth.status }
      );
    }

    const { memberId: memberIdParam } = await context.params;

    const memberId = Number(memberIdParam);

    if (!Number.isInteger(memberId) || memberId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Member ID.",
        },
        { status: 400 }
      );
    }

    // ========================================================
    // GET MEMBER
    // ========================================================
    const [memberRows] = await db.execute(
      `
      SELECT
        member_id,
        full_name
      FROM members
      WHERE member_id = ?
      LIMIT 1
      `,
      [memberId]
    );

    const members = memberRows as any[];

    if (!members.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Member could not be found.",
        },
        { status: 404 }
      );
    }

    const member = members[0];

    // ========================================================
    // SAVINGS BALANCE
    //
    // Approved deposits are added.
    // ========================================================
    const [savingsRows] = await db.execute(
      `
      SELECT
        COALESCE(SUM(amount_saved), 0) AS savings_balance
      FROM savings_transactions
      WHERE member_id = ?
        AND type = 'deposit'
        AND status = 'approved'
      `,
      [memberId]
    );

    const savingsResult = (savingsRows as any[])[0];

    // ========================================================
    // LOAN REPAYMENTS
    //
    // This represents total approved repayments recorded.
    //
    // IMPORTANT:
    // If you have a loans table containing the actual
    // outstanding loan balance, use that table instead for
    // "loan_balance".
    // ========================================================
    const [repaymentRows] = await db.execute(
      `
      SELECT
        COALESCE(SUM(amount_paid), 0) AS loan_balance
      FROM loan_repayments
      WHERE member_id = ?
        AND status = 'approved'
      `,
      [memberId]
    );

    const repaymentResult = (repaymentRows as any[])[0];

    // ========================================================
    // FIXED DEPOSIT
    // ========================================================
    const [fixedRows] = await db.execute(
      `
      SELECT
        COALESCE(SUM(amount_deposited), 0) AS fixed_balance
      FROM fixed_deposits
      WHERE member_id = ?
        AND status = 'confirmed'
      `,
      [memberId]
    );

    const fixedResult = (fixedRows as any[])[0];

    // ========================================================
    // MONTHLY CONTRIBUTION
    // ========================================================
    const [monthlyRows] = await db.execute(
      `
      SELECT
        COALESCE(SUM(auto_amount), 0) AS monthly_balance
      FROM monthly_savings
      WHERE member_id = ?
        AND status = 'approved'
      `,
      [memberId]
    );

    const monthlyResult = (monthlyRows as any[])[0];

    // ========================================================
    // RETURN DATA
    // ========================================================
    return NextResponse.json({
      success: true,

      data: {
        member_id: member.member_id,
        full_name: member.full_name,

        savings_balance:
          Number(savingsResult?.savings_balance) || 0,

        loan_balance:
          Number(repaymentResult?.loan_balance) || 0,

        fixed_balance:
          Number(fixedResult?.fixed_balance) || 0,

        monthly_balance:
          Number(monthlyResult?.monthly_balance) || 0,
      },
    });
  } catch (error) {
    console.error(
      "GET MEMBER FINANCIAL INFORMATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to retrieve member information.",
      },
      { status: 500 }
    );
  }
}
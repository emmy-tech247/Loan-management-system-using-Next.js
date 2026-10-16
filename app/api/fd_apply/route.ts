import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    /*
     * Read logged-in member from your authentication/session system.
     *
     * IMPORTANT:
     * Replace this section with the same authentication method
     * you are already using elsewhere in your LMS.
     *
     * Do NOT accept member_id from the browser because that would
     * allow one member to submit an FD for another member.
     */

    // Example:
    // const session = await getMemberSession();
    // const member_id = session.member_id;

    /*
     * Temporary placeholder.
     *
     * Connect this to your existing member authentication.
     */
    const member_id = 1;

    if (!member_id) {
      return NextResponse.json(
        {
          message: "Unauthorized. Please log in.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const amount = Number(body.amount_deposited);
    const tenure = Number(body.tenure);
    const rate = Number(body.rate);

    // Validate input
    if (
      !Number.isFinite(amount) ||
      !Number.isFinite(tenure) ||
      !Number.isFinite(rate)
    ) {
      return NextResponse.json(
        {
          message: "Invalid input. Please check your entries.",
        },
        { status: 400 }
      );
    }

    if (amount <= 0 || tenure <= 0 || rate <= 0) {
      return NextResponse.json(
        {
          message: "Invalid input. Please check your entries.",
        },
        { status: 400 }
      );
    }

    if (tenure > 60) {
      return NextResponse.json(
        {
          message: "Tenure cannot exceed 60 months.",
        },
        { status: 400 }
      );
    }

    if (rate > 100) {
      return NextResponse.json(
        {
          message: "Interest rate cannot exceed 100%.",
        },
        { status: 400 }
      );
    }

    /*
     * Calculate dates.
     */
    const startDate = new Date();

    const maturityDate = new Date(startDate);

    maturityDate.setMonth(
      maturityDate.getMonth() + tenure
    );

    const formatDate = (date: Date) => {
      const year = date.getFullYear();

      const month = String(
        date.getMonth() + 1
      ).padStart(2, "0");

      const day = String(
        date.getDate()
      ).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };

    const start_date = formatDate(startDate);
    const maturity_date = formatDate(maturityDate);

    /*
     * Insert Fixed Deposit.
     */
    const [result]: any = await db.execute(
      `
      INSERT INTO fixed_deposits
      (
        member_id,
        amount_deposited,
        tenure_months,
        interest_rate,
        start_date,
        maturity_date,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
      `,
      [
        member_id,
        amount,
        tenure,
        rate,
        start_date,
        maturity_date,
      ]
    );

    if (!result.insertId) {
      return NextResponse.json(
        {
          message: "Error submitting fixed deposit application.",
        },
        { status: 500 }
      );
    }

    const fd_id = result.insertId;

    /*
     * Create approval record.
     */
    await db.execute(
      `
      INSERT INTO approvals
      (
        item_type,
        item_id,
        status,
        approver_id,
        step,
        created_at
      )
      VALUES
      (
        'fixed_deposit',
        ?,
        'pending',
        1,
        1,
        NOW()
      )
      `,
      [fd_id]
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Fixed Deposit Application Submitted. Awaiting Admin Approval.",
        fd_id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Fixed deposit application error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "An unexpected error occurred while submitting your application.",
      },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    /*
     * IMPORTANT:
     * Get member_id from your authenticated session.
     *
     * Do NOT get member_id from searchParams or from the
     * browser because members must only be able to see
     * their own fixed deposits.
     */

    // Replace this with your existing authentication/session code.
    const member_id = 1;

    if (!member_id) {
      return NextResponse.json(
        {
          message: "Unauthorized. Please log in.",
        },
        { status: 401 }
      );
    }

    /*
     * Get this member's fixed deposits.
     */
    const [rows]: any = await db.execute(
      `
      SELECT
        id,
        member_id,
        amount_deposited,
        tenure_months,
        interest_rate,
        start_date,
        maturity_date,
        status
      FROM fixed_deposits
      WHERE member_id = ?
      ORDER BY id DESC
      `,
      [member_id]
    );

    const today = new Date();

    /*
     * Calculate interest and maturity status.
     */
    const records = rows.map((row: any) => {
      const amount = Number(row.amount_deposited);
      const tenure = Number(row.tenure_months);
      const rate = Number(row.interest_rate);

      /*
       * Same formula as the PHP version:
       *
       * interest =
       * amount × rate / 100 × tenure / 12
       */
      const interest =
        (amount * rate / 100) *
        (tenure / 12);

      let days_left = 0;

      let maturity_status:
        | "active"
        | "matured"
        | "not_set" = "not_set";

      if (row.maturity_date) {
        /*
         * MySQL DATE values can be returned as strings.
         */
        const maturityDate = new Date(
          `${row.maturity_date}T00:00:00`
        );

        /*
         * Compare dates without time differences.
         */
        const todayDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );

        const maturityOnlyDate = new Date(
          maturityDate.getFullYear(),
          maturityDate.getMonth(),
          maturityDate.getDate()
        );

        const difference =
          maturityOnlyDate.getTime() -
          todayDate.getTime();

        days_left = Math.ceil(
          difference / (1000 * 60 * 60 * 24)
        );

        if (days_left > 0) {
          maturity_status = "active";
        } else {
          maturity_status = "matured";
          days_left = 0;
        }
      }

      return {
        id: Number(row.id),
        amount_deposited: amount,
        tenure_months: tenure,
        interest_rate: rate,
        start_date: row.start_date,
        maturity_date: row.maturity_date,
        status: row.status,
        interest: Number(interest.toFixed(2)),
        days_left,
        maturity_status,
      };
    });

    return NextResponse.json(
      {
        success: true,
        records,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Fixed deposit records error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to retrieve fixed deposit records.",
      },
      { status: 500 }
    );
  }
}


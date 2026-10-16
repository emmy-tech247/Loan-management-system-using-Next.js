import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";

/*
 * Calculate interest using the same logic
 * as the original PHP application.
 */
function calculateInterest(
  amount: number,
  rate: number,
  startDateValue: string | Date,
  endDateValue: string | Date
): number {
  const start = new Date(startDateValue);
  const end = new Date(endDateValue);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return 0;
  }

  /*
   * If the end date is before the start date,
   * there is no valid interest period.
   */
  if (end < start) {
    return 0;
  }

  let years =
    end.getFullYear() -
    start.getFullYear();

  let months =
    end.getMonth() -
    start.getMonth();

  let days =
    end.getDate() -
    start.getDate();

  /*
   * PHP DateTime::diff() adjusts the values
   * when the day difference is negative.
   *
   * We use a date-copy approach to determine
   * the elapsed whole months and remaining days.
   */
  if (days < 0) {
    months -= 1;

    const previousMonth = new Date(
      end.getFullYear(),
      end.getMonth(),
      0
    );

    days += previousMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  let monthsElapsed =
    years * 12 + months;

  /*
   * Same behavior as:
   *
   * if ($interval->d > 0) $months_elapsed++;
   */
  if (days > 0) {
    monthsElapsed++;
  }

  const interest =
    (amount *
      (rate / 100) *
      monthsElapsed) /
    12;

  return Number(interest.toFixed(2));
}

export async function GET(request: NextRequest) {
  try {
    /*
     * IMPORTANT:
     *
     * Replace this placeholder with your existing
     * authenticated member session.
     *
     * Never accept member_id from the browser.
     */
    const member_id = 1;

    if (!member_id) {
      return NextResponse.json(
        {
          message:
            "Unauthorized. Please log in.",
        },
        { status: 401 }
      );
    }

    /*
     * Get only fixed deposits belonging
     * to the logged-in member.
     */
    const [rows]: any = await db.execute(
      `
      SELECT
        fd_id,
        amount_deposited,
        tenure_months,
        interest_rate,
        start_date,
        end_date,
        status
      FROM fixed_deposits
      WHERE member_id = ?
      ORDER BY fd_id DESC
      `,
      [member_id]
    );

    /*
     * Calculate interest for each FD.
     */
    const records = rows.map(
      (fd: any) => {
        const amount = Number(
          fd.amount_deposited
        );

        const rate = Number(
          fd.interest_rate
        );

        let interest_earned = 0;

        if (
          fd.start_date &&
          fd.end_date
        ) {
          interest_earned =
            calculateInterest(
              amount,
              rate,
              fd.start_date,
              fd.end_date
            );
        }

        return {
          fd_id: Number(fd.fd_id),

          amount_deposited:
            amount,

          tenure_months:
            Number(fd.tenure_months),

          interest_rate:
            rate,

          start_date:
            fd.start_date,

          end_date:
            fd.end_date,

          status:
            fd.status,

          interest_earned,
        };
      }
    );

    return NextResponse.json(
      {
        success: true,
        records,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Fixed deposit interest API error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to calculate fixed deposit interest.",
      },
      { status: 500 }
    );
  }
}
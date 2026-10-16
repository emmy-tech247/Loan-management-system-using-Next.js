import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DurationType = "years" | "months";

export async function POST(request: NextRequest) {
  try {
    // ============================================================
    // 1. Read request body
    // ============================================================

    const body = await request.json();

    const amount = Number(body.amount);
    const rate = Number(body.rate);
    const duration = Number(body.duration);
    const durationType = body.durationType as DurationType;

    // ============================================================
    // 2. Validate input
    // ============================================================

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Investment amount must be greater than zero.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(rate) || rate < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Dividend rate must be zero or greater.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(duration) || duration <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Duration must be greater than zero.",
        },
        { status: 400 }
      );
    }

    if (durationType !== "years" && durationType !== "months") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid duration type. Use years or months.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 3. Convert duration to months
    // ============================================================

    const months =
      durationType === "years"
        ? Math.round(duration * 12)
        : Math.round(duration);

    if (months <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Duration must result in at least one month.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 4. Calculate dividend
    //
    // Rate is treated as an ANNUAL percentage.
    //
    // Example:
    // Investment = ₦500,000
    // Rate       = 15%
    //
    // Annual dividend:
    // ₦500,000 × 15 / 100 = ₦75,000
    //
    // Monthly dividend:
    // ₦75,000 / 12 = ₦6,250
    // ============================================================

    const annualDividend = amount * (rate / 100);

    const oneMonthDividend = annualDividend / 12;

    // ============================================================
    // 5. Calculate total dividend
    // ============================================================

    const totalDividend = oneMonthDividend * months;

    // ============================================================
    // 6. Calculate total investment value
    // ============================================================

    const totalValue = amount + totalDividend;

    // ============================================================
    // 7. Return result
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        result: {
          amount: Number(amount.toFixed(2)),
          rate: Number(rate.toFixed(2)),
          duration: Number(duration.toFixed(2)),
          durationType,

          months,

          oneMonthDividend: Number(oneMonthDividend.toFixed(2)),

          totalDividend: Number(totalDividend.toFixed(2)),

          totalValue: Number(totalValue.toFixed(2)),
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error(
      "POST /api/admin_staff/md/calculator/dividend error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to calculate dividend. Please try again.",
      },
      { status: 500 }
    );
  }
}
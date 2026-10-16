import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const savedId = Number(body.saved_id);
    const action = body.action;

    if (!savedId || action !== "confirm") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid confirmation request.",
        },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      `
      UPDATE savings_transactions
      SET confirmed_at = NOW()
      WHERE saved_id = ?
        AND acknowledged_at IS NOT NULL
        AND confirmed_at IS NULL
      `,
      [savedId]
    );

    const updateResult = result as { affectedRows: number };

    if (updateResult.affectedRows === 0) {
      return NextResponse.json({
        success: false,
        message:
          "Deposit was not found or has already been confirmed.",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Deposit confirmed successfully.",
    });
  } catch (error) {
    console.error("Verify savings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to confirm deposit.",
      },
      { status: 500 }
    );
  }
}
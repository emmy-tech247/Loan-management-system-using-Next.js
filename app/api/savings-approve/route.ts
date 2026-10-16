import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          message: "Invalid transaction ID.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * IMPORTANT:
     * Replace this with your actual authenticated
     * Managing Director/admin session lookup.
     */
    const admin2Id = 1;

    const [result] = await db.execute(
      `
        UPDATE savings_transactions
        SET
          status = 'approved',
          approved_by = ?
        WHERE
          id = ?
          AND status = 'acknowledged'
      `,
      [admin2Id, id]
    );

    const affectedRows = (result as { affectedRows: number })
      .affectedRows;

    if (affectedRows === 0) {
      return NextResponse.json(
        {
          message:
            "Transaction could not be approved. It may no longer be acknowledged or may not exist.",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Approved and savings updated.",
    });
  } catch (error) {
    console.error("Savings approval error:", error);

    return NextResponse.json(
      {
        message: "An error occurred while approving the transaction.",
      },
      {
        status: 500,
      }
    );
  }
}
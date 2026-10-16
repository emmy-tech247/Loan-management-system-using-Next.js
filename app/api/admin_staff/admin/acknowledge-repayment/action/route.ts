import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RepaymentRow = {
  loan_repayments_id: number;
  member_id: number | string;
  loan_id: number;
  amount_paid: number | string;
  receipt_file: string | null;
  status: string | null;
};

export async function POST(request: NextRequest) {
  let connection:
    | Awaited<ReturnType<typeof db.getConnection>>
    | null = null;

  try {
    // ============================================================
    // Read request body
    // ============================================================
    const body = await request.json();

    const repaymentId = Number(body?.ack_id);

    if (
      !Number.isInteger(repaymentId) ||
      repaymentId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid repayment ID.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // Database connection
    // ============================================================
    connection = await db.getConnection();

    await connection.beginTransaction();

    // ============================================================
    // Lock repayment record
    // ============================================================
    const [rows] = await connection.query(
      `
        SELECT
          loan_repayments_id,
          member_id,
          loan_id,
          amount_paid,
          receipt_file,
          status
        FROM loan_repayments
        WHERE loan_repayments_id = ?
        LIMIT 1
        FOR UPDATE
      `,
      [repaymentId]
    );

    const repaymentRows =
      rows as RepaymentRow[];

    // ============================================================
    // Check repayment exists
    // ============================================================
    if (repaymentRows.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Loan repayment was not found.",
        },
        { status: 404 }
      );
    }

    const repayment = repaymentRows[0];

    const currentStatus = String(
      repayment.status ?? ""
    )
      .trim()
      .toLowerCase();

    // ============================================================
    // Already acknowledged
    // ============================================================
    if (currentStatus === "acknowledged") {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "This loan repayment has already been acknowledged.",
        },
        { status: 409 }
      );
    }

    // ============================================================
    // Rejected repayment
    // ============================================================
    if (currentStatus === "rejected") {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "This loan repayment has been rejected and cannot be acknowledged.",
        },
        { status: 409 }
      );
    }

    // ============================================================
    // Only pending repayments can be acknowledged
    // ============================================================
    if (currentStatus !== "pending") {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            `This repayment cannot be acknowledged. Current status: ${
              repayment.status ?? "unknown"
            }.`,
        },
        { status: 409 }
      );
    }

    // ============================================================
    // Get logged-in staff ID
    // ============================================================
    const staffIdCookie =
      request.cookies.get("staff_id")?.value;

    const staffId = staffIdCookie
      ? Number(staffIdCookie)
      : null;

    // ============================================================
    // Update repayment
    // ============================================================
    //
    // If your table has acknowledged_by, this records the
    // administrator who performed the acknowledgement.
    //
    // Otherwise, use the second UPDATE below.
    // ============================================================

    if (
      staffId !== null &&
      Number.isInteger(staffId) &&
      staffId > 0
    ) {
      await connection.query(
        `
          UPDATE loan_repayments
          SET
            status = 'acknowledged',
            acknowledged_by = ?
          WHERE loan_repayments_id = ?
        `,
        [staffId, repaymentId]
      );
    } else {
      await connection.query(
        `
          UPDATE loan_repayments
          SET
            status = 'acknowledged'
          WHERE loan_repayments_id = ?
        `,
        [repaymentId]
      );
    }

    // ============================================================
    // Commit transaction
    // ============================================================
    await connection.commit();

    // ============================================================
    // Return successful response
    // ============================================================
    return NextResponse.json(
      {
        success: true,
        message:
          "Loan repayment acknowledged successfully.",

        repayment: {
          loan_repayments_id:
            Number(
              repayment.loan_repayments_id
            ),

          member_id:
            repayment.member_id,

          loan_id:
            Number(repayment.loan_id),

          amount_paid:
            String(
              repayment.amount_paid ?? "0.00"
            ),

          receipt_file:
            repayment.receipt_file
              ? String(repayment.receipt_file)
              : "",

          status: "acknowledged",
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    // ============================================================
    // Rollback
    // ============================================================
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Repayment rollback error:",
          rollbackError
        );
      }
    }

    console.error(
      "POST /api/admin_staff/admin/acknowledge-repayment/action error:",
      error
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : String(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to acknowledge loan repayment.",
        error: errorMessage,
      },
      { status: 500 }
    );
  } finally {
    // ============================================================
    // Release connection
    // ============================================================
    if (connection) {
      connection.release();
    }
  }
}
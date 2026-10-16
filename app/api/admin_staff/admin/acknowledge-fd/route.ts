import { NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================
// TYPES
// ============================================================

type DbRow = Record<string, unknown>;

// ============================================================
// GET PENDING FIXED DEPOSIT APPLICATIONS
// ============================================================

export async function GET() {
  try {
    // ----------------------------------------------------------
    // Check that fixed_deposits table exists
    // ----------------------------------------------------------

    const [tableRows] = await db.query(
      `
      SELECT COUNT(*) AS table_count
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = 'fixed_deposits'
      `
    );

    const tableResult = tableRows as DbRow[];

    const fixedDepositsExists =
      Number(tableResult?.[0]?.table_count ?? 0) > 0;

    if (!fixedDepositsExists) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The fixed_deposits table was not found in the current database.",
          error: "Missing MySQL table: fixed_deposits",
        },
        { status: 500 }
      );
    }

    // ----------------------------------------------------------
    // Check required columns
    // ----------------------------------------------------------

    const [columnRows] = await db.query(
      `
      SELECT COLUMN_NAME
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = 'fixed_deposits'
      ORDER BY ORDINAL_POSITION
      `
    );

    const columns = (columnRows as DbRow[]).map((row) =>
      String(row.COLUMN_NAME ?? "")
    );

    console.log("fixed_deposits columns:", columns);

    const requiredColumns = [
      "fd_id",
      "member_id",
      "amount_deposited",
      "tenure_months",
      "interest_rate",
      "start_date",
      "status",
      "forwarded_to_admin2",
    ];

    const missingColumns = requiredColumns.filter(
      (column) => !columns.includes(column)
    );

    if (missingColumns.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The fixed_deposits table is missing one or more required columns.",
          error: `Missing columns: ${missingColumns.join(", ")}`,
          details: {
            missingColumns,
            availableColumns: columns,
          },
        },
        { status: 500 }
      );
    }

    // ----------------------------------------------------------
    // GET PENDING FIXED DEPOSITS
    //
    // forwarded_to_admin2 = 1 means the fixed deposit has
    // been forwarded to the administrator for acknowledgement.
    //
    // We do NOT use fd_actions because that table does not exist.
    // ----------------------------------------------------------

    const sql = `
      SELECT
        fd.fd_id,
        fd.amount_deposited,
        fd.tenure_months,
        fd.interest_rate,
        fd.start_date,
        fd.forwarded_to_admin2,

        -- The existing FD ID is used as the acknowledgement ID.
        fd.fd_id AS approval_id

      FROM fixed_deposits fd

      WHERE
        fd.forwarded_to_admin2 = 1

      ORDER BY
        fd.start_date ASC,
        fd.fd_id ASC
    `;

    console.log(
      "GET /api/admin_staff/admin/acknowledge-fd SQL:",
      sql
    );

    const [rows] = await db.query(sql);

    // ----------------------------------------------------------
    // NORMALIZE MYSQL RESULTS
    // ----------------------------------------------------------

    const pendingApprovals = (rows as DbRow[]).map((row) => ({
      fd_id: Number(row.fd_id),

      amount_deposited: row.amount_deposited,

      tenure_months: Number(row.tenure_months),

      interest_rate: row.interest_rate,

      start_date: row.start_date,

      forwarded_to_admin2: Number(
        row.forwarded_to_admin2 ?? 0
      ),

      approval_id: Number(row.approval_id),
    }));

    // ----------------------------------------------------------
    // SUCCESS
    // ----------------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        pendingApprovals,
        count: pendingApprovals.length,

        details: {
          fixedDepositsTable: true,
          source: "fixed_deposits.forwarded_to_admin2",
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(
      "GET /api/admin_staff/admin/acknowledge-fd error:",
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
          "Failed to load pending fixed deposit applications.",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
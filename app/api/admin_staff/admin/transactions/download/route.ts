import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filter = searchParams.get("filter") || "all";

    let where = "";

    switch (filter) {
      case "daily":
        where = `
          WHERE DATE(t.transaction_date) = CURDATE()
        `;
        break;

      case "monthly":
        where = `
          WHERE YEAR(t.transaction_date) = YEAR(CURDATE())
          AND MONTH(t.transaction_date) = MONTH(CURDATE())
        `;
        break;

      case "3months":
        where = `
          WHERE t.transaction_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
        `;
        break;

      default:
        where = "";
    }

    const sql = `
      SELECT
        t.transaction_id,
        t.member_id,
        m.full_name,
        t.transaction_type,
        t.amount,
        t.transaction_date,
        t.reference
      FROM (
        SELECT
          saved_id AS transaction_id,
          member_id,
          type AS transaction_type,
          amount_saved AS amount,
          created_at AS transaction_date,
          CONCAT('SAV-', saved_id) AS reference
        FROM savings_transactions

        UNION ALL

        SELECT
          loan_id AS transaction_id,
          member_id,
          'loan_disbursement' AS transaction_type,
          loan_amount AS amount,
          disbursed_at AS transaction_date,
          CONCAT('LOAN-', loan_id) AS reference
        FROM loans
        WHERE loan_status = 'approved'

        UNION ALL

        SELECT
          loan_repayments_id AS transaction_id,
          member_id,
          'loan_repayment' AS transaction_type,
          amount_paid AS amount,
          repayment_date AS transaction_date,
          CONCAT('REPAY-', loan_repayments_id) AS reference
        FROM loan_repayments

        UNION ALL

        SELECT
          fd_id AS transaction_id,
          member_id,
          'fixed_deposit' AS transaction_type,
          amount_deposited AS amount,
          created_at AS transaction_date,
          CONCAT('FD-', fd_id) AS reference
        FROM fixed_deposits
      ) AS t

      LEFT JOIN members m
        ON t.member_id = m.member_id

      ${where}

      ORDER BY t.transaction_date DESC
    `;

    const [rows] = await db.query(sql);

    const data = rows as Array<{
      transaction_id: number;
      member_id: number;
      full_name: string | null;
      transaction_type: string;
      amount: number;
      transaction_date: string;
      reference: string;
    }>;

    const headers = [
      "ID",
      "Member ID",
      "Member Name",
      "Transaction Type",
      "Amount",
      "Date",
      "Reference",
    ];

    const csvRows = data.map((row) => [
      row.transaction_id,
      row.member_id,
      row.full_name || "",
      row.transaction_type,
      Number(row.amount || 0).toFixed(2),
      row.transaction_date,
      row.reference,
    ]);

    const csv = [
      headers.join(","),
      ...csvRows.map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="financial-transactions-${filter}.csv"`,
      },
    });
  } catch (error) {
    console.error("Download report error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate financial report.",
      },
      { status: 500 }
    );
  }
}
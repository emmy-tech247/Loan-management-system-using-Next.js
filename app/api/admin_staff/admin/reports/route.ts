import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import {
  AdminReportsApiResponse,
  FixedDepositStats,
} from "@/types/adminReports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================================================
   GET ADMIN REPORTS
========================================================= */

export async function GET(request: NextRequest) {
  try {
    /* =====================================================
       1. GET STAFF COOKIES
    ===================================================== */

    const staffId = request.cookies.get("staff_id")?.value?.trim() || "";
    const staffEmail =
      request.cookies.get("staff_email")?.value?.trim() || "";

    const staffRoleCookie =
      request.cookies.get("staff_role")?.value?.trim().toLowerCase() || "";

    console.log("==========================================");
    console.log("ADMIN REPORTS AUTH");
    console.log("staff_id:", staffId || "MISSING");
    console.log("staff_email:", staffEmail || "MISSING");
    console.log("staff_role:", staffRoleCookie || "MISSING");
    console.log("==========================================");

    /* =====================================================
       2. FIND STAFF FROM DATABASE
    ===================================================== */

    let staffRows: any[] = [];

    /*
     * Try staff_id first.
     */
    if (staffId) {
      const sql =
        "SELECT " +
        "staff_id, " +
        "full_name, " +
        "email, " +
        "phone, " +
        "role " +
        "FROM admin_panel " +
        "WHERE CAST(staff_id AS CHAR) = ? " +
        "LIMIT 1";

      const [rows] = await db.query(sql, [staffId]);

      staffRows = rows as any[];
    }

    /*
     * If staff_id did not find the account,
     * try email.
     */
    if (staffRows.length === 0 && staffEmail) {
      const sql =
        "SELECT " +
        "staff_id, " +
        "full_name, " +
        "email, " +
        "phone, " +
        "role " +
        "FROM admin_panel " +
        "WHERE LOWER(TRIM(email)) = LOWER(TRIM(?)) " +
        "LIMIT 1";

      const [rows] = await db.query(sql, [staffEmail]);

      staffRows = rows as any[];
    }

    /* =====================================================
       3. STAFF NOT FOUND
    ===================================================== */

    if (staffRows.length === 0) {
      console.error("ADMIN REPORTS: STAFF ACCOUNT NOT FOUND");

      return NextResponse.json(
        {
          success: false,
          message: "Staff account not found.",
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    /* =====================================================
       4. GET DATABASE STAFF
    ===================================================== */

    const staff = staffRows[0];

    const databaseRole = String(staff.role || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

    console.log("ADMIN REPORTS STAFF DATABASE:", {
      staff_id: staff.staff_id,
      full_name: staff.full_name,
      email: staff.email,
      role: databaseRole,
    });

    /* =====================================================
       5. CHECK AUTHORIZATION
    ===================================================== */

    /*
     * Reports are available to:
     *
     * admin
     * md
     */

    if (databaseRole !== "admin" && databaseRole !== "md") {
      console.error(
        "ADMIN REPORTS: UNAUTHORIZED ROLE:",
        databaseRole
      );

      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to view admin reports.",
        },
        {
          status: 403,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    /* =====================================================
       6. MEMBER SUMMARY
    ===================================================== */

    const membersSql =
      "SELECT " +
      "COALESCE(NULLIF(TRIM(status), ''), 'unknown') AS status, " +
      "COUNT(*) AS count " +
      "FROM members " +
      "GROUP BY COALESCE(NULLIF(TRIM(status), ''), 'unknown') " +
      "ORDER BY count DESC";

    const [membersRows] = await db.query(membersSql);

    const membersSummary = (membersRows as any[]).map((row) => ({
      status: String(row.status || "unknown"),
      count: Number(row.count || 0),
    }));

    /* =====================================================
       7. LOAN SUMMARY
    ===================================================== */

    const loanSql =
      "SELECT " +
      "COUNT(*) AS total_loans, " +
      "COALESCE(SUM(loan_amount), 0) AS total_amount " +
      "FROM loans";

    const [loanRows] = await db.query(loanSql);

    const loanRow = (loanRows as any[])[0] || {};

    const loanStats = {
      total_loans: Number(loanRow.total_loans || 0),
      total_amount: Number(loanRow.total_amount || 0),
    };

    /* =====================================================
       8. SAVINGS SUMMARY
    ===================================================== */

    const savingsSql =
      "SELECT " +
      "COUNT(DISTINCT member_id) AS total_savers, " +
      "COALESCE(SUM(amount_saved), 0) AS total_saved " +
      "FROM savings_transactions " +
      "WHERE LOWER(COALESCE(status, '')) NOT IN " +
      "('pending', 'rejected', 'cancelled', 'deleted')";

    const [savingRows] = await db.query(savingsSql);

    const savingRow = (savingRows as any[])[0] || {};

    const savingStats = {
      total_savers: Number(savingRow.total_savers || 0),
      total_saved: Number(savingRow.total_saved || 0),
    };

    /* =====================================================
       9. FIXED DEPOSIT SUMMARY
    ===================================================== */

    let fdStats: FixedDepositStats | null = null;

    const fixedDepositTableSql =
      "SELECT COUNT(*) AS table_exists " +
      "FROM information_schema.TABLES " +
      "WHERE TABLE_SCHEMA = DATABASE() " +
      "AND TABLE_NAME = 'fixed_deposits'";

    const [fixedDepositTableRows] = await db.query(
      fixedDepositTableSql
    );

    const fixedDepositTableExists =
      Number(
        (fixedDepositTableRows as any[])[0]?.table_exists || 0
      ) > 0;

    if (fixedDepositTableExists) {
      const fixedDepositSql =
        "SELECT " +
        "COUNT(*) AS total_fds, " +
        "COALESCE(SUM(amount_deposited), 0) AS total_fd_amount " +
        "FROM fixed_deposits";

      const [fdRows] = await db.query(fixedDepositSql);

      const fdRow = (fdRows as any[])[0] || {};

      fdStats = {
        total_fds: Number(fdRow.total_fds || 0),
        total_fd_amount: Number(fdRow.total_fd_amount || 0),
      };
    }

    /* =====================================================
       10. PAYMENT TRANSACTIONS
    ===================================================== */

    let payments: any[] = [];

    const paymentTableSql =
      "SELECT COUNT(*) AS table_exists " +
      "FROM information_schema.TABLES " +
      "WHERE TABLE_SCHEMA = DATABASE() " +
      "AND TABLE_NAME = 'payment_transactions'";

    const [paymentTableRows] = await db.query(paymentTableSql);

    const paymentTableExists =
      Number(
        (paymentTableRows as any[])[0]?.table_exists || 0
      ) > 0;

    if (paymentTableExists) {
      const paymentSql =
        "SELECT " +
        "p.id, " +
        "p.amount_paid, " +
        "p.created_at, " +
        "m.full_name " +
        "FROM payment_transactions p " +
        "INNER JOIN members m " +
        "ON p.member_id = m.member_id " +
        "ORDER BY p.created_at DESC " +
        "LIMIT 10";

      const [paymentRows] = await db.query(paymentSql);

      payments = (paymentRows as any[]).map((row) => ({
        id: Number(row.id),
        amount_paid: Number(row.amount_paid || 0),
        created_at: row.created_at,
        full_name: String(row.full_name || ""),
      }));
    }

    /* =====================================================
       11. BUILD RESPONSE
    ===================================================== */

    const response: AdminReportsApiResponse = {
      success: true,
      membersSummary,
      loanStats,
      savingStats,
      fdStats,
      payments,
    };

    console.log("ADMIN REPORTS: DATABASE DATA LOADED SUCCESSFULLY");

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error: any) {
    console.error(
      "=========================================="
    );

    console.error(
      "GET /api/admin_staff/admin/reports ERROR:"
    );

    console.error(error);

    console.error(
      "=========================================="
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to fetch admin reporting statistics.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}


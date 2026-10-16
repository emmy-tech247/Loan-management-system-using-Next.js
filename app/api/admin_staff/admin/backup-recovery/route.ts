import { NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================
// ENSURE SYSTEM LOGS TABLE EXISTS
// ============================================================
async function ensureSystemLogsTable(): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS system_logs (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      username VARCHAR(255) NOT NULL DEFAULT 'System',
      role VARCHAR(100) NOT NULL DEFAULT 'system',
      action TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

      PRIMARY KEY (id),

      INDEX idx_system_logs_created_at (created_at),
      INDEX idx_system_logs_role (role),
      INDEX idx_system_logs_username (username)
    )
    ENGINE=InnoDB
    DEFAULT CHARSET=utf8mb4
    COLLATE=utf8mb4_unicode_ci
  `);
}

// ============================================================
// CHECK WHETHER A TABLE EXISTS
// ============================================================
async function tableExists(
  tableName: string
): Promise<boolean> {
  try {
    const [rows]: any = await db.query(
      `
      SELECT COUNT(*) AS count
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = ?
      `,
      [tableName]
    );

    return Number(rows?.[0]?.count ?? 0) > 0;
  } catch (error) {
    console.error(
      `Failed to check table ${tableName}:`,
      error
    );

    return false;
  }
}

// ============================================================
// GET BACKUP & RECOVERY OVERVIEW
// ============================================================
export async function GET() {
  try {
    // ========================================================
    // 1. MAKE SURE SYSTEM LOGS TABLE EXISTS
    // ========================================================
    try {
      await ensureSystemLogsTable();
    } catch (error) {
      console.error(
        "Failed to create/check system_logs table:",
        error
      );
    }

    // ========================================================
    // 2. CHECK REQUIRED TABLES
    // ========================================================
    const [loansExists, savingsExists, logsExists] =
      await Promise.all([
        tableExists("loans"),
        tableExists("monthly_savings"),
        tableExists("system_logs"),
      ]);

    // ========================================================
    // 3. LOAN SUMMARY
    // ========================================================
    let loanSummary = {
      total_loans: 0,
      total_loan_amount: 0,
    };

    if (loansExists) {
      try {
        const [loanRows]: any = await db.query(`
          SELECT
            COUNT(*) AS total_loans,
            COALESCE(SUM(loan_amount), 0)
              AS total_loan_amount
          FROM loans
        `);

        loanSummary = {
          total_loans: Number(
            loanRows?.[0]?.total_loans ?? 0
          ),

          total_loan_amount: Number(
            loanRows?.[0]?.total_loan_amount ?? 0
          ),
        };
      } catch (error) {
        console.error(
          "Loan summary query failed:",
          error
        );
      }
    }

    // ========================================================
    // 4. SAVINGS SUMMARY
    // ========================================================
    let savingsSummary = {
      total_savings: 0,
      total_savings_amount: 0,
    };

    if (savingsExists) {
      try {
        const [savingsRows]: any = await db.query(`
          SELECT
            COUNT(*) AS total_savings,
            COALESCE(SUM(amount_saved), 0)
              AS total_savings_amount
          FROM monthly_savings
        `);

        savingsSummary = {
          total_savings: Number(
            savingsRows?.[0]?.total_savings ?? 0
          ),

          total_savings_amount: Number(
            savingsRows?.[0]?.total_savings_amount ?? 0
          ),
        };
      } catch (error) {
        console.error(
          "Savings summary query failed:",
          error
        );
      }
    }

    // ========================================================
    // 5. RECENT SYSTEM LOGS
    // ========================================================
    let logs: Array<{
      username: string;
      role: string;
      action: string;
      created_at: string | Date | null;
    }> = [];

    if (logsExists) {
      try {
        const [logRows]: any = await db.query(`
          SELECT
            username,
            role,
            action,
            created_at
          FROM system_logs
          ORDER BY created_at DESC
          LIMIT 100
        `);

        logs = (logRows ?? []).map(
          (log: any) => ({
            username:
              log.username ?? "System",

            role:
              log.role ?? "Unknown",

            action:
              log.action ?? "Unknown action",

            created_at:
              log.created_at ?? null,
          })
        );
      } catch (error) {
        console.error(
          "System logs query failed:",
          error
        );
      }
    }

    // ========================================================
    // 6. ACTIONS PER ROLE
    // ========================================================
    let roleActivities: Array<{
      role: string;
      actions: number;
    }> = [];

    if (logsExists) {
      try {
        const [roleRows]: any = await db.query(`
          SELECT
            COALESCE(role, 'Unknown') AS role,
            COUNT(*) AS actions
          FROM system_logs
          GROUP BY role
          ORDER BY actions DESC
        `);

        roleActivities =
          (roleRows ?? []).map(
            (activity: any) => ({
              role:
                activity.role ??
                "Unknown",

              actions:
                Number(
                  activity.actions ?? 0
                ),
            })
          );
      } catch (error) {
        console.error(
          "Role activity query failed:",
          error
        );
      }
    }

    // ========================================================
    // 7. WARNINGS
    // ========================================================
    const warnings: string[] = [];

    if (!loansExists) {
      warnings.push(
        "The loans table was not found."
      );
    }

    if (!savingsExists) {
      warnings.push(
        "The monthly_savings table was not found."
      );
    }

    /*
     * Do not normally reach this point because the
     * system_logs table is automatically created above.
     */
    if (!logsExists) {
      warnings.push(
        "The system_logs table could not be created."
      );
    }

    // ========================================================
    // 8. RETURN RESPONSE
    // ========================================================
    return NextResponse.json(
      {
        success: true,

        loanSummary,

        savingsSummary,

        logs,

        roleActivities,

        tables: {
          loans: loansExists,
          monthly_savings: savingsExists,
          system_logs: logsExists,
        },

        warnings,
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.error(
      "GET /api/admin_staff/admin/backup-recovery error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Failed to load backup and recovery overview.",

        error:
          error?.message ??
          "Unknown database or server error.",
      },
      {
        status: 500,
      }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentStaff } from "@/lib/staff-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TransactionType =
  | "deposit"
  | "repayment"
  | "fixed_deposit"
  | "monthly_contribution";

function jsonResponse(
  data: Record<string, unknown>,
  status = 200
) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: NextRequest) {
  let connection:
    | Awaited<ReturnType<typeof db.getConnection>>
    | null = null;

  try {
    // ============================================================
    // 1. CHECK MD LOGIN
    // ============================================================

    const staff = await getCurrentStaff(request);

    if (!staff) {
      return jsonResponse(
        {
          success: false,
          message:
            "Your MD session has expired. Please login again.",
        },
        401
      );
    }

    if (staff.role !== "md") {
      return jsonResponse(
        {
          success: false,
          message:
            "Unauthorized. Only the Managing Director can update transactions.",
        },
        403
      );
    }

    // ============================================================
    // 2. READ REQUEST
    // ============================================================

    let body: {
      member_id?: unknown;
      amount?: unknown;
      type?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return jsonResponse(
        {
          success: false,
          message: "Invalid JSON request.",
        },
        400
      );
    }

    console.log(
      "========== MANUAL TRANSACTION =========="
    );

    console.log("REQUEST BODY:", body);

    // ============================================================
    // 3. MEMBER ID
    // ============================================================

    const memberId = Number(body.member_id);

    console.log("MEMBER ID RECEIVED:", memberId);

    if (
      !Number.isInteger(memberId) ||
      memberId <= 0
    ) {
      return jsonResponse(
        {
          success: false,
          message: "Please enter a valid member ID.",
        },
        400
      );
    }

    // ============================================================
    // 4. AMOUNT
    // ============================================================

    const amount = Number(body.amount);

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return jsonResponse(
        {
          success: false,
          message: "Please enter a valid amount.",
        },
        400
      );
    }

    // ============================================================
    // 5. TRANSACTION TYPE
    // ============================================================

    const type = String(
      body.type ?? ""
    ) as TransactionType;

    const allowedTypes: TransactionType[] = [
      "deposit",
      "repayment",
      "fixed_deposit",
      "monthly_contribution",
    ];

    if (!allowedTypes.includes(type)) {
      return jsonResponse(
        {
          success: false,
          message: "Invalid transaction type.",
        },
        400
      );
    }

    // ============================================================
    // 6. GET DATABASE CONNECTION
    // ============================================================

    connection = await db.getConnection();

    // ============================================================
    // 7. CHECK DATABASE
    // ============================================================

    const [databaseRows] =
      await connection.execute(
        `SELECT DATABASE() AS database_name`
      );

    const databaseName =
      (
        databaseRows as Array<{
          database_name: string | null;
        }>
      )[0]?.database_name ?? null;

    console.log(
      "DATABASE USED BY NEXT.JS:",
      databaseName
    );

    // ============================================================
    // 8. CHECK MEMBERS TABLE
    // ============================================================

    const [memberRows] =
      await connection.execute(
        `
        SELECT
          member_id,
          full_name
        FROM members
        WHERE member_id = ?
        LIMIT 1
        `,
        [memberId]
      );

    const members =
      memberRows as Array<{
        member_id: number;
        full_name: string | null;
      }>;

    console.log(
      "MEMBER SEARCH RESULT:",
      members
    );

    // ============================================================
    // 9. MEMBER NOT FOUND
    // ============================================================

    if (members.length === 0) {
      const [sampleRows] =
        await connection.execute(
          `
          SELECT
            member_id,
            full_name
          FROM members
          ORDER BY member_id ASC
          LIMIT 20
          `
        );

      const sampleMembers =
        sampleRows as Array<{
          member_id: number;
          full_name: string | null;
        }>;

      console.log(
        "AVAILABLE MEMBERS:",
        sampleMembers
      );

      return jsonResponse(
        {
          success: false,

          message:
            `Member ID ${memberId} could not be found.`,

          debug: {
            database: databaseName,
            searched_member_id: memberId,
            available_members: sampleMembers,
          },
        },
        404
      );
    }

    // ============================================================
    // 10. MEMBER FOUND
    // ============================================================

    const member = members[0];

    console.log(
      "MEMBER FOUND:",
      {
        member_id: member.member_id,
        full_name: member.full_name,
      }
    );

    // ============================================================
    // 11. START TRANSACTION
    // ============================================================

    await connection.beginTransaction();

    // ============================================================
    // 12. DEPOSIT
    // ============================================================

    if (type === "deposit") {
      await connection.execute(
        `
        INSERT INTO savings_transactions
        (
          member_id,
          amount_saved,
          type,
          status,
          created_at
        )
        VALUES
        (?, ?, 'deposit', 'approved', NOW())
        `,
        [memberId, amount]
      );

      await connection.execute(
        `
        UPDATE members
        SET
          savings_balance =
            COALESCE(savings_balance, 0) + ?,

          amount_saved =
            COALESCE(amount_saved, 0) + ?,

          updated_at = NOW()

        WHERE member_id = ?
        `,
        [
          amount,
          amount,
          memberId,
        ]
      );
    }

    // ============================================================
    // 13. LOAN REPAYMENT
    // ============================================================

    if (type === "repayment") {
      await connection.execute(
        `
        INSERT INTO loan_repayments
        (
          member_id,
          amount_paid,
          status,
          created_at
        )
        VALUES
        (?, ?, 'approved', NOW())
        `,
        [memberId, amount]
      );

      await connection.execute(
        `
        UPDATE members
        SET
          loan_balance =
            GREATEST(
              COALESCE(loan_balance, 0) - ?,
              0
            ),

          amount_paid =
            COALESCE(amount_paid, 0) + ?,

          updated_at = NOW()

        WHERE member_id = ?
        `,
        [
          amount,
          amount,
          memberId,
        ]
      );
    }

    // ============================================================
    // 14. FIXED DEPOSIT
    // ============================================================

    if (type === "fixed_deposit") {
      await connection.execute(
        `
        INSERT INTO fixed_deposits
        (
          member_id,
          amount_deposited,
          status,
          created_at
        )
        VALUES
        (?, ?, 'confirmed', NOW())
        `,
        [memberId, amount]
      );

      await connection.execute(
        `
        UPDATE members
        SET
          fixed_deposit_amount =
            COALESCE(fixed_deposit_amount, 0) + ?,

          updated_at = NOW()

        WHERE member_id = ?
        `,
        [
          amount,
          memberId,
        ]
      );
    }

    // ============================================================
    // 15. MONTHLY CONTRIBUTION
    // ============================================================

    if (type === "monthly_contribution") {
      await connection.execute(
        `
        INSERT INTO monthly_savings
        (
          member_id,
          auto_amount,
          status,
          created_at
        )
        VALUES
        (?, ?, 'approved', NOW())
        `,
        [memberId, amount]
      );

      await connection.execute(
        `
        UPDATE members
        SET
          savings_balance =
            COALESCE(savings_balance, 0) + ?,

          amount_saved =
            COALESCE(amount_saved, 0) + ?,

          updated_at = NOW()

        WHERE member_id = ?
        `,
        [
          amount,
          amount,
          memberId,
        ]
      );
    }

    // ============================================================
    // 16. COMMIT
    // ============================================================

    await connection.commit();

    console.log(
      "TRANSACTION COMPLETED SUCCESSFULLY"
    );

    console.log({
      staff_id: staff.staff_id,
      member_id: member.member_id,
      member_name: member.full_name,
      amount,
      type,
    });

    return jsonResponse({
      success: true,

      message:
        "Transaction updated successfully.",

      member: {
        member_id: member.member_id,
        full_name:
          member.full_name ?? "Unknown Member",
      },

      transaction: {
        member_id: memberId,
        amount,
        type,
      },
    });
  } catch (error) {
    // ============================================================
    // 17. ROLLBACK
    // ============================================================

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "ROLLBACK ERROR:",
          rollbackError
        );
      }
    }

    console.error(
      "MANUAL TRANSACTION ERROR:",
      error
    );

    return jsonResponse(
      {
        success: false,

        message:
          "Unable to update transaction.",

        error:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      500
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
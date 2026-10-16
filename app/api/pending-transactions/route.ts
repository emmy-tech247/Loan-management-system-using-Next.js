import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

type TransactionAction = "approve" | "reject";

type PendingTransaction = {
  id: number;
  member_id: number;
  full_name: string;
  amount: number;
  type: string;
  status: string;
  created_at: string;
};

/**
 * GET
 * Fetch pending accountant transactions
 */
export async function GET() {
  try {
    /*
     * Replace this with your actual Next.js authentication/session check.
     *
     * For example, if your authentication system exposes:
     *
     * const session = await getServerSession();
     *
     * then verify that the logged-in user is Admin2/Managing Director here.
     */

    const [rows] = await pool.query(
      `
        SELECT
          id,
          member_id,
          full_name,
          amount,
          type,
          status,
          created_at
        FROM pending_transactions
        WHERE status = 'pending'
        ORDER BY created_at DESC
      `
    );

    return NextResponse.json({
      transactions: rows as PendingTransaction[],
    });
  } catch (error) {
    console.error(
      "GET /api/admin/pending-transactions error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch pending transactions.",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * POST
 * Approve or reject a transaction
 */
export async function POST(request: NextRequest) {
  let connection: any = null;

  try {
    const body = await request.json();

    const id = Number(body.id);
    const action = body.action as TransactionAction;

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          error: "Invalid transaction ID.",
        },
        {
          status: 400,
        }
      );
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        {
          error: "Invalid transaction action.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Get a connection so approval can be performed
     * inside a database transaction.
     */
    connection = await pool.getConnection();

    await connection.beginTransaction();

    /*
     * Lock the pending transaction while processing it.
     *
     * This prevents two Admin2 requests from approving
     * the same transaction simultaneously.
     */
    const [transactionRows] = await connection.query(
      `
        SELECT
          id,
          member_id,
          full_name,
          amount,
          type,
          status
        FROM pending_transactions
        WHERE id = ?
        LIMIT 1
        FOR UPDATE
      `,
      [id]
    );

    const transactions = transactionRows as PendingTransaction[];

    if (transactions.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          error: "Transaction not found.",
        },
        {
          status: 404,
        }
      );
    }

    const transaction = transactions[0];

    /*
     * Don't process a transaction that has already
     * been approved/rejected.
     */
    if (transaction.status !== "pending") {
      await connection.rollback();

      return NextResponse.json(
        {
          error: `Transaction #${id} has already been ${transaction.status}.`,
        },
        {
          status: 409,
        }
      );
    }

    /*
     * ==========================================================
     * REJECT
     * ==========================================================
     */
    if (action === "reject") {
      await connection.query(
        `
          UPDATE pending_transactions
          SET
            status = 'rejected',
            updated_at = NOW()
          WHERE id = ?
        `,
        [id]
      );

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: `Transaction #${id} rejected.`,
      });
    }

    /*
     * ==========================================================
     * APPROVE
     * ==========================================================
     */

    const memberId = Number(transaction.member_id);
    const amount = Number(transaction.amount);
    const type = transaction.type;

    if (!Number.isFinite(memberId) || !Number.isFinite(amount)) {
      await connection.rollback();

      return NextResponse.json(
        {
          error: "Invalid transaction member or amount.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Determine destination table.
     */
    switch (type) {
      /**
       * Deposit
       */
      case "deposit":
        await connection.query(
          `
            INSERT INTO savings_transactions
              (
                member_id,
                amount_saved,
                status,
                created_at
              )
            VALUES
              (
                ?,
                ?,
                'approved',
                NOW()
              )
          `,
          [memberId, amount]
        );

        break;

      /**
       * Loan repayment
       */
      case "repayment":
        await connection.query(
          `
            INSERT INTO loan_repayments
              (
                member_id,
                amount_paid,
                status,
                created_at
              )
            VALUES
              (
                ?,
                ?,
                'approved',
                NOW()
              )
          `,
          [memberId, amount]
        );

        break;

      /**
       * Fixed deposit
       */
      case "fixed_deposit":
        await connection.query(
          `
            INSERT INTO fixed_deposits
              (
                member_id,
                amount_deposited,
                status,
                created_at
              )
            VALUES
              (
                ?,
                ?,
                'approved',
                NOW()
              )
          `,
          [memberId, amount]
        );

        break;

      /**
       * Monthly contribution
       */
      case "monthly_contribution":
        await connection.query(
          `
            INSERT INTO monthly_savings
              (
                member_id,
                auto_amount,
                status,
                created_at
              )
            VALUES
              (
                ?,
                ?,
                'approved',
                NOW()
              )
          `,
          [memberId, amount]
        );

        break;

      default:
        await connection.rollback();

        return NextResponse.json(
          {
            error: `Unknown transaction type: ${type}`,
          },
          {
            status: 400,
          }
        );
    }

    /*
     * Mark original pending transaction as approved.
     */
    await connection.query(
      `
        UPDATE pending_transactions
        SET
          status = 'approved',
          updated_at = NOW()
        WHERE id = ?
      `,
      [id]
    );

    /*
     * Commit everything.
     */
    await connection.commit();

    return NextResponse.json({
      success: true,
      message: `Transaction #${id} approved and moved to ${type} successfully.`,
    });
  } catch (error) {
    /*
     * Roll back any partially completed approval.
     */
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
      }
    }

    console.error(
      "POST /api/admin/pending-transactions error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process transaction.",
      },
      {
        status: 500,
      }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
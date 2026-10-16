import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";

/**
 * ============================================================
 * AUTHENTICATION
 * ============================================================
 */
async function authenticateMD(request: NextRequest) {
  const admin2Id = request.cookies.get("admin2Id")?.value;
  const staffId = request.cookies.get("staff_id")?.value;

  const loggedInId = admin2Id || staffId;

  if (!loggedInId) {
    return {
      authenticated: false,
      staff: null,
      response: NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in.",
        },
        { status: 401 }
      ),
    };
  }

  const [rows]: any = await db.query(
    `
    SELECT
      staff_id,
      full_name,
      email,
      role
    FROM staff
    WHERE staff_id = ?
    LIMIT 1
    `,
    [Number(loggedInId)]
  );

  if (!rows || rows.length === 0) {
    return {
      authenticated: false,
      staff: null,
      response: NextResponse.json(
        {
          success: false,
          message: "Staff account not found.",
        },
        { status: 401 }
      ),
    };
  }

  const staff = rows[0];

  if (staff.role !== "md") {
    return {
      authenticated: false,
      staff: null,
      response: NextResponse.json(
        {
          success: false,
          message: "Access denied. MD authorization required.",
        },
        { status: 403 }
      ),
    };
  }

  return {
    authenticated: true,
    staff,
    response: null,
  };
}

/**
 * ============================================================
 * GET
 *
 * Fetch transactions waiting for confirmation.
 *
 * Expected frontend response:
 * {
 *   success: true,
 *   data: [...]
 * }
 * ============================================================
 */
export async function GET(request: NextRequest) {
  try {
    // ----------------------------------------------------------
    // 1. Authenticate MD
    // ----------------------------------------------------------
    const auth = await authenticateMD(request);

    if (!auth.authenticated) {
      return auth.response;
    }

    // ----------------------------------------------------------
    // 2. Get pending transactions
    //
    // Transactions submitted by accounting are expected to have
    // status = pending_admin2.
    //
    // If your accountant workflow uses another status, change
    // the value below.
    // ----------------------------------------------------------
    const [rows]: any = await db.query(
      `
      SELECT
        t.transaction_id AS id,
        t.member_id,
        COALESCE(m.full_name, 'Unknown Member') AS full_name,
        t.amount,
        t.type,
        t.transaction_type,
        t.status,
        t.reference,
        t.payment_method,
        t.payment_date,
        t.transaction_date,
        t.created_at
      FROM transactions t
      LEFT JOIN members m
        ON m.member_id = t.member_id
      WHERE t.status = 'pending_admin2'
      ORDER BY t.created_at DESC
      `
    );

    // ----------------------------------------------------------
    // 3. Return data
    // ----------------------------------------------------------
    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("GET /api/admin_staff/md/transactions/confirm:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load pending transactions.",
        data: [],
      },
      { status: 500 }
    );
  }
}

/**
 * ============================================================
 * POST
 *
 * Approve or reject a transaction.
 *
 * Body:
 * {
 *   id: number,
 *   action: "approve" | "reject"
 * }
 * ============================================================
 */
export async function POST(request: NextRequest) {
  let connection: any = null;

  try {
    // ----------------------------------------------------------
    // 1. Authenticate MD
    // ----------------------------------------------------------
    const auth = await authenticateMD(request);

    if (!auth.authenticated) {
      return auth.response;
    }

    const staff = auth.staff;

    // ----------------------------------------------------------
    // 2. Read request body
    // ----------------------------------------------------------
    let body: any;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request.",
        },
        { status: 400 }
      );
    }

    const id = Number(body?.id);
    const action = String(body?.action || "").toLowerCase();

    // ----------------------------------------------------------
    // 3. Validate ID
    // ----------------------------------------------------------
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid transaction ID.",
        },
        { status: 400 }
      );
    }

    // ----------------------------------------------------------
    // 4. Validate action
    // ----------------------------------------------------------
    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        {
          success: false,
          message: "Action must be approve or reject.",
        },
        { status: 400 }
      );
    }

    // ----------------------------------------------------------
    // 5. Get database connection
    // ----------------------------------------------------------
    connection = await db.getConnection();

    await connection.beginTransaction();

    // ----------------------------------------------------------
    // 6. Lock the transaction
    //
    // FOR UPDATE prevents two administrators from approving the
    // same transaction simultaneously.
    // ----------------------------------------------------------
    const [transactionRows]: any = await connection.query(
      `
      SELECT
        transaction_id,
        member_id,
        transaction_type,
        amount,
        type,
        status,
        reference
      FROM transactions
      WHERE transaction_id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [id]
    );

    if (!transactionRows || transactionRows.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Transaction not found.",
        },
        { status: 404 }
      );
    }

    const transaction = transactionRows[0];

    // ----------------------------------------------------------
    // 7. Make sure transaction is still pending
    // ----------------------------------------------------------
    if (transaction.status !== "pending_admin2") {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: `This transaction has already been processed. Current status: ${transaction.status}`,
        },
        { status: 409 }
      );
    }

    // ----------------------------------------------------------
    // 8. APPROVE
    // ----------------------------------------------------------
    if (action === "approve") {
      await connection.query(
        `
        UPDATE transactions
        SET
          status = 'approved',
          payment_date = COALESCE(payment_date, NOW())
        WHERE transaction_id = ?
          AND status = 'pending_admin2'
        `,
        [id]
      );

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: "Transaction approved successfully.",
      });
    }

    // ----------------------------------------------------------
    // 9. REJECT
    // ----------------------------------------------------------
    if (action === "reject") {
      await connection.query(
        `
        UPDATE transactions
        SET
          status = 'rejected'
        WHERE transaction_id = ?
          AND status = 'pending_admin2'
        `,
        [id]
      );

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: "Transaction rejected successfully.",
      });
    }

    // This should never be reached
    await connection.rollback();

    return NextResponse.json(
      {
        success: false,
        message: "Invalid transaction action.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("POST /api/admin_staff/md/transactions/confirm:", error);

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError);
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to process transaction.",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
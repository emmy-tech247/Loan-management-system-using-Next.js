// app/api/admin_staff/md/savings/confirm/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

export const runtime = "nodejs";

/* ============================================================
   MD AUTHENTICATION
============================================================ */

async function authenticateMD() {
  const cookieStore = await cookies();

  const admin2Id = cookieStore.get("admin2Id")?.value;

  if (!admin2Id) {
    return {
      authenticated: false,
      staffId: null,
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
        AND role = 'md'
      LIMIT 1
    `,
    [admin2Id]
  );

  if (!rows || rows.length === 0) {
    return {
      authenticated: false,
      staffId: null,
    };
  }

  return {
    authenticated: true,
    staffId: rows[0].staff_id,
  };
}

/* ============================================================
   GET
   LOAD ACKNOWLEDGED SAVINGS TRANSACTIONS
============================================================ */

export async function GET() {
  try {
    const auth = await authenticateMD();

    if (!auth.authenticated) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. MD login required.",
        },
        { status: 401 }
      );
    }

    /*
     * saved_id is aliased as id because the frontend uses:
     *
     * tx.id
     *
     * We also return member information.
     */

    const [rows]: any = await db.query(
      `
        SELECT
          st.saved_id AS id,
          st.member_id,
          st.amount_saved,
          st.type,
          st.status,
          st.reason,
          st.created_at,
          st.approved_by,
          st.approved_at,

          m.full_name,
          m.email

        FROM savings_transactions st

        LEFT JOIN members m
          ON m.member_id = st.member_id

        WHERE
          st.status = 'acknowledged'

        ORDER BY st.created_at DESC
      `
    );

    return NextResponse.json(
      {
        success: true,
        data: rows || [],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(
      "GET /api/admin_staff/md/savings/confirm:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load acknowledged savings transactions.",
        error:
          process.env.NODE_ENV === "development"
            ? error?.message
            : undefined,
      },
      { status: 500 }
    );
  }
}

/* ============================================================
   POST
   MD APPROVES SAVINGS TOP-UP
============================================================ */

export async function POST(request: NextRequest) {
  let connection: any = null;

  try {
    /* --------------------------------------------------------
       1. AUTHENTICATE MD
    -------------------------------------------------------- */

    const auth = await authenticateMD();

    if (!auth.authenticated || !auth.staffId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. MD login required.",
        },
        { status: 401 }
      );
    }

    /* --------------------------------------------------------
       2. READ REQUEST
    -------------------------------------------------------- */

    const body = await request.json();

    const approve_id = Number(body?.approve_id);

    if (!approve_id || !Number.isInteger(approve_id)) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid savings transaction ID is required.",
        },
        { status: 400 }
      );
    }

    /* --------------------------------------------------------
       3. DATABASE CONNECTION
    -------------------------------------------------------- */

    connection = await db.getConnection();

    await connection.beginTransaction();

    /* --------------------------------------------------------
       4. FIND THE SAVINGS TRANSACTION
    -------------------------------------------------------- */

    const [transactionRows]: any = await connection.query(
      `
        SELECT
          saved_id,
          member_id,
          amount_saved,
          type,
          status,
          reason
        FROM savings_transactions
        WHERE saved_id = ?
        LIMIT 1
        FOR UPDATE
      `,
      [approve_id]
    );

    if (
      !transactionRows ||
      transactionRows.length === 0
    ) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Savings transaction not found.",
        },
        { status: 404 }
      );
    }

    const transaction = transactionRows[0];

    /* --------------------------------------------------------
       5. MAKE SURE IT IS ACKNOWLEDGED
    -------------------------------------------------------- */

    if (transaction.status !== "acknowledged") {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "This savings transaction is no longer awaiting MD approval.",
        },
        { status: 409 }
      );
    }

    const memberId = Number(transaction.member_id);
    const amountSaved = Number(transaction.amount_saved);

    if (
      !memberId ||
      !amountSaved ||
      amountSaved <= 0
    ) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Invalid savings transaction amount or member.",
        },
        { status: 400 }
      );
    }

    /* --------------------------------------------------------
       6. GET MEMBER
    -------------------------------------------------------- */

    const [memberRows]: any = await connection.query(
      `
        SELECT
          member_id,
          savings_balance
        FROM members
        WHERE member_id = ?
        LIMIT 1
        FOR UPDATE
      `,
      [memberId]
    );

    if (!memberRows || memberRows.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Member associated with this transaction was not found.",
        },
        { status: 404 }
      );
    }

    const member = memberRows[0];

    /* --------------------------------------------------------
       7. CALCULATE NEW SAVINGS BALANCE
    -------------------------------------------------------- */

    const currentBalance = Number(
      member.savings_balance || 0
    );

    const newBalance = Number(
      (currentBalance + amountSaved).toFixed(2)
    );

    /* --------------------------------------------------------
       8. APPROVE TRANSACTION
    -------------------------------------------------------- */

    await connection.query(
      `
        UPDATE savings_transactions
        SET
          status = 'approved',
          approved_by = ?,
          approved_at = NOW()
        WHERE saved_id = ?
          AND status = 'acknowledged'
      `,
      [
        auth.staffId,
        approve_id,
      ]
    );

    /* --------------------------------------------------------
       9. UPDATE MEMBER SAVINGS BALANCE
    -------------------------------------------------------- */

    await connection.query(
      `
        UPDATE members
        SET
          savings_balance = ?
        WHERE member_id = ?
      `,
      [
        newBalance,
        memberId,
      ]
    );

    /* --------------------------------------------------------
       10. COMMIT
    -------------------------------------------------------- */

    await connection.commit();

    return NextResponse.json(
      {
        success: true,
        message: "Savings top-up approved successfully.",
        data: {
          id: approve_id,
          member_id: memberId,
          amount_saved: amountSaved,
          previous_balance: currentBalance,
          new_balance: newBalance,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    /* --------------------------------------------------------
       ROLLBACK
    -------------------------------------------------------- */

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Savings rollback error:",
          rollbackError
        );
      }
    }

    console.error(
      "POST /api/admin_staff/md/savings/confirm:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to approve savings top-up.",
        error:
          process.env.NODE_ENV === "development"
            ? error?.message
            : undefined,
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
import { NextRequest, NextResponse } from "next/server";

import db from "@/lib/db";
import { getCurrentStaff } from "@/lib/staff-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================
   TYPES
============================================================ */

type WithdrawalRow = {
  id: number;
  member_id: number;
  action_type: "withdraw" | "rollover";
  status:
    | "pending"
    | "acknowledged"
    | "confirmed"
    | "rejected";
  created_at: string;
  full_name: string;
};

type WithdrawalRequestRow = {
  id: number;
  member_id: number;
  fd_id: number | null;
  amount: number | null;
  action_type: "withdraw" | "rollover";
  status:
    | "pending"
    | "acknowledged"
    | "confirmed"
    | "rejected";
  forwarded_to_admin2: number;
  acknowledged_by: number | null;
  acknowledged_at: string | null;
  admin1_id: number | null;
  admin1_time: string | null;
  admin2_id: number | null;
  admin2_time: string | null;
  confirmed_by: number | null;
  confirmed_at: string | null;
};

/* ============================================================
   JSON RESPONSE HELPER
============================================================ */

function jsonResponse(
  data: Record<string, unknown>,
  status = 200
) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control":
        "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

/* ============================================================
   AUTHENTICATE MANAGING DIRECTOR
============================================================ */

/*
 * IMPORTANT:
 *
 * Your actual staff authentication system uses:
 *
 *   staff_id
 *   staff_name
 *   staff_email
 *   staff_role
 *
 * The actual staff table is:
 *
 *   admin_panel
 *
 * NOT:
 *
 *   staff
 *
 * We therefore use the existing getCurrentStaff()
 * helper so this route uses the same authentication
 * system as the rest of your MD portal.
 */

async function getAuthenticatedMD(
  request: NextRequest
) {
  try {
    const staff = await getCurrentStaff(request);

    if (!staff) {
      console.error(
        "FD WITHDRAWALS AUTH: No authenticated staff found."
      );

      return null;
    }

    console.log(
      "FD WITHDRAWALS AUTH:",
      {
        staff_id: staff.staff_id,
        full_name: staff.full_name,
        email: staff.email,
        role: staff.role,
      }
    );

    if (staff.role !== "md") {
      console.error(
        "FD WITHDRAWALS AUTH: Staff is not MD.",
        {
          staff_id: staff.staff_id,
          role: staff.role,
        }
      );

      return null;
    }

    return staff;
  } catch (error) {
    console.error(
      "FD WITHDRAWALS MD AUTHENTICATION ERROR:",
      error
    );

    return null;
  }
}

/* ============================================================
   GET
   Fetch FD withdrawal / rollover requests awaiting MD
============================================================ */

export async function GET(
  request: NextRequest
) {
  try {
    const md = await getAuthenticatedMD(request);

    if (!md) {
      return jsonResponse(
        {
          success: false,
          message:
            "Unauthorized. Managing Director access required.",
        },
        401
      );
    }

    /*
     * Only requests that:
     *
     * 1. Have been acknowledged
     * 2. Have been forwarded to Admin 2 / MD
     * 3. Have not already been confirmed/rejected
     */

    const [rows] = await db.execute(
      `
        SELECT
          fw.id,
          fw.member_id,
          fw.action_type,
          fw.status,
          fw.created_at,
          m.full_name
        FROM fd_withdrawals fw
        INNER JOIN members m
          ON m.member_id = fw.member_id
        WHERE fw.status = 'acknowledged'
          AND fw.forwarded_to_admin2 = 1
          AND COALESCE(m.deleted, 0) = 0
        ORDER BY
          fw.created_at DESC,
          fw.id DESC
      `
    );

    const withdrawals =
      rows as WithdrawalRow[];

    console.log(
      "FD WITHDRAWALS FOR MD:",
      {
        md_id: md.staff_id,
        count: withdrawals.length,
      }
    );

    return jsonResponse({
      success: true,
      withdrawals,
    });
  } catch (error) {
    console.error(
      "GET /api/admin_staff/md/fd-withdrawals ERROR:",
      error
    );

    return jsonResponse(
      {
        success: false,
        message:
          "Unable to load fixed deposit withdrawal requests.",
        withdrawals: [],
        error:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      500
    );
  }
}

/* ============================================================
   POST
   Confirm or reject FD withdrawal / rollover
============================================================ */

export async function POST(
  request: NextRequest
) {
  let connection:
    | Awaited<ReturnType<typeof db.getConnection>>
    | null = null;

  try {
    /* ========================================================
       AUTHENTICATE MD
    ======================================================== */

    const md = await getAuthenticatedMD(request);

    if (!md) {
      return jsonResponse(
        {
          success: false,
          message:
            "Unauthorized. Managing Director access required.",
        },
        401
      );
    }

    /* ========================================================
       READ REQUEST
    ======================================================== */

    let body: {
      id?: number;
      action?: "confirm" | "reject";
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

    const id = Number(body.id);
    const action = body.action;

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return jsonResponse(
        {
          success: false,
          message: "Invalid request ID.",
        },
        400
      );
    }

    if (
      action !== "confirm" &&
      action !== "reject"
    ) {
      return jsonResponse(
        {
          success: false,
          message:
            "Action must be either confirm or reject.",
        },
        400
      );
    }

    /* ========================================================
       DATABASE CONNECTION
    ======================================================== */

    connection = await db.getConnection();

    await connection.beginTransaction();

    /* ========================================================
       LOCK FD WITHDRAWAL REQUEST
    ======================================================== */

    const [requestRows] =
      await connection.execute(
        `
          SELECT
            id,
            member_id,
            fd_id,
            amount,
            action_type,
            status,
            forwarded_to_admin2,
            acknowledged_by,
            acknowledged_at,
            admin1_id,
            admin1_time,
            admin2_id,
            admin2_time,
            confirmed_by,
            confirmed_at
          FROM fd_withdrawals
          WHERE id = ?
          FOR UPDATE
        `,
        [id]
      );

    const requests =
      requestRows as WithdrawalRequestRow[];

    if (requests.length === 0) {
      await connection.rollback();

      return jsonResponse(
        {
          success: false,
          message:
            "Fixed deposit request not found.",
        },
        404
      );
    }

    const withdrawal = requests[0];

    /* ========================================================
       VERIFY REQUEST STATUS
    ======================================================== */

    if (
      withdrawal.status !==
      "acknowledged"
    ) {
      await connection.rollback();

      return jsonResponse(
        {
          success: false,
          message:
            `This request has already been ${withdrawal.status}.`,
        },
        409
      );
    }

    /* ========================================================
       VERIFY REQUEST WAS FORWARDED TO MD
    ======================================================== */

    if (
      Number(
        withdrawal.forwarded_to_admin2
      ) !== 1
    ) {
      await connection.rollback();

      return jsonResponse(
        {
          success: false,
          message:
            "This request has not been forwarded to the Managing Director.",
        },
        409
      );
    }

    /* ========================================================
       VERIFY MEMBER EXISTS
    ======================================================== */

    const [memberRows] =
      await connection.execute(
        `
          SELECT
            member_id,
            full_name
          FROM members
          WHERE member_id = ?
            AND COALESCE(deleted, 0) = 0
          LIMIT 1
        `,
        [withdrawal.member_id]
      );

    const members =
      memberRows as Array<{
        member_id: number;
        full_name: string;
      }>;

    if (members.length === 0) {
      await connection.rollback();

      return jsonResponse(
        {
          success: false,
          message:
            "The member associated with this request was not found.",
        },
        404
      );
    }

    /* ========================================================
       VERIFY FIXED DEPOSIT
    ======================================================== */

    let fixedDeposit:
      | {
          fd_id: number;
          member_id: number;
          amount_deposited: number;
          status: string;
          action_taken: string;
          rollover_count: number;
        }
      | null = null;

    if (withdrawal.fd_id !== null) {
      const [fdRows] =
        await connection.execute(
          `
            SELECT
              fd_id,
              member_id,
              amount_deposited,
              status,
              action_taken,
              rollover_count
            FROM fixed_deposits
            WHERE fd_id = ?
            FOR UPDATE
          `,
          [withdrawal.fd_id]
        );

      const fixedDeposits =
        fdRows as Array<{
          fd_id: number;
          member_id: number;
          amount_deposited: number;
          status: string;
          action_taken: string;
          rollover_count: number;
        }>;

      if (fixedDeposits.length === 0) {
        await connection.rollback();

        return jsonResponse(
          {
            success: false,
            message:
              "The fixed deposit associated with this request was not found.",
          },
          404
        );
      }

      fixedDeposit =
        fixedDeposits[0];

      if (
        fixedDeposit.member_id !==
        withdrawal.member_id
      ) {
        await connection.rollback();

        return jsonResponse(
          {
            success: false,
            message:
              "Fixed deposit/member mismatch detected.",
          },
          409
        );
      }
    }

    /* ========================================================
       REJECT REQUEST
    ======================================================== */

    if (action === "reject") {
      const [updateResult] =
        await connection.execute(
          `
            UPDATE fd_withdrawals
            SET
              status = 'rejected',
              admin2_id = ?,
              admin2_time = NOW(),
              confirmed_by = ?,
              confirmed_at = NOW(),
              confirm_id = ?
            WHERE id = ?
              AND status = 'acknowledged'
              AND forwarded_to_admin2 = 1
          `,
          [
            md.staff_id,
            md.staff_id,
            md.staff_id,
            id,
          ]
        );

      const result =
        updateResult as {
          affectedRows?: number;
        };

      if (
        Number(result.affectedRows || 0) !==
        1
      ) {
        await connection.rollback();

        return jsonResponse(
          {
            success: false,
            message:
              "The request could not be rejected because its status changed. Please refresh and try again.",
          },
          409
        );
      }

      /* ======================================================
         RESTORE FIXED DEPOSIT
      ====================================================== */

      if (withdrawal.fd_id !== null) {
        await connection.execute(
          `
            UPDATE fixed_deposits
            SET
              status = 'active',
              action_taken = 'none',
              action_date = NULL
            WHERE fd_id = ?
          `,
          [withdrawal.fd_id]
        );
      }

      await connection.commit();

      return jsonResponse({
        success: true,
        message:
          `${
            withdrawal.action_type ===
            "withdraw"
              ? "Withdrawal"
              : "Rollover"
          } request rejected successfully.`,
      });
    }

    /* ========================================================
       CONFIRM REQUEST
    ======================================================== */

    if (action === "confirm") {
      const [updateResult] =
        await connection.execute(
          `
            UPDATE fd_withdrawals
            SET
              status = 'confirmed',
              confirmed_by = ?,
              confirmed_at = NOW(),
              admin2_id = ?,
              admin2_time = NOW(),
              confirm_id = ?
            WHERE id = ?
              AND status = 'acknowledged'
              AND forwarded_to_admin2 = 1
          `,
          [
            md.staff_id,
            md.staff_id,
            md.staff_id,
            id,
          ]
        );

      const result =
        updateResult as {
          affectedRows?: number;
        };

      if (
        Number(result.affectedRows || 0) !==
        1
      ) {
        await connection.rollback();

        return jsonResponse(
          {
            success: false,
            message:
              "The request could not be confirmed because its status changed. Please refresh and try again.",
          },
          409
        );
      }

      /* ======================================================
         UPDATE FIXED DEPOSIT
      ====================================================== */

      if (withdrawal.fd_id !== null) {
        if (
          withdrawal.action_type ===
          "withdraw"
        ) {
          /*
           * Withdrawal confirmed.
           */
          await connection.execute(
            `
              UPDATE fixed_deposits
              SET
                status = 'withdrawn',
                action_taken = 'withdraw',
                action_date = CURDATE()
              WHERE fd_id = ?
            `,
            [withdrawal.fd_id]
          );
        } else if (
          withdrawal.action_type ===
          "rollover"
        ) {
          /*
           * Rollover confirmed.
           *
           * Existing fixed deposit remains active.
           */
          await connection.execute(
            `
              UPDATE fixed_deposits
              SET
                status = 'active',
                action_taken = 'rollover',
                action_date = CURDATE(),
                rollover_count =
                  COALESCE(rollover_count, 0) + 1
              WHERE fd_id = ?
            `,
            [withdrawal.fd_id]
          );
        }
      }

      await connection.commit();

      return jsonResponse({
        success: true,
        message:
          `${
            withdrawal.action_type ===
            "withdraw"
              ? "Withdrawal"
              : "Rollover"
          } request confirmed successfully.`,
      });
    }

    await connection.rollback();

    return jsonResponse(
      {
        success: false,
        message: "Unable to process request.",
      },
      400
    );
  } catch (error) {
    console.error(
      "POST /api/admin_staff/md/fd-withdrawals ERROR:",
      error
    );

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "FD withdrawal rollback error:",
          rollbackError
        );
      }
    }

    return jsonResponse(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to process fixed deposit request.",
      },
      500
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

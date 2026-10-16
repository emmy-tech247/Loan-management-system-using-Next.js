import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import {
  getCurrentStaff,
  isValidStaffRole,
} from "@/lib/staff-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================
   TYPES
============================================================ */

interface FDWithdrawalRow {
  id: number;
  member_id: number;
  full_name: string | null;
  action_type: string;
  status: string;
  created_at: string;
}

/* ============================================================
   GET FD WITHDRAWAL REQUESTS
============================================================ */

export async function GET(request: NextRequest) {
  try {
    console.log(
      "================================================"
    );

    console.log(
      "FD WITHDRAWALS API - AUTHENTICATION"
    );

    console.log(
      "Available cookies:",
      request.cookies
        .getAll()
        .map((cookie) => cookie.name)
    );

    console.log(
      "================================================"
    );

    /* ========================================================
       1. GET CURRENT STAFF
       Uses the SAME authentication helper as login.
    ======================================================== */

    const staff = await getCurrentStaff(request);

    /* ========================================================
       2. CHECK STAFF SESSION
    ======================================================== */

    if (!staff) {
      console.error(
        "FD WITHDRAWALS API: No authenticated staff found."
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized. Staff login session was not found. Please log in again.",
        },
        {
          status: 401,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    /* ========================================================
       3. NORMALIZE STAFF ROLE
    ======================================================== */

    const staffRole = String(
      staff.role || ""
    )
      .trim()
      .toLowerCase();

    console.log(
      "Authenticated staff:",
      {
        staff_id: staff.staff_id,
        full_name: staff.full_name,
        email: staff.email,
        role: staffRole,
      }
    );

    /* ========================================================
       4. VALIDATE ROLE
    ======================================================== */

    if (!isValidStaffRole(staffRole)) {
      console.error(
        "Invalid staff role:",
        staffRole
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Your staff role is not recognized. Please contact the system administrator.",
        },
        {
          status: 403,
        }
      );
    }

    /* ========================================================
       5. ALLOWED ROLES FOR FD REQUESTS
    ======================================================== */

    const allowedRoles = [
      "admin",
      "md",
      "manager",
    ] as const;

    if (
      !allowedRoles.includes(
        staffRole as
          | "admin"
          | "md"
          | "manager"
      )
    ) {
      console.error(
        "FD withdrawal access denied for role:",
        staffRole
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Access denied. You do not have permission to view FD withdrawal requests.",
        },
        {
          status: 403,
        }
      );
    }

    /* ========================================================
       6. LOAD FD WITHDRAWAL REQUESTS
       
       IMPORTANT:
       fd_withdrawals uses:
         withdrawal_id
         member_id
         reason
         requested_at
         status

       It does NOT have:
         id
         action_type
         created_at

       Therefore aliases are used below.
    ======================================================== */

    const [rows] = await db.execute(
      `
      SELECT
        fw.withdrawal_id AS id,

        fw.member_id,

        COALESCE(
          m.full_name,
          CONCAT(
            'Member #',
            fw.member_id
          )
        ) AS full_name,

        CASE
          WHEN LOWER(
            COALESCE(
              fw.reason,
              ''
            )
          ) LIKE '%rollover%'
          THEN 'rollover'

          ELSE 'withdraw'
        END AS action_type,

        fw.status,

        fw.requested_at AS created_at

      FROM fd_withdrawals AS fw

      LEFT JOIN members AS m
        ON m.member_id = fw.member_id

      WHERE fw.status IN (
        'pending',
        'acknowledged'
      )

      ORDER BY
        fw.requested_at DESC
      `
    );

    const withdrawals =
      rows as FDWithdrawalRow[];

    /* ========================================================
       7. RETURN SUCCESS
    ======================================================== */

    console.log(
      `FD withdrawals loaded: ${withdrawals.length}`
    );

    return NextResponse.json(
      {
        success: true,

        message:
          "FD withdrawal requests loaded successfully.",

        withdrawals,

        staff: {
          staffId: staff.staff_id,
          fullName: staff.full_name,
          email: staff.email,
          phone: staff.phone,
          role: staffRole,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: unknown) {
    console.error(
      "================================================"
    );

    console.error(
      "FD WITHDRAWALS API ERROR"
    );

    console.error(error);

    console.error(
      "================================================"
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown server error.";

    return NextResponse.json(
      {
        success: false,

        message:
          process.env.NODE_ENV === "development"
            ? `Failed to load FD withdrawal requests: ${errorMessage}`
            : "Failed to load FD withdrawal requests. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}
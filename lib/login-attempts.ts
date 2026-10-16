import { cookies } from "next/headers";
import db from "@/lib/db";

/* ============================================================
   TYPES
============================================================ */

export type FailedLogin = {
  id: number;
  email: string;
  ip_address: string;
  attempt_time: string;
  success: number;
};

export type PasswordReset = {
  id: number;
  email: string;
  request_time: string;
};

type SecurityAlertsResult =
  | {
      authorized: true;
      failedLogins: FailedLogin[];
      passwordResets: PasswordReset[];
    }
  | {
      authorized: false;
      reason?: string;
    };

/* ============================================================
   GET SECURITY ALERTS
============================================================ */

export async function getSecurityAlerts(): Promise<SecurityAlertsResult> {
  const cookieStore = await cookies();

  /* ==========================================================
     CURRENT STAFF SESSION
  ========================================================== */

  const staffIdCookie = cookieStore.get("staff_id")?.value;

  if (!staffIdCookie) {
    return {
      authorized: false,
      reason: "Staff login session was not found. Please log in again.",
    };
  }

  const staffId = Number(staffIdCookie);

  if (!Number.isInteger(staffId) || staffId <= 0) {
    return {
      authorized: false,
      reason: "Invalid staff login session.",
    };
  }

  try {
    /* ========================================================
       VERIFY STAFF ACCOUNT
    ======================================================== */

    const [staffRows] = await db.execute(
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
      [staffId]
    );

    const staff = staffRows as Array<{
      staff_id: number;
      full_name: string;
      email: string;
      role: string;
    }>;

    if (staff.length === 0) {
      return {
        authorized: false,
        reason: "Staff account was not found.",
      };
    }

    const currentStaff = staff[0];

    /* ========================================================
       REQUIRE MANAGING DIRECTOR
    ======================================================== */

    if (currentStaff.role !== "md") {
      return {
        authorized: false,
        reason: "Managing Director access required.",
      };
    }

    /* ========================================================
       FAILED LOGIN ATTEMPTS
    ======================================================== */

    const [failedLoginRows] = await db.execute(`
      SELECT
        la.id,
        la.email,
        la.ip_address,
        la.attempt_time,
        la.success
      FROM login_attempts AS la
      INNER JOIN (
        SELECT
          email
        FROM login_attempts
        WHERE success = 0
        GROUP BY email
        HAVING COUNT(*) >= 5
      ) AS filtered
        ON la.email = filtered.email
      ORDER BY la.attempt_time DESC
      LIMIT 50
    `);

    /* ========================================================
       PASSWORD RESET REQUESTS
    ======================================================== */

    const [passwordResetRows] = await db.execute(`
      SELECT
        id,
        email,
        request_time
      FROM password_resets
      ORDER BY request_time DESC
      LIMIT 50
    `);

    /* ========================================================
       RETURN RESULT
    ======================================================== */

    return {
      authorized: true,
      failedLogins: failedLoginRows as FailedLogin[],
      passwordResets: passwordResetRows as PasswordReset[],
    };
  } catch (error) {
    console.error("SECURITY ALERTS DATABASE ERROR:", error);

    return {
      authorized: false,
      reason: "Unable to load security alerts.",
    };
  }
}
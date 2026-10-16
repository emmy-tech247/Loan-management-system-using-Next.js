import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

/**
 * ============================================================
 * STAFF ROLES
 * ============================================================
 */

export const STAFF_ROLES = [
  "relationship_officer1",
  "relationship_officer2",
  "auditor",
  "manager",
  "accountant",
  "admin",
  "md",
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

/**
 * ============================================================
 * CURRENT STAFF
 * ============================================================
 */

export interface CurrentStaff {
  staff_id: number;
  full_name: string;
  role: StaffRole;
  email: string;
  phone: string;
}

/**
 * ============================================================
 * GET CURRENT STAFF
 *
 * IMPORTANT:
 * The staff table has been replaced with admin_panel.
 * All staff authentication lookups therefore use admin_panel.
 *
 * Supported session cookies:
 *
 * 1. staff_id      - primary/current staff session
 * 2. admin2Id      - legacy MD/Admin2 session compatibility
 * 3. staff_email   - fallback session lookup
 * ============================================================
 */

export async function getCurrentStaff(
  request: NextRequest
): Promise<CurrentStaff | null> {
  try {
    /**
     * ----------------------------------------------------------
     * Read authentication cookies
     * ----------------------------------------------------------
     */

    const staffIdCookie =
      request.cookies.get("staff_id")?.value?.trim() || "";

    const admin2IdCookie =
      request.cookies.get("admin2Id")?.value?.trim() || "";

    const staffEmail =
      request.cookies.get("staff_email")?.value?.trim() || "";

    /**
     * ----------------------------------------------------------
     * Determine which staff ID should be used
     *
     * staff_id is the primary cookie.
     * admin2Id is supported for older MD/Admin2 pages.
     * ----------------------------------------------------------
     */

    const staffId = staffIdCookie || admin2IdCookie;

    /**
     * ----------------------------------------------------------
     * LOOKUP BY STAFF ID
     * ----------------------------------------------------------
     */

    if (staffId) {
      const numericStaffId = Number(staffId);

      if (
        Number.isInteger(numericStaffId) &&
        numericStaffId > 0
      ) {
        const [rows] = await db.execute(
          `
            SELECT
              staff_id,
              full_name,
              role,
              email,
              phone
            FROM admin_panel
            WHERE staff_id = ?
            LIMIT 1
          `,
          [numericStaffId]
        );

        const staffRows = rows as Array<{
          staff_id: number;
          full_name: string;
          role: string;
          email: string;
          phone: string;
        }>;

        if (staffRows.length > 0) {
          const staff = staffRows[0];

          const role = String(staff.role || "")
            .trim()
            .toLowerCase();

          if (!isValidStaffRole(role)) {
            console.error(
              "getCurrentStaff: Invalid staff role:",
              staff.role
            );

            return null;
          }

          return {
            staff_id: Number(staff.staff_id),
            full_name: String(staff.full_name || ""),
            role,
            email: String(staff.email || ""),
            phone: String(staff.phone || ""),
          };
        }
      }
    }

    /**
     * ----------------------------------------------------------
     * FALLBACK LOOKUP BY EMAIL
     * ----------------------------------------------------------
     */

    if (staffEmail) {
      const normalizedEmail = normalizeEmail(staffEmail);

      const [rows] = await db.execute(
        `
          SELECT
            staff_id,
            full_name,
            role,
            email,
            phone
          FROM admin_panel
          WHERE LOWER(TRIM(email)) = ?
          LIMIT 1
        `,
        [normalizedEmail]
      );

      const staffRows = rows as Array<{
        staff_id: number;
        full_name: string;
        role: string;
        email: string;
        phone: string;
      }>;

      if (staffRows.length > 0) {
        const staff = staffRows[0];

        const role = String(staff.role || "")
          .trim()
          .toLowerCase();

        if (!isValidStaffRole(role)) {
          console.error(
            "getCurrentStaff: Invalid staff role:",
            staff.role
          );

          return null;
        }

        return {
          staff_id: Number(staff.staff_id),
          full_name: String(staff.full_name || ""),
          role,
          email: String(staff.email || ""),
          phone: String(staff.phone || ""),
        };
      }
    }

    /**
     * ----------------------------------------------------------
     * NO STAFF SESSION
     * ----------------------------------------------------------
     */

    console.warn(
      "getCurrentStaff: No valid staff session found.",
      {
        hasStaffIdCookie: Boolean(staffIdCookie),
        hasAdmin2IdCookie: Boolean(admin2IdCookie),
        hasStaffEmailCookie: Boolean(staffEmail),
      }
    );

    return null;
  } catch (error) {
    console.error(
      "getCurrentStaff database/session error:",
      error
    );

    return null;
  }
}

/**
 * ============================================================
 * SET STAFF COOKIES
 * ============================================================
 */

export function setStaffCookies(
  response: NextResponse,
  staff: CurrentStaff
) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  };

  /**
   * Primary staff session
   */

  response.cookies.set(
    "staff_id",
    String(staff.staff_id),
    cookieOptions
  );

  response.cookies.set(
    "staff_name",
    staff.full_name,
    cookieOptions
  );

  response.cookies.set(
    "staff_email",
    staff.email,
    cookieOptions
  );

  response.cookies.set(
    "staff_role",
    staff.role,
    cookieOptions
  );

  /**
   * ----------------------------------------------------------
   * Compatibility cookie
   *
   * Some existing MD/Admin2 pages may still look for
   * admin2Id. Setting it to the same staff_id prevents those
   * pages from incorrectly reporting an expired session.
   * ----------------------------------------------------------
   */

  if (staff.role === "md" || staff.role === "admin") {
    response.cookies.set(
      "admin2Id",
      String(staff.staff_id),
      cookieOptions
    );
  }
}

/**
 * ============================================================
 * CLEAR STAFF COOKIES
 * ============================================================
 */

export function clearStaffCookies(
  response: NextResponse
) {
  const cookies = [
    "staff_id",
    "staff_name",
    "staff_email",
    "staff_role",
    "admin2Id",
  ];

  for (const cookie of cookies) {
    response.cookies.set(cookie, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }
}

/**
 * ============================================================
 * VALIDATE STAFF ROLE
 * ============================================================
 */

export function isValidStaffRole(
  role: string
): role is StaffRole {
  return STAFF_ROLES.includes(
    role as StaffRole
  );
}

/**
 * ============================================================
 * NORMALIZE EMAIL
 * ============================================================
 */

export function normalizeEmail(
  email: string
): string {
  return String(email || "")
    .trim()
    .toLowerCase();
}

/**
 * ============================================================
 * NORMALIZE PHONE
 * ============================================================
 */

export function normalizePhone(
  phone: string
): string {
  return String(phone || "").trim();
}

/**
 * ============================================================
 * VALIDATE PASSWORD
 * ============================================================
 */

export function validatePassword(
  password: string
): string | null {
  if (!password) {
    return "Password is required.";
  }

  if (password.length < 6) {
    return "Password must contain at least 6 characters.";
  }

  if (password.length > 100) {
    return "Password is too long.";
  }

  return null;
}
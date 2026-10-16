import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import {
  STAFF_ROLES,
  isValidStaffRole,
  normalizeEmail,
  normalizePhone,
  validatePassword,
} from "@/lib/staff-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const fullName = String(body.full_name || "").trim();
    const email = normalizeEmail(String(body.email || ""));
    const phone = normalizePhone(String(body.phone || ""));
    const password = String(body.password || "");
    const role = String(body.role || "").trim().toLowerCase();

    if (!fullName) {
      return NextResponse.json(
        {
          success: false,
          message: "Full name is required.",
        },
        { status: 400 }
      );
    }

    if (fullName.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid full name.",
        },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email address is required.",
        },
        { status: 400 }
      );
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number is required.",
        },
        { status: 400 }
      );
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
      return NextResponse.json(
        {
          success: false,
          message: passwordError,
        },
        { status: 400 }
      );
    }

    if (!isValidStaffRole(role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid staff role selected.",
          allowedRoles: STAFF_ROLES,
        },
        { status: 400 }
      );
    }

    /*
     * SECURITY:
     *
     * Public signup must not allow someone to create
     * an administrator or MD account.
     *
     * Admin/MD accounts should be created from the
     * Staff Administration page.
     */
    if (role === "admin" || role === "md") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Admin and MD accounts can only be created by an authorized administrator.",
        },
        { status: 403 }
      );
    }

    const [existingRows] = await db.execute(
      `
      SELECT staff_id
      FROM admin_panel
      WHERE LOWER(TRIM(email)) = ?
      LIMIT 1
      `,
      [email]
    );

    const existingStaff = existingRows as Array<{
      staff_id: number;
    }>;

    if (existingStaff.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A staff account with this email already exists.",
        },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await db.execute(
      `
      INSERT INTO admin_panel
      (
        full_name,
        role,
        password_hash,
        email,
        phone
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        fullName,
        role,
        passwordHash,
        email,
        phone,
      ]
    );

    const insertResult = result as {
      insertId: number;
    };

    return NextResponse.json(
      {
        success: true,
        message:
          "Staff account created successfully.",
        staff: {
          staffId: insertResult.insertId,
          fullName,
          email,
          phone,
          role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("=================================");
    console.error("STAFF SIGNUP SERVER ERROR:");
    console.error(error);
    console.error("=================================");

    return NextResponse.json(
      {
        success: false,
        message:
          process.env.NODE_ENV === "development" &&
          error instanceof Error
            ? error.message
            : "Unable to create staff account.",
      },
      { status: 500 }
    );
  }
}
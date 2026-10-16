import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { validatePassword } from "@/lib/staff-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const token = String(
      body.token || ""
    ).trim();

    const password = String(
      body.password || ""
    );

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password reset token is missing.",
        },
        { status: 400 }
      );
    }

    const passwordError =
      validatePassword(password);

    if (passwordError) {
      return NextResponse.json(
        {
          success: false,
          message: passwordError,
        },
        { status: 400 }
      );
    }

    const tokenHash =
      crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const [rows] = await db.execute(
      `
      SELECT
        staff_id,
        full_name,
        email,
        reset_token_expires_at
      FROM admin_panel
      WHERE reset_token_hash = ?
      LIMIT 1
      `,
      [tokenHash]
    );

    const staffRows = rows as Array<{
      staff_id: number;
      full_name: string;
      email: string;
      reset_token_expires_at:
        | string
        | Date
        | null;
    }>;

    if (staffRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This password reset link is invalid or has already been used.",
        },
        { status: 400 }
      );
    }

    const staff = staffRows[0];

    if (!staff.reset_token_expires_at) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This password reset link is invalid or has expired.",
        },
        { status: 400 }
      );
    }

    const expiry = new Date(
      staff.reset_token_expires_at
    ).getTime();

    if (
      Number.isNaN(expiry) ||
      expiry < Date.now()
    ) {
      await db.execute(
        `
        UPDATE admin_panel
        SET
          reset_token_hash = NULL,
          reset_token_expires_at = NULL
        WHERE staff_id = ?
        `,
        [staff.staff_id]
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "This password reset link has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    const passwordHash =
      await bcrypt.hash(password, 12);

    await db.execute(
      `
      UPDATE admin_panel
      SET
        password_hash = ?,
        reset_token_hash = NULL,
        reset_token_expires_at = NULL
      WHERE staff_id = ?
      `,
      [
        passwordHash,
        staff.staff_id,
      ]
    );

    /*
     * Clear any existing staff login cookies.
     * The user must log in again using the new password.
     */
    const response = NextResponse.json({
      success: true,
      message:
        "Your password has been reset successfully. You can now sign in.",
    });

    for (const cookie of [
      "staff_id",
      "staff_name",
      "staff_email",
      "staff_role",
    ]) {
      response.cookies.set(
        cookie,
        "",
        {
          httpOnly: true,
          secure:
            process.env.NODE_ENV ===
            "production",
          sameSite: "lax",
          path: "/",
          maxAge: 0,
        }
      );
    }

    return response;
  } catch (error) {
    console.error(
      "================================="
    );

    console.error(
      "RESET PASSWORD SERVER ERROR:"
    );

    console.error(error);

    console.error(
      "================================="
    );

    return NextResponse.json(
      {
        success: false,
        message:
          process.env.NODE_ENV === "development" &&
          error instanceof Error
            ? error.message
            : "Unable to reset password. Please try again.",
      },
      { status: 500 }
    );
  }
}
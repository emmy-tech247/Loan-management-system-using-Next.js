import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import db from "@/lib/db";
import { normalizeEmail } from "@/lib/staff-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = normalizeEmail(
      String(body.email || "")
    );

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter your email address.",
        },
        { status: 400 }
      );
    }

    const [rows] = await db.execute(
      `
      SELECT
        staff_id,
        full_name,
        email
      FROM admin_panel
      WHERE LOWER(TRIM(email)) = ?
      LIMIT 1
      `,
      [email]
    );

    const staffRows = rows as Array<{
      staff_id: number;
      full_name: string;
      email: string;
    }>;

    /*
     * We deliberately return the same message whether
     * the account exists or not. This prevents people
     * from discovering registered staff emails.
     */
    if (staffRows.length === 0) {
      return NextResponse.json({
        success: true,
        message:
          "If a staff account exists for this email, a password reset link has been sent.",
      });
    }

    const staff = staffRows[0];

    /*
     * Generate a strong random token.
     */
    const rawToken =
      crypto.randomBytes(32).toString("hex");

    /*
     * Only store the hash in the database.
     */
    const tokenHash =
      crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

    /*
     * Reset link expires after 30 minutes.
     */
    const expiresAt = new Date(
      Date.now() + 30 * 60 * 1000
    );

    await db.execute(
      `
      UPDATE admin_panel
      SET
        reset_token_hash = ?,
        reset_token_expires_at = ?
      WHERE staff_id = ?
      `,
      [
        tokenHash,
        expiresAt,
        staff.staff_id,
      ]
    );

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const resetUrl =
      `${appUrl}/staff_login/reset-password?token=${rawToken}`;

    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASSWORD
    ) {
      console.error(
        "SMTP settings are missing."
      );

      /*
       * Development convenience:
       * show the link in terminal only.
       *
       * Never expose this in production.
       */
      if (
        process.env.NODE_ENV ===
        "development"
      ) {
        console.log(
          "================================="
        );
        console.log(
          "STAFF PASSWORD RESET LINK:"
        );
        console.log(resetUrl);
        console.log(
          "================================="
        );
      }

      return NextResponse.json({
        success: true,
        message:
          "A password reset link has been generated. Check the server console during development.",
        ...(process.env.NODE_ENV ===
        "development"
          ? { developmentResetUrl: resetUrl }
          : {}),
      });
    }

    const transporter =
      nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(
          process.env.SMTP_PORT || 465
        ),
        secure:
          String(
            process.env.SMTP_SECURE
          ).toLowerCase() === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

    await transporter.sendMail({
      from:
        process.env.SMTP_FROM ||
        process.env.SMTP_USER,

      to: staff.email,

      subject:
        "DCG Cooperative Staff Password Reset",

      text: `
Hello ${staff.full_name},

We received a request to reset your DCG Cooperative staff portal password.

Use the following link to create a new password:

${resetUrl}

This link expires in 30 minutes.

If you did not request this password reset, you can safely ignore this email.

DCG Multi-Purpose Cooperative Society Ltd.
Prosperity Built on Integrity
      `.trim(),

      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1e293b;max-width:600px;margin:auto;">
          <h2 style="color:#047857;">
            DCG Cooperative Staff Portal
          </h2>

          <p>Hello ${escapeHtml(
            staff.full_name
          )},</p>

          <p>
            We received a request to reset your
            staff portal password.
          </p>

          <p>
            Click the button below to create a
            new password:
          </p>

          <p>
            <a
              href="${resetUrl}"
              style="
                display:inline-block;
                padding:12px 22px;
                background:#059669;
                color:#ffffff;
                text-decoration:none;
                border-radius:8px;
                font-weight:bold;
              "
            >
              Reset Password
            </a>
          </p>

          <p>
            This link expires in
            <strong>30 minutes</strong>.
          </p>

          <p>
            If you did not request this password
            reset, you can safely ignore this email.
          </p>

          <hr />

          <p style="color:#64748b;font-size:13px;">
            DCG Multi-Purpose Cooperative Society Ltd.<br />
            Prosperity Built on Integrity
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message:
        "If a staff account exists for this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error(
      "================================="
    );

    console.error(
      "FORGOT PASSWORD SERVER ERROR:"
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
            : "Unable to process your request. Please try again.",
      },
      { status: 500 }
    );
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import mysql from "mysql2/promise";
import nodemailer from "nodemailer";

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// POST /api/forgot-password
export async function POST(request: NextRequest) {
  try {
    // Get JSON from request
    const body = await request.json();
    const email = body.email;

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email address is required.",
        },
        { status: 400 }
      );
    }

    // Generate reset token
    const token = crypto.randomBytes(16).toString("hex");

    // Hash token before saving to database
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Token expires in 30 minutes
    const expiry = new Date(Date.now() + 30 * 60 * 1000);

    // Save token in database
    const [result] = await pool.execute(
      `UPDATE members
       SET reset_token_hash = ?,
           reset_token_expires_at = ?
       WHERE email = ?`,
      [tokenHash, expiry, email]
    );

    const updateResult = result as mysql.ResultSetHeader;

    if (updateResult.affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No account found with that email.",
        },
        { status: 404 }
      );
    }

    // Configure email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    // Reset URL
    const resetUrl = `https://dcgcoop.com.ng/reset-password?token=${token}`;

    // Send email
    await transporter.sendMail({
      from: `"DCG Multipurpose Cooperative" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>Click the link below to reset your password:</p>

        <p>
          <a href="${resetUrl}">
            Reset Password
          </a>
        </p>

        <p>This link will expire in 30 minutes.</p>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Message sent! Please check your inbox.",
    });
  } catch (error) {
    console.error("Password reset error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Message could not be sent.",
      },
      { status: 500 }
    );
  }
}
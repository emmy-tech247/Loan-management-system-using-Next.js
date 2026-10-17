
import "server-only";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/*==============================================================
Send Email
==============================================================*/

export async function sendEmail(
  to: string,
  subject: string,
  html: string
) {
  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}

/*==============================================================
Send Verification Email
==============================================================*/

export async function sendVerificationEmail(
  to: string,
  token: string
) {
  const verificationUrl =
    `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${encodeURIComponent(token)}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2>Email Verification</h2>

      <p>Thank you for registering. Please verify your email address
      by clicking the button below.</p>

      <p style="margin: 30px 0;">
        <a
          href="${verificationUrl}"
          style="background: #2563eb; color: #ffffff; padding: 12px 24px;
          text-decoration: none; border-radius: 6px; display: inline-block;"
        >
          Verify Email Address
        </a>
      </p>

      <p>If the button does not work, copy and paste this link into your browser:</p>

      <p>
        <a href="${verificationUrl}">${verificationUrl}</a>
      </p>

      <p>If you did not create an account, you can safely ignore this email.</p>

      <p>This verification link should expire within 24 hours.</p>
    </div>
  `;

  return sendEmail(
    to,
    "Verify Your Email Address",
    html
  );
}

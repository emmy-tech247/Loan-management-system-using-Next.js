
import crypto from "crypto";

/*==============================================================
Email Verification Token
==============================================================*/

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/*==============================================================
Generate OTP
==============================================================*/

export function generateOTP(length = 6): string {
  const max = 10 ** length;
  return crypto
    .randomInt(0, max)
    .toString()
    .padStart(length, "0");
}

/*==============================================================
Hash Token
==============================================================*/

export function hashToken(token: string): string {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

/*==============================================================
Expiry Date
==============================================================*/

export function tokenExpiry(hours = 24): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry;
}

/*==============================================================
Payment Reference
==============================================================*/

export function generatePaymentReference(): string {
  return (
    "DCG-" +
    Date.now() +
    "-" +
    crypto.randomInt(0, 1_000_000)
      .toString()
      .padStart(6, "0")
  );
}

/*==============================================================
Random Member Code
==============================================================*/

export function generateMemberCode(): string {
  return (
    "MEM" +
    crypto.randomInt(100000, 1_000_000)
  );
}

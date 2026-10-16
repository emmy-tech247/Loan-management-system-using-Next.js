import crypto from "crypto";

/*==============================================================
Email Verification Token
==============================================================*/

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
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

export function generatePaymentReference() {

  return (
    "DCG-" +
    Date.now() +
    "-" +
    Math.floor(Math.random() * 1000000)
  );

}

/*==============================================================
Random Member Code
==============================================================*/

export function generateMemberCode() {

  return (
    "MEM" +
    Math.floor(100000 + Math.random() * 900000)
  );

}

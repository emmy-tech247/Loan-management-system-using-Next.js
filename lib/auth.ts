import bcrypt from "bcryptjs";

/*==============================================================
Password Hashing
==============================================================*/

const SALT_ROUNDS = 12;

/**
 * Hash Password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify Password
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/*==============================================================
OTP Generator
==============================================================*/

export function generateOTP(length = 6): string {
  let otp = "";

  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }

  return otp;
}

/*==============================================================
OTP Expiry
==============================================================*/

export function otpExpiry(minutes = 10): Date {
  const expiry = new Date();

  expiry.setMinutes(expiry.getMinutes() + minutes);

  return expiry;
}

// Imports & Config
// =============================
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import path from "path";
import fs from "fs/promises";

import db from "@/lib/db";
import { uploadFile } from "@/lib/upload";
import { generateOTP, generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/mail";

export const runtime = "nodejs";

// =============================
// GET Route (Email Verification)
// =============================
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (!email || !token) {
      return NextResponse.redirect(
        new URL("/register/verify/error", request.url)
      );
    }

    // Find Member
    const [rows]: any = await db.execute(
      `
      SELECT
        member_id,
        full_name,
        email_verified,
        reset_token_hash,
        reset_token_expires_at
      FROM members
      WHERE email = ?
      `,
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.redirect(
        new URL("/register/verify/error", request.url)
      );
    }

    const member = rows[0];

    // Already Verified
    if (member.email_verified === 1) {
      return NextResponse.redirect(
        new URL("/register/verify/already", request.url)
      );
    }

    // Token Expired
    if (
      !member.reset_token_expires_at ||
      new Date(member.reset_token_expires_at) < new Date()
    ) {
      return NextResponse.redirect(
        new URL("/register/verify/expired", request.url)
      );
    }

    // Compare Token
    const validToken = await bcrypt.compare(
      token,
      member.reset_token_hash
    );

    if (!validToken) {
      return NextResponse.redirect(
        new URL("/register/verify/error", request.url)
      );
    }

    // Update Database
    await db.execute(
      `
      UPDATE members
      SET
        email_verified = 1,
        reset_token_hash = NULL,
        reset_token_expires_at = NULL
      WHERE member_id = ?
      `,
      [member.member_id]
    );

    // Redirect Success
    return NextResponse.redirect(
      new URL("/register/verify/success", request.url)
    );

  } catch (error) {
    console.error("GET Verification Error:", error);

    return NextResponse.redirect(
      new URL("/register/verify/error", request.url)
    );
  }
}

// =============================
// POST Route (Registration)
// =============================
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    /* Read Form Fields */
    const surname = String(formData.get("surname") || "").trim();
    const firstname = String(formData.get("firstname") || "").trim();
    const othername = String(formData.get("othername") || "").trim();

    const full_name = `${surname} ${firstname} ${othername}`.trim();

    const nin = String(formData.get("nin") || "").trim();
    const password = String(formData.get("password") || "");
    const state_of_origin = String(formData.get("state_of_origin") || "");
    const lga_of_origin = String(formData.get("lga_of_origin") || "");
    const permanent_address = String(formData.get("permanent_address") || "");
    const residential_address = String(formData.get("residential_address") || "");
    const phone_number = String(formData.get("phone_number") || "");
    const email = String(formData.get("email") || "");

    const bank_name = String(formData.get("bank_name") || "");
    const account_number = String(formData.get("account_number") || "");
    const account_name = String(formData.get("account_name") || "");
    const account_type = String(formData.get("account_type") || "");

    const place_of_work = String(formData.get("place_of_work") || "");
    const type_of_business_work = String(formData.get("type_of_business_work") || "");
    const monthly_earning = String(formData.get("monthly_earning") || "");
    const annual_income = String(formData.get("annual_income") || "");

    const expected_monthly_contribution_amount = Number(formData.get("expected_monthly_contribution_amount"));
    const fixed_deposit_amount = Number(formData.get("fixed_deposit_amount") || 0);
    const fixed_deposit_years = Number(formData.get("fixed_deposit_years") || 0);
    const contribution_start_date = String(formData.get("contribution_start_date"));

    const full_name_of_next_of_kin = String(formData.get("full_name_of_next_of_kin"));
    const address_of_next_of_kin = String(formData.get("address_of_next_of_kin"));
    const phone_number_of_next_of_kin = String(formData.get("phone_number_of_next_of_kin"));
    const relationship_with_next_of_kin = String(formData.get("relationship_with_next_of_kin"));

    /* Read Uploaded Files */
    const passport = formData.get("passport") as File;
    const id_document = formData.get("id_document") as File;
    const payment_receipt = formData.get("payment_receipt") as File;

    /* Validate Required Fields */
    if (!surname || !firstname || !nin || !password || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "Required fields are missing.",
        },
        { status: 400 }
      );
    }

    if (!payment_receipt) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment receipt is required.",
        },
        { status: 400 }
      );
    }

    /* Check Duplicate NIN */
    const [rows]: any = await db.execute(
      `
      SELECT member_id
      FROM members
      WHERE nin = ?
      `,
      [nin]
    );

    if (rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "This NIN has already been registered.",
        },
        { status: 409 }
      );
    }

    /* Hash Password */
    const password_hash = await bcrypt.hash(password, 12);

    /* Generate OTP */
    const otp_code = generateOTP();
    const otp_expires = new Date(Date.now() + 10 * 60 * 1000);

    /* Generate Email Verification Token */
    const token = generateVerificationToken();
    const token_hash = await bcrypt.hash(token, 12);
    const token_expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // TODO: Proceed with file uploads, SQL insert, and mail dispatch here

    return NextResponse.json(
      {
        success: true,
        message: "Registration initiated successfully.",
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("POST Registration Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during registration.",
      },
      { status: 500 }
    );
  }
}

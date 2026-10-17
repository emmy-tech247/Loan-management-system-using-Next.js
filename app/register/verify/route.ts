import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import db from "@/lib/db";
import { uploadFile } from "@/lib/upload";
import {
  generateOTP,
  generateVerificationToken,
} from "@/lib/token";
import { sendVerificationEmail } from "@/lib/mail";

export const runtime = "nodejs";

// =============================
// GET Route (Email Verification)
// =============================
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const email = searchParams.get("email")?.trim().toLowerCase();
    const token = searchParams.get("token");

    if (!email || !token) {
      return NextResponse.redirect(
        new URL("/register/verify/error", request.url)
      );
    }

    const [rows]: any = await db.execute(
      `
      SELECT
        member_id,
        email_verified,
        reset_token_hash,
        reset_token_expires_at
      FROM members
      WHERE email = ?
      LIMIT 1
      `,
      [email]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.redirect(
        new URL("/register/verify/error", request.url)
      );
    }

    const member = rows[0];

    if (Number(member.email_verified) === 1) {
      return NextResponse.redirect(
        new URL("/register/verify/already", request.url)
      );
    }

    if (
      !member.reset_token_hash ||
      !member.reset_token_expires_at ||
      new Date(member.reset_token_expires_at).getTime() <= Date.now()
    ) {
      return NextResponse.redirect(
        new URL("/register/verify/expired", request.url)
      );
    }

    const validToken = await bcrypt.compare(
      token,
      member.reset_token_hash
    );

    if (!validToken) {
      return NextResponse.redirect(
        new URL("/register/verify/error", request.url)
      );
    }

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
// POST Route (Member Registration)
// =============================
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Read personal information
    const surname = String(formData.get("surname") || "").trim();
    const firstname = String(formData.get("firstname") || "").trim();
    const othername = String(formData.get("othername") || "").trim();

    const full_name = [surname, firstname, othername]
      .filter(Boolean)
      .join(" ");

    const nin = String(formData.get("nin") || "").trim();
    const password = String(formData.get("password") || "");

    const state_of_origin = String(
      formData.get("state_of_origin") || ""
    ).trim();

    const lga_of_origin = String(
      formData.get("lga_of_origin") || ""
    ).trim();

    const permanent_address = String(
      formData.get("permanent_address") || ""
    ).trim();

    const residential_address = String(
      formData.get("residential_address") || ""
    ).trim();

    const phone_number = String(
      formData.get("phone_number") || ""
    ).trim();

    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();

    // Banking information
    const bank_name = String(formData.get("bank_name") || "").trim();
    const account_number = String(
      formData.get("account_number") || ""
    ).trim();

    const account_name = String(
      formData.get("account_name") || ""
    ).trim();

    const account_type = String(
      formData.get("account_type") || ""
    ).trim();

    // Employment and income information
    const place_of_work = String(
      formData.get("place_of_work") || ""
    ).trim();

    const type_of_business_work = String(
      formData.get("type_of_business_work") || ""
    ).trim();

    const monthly_earning = String(
      formData.get("monthly_earning") || ""
    ).trim();

    const annual_income = String(
      formData.get("annual_income") || ""
    ).trim();

    // Contribution and fixed deposit
    const expected_monthly_contribution_amount = Number(
      formData.get("expected_monthly_contribution_amount")
    );

    const fixed_deposit_amount = Number(
      formData.get("fixed_deposit_amount") || 0
    );

    const fixed_deposit_years = Number(
      formData.get("fixed_deposit_years") || 0
    );

    const contribution_start_date = String(
      formData.get("contribution_start_date") || ""
    ).trim();

    // Next of kin
    const full_name_of_next_of_kin = String(
      formData.get("full_name_of_next_of_kin") || ""
    ).trim();

    const address_of_next_of_kin = String(
      formData.get("address_of_next_of_kin") || ""
    ).trim();

    const phone_number_of_next_of_kin = String(
      formData.get("phone_number_of_next_of_kin") || ""
    ).trim();

    const relationship_with_next_of_kin = String(
      formData.get("relationship_with_next_of_kin") || ""
    ).trim();

    // Uploaded files
    const passport = formData.get("passport");
    const id_document = formData.get("id_document");
    const payment_receipt = formData.get("payment_receipt");

    // Validate required fields
    if (!surname || !firstname || !nin || !password || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "Surname, first name, NIN, password, and email are required.",
        },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid email address.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Your password must contain at least 8 characters.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{11}$/.test(nin)) {
      return NextResponse.json(
        {
          success: false,
          message: "NIN must contain exactly 11 digits.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(expected_monthly_contribution_amount) ||
      expected_monthly_contribution_amount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid monthly contribution amount.",
        },
        { status: 400 }
      );
    }

    if (
      !payment_receipt ||
      typeof payment_receipt === "string" ||
      payment_receipt.size === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid payment receipt is required.",
        },
        { status: 400 }
      );
    }

    // Check duplicate NIN or email
    const [existingMembers]: any = await db.execute(
      `
      SELECT member_id
      FROM members
      WHERE nin = ? OR email = ?
      LIMIT 1
      `,
      [nin, email]
    );

    if (existingMembers.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "This NIN or email address is already registered.",
        },
        { status: 409 }
      );
    }

    // Generate authentication credentials
    const password_hash = await bcrypt.hash(password, 12);

    const otp_code = String(generateOTP());
    const otp_hash = await bcrypt.hash(otp_code, 12);
    const otp_expires = new Date(Date.now() + 10 * 60 * 1000);

    const token = generateVerificationToken();
    const token_hash = await bcrypt.hash(token, 12);
    const token_expiry = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    /*
     * Upload the files using your existing upload utility.
     *
     * IMPORTANT:
     * The uploadFile arguments below are placeholders for the
     * intended interface. Adjust them to match lib/upload.ts.
     */
    const [passportPath, idDocumentPath, paymentReceiptPath] =
      await Promise.all([
        passport &&
        typeof passport !== "string" &&
        passport.size > 0
          ? uploadFile(passport)
          : Promise.resolve(null),

        id_document &&
        typeof id_document !== "string" &&
        id_document.size > 0
          ? uploadFile(id_document)
          : Promise.resolve(null),

        uploadFile(payment_receipt),
      ]);

    /*
     * IMPORTANT:
     * Confirm every column name against your actual members table.
     * This INSERT is a template and may need adjustment for your schema.
     */
    const [insertResult]: any = await db.execute(
      `
      INSERT INTO members (
        full_name,
        surname,
        firstname,
        othername,
        nin,
        password_hash,
        email,
        phone_number,
        state_of_origin,
        lga_of_origin,
        permanent_address,
        residential_address,
        bank_name,
        account_number,
        account_name,
        account_type,
        place_of_work,
        type_of_business_work,
        monthly_earning,
        annual_income,
        expected_monthly_contribution_amount,
        fixed_deposit_amount,
        fixed_deposit_years,
        contribution_start_date,
        full_name_of_next_of_kin,
        address_of_next_of_kin,
        phone_number_of_next_of_kin,
        relationship_with_next_of_kin,
        passport,
        id_document,
        payment_receipt,
        email_verified,
        reset_token_hash,
        reset_token_expires_at,
        otp_hash,
        otp_expires_at,
        status,
        payment_verified
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, 0, ?, ?, ?, ?, 'pending', 0
      )
      `,
      [
        full_name,
        surname,
        firstname,
        othername || null,
        nin,
        password_hash,
        email,
        phone_number || null,
        state_of_origin || null,
        lga_of_origin || null,
        permanent_address || null,
        residential_address || null,
        bank_name || null,
        account_number || null,
        account_name || null,
        account_type || null,
        place_of_work || null,
        type_of_business_work || null,
        monthly_earning || null,
        annual_income || null,
        expected_monthly_contribution_amount,
        fixed_deposit_amount,
        fixed_deposit_years,
        contribution_start_date || null,
        full_name_of_next_of_kin || null,
        address_of_next_of_kin || null,
        phone_number_of_next_of_kin || null,
        relationship_with_next_of_kin || null,
        passportPath,
        idDocumentPath,
        paymentReceiptPath,
        token_hash,
        token_expiry,
        otp_hash,
        otp_expires,
      ]
    );

    // Send email verification
    try {
      await sendVerificationEmail(
        email,
        full_name,
        token
      );
    } catch (emailError) {
      console.error("Verification email error:", emailError);

      /*
       * The account has already been created.
       * Do not return a generic registration failure that might
       * encourage a duplicate submission.
       */
      return NextResponse.json(
        {
          success: true,
          message:
            "Your registration was saved, but the verification email could not be sent. Please contact support to resend it.",
          memberId: insertResult.insertId,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Registration submitted successfully. Check your email to verify your account.",
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

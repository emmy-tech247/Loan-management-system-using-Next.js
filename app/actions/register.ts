"use server";

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";

import db from "@/lib/db";

export async function registerMember(formData: FormData) {
  try {
    // ============================================================
    // 1. COLLECT FORM DATA
    // ============================================================

    const surname = String(formData.get("surname") || "").trim();
    const firstname = String(formData.get("firstname") || "").trim();
    const othername = String(formData.get("othername") || "").trim();

    const full_name = `${surname} ${firstname} ${othername}`
      .replace(/\s+/g, " ")
      .trim();

    const nin = String(formData.get("nin") || "").trim();

    const rawPassword = String(formData.get("password") || "");

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

    const email = String(
      formData.get("email") || ""
    )
      .trim()
      .toLowerCase();

    const bank_name = String(
      formData.get("bank_name") || ""
    ).trim();

    const account_number = String(
      formData.get("account_number") || ""
    ).trim();

    const account_name = String(
      formData.get("account_name") || ""
    ).trim();

    const account_type = String(
      formData.get("account_type") || ""
    ).trim();

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

    // ============================================================
    // 2. NUMERIC VALUES
    // ============================================================

    const contributionValue = Number(
      formData.get("expected_monthly_contribution_amount") || 0
    );

    const fixedDepositValue = Number(
      formData.get("fixed_deposit_amount") || 0
    );

    const fixedDepositYearsValue = Number(
      formData.get("fixed_deposit_years") || 0
    );

    const expected_monthly_contribution_amount =
      Number.isFinite(contributionValue)
        ? contributionValue
        : 0;

    const fixed_deposit_amount =
      Number.isFinite(fixedDepositValue)
        ? fixedDepositValue
        : 0;

    const fixed_deposit_years =
      Number.isFinite(fixedDepositYearsValue)
        ? fixedDepositYearsValue
        : 0;

    const contribution_start_date =
      String(formData.get("contribution_start_date") || "").trim() || null;

    // ============================================================
    // 3. NEXT OF KIN
    // ============================================================

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

    // ============================================================
    // 4. BASIC VALIDATION
    // ============================================================

    if (!surname) {
      return {
        success: false,
        message: "❌ Please enter your surname.",
      };
    }

    if (!firstname) {
      return {
        success: false,
        message: "❌ Please enter your firstname.",
      };
    }

    if (!nin) {
      return {
        success: false,
        message: "❌ Please enter your NIN.",
      };
    }

    if (!rawPassword) {
      return {
        success: false,
        message: "❌ Please enter a password.",
      };
    }

    if (rawPassword.length < 6) {
      return {
        success: false,
        message: "❌ Password must be at least 6 characters.",
      };
    }

    if (!email) {
      return {
        success: false,
        message: "❌ Please enter your email address.",
      };
    }

    // ============================================================
    // 5. CHECK DUPLICATE NIN
    // ============================================================

    const [existingNIN]: any = await db.execute(
      `
        SELECT member_id
        FROM members
        WHERE nin = ?
        LIMIT 1
      `,
      [nin]
    );

    if (existingNIN.length > 0) {
      return {
        success: false,
        message:
          "❌ This NIN is already registered. Please contact the administrator.",
      };
    }

    // ============================================================
    // 6. CHECK DUPLICATE EMAIL
    // ============================================================

    const [existingEmail]: any = await db.execute(
      `
        SELECT member_id
        FROM members
        WHERE email = ?
        LIMIT 1
      `,
      [email]
    );

    if (existingEmail.length > 0) {
      return {
        success: false,
        message:
          "❌ This email address is already registered.",
      };
    }

    // ============================================================
    // 7. GENERATE USERNAME
    // ============================================================

    const baseUsername =
      `${firstname}.${surname}`
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, "");

    let username = baseUsername;

    const [existingUsername]: any = await db.execute(
      `
        SELECT member_id
        FROM members
        WHERE username = ?
        LIMIT 1
      `,
      [username]
    );

    if (existingUsername.length > 0) {
      username = `${baseUsername}${Date.now()}`;
    }

    // ============================================================
    // 8. HASH PASSWORD
    // ============================================================

    const password_hash = await bcrypt.hash(
      rawPassword,
      12
    );

    /*
     * Your database has BOTH:
     *
     * password_hash varchar(255)
     * password      varchar(255) NOT NULL
     *
     * We store the SAME bcrypt hash in both fields.
     *
     * This keeps the database compatible with login code
     * that may currently use either column.
     */
    const password = password_hash;

    // ============================================================
    // 9. SYSTEM VALUES
    // ============================================================

    const payment_verified = 0;

    const otp_code = String(
      Math.floor(100000 + Math.random() * 900000)
    );

    const otp_expires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    const payment_reference = "";

    const admin1_acknowledged = 0;

    const admin2_approved = 0;

    // ============================================================
    // 10. SAVE UPLOADED FILES
    // ============================================================

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads"
    );

    await mkdir(uploadDir, {
      recursive: true,
    });

    async function saveFile(
      fileEntry: FormDataEntryValue | null
    ): Promise<string> {
      if (
        !fileEntry ||
        !(fileEntry instanceof File) ||
        fileEntry.size === 0
      ) {
        return "";
      }

      const buffer = Buffer.from(
        await fileEntry.arrayBuffer()
      );

      const ext = path.extname(fileEntry.name);

      const safeExtension =
        ext && ext.length <= 10
          ? ext
          : "";

      const filename = `${Date.now()}_${crypto
        .randomBytes(8)
        .toString("hex")}${safeExtension}`;

      await writeFile(
        path.join(uploadDir, filename),
        buffer
      );

      return filename;
    }

    // ============================================================
    // 11. ID DOCUMENT
    // ============================================================

    const id_document = await saveFile(
      formData.get("id_document")
    );

    if (!id_document) {
      return {
        success: false,
        message: "❌ Please upload your ID document.",
      };
    }

    // ============================================================
    // 12. PASSPORT
    // ============================================================

    const passport = await saveFile(
      formData.get("passport")
    );

    if (!passport) {
      return {
        success: false,
        message: "❌ Please upload your passport photograph.",
      };
    }

    // ============================================================
    // 13. PAYMENT RECEIPT
    // ============================================================

    const payment_receipt = await saveFile(
      formData.get("payment_receipt")
    );

    if (!payment_receipt) {
      return {
        success: false,
        message:
          "❌ Please upload payment receipt as proof of payment.",
      };
    }

    // ============================================================
    // 14. EMAIL VERIFICATION TOKEN
    // ============================================================

    const token = crypto
      .randomBytes(32)
      .toString("hex");

    const reset_token_hash = await bcrypt.hash(
      token,
      12
    );

    const reset_token_expires_at = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    // ============================================================
    // 15. INSERT MEMBER
    // ============================================================

    /*
     * IMPORTANT:
     *
     * These columns EXACTLY match the members table
     * you provided.
     *
     * password is included because your database defines:
     *
     * password varchar(255) NOT NULL
     */

    const sql = `
      INSERT INTO members (
        full_name,
        username,
        password_hash,
        password,
        state_of_origin,
        lga_of_origin,
        permanent_address,
        residential_address,
        phone_number,
        email,
        bank_name,
        account_number,
        account_name,
        account_type,
        nin,
        id_document,
        passport,
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
        payment_reference,
        payment_verified,
        role,
        otp_code,
        otp_expires,
        status,
        payment_receipt,
        reset_token_hash,
        reset_token_expires_at,
        deleted,
        admin1_acknowledged,
        admin2_approved,
        failed_attempts,
        account_locked,
        forwarded_to_admin2,
        savings_balance,
        loan_balance,
        amount_saved,
        amount_paid,
        loan_status
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `;

    const values = [
      full_name,                              // 1
      username,                               // 2
      password_hash,                          // 3
      password,                               // 4
      state_of_origin,                       // 5
      lga_of_origin,                         // 6
      permanent_address,                     // 7
      residential_address,                   // 8
      phone_number,                           // 9
      email,                                  // 10
      bank_name,                              // 11
      account_number,                         // 12
      account_name,                           // 13
      account_type || null,                   // 14
      nin,                                    // 15
      id_document,                            // 16
      passport,                               // 17
      place_of_work,                          // 18
      type_of_business_work,                  // 19
      monthly_earning || null,                // 20
      annual_income || null,                  // 21
      expected_monthly_contribution_amount,   // 22
      fixed_deposit_amount,                   // 23
      fixed_deposit_years,                    // 24
      contribution_start_date,                // 25
      full_name_of_next_of_kin,               // 26
      address_of_next_of_kin,                 // 27
      phone_number_of_next_of_kin,            // 28
      relationship_with_next_of_kin,          // 29
      payment_reference,                      // 30
      payment_verified,                       // 31
      "member",                               // 32
      otp_code,                               // 33
      otp_expires,                            // 34
      "pending",                              // 35
      payment_receipt,                        // 36
      reset_token_hash,                       // 37
      reset_token_expires_at,                 // 38
      0,                                      // 39 deleted
      admin1_acknowledged,                    // 40
      admin2_approved,                        // 41
      0,                                      // 42 failed_attempts
      0,                                      // 43 account_locked
      0,                                      // 44 forwarded_to_admin2
      0,                                      // 45 savings_balance
      0,                                      // 46 loan_balance
      0,                                      // 47 amount_saved
      0,                                      // 48 amount_paid
      "Pending",                              // 49 loan_status
    ];

    // ============================================================
    // 16. SAFETY CHECK
    // ============================================================

    const placeholderCount =
      (sql.match(/\?/g) || []).length;

    if (placeholderCount !== values.length) {
      console.error(
        "❌ SQL placeholder/value mismatch",
        {
          placeholderCount,
          valuesLength: values.length,
        }
      );

      return {
        success: false,
        message:
          "❌ Registration configuration error: SQL values do not match database columns.",
      };
    }

    // ============================================================
    // 17. EXECUTE INSERT
    // ============================================================

    const [result]: any = await db.execute(
      sql,
      values
    );

    console.log(
      "✅ Member registration successful:",
      result.insertId
    );

    // ============================================================
    // 18. SUCCESS
    // ============================================================

    return {
      success: true,
      message:
        "✅ Registration submitted successfully! Please check your email to verify your account. Awaiting admin approval.",
    };
  } catch (error: any) {
    console.error(
      "❌ Database or registration error:",
      error
    );

    console.error(
      "SQL Error Code:",
      error?.code
    );

    console.error(
      "SQL Error Number:",
      error?.errno
    );

    console.error(
      "SQL Error SQL State:",
      error?.sqlState
    );

    console.error(
      "SQL Error Message:",
      error?.sqlMessage
    );

    return {
      success: false,
      message: `❌ Error saving registration: ${
        error?.sqlMessage ||
        error?.message ||
        "Unknown database error"
      }`,
    };
  }
}
import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function isValidEmail(email: string): boolean {
  if (!email) return true;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidBVN(bvn: string): boolean {
  return /^\d{11}$/.test(bvn);
}

/*
|--------------------------------------------------------------------------
| POST - Create Relationship Officer Loan Application
|--------------------------------------------------------------------------
*/

export async function POST(request: NextRequest) {
  let connection: any = null;

  try {
    /*
    |--------------------------------------------------------------------------
    | 1. Verify logged-in Relationship Officer1
    |--------------------------------------------------------------------------
    */

    const staffIdCookie = request.cookies.get("staff_id")?.value;

    if (!staffIdCookie) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in again.",
        },
        { status: 401 }
      );
    }

    const staffId = Number(staffIdCookie);

    if (!Number.isInteger(staffId) || staffId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid staff session.",
        },
        { status: 401 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 2. Verify staff account
    |--------------------------------------------------------------------------
    */

    const [staffRows] = await db.query(
      `
      SELECT
        staff_id,
        full_name,
        role
      FROM staff
      WHERE staff_id = ?
      LIMIT 1
      `,
      [staffId]
    );

    const staff = (staffRows as any[])[0];

    if (!staff) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff account not found.",
        },
        { status: 401 }
      );
    }

    if (staff.role !== "relationship_officer2") {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. Relationship Officer2 only.",
        },
        { status: 403 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 3. Read multipart/form-data
    |--------------------------------------------------------------------------
    */

    const formData = await request.formData();

    const memberId = Number(getString(formData, "member_id"));

    const loanCategory = getString(formData, "loan_category");
    const loanType = getString(formData, "loan_type");
    const purpose = getString(formData, "purpose");

    const loanAmount = Number(getString(formData, "loan_amount"));
    const interestRate = Number(getString(formData, "interest_rate"));
    const tenureMonth = Number(getString(formData, "tenure_month"));

    const repaymentSource = getString(
      formData,
      "repayment_source"
    );

    const bankName = getString(formData, "bank_name");
    const accountNumber = getString(
      formData,
      "account_number"
    );
    const accountName = getString(
      formData,
      "account_name"
    );
    const bvn = getString(formData, "bvn");

    const guarantor1Name = getString(
      formData,
      "guarantor1_name"
    );
    const guarantor1Phone = getString(
      formData,
      "guarantor1_phone"
    );
    const guarantor1Email = getString(
      formData,
      "guarantor1_email"
    );
    const guarantor1Address = getString(
      formData,
      "guarantor1_address"
    );

    const guarantor2Name = getString(
      formData,
      "guarantor2_name"
    );
    const guarantor2Phone = getString(
      formData,
      "guarantor2_phone"
    );
    const guarantor2Email = getString(
      formData,
      "guarantor2_email"
    );
    const guarantor2Address = getString(
      formData,
      "guarantor2_address"
    );

    /*
    |--------------------------------------------------------------------------
    | 4. Validate required fields
    |--------------------------------------------------------------------------
    */

    if (
      !Number.isInteger(memberId) ||
      memberId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select a valid member.",
        },
        { status: 400 }
      );
    }

    if (
      !["monthly_saver", "borrower"].includes(
        loanCategory
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid loan category.",
        },
        { status: 400 }
      );
    }

    if (
      !["personal", "business", "education"].includes(
        loanType
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid loan type.",
        },
        { status: 400 }
      );
    }

    if (!purpose) {
      return NextResponse.json(
        {
          success: false,
          message: "Loan purpose is required.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(loanAmount) ||
      loanAmount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Loan amount must be greater than zero.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(interestRate) ||
      interestRate < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid interest rate.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(tenureMonth) ||
      tenureMonth <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Tenure must be at least 1 month.",
        },
        { status: 400 }
      );
    }

    if (!repaymentSource) {
      return NextResponse.json(
        {
          success: false,
          message: "Repayment source is required.",
        },
        { status: 400 }
      );
    }

    if (!bankName || !accountNumber || !accountName) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Bank name, account number and account name are required.",
        },
        { status: 400 }
      );
    }

    if (!isValidBVN(bvn)) {
      return NextResponse.json(
        {
          success: false,
          message: "BVN must contain exactly 11 digits.",
        },
        { status: 400 }
      );
    }

    if (
      !guarantor1Name ||
      !guarantor1Phone ||
      !guarantor1Address
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Complete Guarantor 1 information is required.",
        },
        { status: 400 }
      );
    }

    if (
      !guarantor2Name ||
      !guarantor2Phone ||
      !guarantor2Address
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Complete Guarantor 2 information is required.",
        },
        { status: 400 }
      );
    }

    if (!isValidEmail(guarantor1Email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Guarantor 1 email address.",
        },
        { status: 400 }
      );
    }

    if (!isValidEmail(guarantor2Email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Guarantor 2 email address.",
        },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 5. Verify member exists
    |--------------------------------------------------------------------------
    */

    const [memberRows] = await db.query(
      `
      SELECT
        member_id,
        full_name
      FROM members
      WHERE member_id = ?
      LIMIT 1
      `,
      [memberId]
    );

    const member = (memberRows as any[])[0];

    if (!member) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected member does not exist.",
        },
        { status: 404 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 6. Handle receipt upload
    |--------------------------------------------------------------------------
    */

    let receiptPath: string | null = null;

    const receipt = formData.get("receipt");

    if (receipt instanceof File && receipt.size > 0) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "application/pdf",
      ];

      if (!allowedTypes.includes(receipt.type)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Receipt must be a JPG, PNG or PDF file.",
          },
          { status: 400 }
        );
      }

      // 5 MB maximum
      const maxSize = 5 * 1024 * 1024;

      if (receipt.size > maxSize) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Receipt file must not exceed 5MB.",
          },
          { status: 400 }
        );
      }

      const extensionMap: Record<string, string> = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "application/pdf": ".pdf",
      };

      const extension =
        extensionMap[receipt.type] || "";

      const fileName =
        `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extension}`;

      const uploadDirectory = path.join(
        process.cwd(),
        "public",
        "uploads",
        "loan-receipts"
      );

      await mkdir(uploadDirectory, {
        recursive: true,
      });

      const filePath = path.join(
        uploadDirectory,
        fileName
      );

      const buffer = Buffer.from(
        await receipt.arrayBuffer()
      );

      await writeFile(filePath, buffer);

      receiptPath =
        `/uploads/loan-receipts/${fileName}`;
    }

    /*
    |--------------------------------------------------------------------------
    | 7. Calculate repayment
    |--------------------------------------------------------------------------
    */

    const totalRepayment =
      loanAmount +
      loanAmount *
        (interestRate / 100) *
        tenureMonth;

    const monthlyRepayment =
      totalRepayment / tenureMonth;

    /*
    |--------------------------------------------------------------------------
    | 8. Start database transaction
    |--------------------------------------------------------------------------
    */

    connection = await db.getConnection();

    await connection.beginTransaction();

    /*
    |--------------------------------------------------------------------------
    | 9. Insert loan application
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    | This INSERT assumes these columns exist in `loans`.
    |
    */

    const [result] = await connection.query(
      `
      INSERT INTO loans (
        member_id,
        loan_category,
        loan_type,
        purpose,
        loan_amount,
        interest_rate,
        tenure_month,
        repayment_source,
        bank_name,
        account_number,
        account_name,
        bvn,
        guarantor1_name,
        guarantor1_phone,
        guarantor1_email,
        guarantor1_address,
        guarantor2_name,
        guarantor2_phone,
        guarantor2_email,
        guarantor2_address,
        receipt,
        total_repayment,
        monthly_repayment,
        loan_status
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
      `,
      [
        memberId,
        loanCategory,
        loanType,
        purpose,
        loanAmount,
        interestRate,
        tenureMonth,
        repaymentSource,
        bankName,
        accountNumber,
        accountName,
        bvn,

        guarantor1Name,
        guarantor1Phone,
        guarantor1Email || null,
        guarantor1Address,

        guarantor2Name,
        guarantor2Phone,
        guarantor2Email || null,
        guarantor2Address,

        receiptPath,

        totalRepayment,
        monthlyRepayment,

        "forwarded_to_accountant",
      ]
    );

    const loanId = (result as any).insertId;

    /*
    |--------------------------------------------------------------------------
    | 10. Commit
    |--------------------------------------------------------------------------
    */

    await connection.commit();

    /*
    |--------------------------------------------------------------------------
    | 11. Success response
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        success: true,
        message:
          "Loan application submitted successfully.",
        loan_id: loanId,
        member_id: memberId,
        full_name: member.full_name,
        loan_status: "forwarded_to_accountant",
        total_repayment: totalRepayment,
        monthly_repayment: monthlyRepayment,
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error: any) {
    /*
    |--------------------------------------------------------------------------
    | Rollback
    |--------------------------------------------------------------------------
    */

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Rollback error:",
          rollbackError
        );
      }
    }

    console.error(
      "POST /api/loans/relationship_officer2 error:",
      error
    );

    /*
    |--------------------------------------------------------------------------
    | Return database error during development
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        success: false,
        message:
          error?.sqlMessage ||
          error?.message ||
          "Failed to submit loan application.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
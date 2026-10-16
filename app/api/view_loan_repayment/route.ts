import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import db from "@/lib/db";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    /*
     * Replace this with your real authentication/session system.
     *
     * Example:
     *
     * const session = await auth();
     * const memberId = session?.user?.memberId;
     *
     * if (!memberId) {
     *   return NextResponse.json(
     *     { error: "Unauthorized" },
     *     { status: 401 }
     *   );
     * }
     */

    // TEMPORARY
    const memberId = 1;

    if (!memberId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const loanIdValue = formData.get("loan_id");
    const amountValue = formData.get("amount");
    const receipt = formData.get("receipt");

    const loanId = Number(loanIdValue);
    const amount = Number(amountValue);

    if (!Number.isInteger(loanId) || loanId <= 0) {
      return NextResponse.json(
        { error: "Invalid loan application." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid repayment amount." },
        { status: 400 }
      );
    }

    if (!(receipt instanceof File)) {
      return NextResponse.json(
        { error: "No receipt uploaded." },
        { status: 400 }
      );
    }

    /* ========================================================
       File Validation
    ======================================================== */

    if (!ALLOWED_TYPES.includes(receipt.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only JPG, PNG and PDF files are allowed.",
        },
        { status: 400 }
      );
    }

    if (receipt.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "Receipt file must not exceed 5MB.",
        },
        { status: 400 }
      );
    }

    /* ========================================================
       Verify Loan Belongs To Member
    ======================================================== */

    const [loanRows] = await db.execute(
      `
        SELECT id
        FROM loans
        WHERE id = ?
          AND member_id = ?
        LIMIT 1
      `,
      [loanId, memberId]
    );

    const loans = loanRows as Array<{ id: number }>;

    if (loans.length === 0) {
      return NextResponse.json(
        {
          error:
            "The selected loan does not belong to this member.",
        },
        { status: 403 }
      );
    }

    /* ========================================================
       Generate Secure Filename
    ======================================================== */

    const extensionMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "application/pdf": "pdf",
    };

    const extension = extensionMap[receipt.type];

    const filename = `receipt_${crypto.randomUUID()}.${extension}`;

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "uploads",
      "repayments"
    );

    await mkdir(uploadDirectory, {
      recursive: true,
    });

    const filePath = path.join(
      uploadDirectory,
      filename
    );

    /* ========================================================
       Save File
    ======================================================== */

    const bytes = await receipt.arrayBuffer();

    await writeFile(
      filePath,
      Buffer.from(bytes)
    );

    const receiptFile = `/uploads/repayments/${filename}`;

    /* ========================================================
       Insert Repayment
    ======================================================== */

    await db.execute(
      `
        INSERT INTO loan_repayments
        (
          member_id,
          loan_id,
          amount_paid,
          receipt_file
        )
        VALUES (?, ?, ?, ?)
      `,
      [
        memberId,
        loanId,
        amount,
        receiptFile,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Repayment submitted successfully!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Loan repayment API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "An error occurred while submitting your repayment.",
      },
      { status: 500 }
    );
  }
}
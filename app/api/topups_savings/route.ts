import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

import db from "@/lib/db";

export const runtime = "nodejs";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    /*
     * IMPORTANT:
     * Do NOT accept member_id from the browser.
     *
     * Replace this section with the same authentication/session
     * mechanism that your existing Next.js login uses.
     */

    const memberIdCookie = request.cookies.get("member_id");

    if (!memberIdCookie?.value) {
      return NextResponse.json(
        {
          message: "Unauthorized. Please log in.",
        },
        {
          status: 401,
        }
      );
    }

    const memberId = Number(memberIdCookie.value);

    if (!Number.isInteger(memberId) || memberId <= 0) {
      return NextResponse.json(
        {
          message: "Invalid member session.",
        },
        {
          status: 401,
        }
      );
    }

    const formData = await request.formData();

    const amountValue = formData.get("amount_saved");
    const receipt = formData.get("receipt");

    if (!amountValue) {
      return NextResponse.json(
        {
          message: "Savings amount is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!(receipt instanceof File)) {
      return NextResponse.json(
        {
          message: "Please upload a receipt.",
        },
        {
          status: 400,
        }
      );
    }

    const amountSaved = Number(amountValue);

    if (!Number.isFinite(amountSaved) || amountSaved <= 0) {
      return NextResponse.json(
        {
          message: "Please enter a valid savings amount.",
        },
        {
          status: 400,
        }
      );
    }

    if (!ALLOWED_TYPES.includes(receipt.type)) {
      return NextResponse.json(
        {
          message:
            "Invalid file type. Only JPG, JPEG, PNG and PDF files are allowed.",
        },
        {
          status: 400,
        }
      );
    }

    if (receipt.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          message: "Receipt file must not exceed 5MB.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Create uploads directory:
     *
     * public/uploads/receipts
     */
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "receipts"
    );

    await fs.mkdir(uploadDir, {
      recursive: true,
    });

    /*
     * Get original filename
     */
    const originalName = receipt.name || "receipt";

    /*
     * Clean filename
     */
    const safeName = originalName.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );

    /*
     * Generate unique filename
     */
    const uniqueName = `${Date.now()}_${crypto.randomUUID()}_${safeName}`;

    const filePath = path.join(
      uploadDir,
      uniqueName
    );

    /*
     * Convert File -> Buffer
     */
    const bytes = await receipt.arrayBuffer();

    const buffer = Buffer.from(bytes);

    /*
     * Save receipt
     */
    await fs.writeFile(filePath, buffer);

    /*
     * Public URL stored in database
     */
    const receiptFile = `/uploads/receipts/${uniqueName}`;

    /*
     * Generate transaction reference
     */
    const reference = `TXN_${crypto
      .randomBytes(8)
      .toString("hex")
      .toUpperCase()}`;

    /*
     * Insert transaction.
     *
     * This corresponds to your PHP:
     *
     * INSERT INTO savings_transactions
     * (
     *   member_id,
     *   amount_saved,
     *   reference,
     *   receipt_file,
     *   type,
     *   status,
     *   acknowledged_by_admin1,
     *   confirmed_by_admin2
     * )
     */
    const [result] = await db.execute(
      `
      INSERT INTO savings_transactions
      (
        member_id,
        amount_saved,
        reference,
        receipt_file,
        type,
        status,
        acknowledged_by_admin1,
        confirmed_by_admin2
      )
      VALUES (?, ?, ?, ?, 'deposit', 'pending', 0, 0)
      `,
      [
        memberId,
        amountSaved,
        reference,
        receiptFile,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Receipt uploaded successfully. Awaiting admin acknowledgment.",
        reference,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Upload savings receipt error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to upload receipt. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}
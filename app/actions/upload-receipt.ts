"use server";

import { cookies } from "next/headers";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

import db from "@/lib/db";

type UploadReceiptResult = {
  success: boolean;
  message: string;
};

export async function uploadReceipt(
  formData: FormData
): Promise<UploadReceiptResult> {
  try {
    /*
     * ---------------------------------------------------------
     * Get member session
     * ---------------------------------------------------------
     *
     * IMPORTANT:
     * Change "member_id" below if your Next.js login system
     * stores the member ID in a different cookie.
     */

    const cookieStore = await cookies();

    const memberIdCookie = cookieStore.get("member_id")?.value;

    if (!memberIdCookie || !/^\d+$/.test(memberIdCookie)) {
      return {
        success: false,
        message: "Unauthorized access. Please log in.",
      };
    }

    const memberId = Number(memberIdCookie);

    /*
     * ---------------------------------------------------------
     * Get uploaded file
     * ---------------------------------------------------------
     */

    const receipt = formData.get("receipt");

    if (!(receipt instanceof File)) {
      return {
        success: false,
        message: "No file was uploaded.",
      };
    }

    if (receipt.size === 0) {
      return {
        success: false,
        message: "The selected file is empty.",
      };
    }

    /*
     * ---------------------------------------------------------
     * Maximum file size
     * ---------------------------------------------------------
     *
     * 5 MB
     */

    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    if (receipt.size > MAX_FILE_SIZE) {
      return {
        success: false,
        message: "File is too large. Maximum allowed size is 5 MB.",
      };
    }

    /*
     * ---------------------------------------------------------
     * Allowed MIME types
     * ---------------------------------------------------------
     */

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(receipt.type)) {
      return {
        success: false,
        message: "Invalid file type. Only PDF, JPG, JPEG, and PNG are allowed.",
      };
    }

    /*
     * ---------------------------------------------------------
     * Allowed extensions
     * ---------------------------------------------------------
     */

    const originalName = receipt.name;

    const extension = path
      .extname(originalName)
      .toLowerCase();

    const allowedExtensions = [
      ".pdf",
      ".jpg",
      ".jpeg",
      ".png",
    ];

    if (!allowedExtensions.includes(extension)) {
      return {
        success: false,
        message: "Invalid file extension.",
      };
    }

    /*
     * ---------------------------------------------------------
     * Generate safe filename
     * ---------------------------------------------------------
     */

    const safeFilename =
      `${Date.now()}-${crypto.randomUUID()}${extension}`;

    /*
     * ---------------------------------------------------------
     * Upload directory
     * ---------------------------------------------------------
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
     * ---------------------------------------------------------
     * Save file
     * ---------------------------------------------------------
     */

    const filePath = path.join(
      uploadDir,
      safeFilename
    );

    const bytes = await receipt.arrayBuffer();

    const buffer = Buffer.from(bytes);

    await fs.writeFile(filePath, buffer);

    /*
     * ---------------------------------------------------------
     * Path stored in database
     * ---------------------------------------------------------
     */

    const databasePath =
      `/uploads/receipts/${safeFilename}`;

    /*
     * ---------------------------------------------------------
     * Insert into database
     * ---------------------------------------------------------
     */

    await db.execute(
      `
      INSERT INTO receipts
        (member_id, file_path)
      VALUES
        (?, ?)
      `,
      [
        memberId,
        databasePath,
      ]
    );

    return {
      success: true,
      message:
        "Receipt uploaded successfully. Waiting for admin approval.",
    };
  } catch (error) {
    console.error(
      "Receipt upload error:",
      error
    );

    return {
      success: false,
      message:
        "Failed to upload receipt. Please try again.",
    };
  }
}
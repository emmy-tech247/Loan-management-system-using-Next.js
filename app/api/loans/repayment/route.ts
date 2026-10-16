import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

// Simulated session retrieval helper
async function getSession() {
  // Replace with your actual auth session provider (e.g., NextAuth, Clerk, etc.)
  return { memberId: 12345 };
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.memberId) {
      return NextResponse.json(
        { message: "Unauthorized: You must be logged in." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const loanId = formData.get("loan_id") as string;
    const amountStr = formData.get("amount") as string;
    const file = formData.get("receipt") as File | null;

    if (!loanId || !amountStr || !file) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { message: "Please provide a valid repayment amount." },
        { status: 400 }
      );
    }

    // Validate MIME types
    const allowedMimeTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Invalid file type. Only JPG, PNG, and PDF files are allowed." },
        { status: 400 }
      );
    }

    // Prepare upload directory
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExt = file.name.split(".").pop() || "bin";
    const uniqueFilename = `receipt_${crypto.randomUUID()}.${fileExt}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueFilename);
    const dbFilePath = `/uploads/${uniqueFilename}`;

    // Write file to filesystem
    await writeFile(filePath, buffer);

    // Save metadata to database
    /*
    await db.execute(
      "INSERT INTO loan_repayments (member_id, loan_id, amount_paid, receipt_file) VALUES (?, ?, ?, ?)",
      [session.memberId, parseInt(loanId, 10), amount, dbFilePath]
    );
    */

    return NextResponse.json(
      {
        message: "Repayment submitted successfully!",
        filePath: dbFilePath,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing repayment:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred while processing your request." },
      { status: 500 }
    );
  }
}

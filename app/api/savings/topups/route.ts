import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Helper to simulate authentication session
async function getAuthSession() {
  // Replace with your actual auth mechanism (e.g., NextAuth, Clerk, JWT)
  return { memberId: 101 };
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.memberId) {
      return NextResponse.json(
        { message: "Unauthorized: Please log in." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const amountSaved = formData.get("amount_saved") as string;
    const file = formData.get("receipt") as File | null;

    const parsedAmount = parseFloat(amountSaved);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { message: "Please enter a valid deposit amount." },
        { status: 400 }
      );
    }

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { message: "Please select a valid receipt file." },
        { status: 400 }
      );
    }

    // Validate File Extension
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
    const allowedExtensions = ["jpg", "jpeg", "png", "pdf"];

    if (!allowedExtensions.includes(fileExt)) {
      return NextResponse.json(
        { message: "Invalid file type. Only JPG, PNG, and PDF formats are allowed." },
        { status: 400 }
      );
    }

    // Generate unique file path
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const uploadDir = path.join(process.cwd(), "public/uploads/receipts");
    const filePath = path.join(uploadDir, safeFileName);
    const relativePath = `/uploads/receipts/${safeFileName}`;

    // Ensure upload directory exists and write file
    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, buffer);

    // Generate reference code
    const reference = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Execute database insert
    /*
    await db.execute(
      `INSERT INTO savings_transactions 
       (member_id, amount_saved, reference, receipt_file, type, status, acknowledged_by_admin1, confirmed_by_admin2) 
       VALUES (?, ?, ?, ?, 'deposit', 'pending', 0, 0)`,
      [session.memberId, parsedAmount, reference, relativePath]
    );
    */

    return NextResponse.json(
      {
        message: "Receipt uploaded successfully. Awaiting admin acknowledgment.",
        reference,
        amount: parsedAmount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading savings receipt:", error);
    return NextResponse.json(
      { message: "Server error handling upload. Please try again." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("document") as File | null;
    const type = formData.get("type") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No document was uploaded." },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: "Document type is required." },
        { status: 400 }
      );
    }

    if (!["loan_form", "savings_agreement"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid document type." },
        { status: 400 }
      );
    }

    // Optional file-size restriction
    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size must not exceed 10 MB." },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create upload directory
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "documents"
    );

    await fs.mkdir(uploadDir, { recursive: true });

    // Make filename safer
    const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

    const fileName = `${Date.now()}-${originalName}`;

    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      message: "Document uploaded successfully.",
      fileName,
      type,
    });
  } catch (error) {
    console.error("Document upload error:", error);

    return NextResponse.json(
      { error: "Failed to upload document." },
      { status: 500 }
    );
  }
}
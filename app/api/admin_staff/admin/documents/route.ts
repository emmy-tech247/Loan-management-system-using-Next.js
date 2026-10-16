import { NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET
 * /api/admin_staff/admin/documents
 *
 * Returns all uploaded member documents.
 */
export async function GET() {
  try {
    const [rows] = await db.query(
      `
      SELECT
        document_id,
        file_name,
        file_path,
        type,
        uploaded_at,
        admin1_acknowledged
      FROM documents
      ORDER BY uploaded_at DESC
      `
    );

    return NextResponse.json(
      {
        success: true,
        documents: rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "GET /api/admin_staff/admin/documents error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load uploaded documents.",
      },
      { status: 500 }
    );
  }
}
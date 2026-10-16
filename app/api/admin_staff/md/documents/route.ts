import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    // ============================================================
    // 1. Check MD/Admin 2 authentication
    // ============================================================

    const cookieStore = request.cookies;

    const admin2Id =
      cookieStore.get("admin2Id")?.value ||
      cookieStore.get("staff_id")?.value;

    if (!admin2Id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in.",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // 2. Get documents acknowledged by Admin 1
    //    and forwarded to Admin 2
    // ============================================================

    const [rows] = await db.execute(
      `
        SELECT
          document_id AS id,
          file_name,
          file_path,
          type,
          acknowledged_at
        FROM documents
        WHERE admin1_acknowledged = 1
          AND forwarded_to_admin2 = 1
          AND status = 'acknowledged'
        ORDER BY acknowledged_at DESC, uploaded_at DESC
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
    console.error("MD documents GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load pending documents.",
      },
      { status: 500 }
    );
  }
}
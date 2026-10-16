import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let connection;

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

    const admin2IdNumber = Number(admin2Id);

    if (!Number.isInteger(admin2IdNumber) || admin2IdNumber <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Admin 2 session.",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // 2. Read request body
    // ============================================================

    const body = await request.json();

    const documentId = String(body.document_id || "").trim();

    if (!documentId) {
      return NextResponse.json(
        {
          success: false,
          message: "Document ID is required.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 3. Get database connection
    // ============================================================

    connection = await db.getConnection();

    await connection.beginTransaction();

    // ============================================================
    // 4. Lock the document
    // ============================================================

    const [rows]: any = await connection.execute(
      `
        SELECT
          document_id,
          file_name,
          status,
          admin1_acknowledged,
          forwarded_to_admin2,
          admin2_confirmed
        FROM documents
        WHERE document_id = ?
        FOR UPDATE
      `,
      [documentId]
    );

    if (!rows || rows.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Document not found.",
        },
        { status: 404 }
      );
    }

    const document = rows[0];

    // ============================================================
    // 5. Verify Admin 1 acknowledgement
    // ============================================================

    if (Number(document.admin1_acknowledged) !== 1) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "This document has not been acknowledged by Admin 1.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 6. Verify document was forwarded to Admin 2
    // ============================================================

    if (Number(document.forwarded_to_admin2) !== 1) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "This document has not been forwarded to Admin 2.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 7. Prevent duplicate confirmation
    // ============================================================

    if (
      document.status === "confirmed" ||
      Number(document.admin2_confirmed) === 1
    ) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "This document has already been confirmed.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 8. Make sure document is in the correct status
    // ============================================================

    if (document.status !== "acknowledged") {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: `Document cannot be confirmed because its current status is "${document.status}".`,
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 9. Confirm document
    // ============================================================

    await connection.execute(
      `
        UPDATE documents
        SET
          status = 'confirmed',
          admin2_confirmed = 1,
          admin2_id = ?,
          confirmed_at = NOW(),
          admin2_confirmed_at = NOW()
        WHERE document_id = ?
          AND admin1_acknowledged = 1
          AND forwarded_to_admin2 = 1
          AND status = 'acknowledged'
      `,
      [admin2IdNumber, documentId]
    );

    // ============================================================
    // 10. Commit
    // ============================================================

    await connection.commit();

    return NextResponse.json(
      {
        success: true,
        message: "Document confirmed successfully.",
        document_id: documentId,
      },
      { status: 200 }
    );
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError);
      }
    }

    console.error("MD document confirmation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to confirm document.",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";

/**
 * POST
 * /api/admin_staff/admin/documents/acknowledge
 *
 * Body:
 * {
 *   "document_id": 123
 * }
 */
export async function POST(request: NextRequest) {
  let connection;

  try {
    /*
     * ============================================================
     * READ REQUEST
     * ============================================================
     */

    const body = await request.json();

    const documentId = Number(body?.document_id);

    if (
      !Number.isInteger(documentId) ||
      documentId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid document ID is required.",
        },
        { status: 400 }
      );
    }

    /*
     * ============================================================
     * DATABASE CONNECTION
     * ============================================================
     */

    connection = await db.getConnection();

    await connection.beginTransaction();

    /*
     * ============================================================
     * FIND DOCUMENT
     * ============================================================
     */

    const [documents] = await connection.query(
      `
      SELECT
        document_id,
        admin1_acknowledged
      FROM documents
      WHERE document_id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [documentId]
    );

    const document = (documents as any[])[0];

    if (!document) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Document not found.",
        },
        { status: 404 }
      );
    }

    /*
     * ============================================================
     * CHECK IF ALREADY ACKNOWLEDGED
     * ============================================================
     */

    if (Boolean(document.admin1_acknowledged)) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "This document has already been acknowledged.",
        },
        { status: 409 }
      );
    }

    /*
     * ============================================================
     * ACKNOWLEDGE DOCUMENT
     * ============================================================
     */

    await connection.query(
      `
      UPDATE documents
      SET admin1_acknowledged = 1
      WHERE document_id = ?
      `,
      [documentId]
    );

    /*
     * ============================================================
     * COMMIT
     * ============================================================
     */

    await connection.commit();

    return NextResponse.json(
      {
        success: true,
        message: "Document acknowledged successfully.",
        document_id: documentId,
      },
      { status: 200 }
    );
  } catch (error) {
    /*
     * ============================================================
     * ROLLBACK
     * ============================================================
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
      "POST /api/admin_staff/admin/documents/acknowledge error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to acknowledge document.",
      },
      { status: 500 }
    );
  } finally {
    /*
     * ============================================================
     * RELEASE CONNECTION
     * ============================================================
     */

    if (connection) {
      connection.release();
    }
  }
}
import { NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        s.id AS signature_id,
        s.member_id,
        COALESCE(m.full_name, 'Unknown Member') AS full_name,
        s.purpose,
        s.signed_at,

        CASE
          WHEN s.signature_path IS NOT NULL
               AND TRIM(s.signature_path) <> ''
            THEN s.signature_path

          WHEN s.signature_file IS NOT NULL
               AND TRIM(s.signature_file) <> ''
            THEN s.signature_file

          ELSE ''
        END AS signature_path

      FROM signatures s

      LEFT JOIN members m
        ON CAST(m.member_id AS UNSIGNED) = CAST(s.member_id AS UNSIGNED)

      ORDER BY
        COALESCE(s.signed_at, s.submitted_at) DESC,
        s.id DESC
    `);

    return NextResponse.json(
      {
        success: true,
        mandates: rows,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error(
      "GET /api/admin_staff/admin/view-signatures error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        mandates: [],
        message: "Failed to load signed mandates.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { cookies } from "next/headers";

export const runtime = "nodejs";

async function verifyMD() {
  const cookieStore = await cookies();

  const admin2Id = cookieStore.get("admin2Id")?.value;
  const staffId = cookieStore.get("staff_id")?.value;

  const staffIdToCheck = admin2Id || staffId;

  if (!staffIdToCheck) {
    return null;
  }

  const [rows]: any = await db.query(
    `
    SELECT staff_id, full_name, email, role
    FROM staff
    WHERE staff_id = ?
      AND role = 'md'
    LIMIT 1
    `,
    [Number(staffIdToCheck)]
  );

  return rows.length > 0 ? rows[0] : null;
}

export async function GET() {
  try {
    // ============================================================
    // 1. Verify Managing Director
    // ============================================================

    const staff = await verifyMD();

    if (!staff) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Managing Director access required.",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // 2. Get members
    // ============================================================

    const [rows]: any = await db.query(`
      SELECT
        member_id,
        full_name,
        email,
        phone_number,
        account_type,
        created_at,
        account_number,
        bank_name
      FROM members
      WHERE COALESCE(deleted, 0) = 0
      ORDER BY member_id ASC
    `);

    // ============================================================
    // 3. Create CSV
    // ============================================================

    const headers = [
      "S/N",
      "Member ID",
      "Full Name",
      "Email",
      "Phone Number",
      "Account Type",
      "Account Number",
      "Bank Name",
      "Joined On",
    ];

    const escapeCSV = (value: unknown) => {
      if (value === null || value === undefined) {
        return "";
      }

      const text = String(value);

      return `"${text.replace(/"/g, '""')}"`;
    };

    const csvRows = rows.map((member: any, index: number) => [
      index + 1,
      member.member_id,
      member.full_name,
      member.email,
      member.phone_number,
      member.account_type,
      member.account_number,
      member.bank_name,
      member.created_at
        ? new Date(member.created_at).toLocaleDateString("en-GB")
        : "",
    ]);

    const csv = [
      headers.map(escapeCSV).join(","),
      ...csvRows.map((row: unknown[]) =>
        row.map(escapeCSV).join(",")
      ),
    ].join("\r\n");

    // ============================================================
    // 4. Return downloadable file
    // ============================================================

    return new NextResponse("\uFEFF" + csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="registered_members.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Member download error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to export member records.",
      },
      { status: 500 }
    );
  }
}
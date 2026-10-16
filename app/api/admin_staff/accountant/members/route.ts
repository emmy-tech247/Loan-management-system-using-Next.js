import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import {
  MembersDirectoryApiResponse,
  MemberProfileItem,
} from "@/types/membersDirectory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================
   GET - LOAD MEMBERS DIRECTORY
============================================================ */

export async function GET(request: NextRequest) {
  try {
    /* ========================================================
       1. GET SEARCH PARAMETER
    ======================================================== */

    const search =
      request.nextUrl.searchParams.get("search")?.trim() || "";

    /* ========================================================
       2. BUILD SQL
    ======================================================== */

    let sql = `
      SELECT
        member_id,
        full_name,
        account_name,
        account_number,
        bank_name,
        phone_number,
        passport
      FROM members
    `;

    const params: string[] = [];

    /* ========================================================
       3. APPLY SEARCH FILTER
    ======================================================== */

    if (search) {
      sql += `
        WHERE
          full_name LIKE ?
          OR CAST(member_id AS CHAR) LIKE ?
      `;

      const searchValue = `%${search}%`;

      params.push(searchValue, searchValue);
    }

    /* ========================================================
       4. ORDER RESULTS
    ======================================================== */

    sql += `
      ORDER BY
        full_name ASC,
        member_id DESC
    `;

    /* ========================================================
       5. EXECUTE QUERY
    ======================================================== */

    const [rows] = await db.execute(sql, params);

    /* ========================================================
       6. FORMAT DATABASE RESULTS
    ======================================================== */

    const members: MemberProfileItem[] = (
      rows as Array<{
        member_id: number | string;
        full_name: string | null;
        account_name: string | null;
        account_number: string | null;
        bank_name: string | null;
        phone_number: string | null;
        passport: string | null;
      }>
    ).map((member) => ({
      member_id: String(member.member_id),
      full_name: member.full_name || "Unnamed Member",
      account_name: member.account_name || "",
      account_number: member.account_number || "",
      bank_name: member.bank_name || "",
      phone_number: member.phone_number || "",
      passport: member.passport || "default_passport.jpg",
    }));

    /* ========================================================
       7. SUCCESS RESPONSE
    ======================================================== */

    const response: MembersDirectoryApiResponse = {
      success: true,
      message: search
        ? "Member search completed successfully."
        : "Members directory fetched successfully.",
      members,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error(
      "ACCOUNTANT MEMBERS DIRECTORY ERROR:",
      error
    );

    /* ========================================================
       8. ERROR RESPONSE
    ======================================================== */

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load member records. Please try again.",
        members: [],
      } satisfies MembersDirectoryApiResponse,
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // FIND STAFF IN admin_panel
    // ============================================================

    const [rows] = await db.query(
      `
      SELECT
        staff_id,
        full_name,
        email,
        phone,
        role,
        password_hash
      FROM admin_panel
      WHERE LOWER(TRIM(email)) = ?
      LIMIT 1
      `,
      [email]
    );

    const staffRows = rows as Array<{
      staff_id: number;
      full_name: string;
      email: string;
      phone: string | null;
      role: string;
      password_hash: string;
    }>;

    if (staffRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Incorrect email or password.",
        },
        { status: 401 }
      );
    }

    const staff = staffRows[0];

    // ============================================================
    // CHECK PASSWORD
    // ============================================================

    const passwordMatches = await bcrypt.compare(
      password,
      staff.password_hash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          success: false,
          message: "Incorrect email or password.",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // NORMALIZE ROLE
    // ============================================================

    const role = String(staff.role || "")
      .trim()
      .toLowerCase();

    // ============================================================
    // CREATE RESPONSE
    // ============================================================

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      staff: {
        staff_id: staff.staff_id,
        full_name: staff.full_name,
        email: staff.email,
        phone: staff.phone,
        role,
      },
    });

    // ============================================================
    // STAFF AUTH COOKIES
    // ============================================================

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    };

    response.cookies.set(
      "staff_id",
      String(staff.staff_id),
      cookieOptions
    );

    response.cookies.set(
      "staff_name",
      staff.full_name || "",
      cookieOptions
    );

    response.cookies.set(
      "staff_email",
      staff.email || "",
      cookieOptions
    );

    response.cookies.set(
      "staff_role",
      role,
      cookieOptions
    );

    return response;
  } catch (error) {
    console.error("STAFF LOGIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to process login request.",
      },
      { status: 500 }
    );
  }
}
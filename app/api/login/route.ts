import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import db from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Username and password are required.",
        },
        { status: 400 }
      );
    }

    const [rows]: any = await db.execute(
      `
      SELECT
        member_id,
        full_name,
        email,
        phone_number,
        password_hash
      FROM members
      WHERE email = ? OR phone_number = ?
      LIMIT 1
      `,
      [username, username]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid username or password.",
        },
        { status: 401 }
      );
    }

    const member = rows[0];

    const passwordMatch = await bcrypt.compare(
      password,
      member.password_hash
    );

    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid username or password.",
        },
        { status: 401 }
      );
    }

    // Create authenticated response
    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      member: {
        member_id: member.member_id,
        full_name: member.full_name,
        email: member.email,
        phone_number: member.phone_number,
      },
    });

    // Store the logged-in member ID in a secure cookie
    response.cookies.set("member_id", String(member.member_id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}

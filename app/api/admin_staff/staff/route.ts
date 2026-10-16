import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import db from "@/lib/db";

export const runtime = "nodejs";

function jsonError(
  message: string,
  status = 500
) {
  return NextResponse.json(
    {
      success: false,
      message,
      error: message,
    },
    { status }
  );
}

// ============================================================
// GET ALL STAFF
// ============================================================

export async function GET() {
  try {
    const [rows] = await db.execute(
      `
      SELECT
        staff_id,
        full_name,
        email,
        phone,
        role
      FROM staff
      ORDER BY staff_id DESC
      `
    );

    return NextResponse.json({
      success: true,
      staff: rows,
    });
  } catch (error) {
    console.error(
      "GET /api/admin_staff/staff error:",
      error
    );

    return jsonError(
      "Failed to load staff accounts.",
      500
    );
  }
}

// ============================================================
// CREATE STAFF
// ============================================================

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const full_name = String(
      body.full_name || ""
    ).trim();

    const email = String(
      body.email || ""
    )
      .trim()
      .toLowerCase();

    const phone = String(
      body.phone || ""
    ).trim();

    const role = String(
      body.role || ""
    ).trim();

    const password = String(
      body.password || ""
    );

    if (!full_name) {
      return jsonError(
        "Full name is required.",
        400
      );
    }

    if (!email) {
      return jsonError(
        "Email address is required.",
        400
      );
    }

    if (!phone) {
      return jsonError(
        "Phone number is required.",
        400
      );
    }

    if (!role) {
      return jsonError(
        "Staff role is required.",
        400
      );
    }

    if (password.length < 6) {
      return jsonError(
        "Password must contain at least 6 characters.",
        400
      );
    }

    const allowedRoles = [
      "relationship_officer1",
      "relationship_officer2",
      "auditor",
      "manager",
      "accountant",
      "admin",
      "md",
    ];

    if (!allowedRoles.includes(role)) {
      return jsonError(
        "Invalid staff role.",
        400
      );
    }

    // Check existing email

    const [existingRows] =
      await db.execute(
        `
        SELECT staff_id
        FROM staff
        WHERE email = ?
        LIMIT 1
        `,
        [email]
      );

    const existing =
      existingRows as Array<{
        staff_id: number;
      }>;

    if (existing.length > 0) {
      return jsonError(
        "A staff account with this email already exists.",
        409
      );
    }

    // Hash password

    const password_hash =
      await bcrypt.hash(password, 12);

    // Insert staff

    const [result] =
      await db.execute(
        `
        INSERT INTO staff
        (
          full_name,
          email,
          phone,
          role,
          password_hash
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          full_name,
          email,
          phone,
          role,
          password_hash,
        ]
      );

    const insertResult =
      result as {
        insertId: number;
      };

    // Retrieve newly created staff

    const [rows] =
      await db.execute(
        `
        SELECT
          staff_id,
          full_name,
          email,
          phone,
          role
        FROM staff
        WHERE staff_id = ?
        LIMIT 1
        `,
        [insertResult.insertId]
      );

    const staff =
      rows as Staff[];

    return NextResponse.json(
      {
        success: true,
        message:
          "Staff member added successfully.",
        staff: staff[0] || null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/admin_staff/staff error:",
      error
    );

    return jsonError(
      "Failed to create staff account.",
      500
    );
  }
}

type Staff = {
  staff_id: number;
  full_name: string;
  email: string;
  phone: string;
  role: string;
};
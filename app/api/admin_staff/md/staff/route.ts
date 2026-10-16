import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

export const runtime = "nodejs";

const allowedRoles = [
  "relationship_officer1",
  "relationship_officer2",
  "auditor",
  "manager",
  "accountant",
  "admin",
  "md",
];

type CurrentStaff = {
  staff_id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
};

/*
|--------------------------------------------------------------------------
| Authenticate current staff
|--------------------------------------------------------------------------
*/

async function getCurrentStaff(
  request: NextRequest
): Promise<CurrentStaff | null> {
  const staffIdCookie =
    request.cookies.get("staff_id")?.value;

  const staffEmailCookie =
    request.cookies.get("staff_email")?.value;

  console.log("Staff authentication:", {
    staffIdCookie,
    staffEmailCookie,
  });

  /*
  |--------------------------------------------------------------------------
  | Try staff_id
  |--------------------------------------------------------------------------
  */

  if (staffIdCookie) {
    const [rows] = await db.execute(
      `
        SELECT
          staff_id,
          full_name,
          email,
          phone,
          role
        FROM admin_panel
        WHERE staff_id = ?
        LIMIT 1
      `,
      [staffIdCookie]
    );

    const staffRows =
      rows as CurrentStaff[];

    if (staffRows.length > 0) {
      return staffRows[0];
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Try email as fallback
  |--------------------------------------------------------------------------
  */

  if (staffEmailCookie) {
    const [rows] = await db.execute(
      `
        SELECT
          staff_id,
          full_name,
          email,
          phone,
          role
        FROM admin_panel
        WHERE LOWER(TRIM(email)) =
              LOWER(TRIM(?))
        LIMIT 1
      `,
      [staffEmailCookie]
    );

    const staffRows =
      rows as CurrentStaff[];

    if (staffRows.length > 0) {
      return staffRows[0];
    }
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| GET - Fetch all staff
|--------------------------------------------------------------------------
*/

export async function GET(
  request: NextRequest
) {
  try {
    const currentStaff =
      await getCurrentStaff(request);

    if (!currentStaff) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your staff account could not be found. Please log in again.",
        },
        { status: 401 }
      );
    }

    const currentRole = String(
      currentStaff.role || ""
    )
      .trim()
      .toLowerCase();

    /*
    |--------------------------------------------------------------------------
    | Only MD and Admin can manage staff
    |--------------------------------------------------------------------------
    */

    if (
      currentRole !== "md" &&
      currentRole !== "admin"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You are not authorized to manage staff accounts.",
        },
        { status: 403 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Fetch staff
    |--------------------------------------------------------------------------
    */

    const [rows] = await db.execute(
      `
        SELECT
          staff_id,
          full_name,
          email,
          phone,
          role
        FROM admin_panel
        ORDER BY staff_id DESC
      `
    );

    const staff = rows as Array<{
      staff_id: number;
      full_name: string;
      email: string;
      phone: string | null;
      role: string;
    }>;

    return NextResponse.json({
      success: true,
      staff,
      currentStaff: {
        staff_id: currentStaff.staff_id,
        full_name: currentStaff.full_name,
        email: currentStaff.email,
        phone: currentStaff.phone,
        role: currentRole,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/admin_staff/md/staff error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch staff accounts.",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST - Add new staff
|--------------------------------------------------------------------------
*/

export async function POST(
  request: NextRequest
) {
  try {
    const currentStaff =
      await getCurrentStaff(request);

    if (!currentStaff) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your staff account could not be found. Please log in again.",
        },
        { status: 401 }
      );
    }

    const currentRole = String(
      currentStaff.role || ""
    )
      .trim()
      .toLowerCase();

    /*
    |--------------------------------------------------------------------------
    | Only MD and Admin can add staff
    |--------------------------------------------------------------------------
    */

    if (
      currentRole !== "md" &&
      currentRole !== "admin"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You are not authorized to create staff accounts.",
        },
        { status: 403 }
      );
    }

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
    )
      .trim()
      .toLowerCase();

    const password = String(
      body.password || ""
    );

    /*
    |--------------------------------------------------------------------------
    | Validate
    |--------------------------------------------------------------------------
    */

    if (
      !full_name ||
      !email ||
      !phone ||
      !role ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required.",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must contain at least 6 characters.",
        },
        { status: 400 }
      );
    }

    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid staff role.",
        },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Check duplicate email
    |--------------------------------------------------------------------------
    */

    const [existingRows] =
      await db.execute(
        `
          SELECT staff_id
          FROM admin_panel
          WHERE LOWER(TRIM(email)) = ?
          LIMIT 1
        `,
        [email]
      );

    const existing =
      existingRows as Array<{
        staff_id: number;
      }>;

    if (existing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A staff account with this email already exists.",
        },
        { status: 409 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Hash password
    |--------------------------------------------------------------------------
    */

    const password_hash =
      await bcrypt.hash(password, 12);

    /*
    |--------------------------------------------------------------------------
    | Insert
    |--------------------------------------------------------------------------
    */

    const [result] = await db.execute(
      `
        INSERT INTO admin_panel
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

    const insertResult = result as {
      insertId?: number;
    };

    return NextResponse.json(
      {
        success: true,
        message:
          "Staff member added successfully.",
        staffId:
          insertResult.insertId || null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/admin_staff/md/staff error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to add staff member.",
      },
      { status: 500 }
    );
  }
}
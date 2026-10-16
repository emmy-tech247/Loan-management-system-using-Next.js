import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================
   AUTHENTICATE ADMIN
============================================================ */

async function verifyAdmin(request: NextRequest) {
  const staffId = request.cookies.get("staff_id")?.value;
  const staffRole = request.cookies.get("staff_role")?.value;

  if (!staffId || !staffRole) {
    return {
      success: false,
      status: 401,
      message:
        "Unauthorized. Staff login session was not found. Please log in again.",
    };
  }

  const normalizedRole = staffRole.trim().toLowerCase();

  /*
   * Your staff table currently contains:
   *
   * admin
   * md
   * manager
   * accountant
   * auditor
   * relationship_officer1
   * relationship_officer2
   *
   * Therefore "admin" is the database role.
   *
   * "admin1" is also accepted here because your
   * messages table uses admin1 as a participant type.
   */
  if (!["admin", "admin1"].includes(normalizedRole)) {
    return {
      success: false,
      status: 403,
      message: "Unauthorized. Admin access is required.",
    };
  }

  const numericStaffId = Number(staffId);

  if (
    !Number.isInteger(numericStaffId) ||
    numericStaffId <= 0
  ) {
    return {
      success: false,
      status: 401,
      message: "Invalid staff login session.",
    };
  }

  /*
   * Verify that the staff account actually exists.
   */
  const [staffRows] = await db.execute(
    `
    SELECT
      staff_id,
      full_name,
      role,
      email
    FROM staff
    WHERE staff_id = ?
    LIMIT 1
    `,
    [numericStaffId]
  );

  const staff = staffRows as Array<{
    staff_id: number;
    full_name: string;
    role: string;
    email: string;
  }>;

  if (staff.length === 0) {
    return {
      success: false,
      status: 401,
      message:
        "Staff account was not found. Please log in again.",
    };
  }

  const databaseRole = String(
    staff[0].role || ""
  )
    .trim()
    .toLowerCase();

  if (databaseRole !== "admin") {
    return {
      success: false,
      status: 403,
      message:
        "The logged-in staff account does not have administrator privileges.",
    };
  }

  return {
    success: true,
    staffId: numericStaffId,
    staffName: staff[0].full_name,
    staffRole: databaseRole,
  };
}

/* ============================================================
   GET CONVERSATION
============================================================ */

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);

    if (!auth.success) {
      return NextResponse.json(
        {
          success: false,
          message: auth.message,
        },
        {
          status: auth.status,
        }
      );
    }

    const memberId =
      request.nextUrl.searchParams.get("member_id");

    if (!memberId) {
      return NextResponse.json(
        {
          success: false,
          message: "Member ID is required.",
        },
        { status: 400 }
      );
    }

    const numericMemberId = Number(memberId);

    if (
      !Number.isInteger(numericMemberId) ||
      numericMemberId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Member ID.",
        },
        { status: 400 }
      );
    }

    /* ========================================================
       FIND MEMBER
    ======================================================== */

    const [memberRows] = await db.execute(
      `
      SELECT
        member_id,
        full_name,
        email,
        phone
      FROM members
      WHERE member_id = ?
      LIMIT 1
      `,
      [numericMemberId]
    );

    const members = memberRows as Array<{
      member_id: number;
      full_name: string;
      email: string | null;
      phone: string | null;
    }>;

    if (members.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Member not found.",
        },
        { status: 404 }
      );
    }

    /* ========================================================
       MARK MEMBER MESSAGES AS READ
    ======================================================== */

    await db.execute(
      `
      UPDATE messages
      SET is_read = 1
      WHERE
        sender_id = ?
        AND sender_type = 'member'
        AND receiver_id = ?
        AND receiver_type = 'admin1'
        AND is_read = 0
      `,
      [
        numericMemberId,
        auth.staffId,
      ]
    );

    /* ========================================================
       LOAD CONVERSATION
    ======================================================== */

    const [messageRows] = await db.execute(
      `
      SELECT
        id,
        sender_id,
        receiver_id,
        sender_type,
        receiver_type,
        message,
        is_read,
        created_at
      FROM messages
      WHERE
        (
          sender_id = ?
          AND sender_type = 'member'
          AND receiver_id = ?
          AND receiver_type = 'admin1'
        )
        OR
        (
          sender_id = ?
          AND sender_type = 'admin1'
          AND receiver_id = ?
          AND receiver_type = 'member'
        )
      ORDER BY
        created_at ASC,
        id ASC
      `,
      [
        numericMemberId,
        auth.staffId,
        auth.staffId,
        numericMemberId,
      ]
    );

    const messages = (
      messageRows as Array<{
        id: number;
        sender_id: number | string;
        receiver_id: number | string;
        sender_type: string;
        receiver_type: string;
        message: string;
        is_read: number;
        created_at: string;
      }>
    ).map((row) => ({
      id: Number(row.id),
      sender_id: String(row.sender_id),
      receiver_id: String(row.receiver_id),
      sender_type: row.sender_type,
      receiver_type: row.receiver_type,
      message: row.message,
      is_read: Number(row.is_read || 0),
      created_at: row.created_at,
    }));

    return NextResponse.json(
      {
        success: true,
        message: "Conversation loaded successfully.",

        staff: {
          staff_id: String(auth.staffId),
          full_name: auth.staffName,
          role: auth.staffRole,
        },

        member: {
          member_id: String(members[0].member_id),
          full_name: members[0].full_name,
          email: members[0].email ?? null,
          phone: members[0].phone ?? null,
        },

        messages,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "ADMIN GET CHAT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load conversation.",
      },
      { status: 500 }
    );
  }
}

/* ============================================================
   SEND MESSAGE
============================================================ */

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);

    if (!auth.success) {
      return NextResponse.json(
        {
          success: false,
          message: auth.message,
        },
        {
          status: auth.status,
        }
      );
    }

    /* ========================================================
       READ REQUEST BODY
    ======================================================== */

    let body: {
      member_id?: number | string;
      message?: string;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request body.",
        },
        { status: 400 }
      );
    }

    const memberId = String(
      body.member_id ?? ""
    ).trim();

    const message = String(
      body.message ?? ""
    ).trim();

    if (!memberId) {
      return NextResponse.json(
        {
          success: false,
          message: "Member ID is required.",
        },
        { status: 400 }
      );
    }

    const numericMemberId = Number(memberId);

    if (
      !Number.isInteger(numericMemberId) ||
      numericMemberId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Member ID.",
        },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message: "Message cannot be empty.",
        },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Message cannot exceed 5000 characters.",
        },
        { status: 400 }
      );
    }

    /* ========================================================
       VERIFY MEMBER
    ======================================================== */

    const [memberRows] = await db.execute(
      `
      SELECT
        member_id,
        full_name
      FROM members
      WHERE member_id = ?
      LIMIT 1
      `,
      [numericMemberId]
    );

    const members = memberRows as Array<{
      member_id: number;
      full_name: string;
    }>;

    if (members.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Member not found.",
        },
        { status: 404 }
      );
    }

    /* ========================================================
       INSERT MESSAGE
    ======================================================== */

    const [result] = await db.execute(
      `
      INSERT INTO messages
      (
        sender_id,
        receiver_id,
        sender_type,
        receiver_type,
        message,
        is_read,
        created_at
      )
      VALUES
      (
        ?,
        ?,
        'admin1',
        'member',
        ?,
        0,
        NOW()
      )
      `,
      [
        auth.staffId,
        numericMemberId,
        message,
      ]
    );

    const insertResult = result as {
      insertId?: number;
    };

    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully.",
        message_id: insertResult.insertId ?? null,
        staff_id: auth.staffId,
        member_id: numericMemberId,
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "ADMIN SEND CHAT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send message.",
      },
      { status: 500 }
    );
  }
}
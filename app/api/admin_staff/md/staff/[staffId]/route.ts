import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

export const runtime = "nodejs";

// ============================================================
// Verify MD session
// ============================================================
async function verifyMD() {
  const cookieStore = await cookies();

  const admin2Id =
    cookieStore.get("admin2Id")?.value ||
    cookieStore.get("staff_id")?.value;

  if (!admin2Id) {
    return {
      authorized: false,
      status: 401,
      message: "Unauthorized. Please log in again.",
    };
  }

  const staffId = Number(admin2Id);

  if (!Number.isInteger(staffId) || staffId <= 0) {
    return {
      authorized: false,
      status: 401,
      message: "Invalid staff session.",
    };
  }

  const [rows] = await db.query(
    `
    SELECT
      staff_id,
      full_name,
      email,
      role
    FROM staff
    WHERE staff_id = ?
    LIMIT 1
    `,
    [staffId]
  );

  const staff = (rows as any[])[0];

  if (!staff) {
    return {
      authorized: false,
      status: 401,
      message: "Staff account not found.",
    };
  }

  if (staff.role !== "md") {
    return {
      authorized: false,
      status: 403,
      message:
        "Access denied. Only the Managing Director can delete staff.",
    };
  }

  return {
    authorized: true,
    staff,
  };
}

// ============================================================
// DELETE STAFF
// DELETE /api/admin_staff/md/staff/[staffId]
// ============================================================
export async function DELETE(
  request: Request,
  context: {
    params: Promise<{
      staffId: string;
    }>;
  }
) {
  try {
    // ----------------------------------------------------------
    // 1. Verify MD
    // ----------------------------------------------------------
    const auth = await verifyMD();

    if (!auth.authorized) {
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

    // ----------------------------------------------------------
    // 2. Get dynamic staff ID
    // ----------------------------------------------------------
    const { staffId: staffIdParam } = await context.params;

    const staffId = Number(staffIdParam);

    if (
      !Number.isInteger(staffId) ||
      staffId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid staff ID.",
        },
        { status: 400 }
      );
    }

    // ----------------------------------------------------------
    // 3. Prevent MD from deleting own account
    // ----------------------------------------------------------
    if (staffId === auth.staff.staff_id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot delete your own Managing Director account.",
        },
        { status: 400 }
      );
    }

    // ----------------------------------------------------------
    // 4. Check that staff exists
    // ----------------------------------------------------------
    const [rows] = await db.query(
      `
      SELECT
        staff_id,
        full_name,
        email,
        role
      FROM staff
      WHERE staff_id = ?
      LIMIT 1
      `,
      [staffId]
    );

    const staffToDelete = (rows as any[])[0];

    if (!staffToDelete) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff member not found.",
        },
        { status: 404 }
      );
    }

    // ----------------------------------------------------------
    // 5. Prevent deleting another MD
    // ----------------------------------------------------------
    if (staffToDelete.role === "md") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Managing Director accounts cannot be deleted from this page.",
        },
        { status: 403 }
      );
    }

    // ----------------------------------------------------------
    // 6. Delete staff
    // ----------------------------------------------------------
    await db.query(
      `
      DELETE FROM staff
      WHERE staff_id = ?
      LIMIT 1
      `,
      [staffId]
    );

    // ----------------------------------------------------------
    // 7. Return success
    // ----------------------------------------------------------
    return NextResponse.json(
      {
        success: true,
        message: "Staff member deleted successfully.",
        staff_id: staffId,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE staff error:", error);

    // ----------------------------------------------------------
    // Foreign key constraint
    // ----------------------------------------------------------
    if (
      error?.code === "ER_ROW_IS_REFERENCED_2" ||
      error?.code === "ER_ROW_IS_REFERENCED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This staff account is linked to existing records and cannot be deleted.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete staff.",
      },
      { status: 500 }
    );
  }
}
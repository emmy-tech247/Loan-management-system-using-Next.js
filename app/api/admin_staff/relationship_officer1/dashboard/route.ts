import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
|--------------------------------------------------------------------------
| GET - Relationship Officer1 Dashboard
|--------------------------------------------------------------------------
*/

export async function GET(request: NextRequest) {
  try {
    /*
    |--------------------------------------------------------------------------
    | 1. Get logged-in admin/staff ID from cookie
    |--------------------------------------------------------------------------
    */

    const staffIdCookie = request.cookies.get("staff_id")?.value;

    if (!staffIdCookie) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in again.",
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const staffId = Number(staffIdCookie);

    if (!Number.isInteger(staffId) || staffId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid staff session.",
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 2. Verify Relationship Officer1 from admin_panel
    |--------------------------------------------------------------------------
    */

    const [adminRows] = await db.query(
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
      [staffId]
    );

    const adminRowsArray = adminRows as any[];

    const admin = adminRowsArray[0];

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff account not found in admin panel.",
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 3. Verify Relationship Officer1 role
    |--------------------------------------------------------------------------
    */

    if (admin.role !== "relationship_officer1") {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. Relationship Officer1 access required.",
        },
        {
          status: 403,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 4. Load loans assigned to this Relationship Officer1
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    |
    | loan_status does NOT contain:
    |
    |   forwarded_to_relationship_officer1
    |
    | Your actual enum is:
    |
    |   submitted
    |   forwarded_to_auditor
    |   forwarded_to_manager
    |   forwarded_to_accountant
    |   disbursed
    |   rejected
    |
    | Therefore we use:
    |
    |   assigned_to = logged-in officer
    | | loan_status = submitted
    |
    |--------------------------------------------------------------------------
    */

    const [loanRows] = await db.query(
      `
      SELECT
        l.loan_id,
        l.member_id,
        COALESCE(m.full_name, 'Unknown Member') AS full_name,
        l.loan_amount,
        l.tenure_month,
        l.tenure,
        l.duration,
        l.loan_status,
        l.purpose,
        l.loan_type,
        l.facility_type,
        l.loan_category,
        l.interest_rate,
        l.assigned_to,
        l.relationship_officer,
        l.created_at,
        l.updated_at
      FROM loans l
      LEFT JOIN members m
        ON m.member_id = l.member_id
      WHERE
        l.assigned_to = ?
        AND l.loan_status = 'submitted'
      ORDER BY l.created_at DESC
      `,
      [staffId]
    );

    /*
    |--------------------------------------------------------------------------
    | 5. Return dashboard data
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        success: true,
        fullName: admin.full_name || "Relationship Officer1",
        staffId,
        role: admin.role,
        loans: loanRows,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error: any) {
    console.error(
      "GET /api/admin_staff/relationship_officer1/dashboard error:",
      error
    );

    /*
    |--------------------------------------------------------------------------
    | Return the actual database error during development
    |--------------------------------------------------------------------------
    */

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown server error.";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load Relationship Officer1 dashboard.",
        error: errorMessage,
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
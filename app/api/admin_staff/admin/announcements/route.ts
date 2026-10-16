import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ExpiryOption =
  | "1_day"
  | "1_week"
  | "1_month"
  | "1_year"
  | "custom";

// ============================================================
// Helper: Return JSON consistently
// ============================================================

function jsonResponse(
  data: Record<string, unknown>,
  status = 200
) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

// ============================================================
// Helper: Format JavaScript Date as MySQL DATE
// Your table uses expiry_date DATE, not expires_at DATETIME.
// ============================================================

function formatMySQLDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// ============================================================
// POST - Publish Announcement
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // --------------------------------------------------------
    // Read JSON body
    // --------------------------------------------------------

    let body: any;

    try {
      body = await request.json();
    } catch {
      return jsonResponse(
        {
          success: false,
          message: "Invalid JSON request body.",
        },
        400
      );
    }

    // --------------------------------------------------------
    // Get values
    // --------------------------------------------------------

    const title = String(body?.title ?? "").trim();

    const content = String(body?.content ?? "").trim();

    const expiryOption = String(
      body?.expiryOption ?? ""
    ).trim() as ExpiryOption;

    const customDate =
      body?.customDate !== null &&
      body?.customDate !== undefined
        ? String(body.customDate).trim()
        : null;

    // ========================================================
    // VALIDATION
    // ========================================================

    if (!title) {
      return jsonResponse(
        {
          success: false,
          message: "Announcement title is required.",
        },
        400
      );
    }

    if (title.length > 255) {
      return jsonResponse(
        {
          success: false,
          message:
            "Announcement title cannot exceed 255 characters.",
        },
        400
      );
    }

    if (!content) {
      return jsonResponse(
        {
          success: false,
          message: "Announcement content is required.",
        },
        400
      );
    }

    if (content.length > 100000) {
      return jsonResponse(
        {
          success: false,
          message: "Announcement content is too long.",
        },
        400
      );
    }

    const validExpiryOptions: ExpiryOption[] = [
      "1_day",
      "1_week",
      "1_month",
      "1_year",
      "custom",
    ];

    if (!validExpiryOptions.includes(expiryOption)) {
      return jsonResponse(
        {
          success: false,
          message: "Invalid announcement expiry option.",
        },
        400
      );
    }

    // ========================================================
    // CALCULATE EXPIRY DATE
    // ========================================================

    const now = new Date();

    let expiresAt: Date;

    switch (expiryOption) {
      // ------------------------------------------------------
      // 1 DAY
      // ------------------------------------------------------

      case "1_day": {
        expiresAt = new Date(now);

        expiresAt.setDate(
          expiresAt.getDate() + 1
        );

        break;
      }

      // ------------------------------------------------------
      // 1 WEEK
      // ------------------------------------------------------

      case "1_week": {
        expiresAt = new Date(now);

        expiresAt.setDate(
          expiresAt.getDate() + 7
        );

        break;
      }

      // ------------------------------------------------------
      // 1 MONTH
      // ------------------------------------------------------

      case "1_month": {
        expiresAt = new Date(now);

        expiresAt.setMonth(
          expiresAt.getMonth() + 1
        );

        break;
      }

      // ------------------------------------------------------
      // 1 YEAR
      // ------------------------------------------------------

      case "1_year": {
        expiresAt = new Date(now);

        expiresAt.setFullYear(
          expiresAt.getFullYear() + 1
        );

        break;
      }

      // ------------------------------------------------------
      // CUSTOM DATE
      // ------------------------------------------------------

      case "custom": {
        if (!customDate) {
          return jsonResponse(
            {
              success: false,
              message: "Custom expiry date is required.",
            },
            400
          );
        }

        // Must be YYYY-MM-DD
        const dateMatch =
          /^(\d{4})-(\d{2})-(\d{2})$/.exec(
            customDate
          );

        if (!dateMatch) {
          return jsonResponse(
            {
              success: false,
              message:
                "Invalid custom expiry date. Use YYYY-MM-DD.",
            },
            400
          );
        }

        const year = Number(dateMatch[1]);
        const month = Number(dateMatch[2]);
        const day = Number(dateMatch[3]);

        // ----------------------------------------------------
        // Validate ranges
        // ----------------------------------------------------

        if (
          month < 1 ||
          month > 12 ||
          day < 1 ||
          day > 31
        ) {
          return jsonResponse(
            {
              success: false,
              message: "Invalid custom expiry date.",
            },
            400
          );
        }

        // ----------------------------------------------------
        // Create local date
        // ----------------------------------------------------

        expiresAt = new Date(
          year,
          month - 1,
          day
        );

        // ----------------------------------------------------
        // Prevent JavaScript date normalization
        // ----------------------------------------------------

        if (
          expiresAt.getFullYear() !== year ||
          expiresAt.getMonth() !== month - 1 ||
          expiresAt.getDate() !== day
        ) {
          return jsonResponse(
            {
              success: false,
              message: "Invalid custom expiry date.",
            },
            400
          );
        }

        // ----------------------------------------------------
        // Do not allow past date
        // ----------------------------------------------------

        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        if (expiresAt.getTime() < today.getTime()) {
          return jsonResponse(
            {
              success: false,
              message:
                "Expiry date cannot be in the past.",
            },
            400
          );
        }

        break;
      }

      default: {
        return jsonResponse(
          {
            success: false,
            message:
              "Invalid announcement expiry option.",
          },
          400
        );
      }
    }

    // ========================================================
    // FORMAT DATE FOR MYSQL DATE COLUMN
    // ========================================================

    const mysqlExpiryDate =
      formatMySQLDate(expiresAt);

    // ========================================================
    // INSERT ANNOUNCEMENT
    //
    // IMPORTANT:
    // Your table has expiry_date, NOT expires_at.
    // ========================================================

    const [result]: any = await db.query(
      `
        INSERT INTO announcements
        (
          title,
          content,
          expiry_date
        )
        VALUES
        (?, ?, ?)
      `,
      [
        title,
        content,
        mysqlExpiryDate,
      ]
    );

    // ========================================================
    // CHECK INSERT RESULT
    // ========================================================

    if (
      !result ||
      typeof result.insertId === "undefined"
    ) {
      console.error(
        "Announcement insert returned an unexpected result:",
        result
      );

      return jsonResponse(
        {
          success: false,
          message:
            "Announcement could not be saved.",
        },
        500
      );
    }

    // ========================================================
    // SUCCESS
    // ========================================================

    return jsonResponse(
      {
        success: true,
        message:
          "Announcement published successfully!",
        announcement: {
          id: result.insertId,
          title,
          content,
          expiry_date: mysqlExpiryDate,
        },
      },
      201
    );
  } catch (error: any) {
    // ========================================================
    // DATABASE / SERVER ERROR
    // ========================================================

    console.error(
      "POST /api/admin_staff/admin/announcements error:",
      error
    );

    const errorMessage =
      error?.sqlMessage ||
      error?.message ||
      "Unknown server error.";

    return jsonResponse(
      {
        success: false,
        message:
          `Failed to publish announcement: ${errorMessage}`,
      },
      500
    );
  }
}
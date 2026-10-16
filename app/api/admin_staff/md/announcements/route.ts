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

interface AnnouncementRequest {
  title?: string;
  content?: string;
  expiry_option?: string;
  custom_date?: string;
}

export async function POST(request: NextRequest) {
  let connection;

  try {
    // ============================================================
    // 1. Read request body
    // ============================================================

    let body: AnnouncementRequest;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 2. Sanitize input
    // ============================================================

    const title = String(body.title || "").trim();
    const content = String(body.content || "").trim();
    const expiryOption = String(body.expiry_option || "").trim();
    const customDate = String(body.custom_date || "").trim();

    // ============================================================
    // 3. Validate title
    // ============================================================

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "Announcement title is required.",
        },
        { status: 400 }
      );
    }

    if (title.length > 255) {
      return NextResponse.json(
        {
          success: false,
          message: "Announcement title cannot exceed 255 characters.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 4. Validate content
    // ============================================================

    if (!content) {
      return NextResponse.json(
        {
          success: false,
          message: "Announcement content is required.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 5. Validate expiry option
    // ============================================================

    const allowedExpiryOptions: ExpiryOption[] = [
      "1_day",
      "1_week",
      "1_month",
      "1_year",
      "custom",
    ];

    if (
      !allowedExpiryOptions.includes(
        expiryOption as ExpiryOption
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid announcement expiry option.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 6. Calculate expiry date
    // ============================================================

    let expiryDate: string;

    if (expiryOption === "custom") {
      if (!customDate) {
        return NextResponse.json(
          {
            success: false,
            message: "Please select a custom expiry date.",
          },
          { status: 400 }
        );
      }

      // Expected format: YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

      if (!dateRegex.test(customDate)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid custom expiry date.",
          },
          { status: 400 }
        );
      }

      const selectedDate = new Date(
        `${customDate}T23:59:59`
      );

      if (Number.isNaN(selectedDate.getTime())) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid custom expiry date.",
          },
          { status: 400 }
        );
      }

      // Prevent past expiry dates
      const today = new Date();

      today.setHours(0, 0, 0, 0);

      const expiryCheck = new Date(
        `${customDate}T23:59:59`
      );

      if (expiryCheck < today) {
        return NextResponse.json(
          {
            success: false,
            message: "Custom expiry date cannot be in the past.",
          },
          { status: 400 }
        );
      }

      expiryDate = `${customDate} 23:59:59`;
    } else {
      // ==========================================================
      // Automatic expiry
      // ==========================================================

      const date = new Date();

      switch (expiryOption) {
        case "1_day":
          date.setDate(date.getDate() + 1);
          break;

        case "1_week":
          date.setDate(date.getDate() + 7);
          break;

        case "1_month":
          date.setMonth(date.getMonth() + 1);
          break;

        case "1_year":
          date.setFullYear(date.getFullYear() + 1);
          break;
      }

      // Store as MySQL DATETIME
      expiryDate = formatMySQLDateTime(date);
    }

    // ============================================================
    // 7. Connect to database
    // ============================================================

    connection = await db.getConnection();

    // ============================================================
    // 8. Insert announcement
    // ============================================================
    //
    // Expected table:
    //
    // announcements
    // ├── id
    // ├── title
    // ├── content
    // ├── expiry_date
    // └── created_at
    //
    // ============================================================

    const [result] = await connection.execute(
      `
        INSERT INTO announcements
        (
          title,
          content,
          expiry_date,
          created_at
        )
        VALUES (?, ?, ?, NOW())
      `,
      [title, content, expiryDate]
    );

    // ============================================================
    // 9. Get inserted ID
    // ============================================================

    const insertResult = result as {
      insertId: number;
    };

    // ============================================================
    // 10. Return success
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        message: "Announcement published successfully!",
        announcement_id: insertResult.insertId,
        expiry_date: expiryDate,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/admin_staff/md/announcements error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to publish announcement.",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// ================================================================
// Helper: JavaScript Date → MySQL DATETIME
// ================================================================

function formatMySQLDateTime(date: Date): string {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  const hours = String(
    date.getHours()
  ).padStart(2, "0");

  const minutes = String(
    date.getMinutes()
  ).padStart(2, "0");

  const seconds = String(
    date.getSeconds()
  ).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
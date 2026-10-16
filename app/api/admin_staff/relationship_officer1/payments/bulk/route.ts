import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import * as XLSX from "xlsx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PaymentRow = {
  member_id?: string | number;
  amount?: string | number;
  type?: string;
  payment_method?: string;
  reference?: string;
  payment_date?: string | number | Date;
  month?: string;
  year?: string | number;
};

export async function POST(request: NextRequest) {
  let connection: any = null;

  try {
    /* ========================================================
       1. READ UPLOADED FILE
    ======================================================== */

    const formData = await request.formData();
    const file = formData.get("csv_file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please upload a CSV or Excel file.",
        },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "The uploaded file is empty.",
        },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();

    const allowedExtensions = [".csv", ".xlsx"];

    const validExtension = allowedExtensions.some((extension) =>
      fileName.endsWith(extension)
    );

    if (!validExtension) {
      return NextResponse.json(
        {
          success: false,
          message: "Only CSV and XLSX files are allowed.",
        },
        { status: 400 }
      );
    }

    /* ========================================================
       2. CONVERT FILE TO BUFFER
    ======================================================== */

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    /* ========================================================
       3. READ WORKBOOK
    ======================================================== */

    const workbook = XLSX.read(buffer, {
      type: "buffer",
      cellDates: true,
    });

    if (!workbook.SheetNames.length) {
      return NextResponse.json(
        {
          success: false,
          message: "The uploaded file contains no worksheet.",
        },
        { status: 400 }
      );
    }

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    if (!worksheet) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to read the first worksheet.",
        },
        { status: 400 }
      );
    }

    /* ========================================================
       4. CONVERT WORKSHEET TO JSON
    ======================================================== */

    const rows = XLSX.utils.sheet_to_json<PaymentRow>(worksheet, {
      defval: "",
      raw: true,
    });

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "The uploaded file contains no payment records.",
        },
        { status: 400 }
      );
    }

    /* ========================================================
       5. LIMIT UPLOAD SIZE
    ======================================================== */

    if (rows.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A maximum of 1000 payment records can be uploaded at once.",
        },
        { status: 400 }
      );
    }

    /* ========================================================
       6. CHECK REQUIRED COLUMNS
    ======================================================== */

    const requiredColumns = [
      "member_id",
      "amount",
      "type",
      "payment_method",
      "reference",
      "payment_date",
      "month",
      "year",
    ];

    const firstRow = rows[0] as Record<string, unknown>;

    const actualColumns = Object.keys(firstRow).map((column) =>
      column.trim().toLowerCase()
    );

    const missingColumns = requiredColumns.filter(
      (column) => !actualColumns.includes(column)
    );

    if (missingColumns.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing required columns: ${missingColumns.join(", ")}`,
          requiredColumns,
          actualColumns,
        },
        { status: 400 }
      );
    }

    /* ========================================================
       7. ALLOWED VALUES
    ======================================================== */

    const allowedTypes = [
      "loan_repayment",
      "monthly_contribution",
    ];

    const allowedMethods = [
      "cash",
      "bank_transfer",
      "pos",
    ];

    /* ========================================================
       8. DATABASE CONNECTION
    ======================================================== */

    connection = await db.getConnection();

    await connection.beginTransaction();

    let successful = 0;

    const errors: string[] = [];

    /* ========================================================
       9. PROCESS EACH PAYMENT
    ======================================================== */

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];

      // Excel/CSV header starts at row 1
      const rowNumber = index + 2;

      try {
        /* ====================================================
           BASIC VALUES
        ==================================================== */

        const memberId = Number(row.member_id);
        const amount = Number(row.amount);

        const type = String(row.type ?? "")
          .trim()
          .toLowerCase();

        const paymentMethod = String(row.payment_method ?? "")
          .trim()
          .toLowerCase();

        const reference = String(row.reference ?? "").trim();

        const month = String(row.month ?? "").trim();

        const year = Number(row.year);

        /* ====================================================
           VALIDATE MEMBER ID
        ==================================================== */

        if (!Number.isInteger(memberId) || memberId <= 0) {
          throw new Error("Invalid member_id.");
        }

        /* ====================================================
           VALIDATE AMOUNT
        ==================================================== */

        if (!Number.isFinite(amount) || amount <= 0) {
          throw new Error("Amount must be greater than zero.");
        }

        /* ====================================================
           VALIDATE PAYMENT TYPE
        ==================================================== */

        if (!allowedTypes.includes(type)) {
          throw new Error(
            `Invalid payment type "${type}". Allowed values: ${allowedTypes.join(
              ", "
            )}.`
          );
        }

        /* ====================================================
           VALIDATE PAYMENT METHOD
        ==================================================== */

        if (!allowedMethods.includes(paymentMethod)) {
          throw new Error(
            `Invalid payment method "${paymentMethod}". Allowed values: ${allowedMethods.join(
              ", "
            )}.`
          );
        }

        /* ====================================================
           VALIDATE REFERENCE
        ==================================================== */

        if (!reference) {
          throw new Error("Payment reference is required.");
        }

        /* ====================================================
           VALIDATE MONTH
        ==================================================== */

        if (!month) {
          throw new Error("Payment month is required.");
        }

        /* ====================================================
           VALIDATE YEAR
        ==================================================== */

        if (
          !Number.isInteger(year) ||
          year < 2020 ||
          year > 2100
        ) {
          throw new Error("Invalid year.");
        }

        /* ====================================================
           CONVERT PAYMENT DATE
        ==================================================== */

        let paymentDate = "";

        if (row.payment_date instanceof Date) {
          const date = row.payment_date;

          if (Number.isNaN(date.getTime())) {
            throw new Error("Invalid payment date.");
          }

          const dateYear = date.getFullYear();

          const dateMonth = String(
            date.getMonth() + 1
          ).padStart(2, "0");

          const dateDay = String(
            date.getDate()
          ).padStart(2, "0");

          paymentDate = `${dateYear}-${dateMonth}-${dateDay}`;
        } else {
          paymentDate = String(
            row.payment_date ?? ""
          ).trim();

          /* ==================================================
             EXCEL SERIAL DATE
          ================================================== */

          if (
            paymentDate &&
            /^\d+(\.\d+)?$/.test(paymentDate)
          ) {
            const serialNumber = Number(paymentDate);

            const excelDate =
              XLSX.SSF.parse_date_code(serialNumber);

            if (excelDate) {
              paymentDate =
                `${excelDate.y}-${String(excelDate.m).padStart(
                  2,
                  "0"
                )}-${String(excelDate.d).padStart(2, "0")}`;
            }
          }

          /* ==================================================
             CONVERT DD/MM/YYYY
          ================================================== */

          if (
            /^\d{2}\/\d{2}\/\d{4}$/.test(paymentDate)
          ) {
            const [day, monthValue, yearValue] =
              paymentDate.split("/");

            paymentDate =
              `${yearValue}-${monthValue}-${day}`;
          }

          /* ==================================================
             CONVERT DD-MM-YYYY
          ================================================== */

          if (
            /^\d{2}-\d{2}-\d{4}$/.test(paymentDate)
          ) {
            const [day, monthValue, yearValue] =
              paymentDate.split("-");

            paymentDate =
              `${yearValue}-${monthValue}-${day}`;
          }
        }

        /* ====================================================
           VALIDATE FINAL DATE
        ==================================================== */

        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(paymentDate)
        ) {
          throw new Error(
            "Invalid payment date. Use YYYY-MM-DD."
          );
        }

        const parsedDate = new Date(
          `${paymentDate}T00:00:00`
        );

        if (Number.isNaN(parsedDate.getTime())) {
          throw new Error("Invalid payment date.");
        }

        /* ====================================================
           CHECK MEMBER EXISTS
        ==================================================== */

        const [memberRows] =
          await connection.query(
            `
            SELECT member_id
            FROM members
            WHERE member_id = ?
            LIMIT 1
            `,
            [memberId]
          );

        if (
          !Array.isArray(memberRows) ||
          memberRows.length === 0
        ) {
          throw new Error(
            `Member ID ${memberId} does not exist.`
          );
        }

        /* ====================================================
           CHECK DUPLICATE REFERENCE
        ==================================================== */

        const [existingRows] =
          await connection.query(
            `
            SELECT transaction_id
            FROM transactions
            WHERE reference = ?
            LIMIT 1
            `,
            [reference]
          );

        if (
          Array.isArray(existingRows) &&
          existingRows.length > 0
        ) {
          throw new Error(
            `Reference "${reference}" already exists.`
          );
        }

        /* ====================================================
           INSERT PAYMENT
        ==================================================== */

        await connection.query(
          `
          INSERT INTO transactions (
            member_id,
            type,
            amount,
            payment_method,
            reference,
            month,
            year,
            payment_date,
            status
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            memberId,
            type,
            amount,
            paymentMethod,
            reference,
            month,
            year,
            paymentDate,
            "pending_accountant",
          ]
        );

        successful++;
      } catch (rowError) {
        const message =
          rowError instanceof Error
            ? rowError.message
            : "Invalid payment record.";

        errors.push(
          `Row ${rowNumber}: ${message}`
        );
      }
    }

    /* ========================================================
       10. ROLLBACK IF ANY ROW FAILED
    ======================================================== */

    if (errors.length > 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Bulk upload failed. No payment transactions were saved.",
          successful: 0,
          failed: errors.length,
          errors,
        },
        { status: 400 }
      );
    }

    /* ========================================================
       11. COMMIT
    ======================================================== */

    await connection.commit();

    /* ========================================================
       12. SUCCESS RESPONSE
    ======================================================== */

    return NextResponse.json(
      {
        success: true,
        message: `${successful} payment transaction${
          successful === 1 ? "" : "s"
        } uploaded successfully and forwarded to the Accountant.`,
        successful,
        failed: 0,
        errors: [],
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    /* ========================================================
       GLOBAL ROLLBACK
    ======================================================== */

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Rollback error:",
          rollbackError
        );
      }
    }

    console.error(
      "POST /api/admin_staff/relationship-officer1/payments/bulk error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to process the bulk payment file.",
        error:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  } finally {
    /* ========================================================
       RELEASE CONNECTION
    ======================================================== */

    if (connection) {
      connection.release();
    }
  }
}
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import * as XLSX from "xlsx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================
   TYPES
============================================================ */

type BulkPaymentRow = {
  member_id: string | number;
  amount: string | number;
  type: string;
  payment_method: string;
  reference: string;
  payment_date: string;
  month: string;
  year: string | number;
};

/* ============================================================
   POST BULK PAYMENTS
============================================================ */

export async function POST(request: NextRequest) {
  const connection = await db.getConnection();

  try {
    /*
     * ----------------------------------------------------------
     * 1. CHECK STAFF SESSION
     * ----------------------------------------------------------
     */

    const staffIdCookie =
      request.cookies.get("staff_id")?.value;

    if (!staffIdCookie) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 }
      );
    }

    const staffId = Number(staffIdCookie);

    if (!Number.isInteger(staffId) || staffId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid staff session.",
        },
        { status: 401 }
      );
    }

    /*
     * ----------------------------------------------------------
     * 2. VERIFY STAFF
     * ----------------------------------------------------------
     */

    const [staffRows] = await connection.query(
      `
      SELECT
        staff_id,
        full_name,
        role
      FROM staff
      WHERE staff_id = ?
      LIMIT 1
      `,
      [staffId]
    );

    const staff = (staffRows as any[])[0];

    if (!staff) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff account not found.",
        },
        { status: 401 }
      );
    }

    if (
      String(staff.role).toLowerCase() !==
      "relationship_officer2"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Access denied. Relationship Officer 2 access required.",
        },
        { status: 403 }
      );
    }

    /*
     * ----------------------------------------------------------
     * 3. GET UPLOADED FILE
     * ----------------------------------------------------------
     */

    const formData = await request.formData();

    const file = formData.get("csv_file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please upload a CSV or Excel file.",
        },
        { status: 400 }
      );
    }

    /*
     * ----------------------------------------------------------
     * 4. CHECK FILE TYPE
     * ----------------------------------------------------------
     */

    const fileName = file.name.toLowerCase();

    const isCSV = fileName.endsWith(".csv");
    const isExcel =
      fileName.endsWith(".xlsx") ||
      fileName.endsWith(".xls");

    if (!isCSV && !isExcel) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only CSV or Excel (.xlsx/.xls) files are allowed.",
        },
        { status: 400 }
      );
    }

    /*
     * ----------------------------------------------------------
     * 5. CHECK FILE SIZE
     * ----------------------------------------------------------
     */

    const maxFileSize = 10 * 1024 * 1024;

    if (file.size > maxFileSize) {
      return NextResponse.json(
        {
          success: false,
          message:
            "File is too large. Maximum size is 10MB.",
        },
        { status: 400 }
      );
    }

    /*
     * ----------------------------------------------------------
     * 6. READ FILE
     * ----------------------------------------------------------
     */

    const buffer = Buffer.from(
      await file.arrayBuffer()
    );

    const workbook = XLSX.read(buffer, {
      type: "buffer",
      cellDates: true,
    });

    const firstSheetName =
      workbook.SheetNames[0];

    if (!firstSheetName) {
      return NextResponse.json(
        {
          success: false,
          message: "The uploaded file is empty.",
        },
        { status: 400 }
      );
    }

    const worksheet =
      workbook.Sheets[firstSheetName];

    const rows =
      XLSX.utils.sheet_to_json<BulkPaymentRow>(
        worksheet,
        {
          defval: "",
          raw: false,
        }
      );

    /*
     * ----------------------------------------------------------
     * 7. CHECK ROW COUNT
     * ----------------------------------------------------------
     */

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No payment records were found in the file.",
        },
        { status: 400 }
      );
    }

    if (rows.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Maximum 1,000 payment records are allowed per upload.",
        },
        { status: 400 }
      );
    }

    /*
     * ----------------------------------------------------------
     * 8. REQUIRED COLUMNS
     * ----------------------------------------------------------
     */

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

    const firstRow = rows[0] as any;

    const missingColumns =
      requiredColumns.filter(
        (column) =>
          !Object.prototype.hasOwnProperty.call(
            firstRow,
            column
          )
      );

    if (missingColumns.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing required columns: ${missingColumns.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    /*
     * ----------------------------------------------------------
     * 9. VALID VALUES
     * ----------------------------------------------------------
     */

    const allowedTypes = [
      "loan_repayment",
      "monthly_contribution",
    ];

    const allowedPaymentMethods = [
      "cash",
      "bank_transfer",
      "pos",
    ];

    /*
     * ----------------------------------------------------------
     * 10. VALIDATE ALL ROWS FIRST
     * ----------------------------------------------------------
     */

    const errors: string[] = [];

    const cleanRows: any[] = [];

    const references = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] as any;

      const excelRowNumber = i + 2;

      const memberId = Number(
        String(row.member_id).trim()
      );

      const amount = Number(
        String(row.amount)
          .replace(/,/g, "")
          .trim()
      );

      const type = String(
        row.type || ""
      ).trim();

      const paymentMethod = String(
        row.payment_method || ""
      ).trim();

      const reference = String(
        row.reference || ""
      ).trim();

      const paymentDate = String(
        row.payment_date || ""
      ).trim();

      const month = String(
        row.month || ""
      ).trim();

      const year = Number(
        String(row.year).trim()
      );

      /*
       * Member ID
       */

      if (
        !Number.isInteger(memberId) ||
        memberId <= 0
      ) {
        errors.push(
          `Row ${excelRowNumber}: Invalid member_id.`
        );
      }

      /*
       * Amount
       */

      if (!Number.isFinite(amount) || amount <= 0) {
        errors.push(
          `Row ${excelRowNumber}: Amount must be greater than zero.`
        );
      }

      /*
       * Type
       */

      if (!allowedTypes.includes(type)) {
        errors.push(
          `Row ${excelRowNumber}: Invalid payment type "${type}".`
        );
      }

      /*
       * Payment method
       */

      if (
        !allowedPaymentMethods.includes(
          paymentMethod
        )
      ) {
        errors.push(
          `Row ${excelRowNumber}: Invalid payment method "${paymentMethod}".`
        );
      }

      /*
       * Reference
       */

      if (!reference) {
        errors.push(
          `Row ${excelRowNumber}: Payment reference is required.`
        );
      }

      if (references.has(reference)) {
        errors.push(
          `Row ${excelRowNumber}: Duplicate reference "${reference}" exists in this file.`
        );
      }

      references.add(reference);

      /*
       * Payment date
       */

      if (!paymentDate) {
        errors.push(
          `Row ${excelRowNumber}: Payment date is required.`
        );
      }

      /*
       * Month
       */

      if (!month) {
        errors.push(
          `Row ${excelRowNumber}: Month is required.`
        );
      }

      /*
       * Year
       */

      if (
        !Number.isInteger(year) ||
        year < 2020 ||
        year > 2100
      ) {
        errors.push(
          `Row ${excelRowNumber}: Invalid year.`
        );
      }

      cleanRows.push({
        memberId,
        amount,
        type,
        paymentMethod,
        reference,
        paymentDate,
        month,
        year,
        excelRowNumber,
      });
    }

    /*
     * ----------------------------------------------------------
     * STOP IF VALIDATION ERRORS EXIST
     * ----------------------------------------------------------
     */

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The uploaded file contains validation errors.",
          errors: errors.slice(0, 100),
        },
        { status: 400 }
      );
    }

    /*
     * ----------------------------------------------------------
     * 11. START TRANSACTION
     * ----------------------------------------------------------
     */

    await connection.beginTransaction();

    /*
     * ----------------------------------------------------------
     * 12. VERIFY ALL MEMBERS
     * ----------------------------------------------------------
     */

    const memberIds = [
      ...new Set(
        cleanRows.map(
          (row) => row.memberId
        )
      ),
    ];

    const placeholders = memberIds
      .map(() => "?")
      .join(",");

    const [memberRows] =
      await connection.query(
        `
        SELECT
          member_id,
          full_name
        FROM members
        WHERE member_id IN (${placeholders})
        `,
        memberIds
      );

    const existingMembers = new Map<
      number,
      string
    >();

    for (const memberRow of memberRows as any[]) {
      existingMembers.set(
        Number(memberRow.member_id),
        memberRow.full_name || ""
      );
    }

    const missingMembers =
      cleanRows.filter(
        (row) =>
          !existingMembers.has(
            row.memberId
          )
      );

    if (missingMembers.length > 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "One or more member IDs do not exist.",
          errors: missingMembers
            .slice(0, 100)
            .map(
              (row) =>
                `Row ${row.excelRowNumber}: Member ID ${row.memberId} does not exist.`
            ),
        },
        { status: 400 }
      );
    }

    /*
     * ----------------------------------------------------------
     * 13. CHECK EXISTING REFERENCES
     * ----------------------------------------------------------
     */

    const referenceList = cleanRows.map(
      (row) => row.reference
    );

    const referencePlaceholders =
      referenceList
        .map(() => "?")
        .join(",");

    const [existingReferences] =
      await connection.query(
        `
        SELECT reference
        FROM transactions
        WHERE reference IN (${referencePlaceholders})
        `,
        referenceList
      );

    if (
      (existingReferences as any[]).length >
      0
    ) {
      await connection.rollback();

      const duplicates = (
        existingReferences as any[]
      ).map(
        (row) => row.reference
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Some payment references already exist.",
          duplicate_references:
            duplicates,
        },
        { status: 409 }
      );
    }

    /*
     * ----------------------------------------------------------
     * 14. INSERT ALL PAYMENTS
     * ----------------------------------------------------------
     */

    let insertedCount = 0;

    for (const row of cleanRows) {
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
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending_accountant')
        `,
        [
          row.memberId,
          row.type,
          row.amount,
          row.paymentMethod,
          row.reference,
          row.month,
          row.year,
          row.paymentDate,
        ]
      );

      insertedCount++;
    }

    /*
     * ----------------------------------------------------------
     * 15. COMMIT
     * ----------------------------------------------------------
     */

    await connection.commit();

    /*
     * ----------------------------------------------------------
     * 16. SUCCESS
     * ----------------------------------------------------------
     */

    return NextResponse.json(
      {
        success: true,
        message: `${insertedCount} payment transaction${
          insertedCount === 1 ? "" : "s"
        } uploaded successfully and forwarded to the Accountant.`,
        inserted: insertedCount,
        status: "pending_accountant",
      },
      { status: 201 }
    );
  } catch (error: any) {
    try {
      await connection.rollback();
    } catch {}

    console.error(
      "POST /api/admin_staff/relationship-officer2/payments/bulk error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to process the bulk payment file.",
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
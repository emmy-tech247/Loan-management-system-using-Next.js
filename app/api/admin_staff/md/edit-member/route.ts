import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "pdf",
];

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
];

const EDITABLE_FIELDS = [
  "full_name",
  "nin",

  "state_of_origin",
  "lga_of_origin",

  "permanent_address",
  "residential_address",

  "phone_number",
  "email",

  "bank_name",
  "account_number",
  "account_name",
  "account_type",

  "place_of_work",
  "type_of_business_work",

  "monthly_earning",
  "annual_income",

  "expected_monthly_contribution_amount",

  "fixed_deposit_amount",
  "fixed_deposit_years",

  "contribution_start_date",

  "full_name_of_next_of_kin",
  "address_of_next_of_kin",
  "phone_number_of_next_of_kin",
  "relationship_with_next_of_kin",
] as const;

type FileField =
  | "passport"
  | "id_document"
  | "payment_receipt";

const FILE_FIELDS: FileField[] = [
  "passport",
  "id_document",
  "payment_receipt",
];

/* =========================================================
   FILE HELPERS
========================================================= */

function getExtension(filename: string): string {
  return (
    filename
      .split(".")
      .pop()
      ?.toLowerCase() || ""
  );
}

function isValidFile(file: File) {
  const extension = getExtension(file.name);

  const validExtension =
    ALLOWED_EXTENSIONS.includes(extension);

  const validMime =
    !file.type ||
    ALLOWED_MIME_TYPES.includes(file.type);

  if (!validExtension) {
    return {
      valid: false,
      message:
        "Invalid file type. Only JPG, JPEG, PNG and PDF files are allowed.",
    };
  }

  if (!validMime) {
    return {
      valid: false,
      message:
        "Invalid file format. Only JPG, JPEG, PNG and PDF files are allowed.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      message:
        "File size must not exceed 5MB.",
    };
  }

  return {
    valid: true,
    message: "",
  };
}

function cleanValue(
  value: FormDataEntryValue | null
) {
  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed === "" ? null : trimmed;
}

/* =========================================================
   UPLOAD DIRECTORY
========================================================= */

function getUploadDirectory() {
  return path.join(
    process.cwd(),
    "public",
    "uploads"
  );
}

/* =========================================================
   SAFE UPLOAD PATH
========================================================= */

function isSafeUploadPath(
  filePath: string
): boolean {
  const uploadDirectory = path.resolve(
    getUploadDirectory()
  );

  const cleanedPath = filePath
    .replace(/^\/+/, "")
    .replace(/\\/g, "/");

  const resolvedPath = path.resolve(
    process.cwd(),
    "public",
    cleanedPath
  );

  return (
    resolvedPath === uploadDirectory ||
    resolvedPath.startsWith(
      `${uploadDirectory}${path.sep}`
    )
  );
}

/* =========================================================
   NORMALIZE DATABASE FILE PATH
========================================================= */

function normalizeFilePath(
  filePath: string | null | undefined
): string | null {
  if (!filePath) {
    return null;
  }

  let normalized = String(filePath)
    .trim()
    .replace(/\\/g, "/");

  if (!normalized) {
    return null;
  }

  /*
   * If the database contains:
   *
   * uploads/file.jpg
   *
   * return:
   *
   * /uploads/file.jpg
   */

  if (
    normalized.startsWith(
      "http://"
    ) ||
    normalized.startsWith(
      "https://"
    )
  ) {
    return normalized;
  }

  normalized = normalized.replace(
    /^\/+/,
    ""
  );

  if (
    normalized.startsWith(
      "public/uploads/"
    )
  ) {
    normalized =
      normalized.substring(
        "public/".length
      );
  }

  if (
    normalized.startsWith(
      "uploads/"
    )
  ) {
    return `/${normalized}`;
  }

  /*
   * If an old record contains only:
   *
   * passport-123.jpg
   *
   * assume it is inside public/uploads.
   */

  return `/uploads/${normalized}`;
}

/* =========================================================
   DELETE OLD FILE
========================================================= */

async function deleteOldFile(
  filePath: string | null | undefined
) {
  if (!filePath) {
    return;
  }

  let normalized = String(filePath)
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

  /*
   * Ignore external URLs.
   */
  if (
    normalized.startsWith(
      "http://"
    ) ||
    normalized.startsWith(
      "https://"
    )
  ) {
    return;
  }

  /*
   * Convert:
   *
   * public/uploads/file.jpg
   *
   * to:
   *
   * uploads/file.jpg
   */
  if (
    normalized.startsWith(
      "public/uploads/"
    )
  ) {
    normalized =
      normalized.substring(
        "public/".length
      );
  }

  /*
   * Only delete files from uploads.
   */
  if (
    !normalized.startsWith(
      "uploads/"
    )
  ) {
    return;
  }

  if (
    !isSafeUploadPath(normalized)
  ) {
    console.warn(
      "Blocked unsafe file deletion:",
      filePath
    );

    return;
  }

  const absolutePath =
    path.resolve(
      process.cwd(),
      "public",
      normalized
    );

  try {
    await fs.unlink(
      absolutePath
    );

    console.log(
      "Old file deleted:",
      absolutePath
    );
  } catch (error: any) {
    if (
      error?.code !== "ENOENT"
    ) {
      console.warn(
        "Unable to delete old file:",
        absolutePath,
        error
      );
    }
  }
}

/* =========================================================
   SAVE NEW FILE
========================================================= */

async function saveUploadedFile(
  file: File,
  fieldName: FileField
) {
  const validation =
    isValidFile(file);

  if (!validation.valid) {
    throw new Error(
      `${fieldName}: ${validation.message}`
    );
  }

  const extension =
    getExtension(file.name);

  const uploadDirectory =
    getUploadDirectory();

  await fs.mkdir(
    uploadDirectory,
    {
      recursive: true,
    }
  );

  const randomName =
    crypto
      .randomBytes(16)
      .toString("hex");

  const fileName =
    `${fieldName}-${Date.now()}-${randomName}.${extension}`;

  const absolutePath =
    path.join(
      uploadDirectory,
      fileName
    );

  const buffer =
    Buffer.from(
      await file.arrayBuffer()
    );

  await fs.writeFile(
    absolutePath,
    buffer
  );

  /*
   * IMPORTANT:
   *
   * This is the value stored in MySQL.
   */
  const databasePath =
    `uploads/${fileName}`;

  console.log(
    `Saved ${fieldName}:`,
    databasePath
  );

  return {
    databasePath,
    absolutePath,
  };
}

/* =========================================================
   CHECK WHETHER FORM ENTRY IS A FILE
========================================================= */

function isFileEntry(
  value: FormDataEntryValue | null
): value is File {
  return (
    value !== null &&
    typeof value !== "string" &&
    typeof value.arrayBuffer ===
      "function"
  );
}

/* =========================================================
   GET MEMBER
========================================================= */

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const memberIdParam =
      searchParams.get(
        "member_id"
      );

    if (!memberIdParam) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Member ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const memberId =
      Number(
        memberIdParam
      );

    if (
      !Number.isInteger(
        memberId
      ) ||
      memberId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid member ID.",
        },
        {
          status: 400,
        }
      );
    }

    const [rows] =
      await db.query(
        `
          SELECT *
          FROM members
          WHERE member_id = ?
          LIMIT 1
        `,
        [memberId]
      );

    const members =
      rows as any[];

    if (
      !members.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Member not found.",
        },
        {
          status: 404,
        }
      );
    }

    const member =
      members[0];

    /*
     * Convert database file paths
     * to browser-accessible paths.
     */
    member.passport =
      normalizeFilePath(
        member.passport
      );

    member.id_document =
      normalizeFilePath(
        member.id_document
      );

    member.payment_receipt =
      normalizeFilePath(
        member.payment_receipt
      );

    return NextResponse.json({
      success: true,
      member,
    });
  } catch (error) {
    console.error(
      "GET /api/admin_staff/md/edit-member error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while loading the member.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   UPDATE MEMBER
========================================================= */

export async function PUT(
  request: NextRequest
) {
  const newlyCreatedFiles: string[] =
    [];

  try {
    const formData =
      await request.formData();

    const memberIdValue =
      formData.get(
        "member_id"
      );

    if (
      !memberIdValue ||
      typeof memberIdValue !==
        "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Member ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const memberId =
      Number(
        memberIdValue.trim()
      );

    if (
      !Number.isInteger(
        memberId
      ) ||
      memberId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid member ID.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Get existing member.
     */
    const [existingRows] =
      await db.query(
        `
          SELECT *
          FROM members
          WHERE member_id = ?
          LIMIT 1
        `,
        [memberId]
      );

    const existingMembers =
      existingRows as any[];

    if (
      !existingMembers.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Member not found.",
        },
        {
          status: 404,
        }
      );
    }

    const existingMember =
      existingMembers[0];

    /*
     * Collect editable fields.
     */
    const values: Record<
      string,
      string | null
    > = {};

    for (
      const field of EDITABLE_FIELDS
    ) {
      values[field] =
        cleanValue(
          formData.get(field)
        );
    }

    /* =====================================================
       EMAIL VALIDATION
    ===================================================== */

    if (values.email) {
      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailPattern.test(
          values.email
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Please enter a valid email address.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /* =====================================================
       NUMERIC VALIDATION
    ===================================================== */

    const numericFields = [
      "monthly_earning",
      "annual_income",
      "expected_monthly_contribution_amount",
      "fixed_deposit_amount",
      "fixed_deposit_years",
    ];

    for (
      const field of numericFields
    ) {
      const value =
        values[field];

      if (
        value !== null &&
        value !== "" &&
        Number.isNaN(
          Number(value)
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              `${field.replace(
                /_/g,
                " "
              )} must be a valid number.`,
          },
          {
            status: 400,
          }
        );
      }
    }

    /* =====================================================
       CONTRIBUTION DATE
    ===================================================== */

    if (
      values.contribution_start_date
    ) {
      const date =
        new Date(
          values.contribution_start_date
        );

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Contribution Start Date is invalid.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /* =====================================================
       PASSWORD
    ===================================================== */

    const newPasswordValue =
      formData.get(
        "new_password"
      );

    let newPasswordHash:
      | string
      | null = null;

    if (
      newPasswordValue &&
      typeof newPasswordValue ===
        "string" &&
      newPasswordValue.trim()
    ) {
      const newPassword =
        newPasswordValue.trim();

      if (
        newPassword.length < 6
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "New password must contain at least 6 characters.",
          },
          {
            status: 400,
          }
        );
      }

      newPasswordHash =
        await bcrypt.hash(
          newPassword,
          12
        );
    }

    /* =====================================================
       FILE UPLOADS
    ===================================================== */

    const newFilePaths: Partial<
      Record<
        FileField,
        string
      >
    > = {};

    for (
      const field of FILE_FIELDS
    ) {
      const entry =
        formData.get(
          field
        );

      if (
        !isFileEntry(entry)
      ) {
        continue;
      }

      /*
       * Ignore empty browser file inputs.
       */
      if (
        entry.size === 0 ||
        !entry.name
      ) {
        continue;
      }

      const savedFile =
        await saveUploadedFile(
          entry,
          field
        );

      newlyCreatedFiles.push(
        savedFile.absolutePath
      );

      newFilePaths[field] =
        savedFile.databasePath;
    }

    /* =====================================================
       BUILD UPDATE QUERY
    ===================================================== */

    const updateFields: string[] =
      [];

    const updateValues: any[] =
      [];

    /*
     * Normal member fields.
     */
    for (
      const field of EDITABLE_FIELDS
    ) {
      updateFields.push(
        `\`${field}\` = ?`
      );

      updateValues.push(
        values[field]
      );
    }

    /*
     * Documents.
     *
     * Only replace a document if
     * a new file was uploaded.
     */
    for (
      const field of FILE_FIELDS
    ) {
      if (
        newFilePaths[field]
      ) {
        updateFields.push(
          `\`${field}\` = ?`
        );

        updateValues.push(
          newFilePaths[field]
        );
      }
    }

    /*
     * Password.
     */
    if (
      newPasswordHash
    ) {
      updateFields.push(
        "`password_hash` = ?"
      );

      updateValues.push(
        newPasswordHash
      );
    }

    if (
      !updateFields.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No information was supplied for update.",
        },
        {
          status: 400,
        }
      );
    }

    updateValues.push(
      memberId
    );

    /* =====================================================
       DATABASE UPDATE
    ===================================================== */

    await db.query(
      `
        UPDATE members
        SET ${updateFields.join(
          ", "
        )}
        WHERE member_id = ?
      `,
      updateValues
    );

    /* =====================================================
       DELETE OLD DOCUMENTS
       ONLY AFTER DATABASE SUCCESS
    ===================================================== */

    for (
      const field of FILE_FIELDS
    ) {
      if (
        !newFilePaths[field]
      ) {
        continue;
      }

      const oldPath =
        existingMember[field];

      if (
        oldPath &&
        oldPath !==
          newFilePaths[field]
      ) {
        await deleteOldFile(
          oldPath
        );
      }
    }

    /* =====================================================
       GET UPDATED MEMBER
    ===================================================== */

    const [updatedRows] =
      await db.query(
        `
          SELECT *
          FROM members
          WHERE member_id = ?
          LIMIT 1
        `,
        [memberId]
      );

    const updatedMembers =
      updatedRows as any[];

    if (
      !updatedMembers.length
    ) {
      throw new Error(
        "Member was updated but could not be retrieved."
      );
    }

    const updatedMember =
      updatedMembers[0];

    /*
     * Convert database paths
     * into browser paths.
     */
    updatedMember.passport =
      normalizeFilePath(
        updatedMember.passport
      );

    updatedMember.id_document =
      normalizeFilePath(
        updatedMember.id_document
      );

    updatedMember.payment_receipt =
      normalizeFilePath(
        updatedMember.payment_receipt
      );

    return NextResponse.json({
      success: true,
      message:
        "Member information updated successfully.",
      member:
        updatedMember,
    });
  } catch (error) {
    console.error(
      "PUT /api/admin_staff/md/edit-member error:",
      error
    );

    /*
     * Delete newly uploaded files
     * if the database update failed.
     */
    for (
      const filePath of
        newlyCreatedFiles
    ) {
      try {
        await fs.unlink(
          filePath
        );
      } catch {
        // Ignore cleanup errors.
      }
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while updating the member.",
      },
      {
        status: 500,
      }
    );
  }
}


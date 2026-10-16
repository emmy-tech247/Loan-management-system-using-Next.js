import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

/*==============================================================
Allowed File Types
==============================================================*/

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_SIZE = 5 * 1024 * 1024;

/*==============================================================
Validate Upload
==============================================================*/

export function validateFile(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Unsupported file type.");
  }

  if (file.size > MAX_SIZE) {
    throw new Error("File exceeds 5MB.");
  }
}

/*==============================================================
Upload File
==============================================================*/

export async function uploadFile(
  file: File,
  folder: string
): Promise<string> {

  validateFile(file);

  const bytes = await file.arrayBuffer();

  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);

  await fs.mkdir(uploadDir, { recursive: true });

  const extension = file.name.split(".").pop();

  const filename =
    `${Date.now()}-${randomUUID()}.${extension}`;

  const filepath = path.join(uploadDir, filename);

  await fs.writeFile(filepath, buffer);

  return `/uploads/${folder}/${filename}`;
}

/*==============================================================
Delete File
==============================================================*/

export async function deleteFile(filePath: string) {

  try {

    const fullPath = path.join(
      process.cwd(),
      "public",
      filePath
    );

    await fs.unlink(fullPath);

  } catch {

    // ignore

  }

}

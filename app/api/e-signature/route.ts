import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const purpose = formData.get("purpose")?.toString().trim();
    const signatureData = formData.get("signature_data")?.toString();
    const signatureFile = formData.get("signature_file");

    if (!purpose) {
      return NextResponse.json(
        {
          message: "Purpose is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!signatureData && !signatureFile) {
      return NextResponse.json(
        {
          message: "Signature is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * IMPORTANT:
     * Get the logged-in member ID from your actual
     * authentication/session system here.
     *
     * Do NOT accept member_id directly from the browser.
     */

    // Example:
    // const memberId = session.member_id;

    return NextResponse.json({
      success: true,
      message: "Signature received successfully.",
    });
  } catch (error) {
    console.error("Save signature error:", error);

    return NextResponse.json(
      {
        message: "Unable to save signature.",
      },
      {
        status: 500,
      }
    );
  }
}
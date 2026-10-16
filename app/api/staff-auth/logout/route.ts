import { NextRequest, NextResponse } from "next/server";
import { clearStaffCookies } from "@/lib/staff-auth";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest
) {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });

  clearStaffCookies(response);

  return response;
}

export async function GET(
  request: NextRequest
) {
  const response =
    NextResponse.redirect(
      new URL(
        "/staff_login/login",
        request.url
      )
    );

  clearStaffCookies(response);

  return response;
}
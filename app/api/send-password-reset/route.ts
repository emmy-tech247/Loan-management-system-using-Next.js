// app/api/send-password-reset/route.ts

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = formData.get("email");

  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  // TODO: Generate a reset token
  // TODO: Save the token
  // TODO: Send the password-reset email

  return NextResponse.json({
    message: "If that email exists, a password reset link has been sent.",
  });
}
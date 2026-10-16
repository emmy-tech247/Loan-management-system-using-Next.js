import { NextResponse } from "next/server";
import { AccountantPaymentApiResponse } from "@/types/accountantPayment";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberId, amount, paymentType, reference } = body;

    if (!memberId || !amount || !paymentType || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "❌ Invalid payment details provided." },
        { status: 400 }
      );
    }

    // ----------------------------------------------------
    // Production SQL Query Reference:
    // INSERT INTO payments (member_id, amount, payment_type, reference, created_at)
    // VALUES (?, ?, ?, ?, NOW());
    // ----------------------------------------------------

    const response: AccountantPaymentApiResponse = {
      success: true,
      message: "✅ Payment and monthly contribution recorded successfully.",
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { success: false, message: "❌ Failed to record payment." },
      { status: 500 }
    );
  }
}

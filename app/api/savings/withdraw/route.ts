import { NextResponse } from "next/server";

async function getAuthSession() {
  return { memberId: 101 };
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.memberId) {
      return NextResponse.json(
        { message: "Unauthorized: Please log in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, reason } = body;

    const parsedAmount = parseFloat(amount);
    const trimmedReason = typeof reason === "string" ? reason.trim() : "";

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { message: "Please enter a valid withdrawal amount." },
        { status: 400 }
      );
    }

    if (!trimmedReason) {
      return NextResponse.json(
        { message: "Please state a reason for this withdrawal." },
        { status: 400 }
      );
    }

    // 1. Fetch current available balance in server logic to double-check
    /*
    const [balanceRows] = await db.execute(
      `SELECT 
        (SELECT IFNULL(SUM(amount_saved), 0) 
         FROM savings_transactions 
         WHERE member_id = ? AND type = 'deposit' AND status = 'approved') 
        - 
        (SELECT IFNULL(SUM(amount_saved), 0) 
         FROM savings_transactions 
         WHERE member_id = ? AND type = 'withdrawal' AND status IN ('pending','approved')) 
       AS balance`,
      [session.memberId, session.memberId]
    );

    const availableBalance = balanceRows[0]?.balance || 0;

    if (parsedAmount > availableBalance) {
      return NextResponse.json(
        { message: "Insufficient funds available for this withdrawal." },
        { status: 400 }
      );
    }

    // 2. Insert withdrawal request
    const reference = `wd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await db.execute(
      `INSERT INTO savings_transactions 
       (member_id, type, amount_saved, reference, reason, status) 
       VALUES (?, 'withdrawal', ?, ?, ?, 'pending')`,
      [session.memberId, parsedAmount, reference, trimmedReason]
    );
    */

    return NextResponse.json(
      { message: "Withdrawal request submitted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    return NextResponse.json(
      { message: "Error submitting request. Please try again." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

// Helper to simulate authentication session
async function getAuthSession() {
  // Replace with your actual auth system (e.g., NextAuth, Clerk, custom JWT)
  return { memberId: 101 };
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.memberId) {
      return NextResponse.json(
        { message: "Unauthorized: Please log in to update settings." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { auto_amount } = body;

    const parsedAmount = parseFloat(auto_amount);

    if (isNaN(parsedAmount) || parsedAmount < 0) {
      return NextResponse.json(
        { message: "Please enter a valid contribution amount." },
        { status: 400 }
      );
    }

    // Execute database update query
    /*
    await db.execute(
      "UPDATE members SET auto_save_amount = ? WHERE member_id = ?",
      [parsedAmount, session.memberId]
    );
    */

    return NextResponse.json(
      {
        message: "Expected monthly contribution updated successfully!",
        amount: parsedAmount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error setting auto-save amount:", error);
    return NextResponse.json(
      { message: "Server error updating contribution amount. Please try again." },
      { status: 500 }
    );
  }
}

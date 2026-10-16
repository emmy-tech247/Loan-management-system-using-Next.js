import { NextResponse } from "next/server";

// TypeScript interface matching the database record
export interface RepaymentRecord {
  id: number;
  member_id: number;
  loan_id: number;
  amount_paid: number;
  created_at: string;
  receipt_file: string | null;
  status: "pending" | "approved" | "rejected" | string;
}

// Helper to simulate authentication session
async function getAuthSession() {
  // Replace with your actual auth system (e.g., NextAuth, Clerk, custom JWTs)
  return {
    memberId: 101, // Set to null if admin
    adminId: null, // Set to 1 if logged in as admin
  };
}

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.memberId && !session?.adminId) {
      return NextResponse.json(
        { message: "Unauthorized: Access denied." },
        { status: 401 }
      );
    }

    let repayments: RepaymentRecord[] = [];

    if (session.adminId) {
      // Query for Admin: Fetch all records ordered by creation date
      /*
      const [rows] = await db.execute(
        "SELECT * FROM loan_repayments ORDER BY created_at DESC"
      );
      repayments = rows as RepaymentRecord[];
      */
    } else {
      // Query for Member: Fetch records specifically for this member
      /*
      const [rows] = await db.execute(
        "SELECT * FROM loan_repayments WHERE member_id = ? ORDER BY created_at DESC",
        [session.memberId]
      );
      repayments = rows as RepaymentRecord[];
      */
    }

    // Mock response data for demonstration
    repayments = [
      {
        id: 1,
        member_id: session.memberId ?? 101,
        loan_id: 1,
        amount_paid: 25000.0,
        created_at: "2026-03-15 10:30:00",
        receipt_file: "/uploads/receipt_123.pdf",
        status: "approved",
      },
      {
        id: 2,
        member_id: session.memberId ?? 101,
        loan_id: 1,
        amount_paid: 15000.5,
        created_at: "2026-04-01 14:15:22",
        receipt_file: "/uploads/receipt_124.png",
        status: "pending",
      },
      {
        id: 3,
        member_id: session.memberId ?? 101,
        loan_id: 2,
        amount_paid: 5000.0,
        created_at: "2026-02-10 09:12:00",
        receipt_file: null,
        status: "rejected",
      },
    ];

    return NextResponse.json(repayments, { status: 200 });
  } catch (error) {
    console.error("Error fetching repayment records:", error);
    return NextResponse.json(
      { message: "Failed to load repayment records." },
      { status: 500 }
    );
  }
}

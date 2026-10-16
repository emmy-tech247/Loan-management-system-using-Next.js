import { NextResponse } from "next/server";

export interface SavingsTransaction {
  saved_id: number;
  amount_saved: number;
  type: "deposit" | "withdrawal";
  reference: string;
  status: "approved" | "pending" | "rejected";
  created_at: string;
  formattedDate: string;
}

export interface SavingsSummary {
  total_deposits: number;
  total_withdrawals: number;
  net_balance: number;
}

export interface SavingsAlertsResponse {
  transactions: SavingsTransaction[];
  summary: SavingsSummary;
}

// Helper to simulate authentication session
async function getAuthSession() {
  // Replace with your actual auth mechanism (e.g., NextAuth, Clerk, JWT)
  return { memberId: 101 };
}

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.memberId) {
      return NextResponse.json(
        { message: "Unauthorized: Please log in." },
        { status: 401 }
      );
    }

    /*
    // 1. Fetch recent transactions
    const [transactionRows] = await db.execute(
      `SELECT saved_id, amount_saved, type, reference, status, created_at 
       FROM savings_transactions 
       WHERE member_id = ? 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [session.memberId]
    );

    // 2. Calculate summary totals
    const [summaryRows] = await db.execute(
      `SELECT 
         SUM(CASE WHEN type = 'deposit' AND status = 'approved' THEN amount_saved ELSE 0 END) AS total_deposits,
         SUM(CASE WHEN type = 'withdrawal' AND status = 'approved' THEN amount_saved ELSE 0 END) AS total_withdrawals
       FROM savings_transactions
       WHERE member_id = ?`,
      [session.memberId]
    );
    */

    // Mock Data output matching DB behavior
    const mockTransactions = [
      {
        saved_id: 104,
        amount_saved: 50000,
        type: "deposit" as const,
        reference: "TXN-2026-004",
        status: "approved" as const,
        created_at: "2026-04-05T10:00:00Z",
      },
      {
        saved_id: 103,
        amount_saved: 10000,
        type: "withdrawal" as const,
        reference: "WTH-2026-001",
        status: "approved" as const,
        created_at: "2026-03-01T11:15:00Z",
      },
      {
        saved_id: 102,
        amount_saved: 25000,
        type: "deposit" as const,
        reference: "TXN-2026-002",
        status: "approved" as const,
        created_at: "2026-02-10T14:30:00Z",
      },
      {
        saved_id: 101,
        amount_saved: 50000,
        type: "deposit" as const,
        reference: "TXN-2026-001",
        status: "approved" as const,
        created_at: "2026-01-05T09:00:00Z",
      },
    ];

    const total_deposits = 125000;
    const total_withdrawals = 10000;
    const net_balance = total_deposits - total_withdrawals;

    const formattedTransactions: SavingsTransaction[] = mockTransactions.map((item) => {
      const dateObj = new Date(item.created_at);
      return {
        ...item,
        formattedDate: dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    });

    const response: SavingsAlertsResponse = {
      transactions: formattedTransactions,
      summary: {
        total_deposits,
        total_withdrawals,
        net_balance,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching savings alerts & summaries:", error);
    return NextResponse.json(
      { message: "Failed to load savings transaction alerts." },
      { status: 500 }
    );
  }
}

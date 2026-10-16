import { NextResponse } from "next/server";

export interface TransactionRow {
  sn: number;
  type: "deposit" | "withdrawal";
  amount_saved: number;
  cumulative: number;
  narration: string;
  created_at: string;
  month: string;
  formattedDate: string;
}

export interface SavingsHistoryResponse {
  transactions: TransactionRow[];
  totalSavings: number;
}

// Helper to simulate authentication session
async function getAuthSession() {
  // Replace with your actual authentication provider (e.g., NextAuth, Clerk)
  return { memberId: 101 };
}

export async function GET(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.memberId) {
      return NextResponse.json(
        { message: "Unauthorized: Please log in." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";

    /*
    let dateSQL = "";
    const params: (string | number)[] = [session.memberId];

    if (from && to) {
      dateSQL = " AND DATE(created_at) BETWEEN ? AND ?";
      params.push(from, to);
    }

    const [rows] = await db.execute(
      `SELECT type, amount_saved, narration, created_at
       FROM savings_transactions
       WHERE member_id = ?
         AND status = 'approved'
         ${dateSQL}
       ORDER BY created_at ASC`,
      params
    );
    */

    // Mock DB Results
    const rawTransactions = [
      {
        type: "deposit" as const,
        amount_saved: 50000,
        narration: "Monthly Auto Contribution",
        created_at: "2026-01-05T09:00:00Z",
      },
      {
        type: "deposit" as const,
        amount_saved: 25000,
        narration: "Topup Savings",
        created_at: "2026-02-10T14:30:00Z",
      },
      {
        type: "withdrawal" as const,
        amount_saved: 10000,
        narration: "Emergency Fund Withdrawal",
        created_at: "2026-03-01T11:15:00Z",
      },
      {
        type: "deposit" as const,
        amount_saved: 50000,
        narration: "Monthly Auto Contribution",
        created_at: "2026-04-05T10:00:00Z",
      },
    ];

    // Filter by dates if parameters are supplied
    const filteredRows = rawTransactions.filter((row) => {
      if (!from || !to) return true;
      const rowDate = row.created_at.slice(0, 10);
      return rowDate >= from && rowDate <= to;
    });

    let cumulative = 0;

    const processedTransactions: TransactionRow[] = filteredRows.map(
      (row, index) => {
        const amount = Number(row.amount_saved);
        if (row.type === "deposit") {
          cumulative += amount;
        } else {
          cumulative -= amount;
        }

        const dateObj = new Date(row.created_at);

        return {
          sn: index + 1,
          type: row.type,
          amount_saved: amount,
          cumulative,
          narration: row.narration || (row.type === "deposit" ? "Deposit" : "Withdrawal"),
          created_at: row.created_at,
          month: dateObj.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
          formattedDate: dateObj.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        };
      }
    );

    const responseData: SavingsHistoryResponse = {
      transactions: processedTransactions,
      totalSavings: cumulative,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Error fetching savings history:", error);
    return NextResponse.json(
      { message: "Failed to retrieve savings history." },
      { status: 500 }
    );
  }
}

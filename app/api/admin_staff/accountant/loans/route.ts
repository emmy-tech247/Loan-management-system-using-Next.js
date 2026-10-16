import { NextResponse } from "next/server";
import { AccountantDashboardApiResponse, AccountantLoanItem } from "@/types/accountantDashboard";

export async function GET() {
  try {
    // ----------------------------------------------------
    // Production SQL Queries Reference
    // ----------------------------------------------------
    /*
      -- Forwarded Loans
      SELECT l.loan_id, l.loan_amount, l.tenure_month, l.loan_status, l.created_at, m.full_name
      FROM loans l
      INNER JOIN members m ON l.member_id = m.member_id
      WHERE l.loan_status = 'forwarded_to_accountant'
      ORDER BY l.created_at DESC;

      -- Disbursed Loans
      SELECT l.loan_id, l.loan_amount, l.tenure_month, l.loan_status, l.disbursed_at, m.full_name
      FROM loans l
      INNER JOIN members m ON l.member_id = m.member_id
      WHERE l.loan_status = 'disbursed'
      ORDER BY l.disbursed_at DESC;
    */

    const forwardedLoans: AccountantLoanItem[] = [
      {
        loan_id: 401,
        loan_amount: 350000.0,
        tenure_month: 12,
        loan_status: "forwarded_to_accountant",
        created_at: "2026-07-30 09:30:00",
        full_name: "Olanrewaju Adebayo",
      },
    ];

    const disbursedLoans: AccountantLoanItem[] = [
      {
        loan_id: 395,
        loan_amount: 500000.0,
        tenure_month: 12,
        loan_status: "disbursed",
        disbursed_at: "2026-07-25 14:00:00",
        full_name: "Fatima Ibrahim",
      },
    ];

    const response: AccountantDashboardApiResponse = {
      success: true,
      message: "Accountant dashboard records retrieved successfully.",
      accountantName: "Mr. Accountant",
      forwardedLoans,
      disbursedLoans,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch accountant dashboard data." },
      { status: 500 }
    );
  }
}

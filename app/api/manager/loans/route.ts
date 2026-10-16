import { NextResponse } from "next/server";
import { ManagerDashboardApiResponse } from "@/types/managerDashboard";

export async function GET() {
  try {
    // ----------------------------------------------------
    // Production SQL Query Reference
    // ----------------------------------------------------
    /*
      SELECT l.loan_id, l.loan_amount, l.tenure_month, l.loan_status, l.created_at, m.full_name
      FROM loans l
      INNER JOIN members m ON l.member_id = m.member_id
      WHERE l.loan_status = 'forwarded_to_manager'
      ORDER BY l.created_at DESC;
    */

    const loans = [
      {
        loan_id: 301,
        loan_amount: 450000.0,
        tenure_month: 12,
        loan_status: "forwarded_to_manager",
        created_at: "2026-07-28 10:15:00",
        full_name: "Olanrewaju Adebayo",
      },
      {
        loan_id: 302,
        loan_amount: 200000.0,
        tenure_month: 6,
        loan_status: "forwarded_to_manager",
        created_at: "2026-07-29 14:30:00",
        full_name: "Fatima Ibrahim",
      },
    ];

    const response: ManagerDashboardApiResponse = {
      success: true,
      message: "Manager dashboard loan queue fetched successfully.",
      managerName: "Alhaji Manager",
      loans,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch manager dashboard loans." },
      { status: 500 }
    );
  }
}

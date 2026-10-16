"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export interface FormState {
  success?: boolean;
  message?: string;
  errors?: {
    amount?: string;
    tenure?: string;
    rate?: string;
  };
}

export async function submitFixedDepositApplication(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // Session check equivalent to PHP $_SESSION['member_id']
  const cookieStore = await cookies();
  const memberId = cookieStore.get("member_id")?.value;

  if (!memberId) {
    redirect("/login");
  }

  const rawAmount = formData.get("amount_deposited");
  const rawTenure = formData.get("tenure");
  const rawRate = formData.get("rate");

  const amount = parseFloat(rawAmount as string);
  const tenure = parseInt(rawTenure as string, 10);
  const rate = parseFloat(rawRate as string);

  // Validation
  if (isNaN(amount) || amount <= 0) {
    return { success: false, message: "Please enter a valid amount greater than ₦0." };
  }
  if (isNaN(tenure) || tenure < 1 || tenure > 60) {
    return { success: false, message: "Tenure must be between 1 and 60 months." };
  }
  if (isNaN(rate) || rate <= 0 || rate > 100) {
    return { success: false, message: "Interest rate must be between 0.01% and 100%." };
  }

  try {
    const startDate = new Date();
    const maturityDate = new Date(startDate);
    maturityDate.setMonth(maturityDate.getMonth() + tenure);

    /* 
    ---------------------------------------------------------
    DATABASE OPERATIONAL EQUIVALENT (e.g. Drizzle / Prisma / mysql2):
    ---------------------------------------------------------
    const [fdResult] = await db.query(
      `INSERT INTO fixed_deposits (member_id, amount_deposited, tenure_months, interest_rate, start_date, maturity_date, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [memberId, amount, tenure, rate, startDate.toISOString().split('T')[0], maturityDate.toISOString().split('T')[0]]
    );

    await db.query(
      `INSERT INTO approvals (item_type, item_id, status, approver_id, step, created_at) 
       VALUES ('fixed_deposit', ?, 'pending', 1, 1, NOW())`,
      [fdResult.insertId]
    );
    ---------------------------------------------------------
    */

    return {
      success: true,
      message: "Fixed Deposit Application Submitted. Awaiting Admin Approval.",
    };
  } catch (error) {
    console.error("Fixed deposit submission error:", error);
    return {
      success: false,
      message: "An unexpected error occurred while processing your request.",
    };
  }
}

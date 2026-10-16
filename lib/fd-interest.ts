export interface FDInterestRecord {
  fd_id: number;
  amount_deposited: number;
  tenure_months: number;
  interest_rate: number;
  start_date: string;
  end_date: string;
  status: "active" | "matured" | "closed" | "pending" | string;
}

export interface ComputedFDInterestRecord extends FDInterestRecord {
  interestEarned: number;
}

/**
 * Replicates PHP calculateInterest() logic:
 * Calculates simple interest for months elapsed between start and end date,
 * rounding up by 1 month if remaining days > 0.
 */
export function calculateInterest(
  amount: number,
  rate: number,
  startDateStr: string,
  endDateStr: string
): number {
  if (!startDateStr || !endDateStr) return 0;

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  let monthsElapsed = years * 12 + months;
  if (days > 0) {
    monthsElapsed += 1;
  }

  // Pure mathematical equation: (P * (R / 100) * T_months) / 12
  const interest = (amount * (rate / 100) * monthsElapsed) / 12;

  return Math.round((interest + Number.EPSILON) * 100) / 100;
}

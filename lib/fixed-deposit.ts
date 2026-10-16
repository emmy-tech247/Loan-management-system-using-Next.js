import { FixedDepositRecord, ComputedFDRecord } from "@/types/fixed-deposit";

export function computeFDMetrics(record: FixedDepositRecord): ComputedFDRecord {
  const amount = Number(record.amount_deposited) || 0;
  const tenure = Number(record.tenure_months) || 0;
  const rate = Number(record.interest_rate) || 0;

  // Simple interest calculation: (P * R * T) / 100
  const interest = (amount * rate * (tenure / 12)) / 100;

  let daysLeft = 0;
  let isMatured = false;

  if (record.maturity_date) {
    const maturityTime = new Date(record.maturity_date).getTime();
    const todayTime = new Date().setHours(0, 0, 0, 0);
    const diffTime = maturityTime - todayTime;
    
    daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    isMatured = daysLeft <= 0;
  }

  return {
    ...record,
    interest,
    daysLeft,
    isMatured,
  };
}

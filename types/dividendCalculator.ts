export interface DividendCalculationResult {
  amount: number;
  rate: number;
  duration: number;
  durationType: "years" | "months";
  months: number;
  oneMonthDividend: number;
  totalDividend: number;
  totalValue: number;
}

export interface DividendCalculatorApiResponse {
  success: boolean;
  result?: DividendCalculationResult;
  message?: string;
}

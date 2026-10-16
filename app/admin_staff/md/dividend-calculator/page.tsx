"use client";

import { FormEvent, useState } from "react";
import { Calculator, TrendingUp, Wallet, CalendarDays } from "lucide-react";

export default function DividendCalculator() {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [duration, setDuration] = useState("");
  const [durationType, setDurationType] = useState<"years" | "months">(
    "years"
  );

  const [result, setResult] = useState<{
    oneMonthDividend: number;
    months: number;
    totalDividend: number;
    total: number;
  } | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const investmentAmount = parseFloat(amount);
    const dividendRate = parseFloat(rate);
    const durationValue = parseFloat(duration);

    if (
      !Number.isFinite(investmentAmount) ||
      !Number.isFinite(dividendRate) ||
      !Number.isFinite(durationValue) ||
      investmentAmount < 0 ||
      dividendRate < 0 ||
      durationValue < 0
    ) {
      setResult(null);
      return;
    }

    // Convert duration to months
    const months =
      durationType === "years" ? durationValue * 12 : durationValue;

    // Monthly dividend rate
    const monthlyRate = dividendRate / 100 / 12;

    // Dividend for one month
    const oneMonthDividend = investmentAmount * monthlyRate;

    // Total dividend
    const totalDividend = oneMonthDividend * months;

    // Investment + dividend
    const total = investmentAmount + totalDividend;

    setResult({
      oneMonthDividend,
      months,
      totalDividend,
      total,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 font-sans text-slate-900 -mt-25 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-2xl">
        {/* Header */}
        <div className="mb-6 rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300">
              <Calculator className="h-6 w-6" />
            </div>

            <div>
              <span className="mb-2 inline-block rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                Financial Calculator
              </span>

              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Dividend Calculator
              </h1>

              <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
                Estimate your monthly dividend, total dividend earnings, and
                projected investment value.
              </p>
            </div>
          </div>
        </div>

        {/* Calculator Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Investment Amount */}
            <div>
              <label
                htmlFor="amount"
                className="mb-2 block text-xs font-bold text-slate-700"
              >
                Investment Amount
              </label>

              <div className="relative">
                <Wallet className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter investment amount"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Dividend Rate */}
            <div>
              <label
                htmlFor="rate"
                className="mb-2 block text-xs font-bold text-slate-700"
              >
                Dividend Rate (%)
              </label>

              <div className="relative">
                <TrendingUp className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  id="rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="Enter dividend rate"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-12 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  %
                </span>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label
                htmlFor="duration"
                className="mb-2 block text-xs font-bold text-slate-700"
              >
                Duration
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="relative">
                  <CalendarDays className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="duration"
                    type="number"
                    min="0"
                    step="0.01"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Enter duration"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <select
                  value={durationType}
                  onChange={(e) =>
                    setDurationType(e.target.value as "years" | "months")
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="years">Years</option>
                  <option value="months">Months</option>
                </select>
              </div>
            </div>

            {/* Calculate Button */}
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <Calculator className="h-4 w-4" />
              Calculate Dividend
            </button>
          </form>

          {/* Results */}
          {result !== null && (
            <div className="mt-7 space-y-3 border-t border-slate-100 pt-7">
              <div className="mb-4">
                <h2 className="text-sm font-extrabold text-slate-900">
                  Calculation Results
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Based on the information you provided.
                </p>
              </div>

              {/* Monthly Dividend */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    Dividend Per Month
                  </p>
                  <p className="mt-1 text-base font-extrabold text-slate-900">
                    {formatCurrency(result.oneMonthDividend)}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>

              {/* Total Months */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    Total Months
                  </p>
                  <p className="mt-1 text-base font-extrabold text-slate-900">
                    {result.months.toLocaleString("en-NG")}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <CalendarDays className="h-5 w-5" />
                </div>
              </div>

              {/* Total Dividend */}
              <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div>
                  <p className="text-xs font-semibold text-emerald-700">
                    Total Dividend
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-emerald-800">
                    {formatCurrency(result.totalDividend)}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>

              {/* Total Value */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-md">
                <p className="text-xs font-semibold text-slate-300">
                  Total Investment Value
                </p>

                <p className="mt-1 text-2xl font-extrabold tracking-tight">
                  {formatCurrency(result.total)}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Original investment + total dividend
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Dividend calculations are estimates based on the rate and duration
          entered.
        </p>
      </div>
    </div>
  );
}
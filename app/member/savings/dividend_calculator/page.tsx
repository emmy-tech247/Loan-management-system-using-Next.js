"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SavingsNavbar from "@/components/navigation/SavingsNavbar";
import {
  ArrowLeft,
  Calculator,
  TrendingUp,
  Wallet,
  Calendar,
  CircleDollarSign,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";

export default function DividendCalculator() {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");

  const [dividend, setDividend] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const calculateDividend = () => {
    setError("");

    const investmentAmount = Number(amount);
    const dividendRate = Number(rate);
    const duration = Number(years);

    if (
      !amount ||
      !rate ||
      !years ||
      investmentAmount <= 0 ||
      dividendRate <= 0 ||
      duration <= 0
    ) {
      setDividend(null);
      setTotal(null);
      setError("Please enter valid values in all fields.");
      return;
    }

    const calculatedDividend =
      investmentAmount * (dividendRate / 100) * duration;

    const calculatedTotal = investmentAmount + calculatedDividend;

    setDividend(calculatedDividend);
    setTotal(calculatedTotal);
  };

  const resetCalculator = () => {
    setAmount("");
    setRate("");
    setYears("");
    setDividend(null);
    setTotal(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* =========================
          NAVBAR
      ========================== */}
       <SavingsNavbar />

      {/* =========================
          MAIN
      ========================== */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 -mt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-md">
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative z-10">
              <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                <Calculator className="h-4 w-4" />
                Financial Calculator
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Dividend Calculator
              </h1>

              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Estimate your expected dividend based on your investment
                amount, dividend rate, and investment duration.
              </p>
            </div>
          </div>

          {/* Calculator Card */}
          <div className="mt-6 rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <TrendingUp className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Calculate Your Dividend
                </h2>
                <p className="text-xs text-slate-500">
                  Enter your investment details below.
                </p>
              </div>
            </div>

            {/* Investment Amount */}
            <div className="mb-5">
              <label
                htmlFor="amount"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Investment Amount (₦)
              </label>

              <div className="relative">
                <CircleDollarSign className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter investment amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Dividend Rate */}
            <div className="mb-5">
              <label
                htmlFor="rate"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Dividend Rate (%)
              </label>

              <div className="relative">
                <TrendingUp className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  id="rate"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 10"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Duration */}
            <div className="mb-6">
              <label
                htmlFor="years"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Duration (Years)
              </label>

              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  id="years"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="e.g. 2"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                <span>⚠</span>
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={calculateDividend}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <Calculator className="h-4 w-4" />
                Calculate Dividend
              </button>

              <button
                type="button"
                onClick={resetCalculator}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>

            {/* Results */}
            {dividend !== null && total !== null && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50">
                <div className="border-b border-emerald-200 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />

                    <h3 className="text-sm font-bold text-emerald-900">
                      Calculation Result
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-px bg-emerald-200 sm:grid-cols-2">
                  {/* Dividend */}
                  <div className="bg-emerald-50 p-5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                      <Wallet className="h-4 w-4" />
                      Estimated Dividend
                    </div>

                    <p className="mt-2 text-xl font-extrabold text-emerald-900">
                      {formatCurrency(dividend)}
                    </p>
                  </div>

                  {/* Total */}
                  <div className="bg-emerald-50 p-5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                      <CircleDollarSign className="h-4 w-4" />
                      Total Value
                    </div>

                    <p className="mt-2 text-xl font-extrabold text-emerald-900">
                      {formatCurrency(total)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Formula */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-700">
                Dividend Formula
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Dividend = Investment Amount × (Dividend Rate ÷ 100) ×
                Duration
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* =========================
          FOOTER
      ========================== */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} DCG Multipurpose Cooperative
            Society Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
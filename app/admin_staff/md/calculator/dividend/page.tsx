"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Shield,
  Loader2,
  Calculator,
  Coins,
  Calendar,
  Percent,
} from "lucide-react";
import { DividendCalculationResult } from "@/types/dividendCalculator";

export default function DividendCalculatorPage() {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [duration, setDuration] = useState("");
  const [durationType, setDurationType] = useState<"years" | "months">("years");

  const [result, setResult] = useState<DividendCalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin_staff/calculator/dividend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          rate,
          duration,
          durationType,
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setResult(json.result);
      } else {
        setError(json.message || "Calculation failed.");
      }
    } catch {
      setError("Network connection error. Could not compute dividend.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin_staff/staff/login" className="flex items-center gap-2">
                <Image
                  src="/images/logo2.png"
                  alt="Cooperative Logo"
                  width={140}
                  height={40}
                  className="h-9 w-auto object-contain"
                  priority
                />
              </Link>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold text-white">
                <Shield className="h-3 w-3 text-emerald-400" /> Financial Tools
              </span>
            </div>

            <Link
              href="/admin_staff/md/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to MD Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Calculator className="h-6 w-6 text-emerald-600" /> Dividend Calculator
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Estimate member earnings, monthly returns, and total investment value over time.
            </p>
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800">
              {error}
            </div>
          )}

          {/* Calculator Form */}
          <form onSubmit={handleCalculate} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Coins className="h-3.5 w-3.5 text-emerald-600" /> Investment Amount (₦)
              </label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 500000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Percent className="h-3.5 w-3.5 text-emerald-600" /> Dividend Rate (%)
              </label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 15"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-emerald-600" /> Duration
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 2"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Duration Unit
                </label>
                <select
                  value={durationType}
                  onChange={(e) => setDurationType(e.target.value as "years" | "months")}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="years">Years</option>
                  <option value="months">Months</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Calculate Dividend
            </button>
          </form>

          {/* Results Box */}
          {result && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Calculation Breakdown
              </h2>
              <div className="space-y-2 text-xs font-medium text-slate-700">
                <div className="flex justify-between border-b border-emerald-100 pb-2">
                  <span className="text-slate-500">Dividend Per Month:</span>
                  <span className="font-extrabold text-emerald-700 font-mono">
                    ₦{formatCurrency(result.oneMonthDividend)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-emerald-100 pb-2">
                  <span className="text-slate-500">Total Months:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {new Intl.NumberFormat("en-NG").format(result.months)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-emerald-100 pb-2">
                  <span className="text-slate-500">Total Dividend:</span>
                  <span className="font-extrabold text-emerald-700 font-mono">
                    ₦{formatCurrency(result.totalDividend)}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-700 font-bold">Total Investment Value:</span>
                  <span className="text-sm font-extrabold text-slate-900 font-mono">
                    ₦{formatCurrency(result.totalValue)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 space-y-2">
          <Link
            href="/admin_staff/md/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to MD Dashboard
          </Link>
          <p className="text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} DCG Multipurpose Cooperative Society Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

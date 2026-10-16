"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LoanNavbar from "@/components/navigation/LoanNavbar";
import {
  ArrowLeft,
  Calculator,
  CreditCard,
  FileText,
  Receipt,
  TrendingUp,
  Wallet,
  CalendarDays,
  Banknote,
  Menu,
  X,
  CheckCircle2,
  Percent,
  Clock,
  Megaphone,
} from "lucide-react";

export default function LoanCalculatorPage() {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("5");
  const [months, setMonths] = useState("");

  const [result, setResult] = useState<{
    principal: number;
    interest: number;
    totalRepayment: number;
    monthlyPayment: number;
    rate: number;
    months: number;
  } | null>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // =========================================================
  // CALCULATE LOAN
  // =========================================================
  const calculateLoan = () => {
    const principal = Number(amount);
    const interestRate = Number(rate);
    const duration = Number(months);

    if (
      !principal ||
      principal <= 0 ||
      !interestRate ||
      interestRate < 0 ||
      !duration ||
      duration <= 0
    ) {
      setResult(null);
      return;
    }

    /*
      Simple interest calculation:

      Interest = Principal × Rate × Time

      Since the rate entered is an annual percentage,
      duration is converted from months to years.
    */

    const years = duration / 12;

    const interest =
      principal * (interestRate / 100) * years;

    const totalRepayment =
      principal + interest;

    const monthlyPayment =
      totalRepayment / duration;

    setResult({
      principal,
      interest,
      totalRepayment,
      monthlyPayment,
      rate: interestRate,
      months: duration,
    });
  };

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // =========================================================
  // CLEAR CALCULATOR
  // =========================================================
  const clearCalculator = () => {
    setAmount("");
    setRate("5");
    setMonths("");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">

      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <LoanNavbar />

      {/* =====================================================
          MAIN
      ===================================================== */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 -mt-24 lg:px-8">

        <div className="space-y-6">

          {/* =================================================
              HEADER
          ================================================= */}
          <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">

            <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              <div className="max-w-3xl">

                <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-300">
                  <Calculator className="h-4 w-4" />
                  Financial Planning Tool
                </div>

                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
                  Loan Calculator
                </h1>

                <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">
                  Calculate your estimated loan interest,
                  total repayment amount, and monthly repayment
                  based on the amount, interest rate, and duration
                  you enter.
                </p>

              </div>

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                <Calculator className="h-8 w-8" />
              </div>

            </div>

          </section>

          {/* =================================================
              CALCULATOR
          ================================================= */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">

            {/* =================================================
                CALCULATOR FORM
            ================================================= */}
            <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

              <div className="mb-6">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Calculator className="h-5 w-5" />
                  </div>

                  <div>

                    <h2 className="text-xl font-extrabold text-slate-900">
                      Calculate Your Loan
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Enter your loan information below.
                    </p>

                  </div>

                </div>

              </div>

              <div className="space-y-5">

                {/* Amount */}
                <div>

                  <label
                    htmlFor="amount_collected"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Amount (₦)
                  </label>

                  <div className="relative">

                    <Banknote className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="amount_collected"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Enter loan amount"
                      inputMode="decimal"
                      value={amount}
                      onChange={(e) =>
                        setAmount(e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-base font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    />

                  </div>

                </div>

                {/* Interest Rate */}
                <div>

                  <label
                    htmlFor="rate"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Interest Rate (%)
                  </label>

                  <div className="relative">

                    <Percent className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="rate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={rate}
                      onChange={(e) =>
                        setRate(e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-base font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    />

                  </div>

                  <p className="mt-1.5 text-xs text-slate-400">
                    Enter the annual interest rate.
                  </p>

                </div>

                {/* Duration */}
                <div>

                  <label
                    htmlFor="months"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Duration (Months)
                  </label>

                  <div className="relative">

                    <Clock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="months"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="e.g. 12"
                      inputMode="numeric"
                      value={months}
                      onChange={(e) =>
                        setMonths(e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-base font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    />

                  </div>

                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-3 pt-2 sm:flex-row">

                  <button
                    type="button"
                    onClick={calculateLoan}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-base font-extrabold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
                  >
                    <Calculator className="h-5 w-5" />
                    Calculate Loan
                  </button>

                  <button
                    type="button"
                    onClick={clearCalculator}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-base font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    Clear
                  </button>

                </div>

              </div>

            </div>

            {/* =================================================
                INFORMATION CARD
            ================================================= */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-emerald-400">
                <FileText className="h-6 w-6" />
              </div>

              <h2 className="mt-5 text-lg font-extrabold text-slate-900">
                How It Works
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Enter the amount you want to borrow,
                your interest rate and the expected duration.
                The calculator will estimate your repayment.
              </p>

              <div className="mt-6 space-y-4">

                <InfoItem
                  number="1"
                  title="Enter Amount"
                  description="Enter the amount of money you want to borrow."
                />

                <InfoItem
                  number="2"
                  title="Enter Interest Rate"
                  description="Enter the applicable annual interest rate."
                />

                <InfoItem
                  number="3"
                  title="Enter Duration"
                  description="Enter how many months you intend to repay."
                />

              </div>

            </div>

          </section>

          {/* =================================================
              RESULT
          ================================================= */}
          {result && (
            <section className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm">

              <div className="border-b border-emerald-100 bg-emerald-50 px-6 py-5 sm:px-8">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div>

                    <h2 className="text-xl font-extrabold text-slate-900">
                      Loan Calculation Result
                    </h2>

                    <p className="text-sm text-slate-500">
                      Estimated repayment breakdown
                    </p>

                  </div>

                </div>

              </div>

              <div className="p-6 sm:p-8">

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                  {/* Principal */}
                  <ResultCard
                    title="Loan Amount"
                    value={formatCurrency(result.principal)}
                    icon={Wallet}
                    className="bg-slate-50"
                    iconClassName="bg-white text-slate-700"
                  />

                  {/* Interest */}
                  <ResultCard
                    title="Total Interest"
                    value={formatCurrency(result.interest)}
                    icon={Percent}
                    className="bg-amber-50"
                    iconClassName="bg-white text-amber-600"
                  />

                  {/* Total */}
                  <ResultCard
                    title="Total Repayment"
                    value={formatCurrency(
                      result.totalRepayment
                    )}
                    icon={Banknote}
                    className="bg-emerald-50"
                    iconClassName="bg-white text-emerald-600"
                  />

                  {/* Monthly */}
                  <ResultCard
                    title="Monthly Payment"
                    value={formatCurrency(
                      result.monthlyPayment
                    )}
                    icon={CalendarDays}
                    className="bg-blue-50"
                    iconClassName="bg-white text-blue-600"
                  />

                </div>

                {/* Calculation Details */}
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">

                  <h3 className="text-sm font-extrabold text-slate-900">
                    Calculation Details
                  </h3>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">

                    <DetailRow
                      label="Interest Rate"
                      value={`${result.rate}%`}
                    />

                    <DetailRow
                      label="Duration"
                      value={`${result.months} ${
                        result.months === 1
                          ? "Month"
                          : "Months"
                      }`}
                    />

                    <DetailRow
                      label="Estimated Monthly Payment"
                      value={formatCurrency(
                        result.monthlyPayment
                      )}
                      highlight
                    />

                  </div>

                </div>

                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">

                  <div className="flex items-start gap-3">

                    <Calculator className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                    <p className="text-xs leading-relaxed text-amber-700">
                      This calculator provides an estimate based
                      on the information entered. Actual loan
                      terms, charges, interest and repayment
                      schedules may differ according to the
                      cooperative&apos;s approved loan terms.
                    </p>

                  </div>

                </div>

              </div>

            </section>
          )}

        </div>

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-7">

        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">

          <div className="mb-2 flex items-center justify-center gap-2">

            <CheckCircle2 className="h-4 w-4 text-emerald-600" />

            <span className="text-sm font-bold text-slate-700">
              DCG Multipurpose Cooperative Society Ltd.
            </span>

          </div>

          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} DCG
            Multipurpose Cooperative Society Ltd.
            All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  );
}


/* =========================================================
   DESKTOP NAVIGATION LINK
========================================================= */

function NavLink({
  href,
  children,
  active = false,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-3.5 text-[17px] font-extrabold transition-all ${
        active
          ? "bg-slate-900 text-white shadow-sm"
          : "text-slate-700 hover:bg-slate-100 hover:text-emerald-700"
      }`}
    >
      {children}
    </Link>
  );
}


/* =========================================================
   MOBILE NAVIGATION LINK
========================================================= */

function MobileNavLink({
  href,
  children,
  active = false,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-extrabold transition-all ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-700 hover:bg-slate-100 hover:text-emerald-700"
      }`}
    >
      {children}
    </Link>
  );
}


/* =========================================================
   INFORMATION ITEM
========================================================= */

function InfoItem({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xs font-extrabold text-emerald-700">
        {number}
      </div>

      <div>

        <h3 className="text-sm font-bold text-slate-900">
          {title}
        </h3>

        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
          {description}
        </p>

      </div>

    </div>
  );
}


/* =========================================================
   RESULT CARD
========================================================= */

function ResultCard({
  title,
  value,
  icon: Icon,
  className,
  iconClassName,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  className: string;
  iconClassName: string;
}) {
  return (
    <div className={`rounded-2xl p-5 ${className}`}>

      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClassName}`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-lg font-extrabold text-slate-900">
        {value}
      </p>

    </div>
  );
}


/* =========================================================
   DETAIL ROW
========================================================= */

function DetailRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl bg-white p-3">

      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-extrabold ${
          highlight
            ? "text-emerald-700"
            : "text-slate-900"
        }`}
      >
        {value}
      </p>

    </div>
  );
}
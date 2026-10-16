"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LoanNavbar from "@/components/navigation/LoanNavbar";
import {
  FileText,
  Landmark,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
  AlertTriangle,
  CalendarDays,
  Banknote,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================

type Loan = {
  loan_id: number;
  loan_amount: number | string;
  amount_paid: number | string;
  start_date: string;
  due_date: string;
  loan_category: string;
};

type LoanCalculation = Loan & {
  outstanding: number;
  defaultRate: number;
  dailyRate: number;
  defaultCharge: number;
  daysOverdue: number;
  dailyGrowth: number;
  totalDue: number;
  progressPercent: number;
};

// ============================================================
// MAIN PAGE
// ============================================================

export default function LoanReportPage() {
  const [memberName, setMemberName] = useState<string>("Member");
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // ==========================================================
  // FETCH MEMBER LOAN DATA
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const fetchLoanReport = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * IMPORTANT:
         * This endpoint must exist:
         *
         * app/api/member/loan-report/route.ts
         *
         * If your API route is instead:
         * app/api/member/loan/loan_report/route.ts
         *
         * change the URL below accordingly.
         */
        const response = await fetch("/api/member/loan-report", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        const responseText = await response.text();

        console.log("Loan report HTTP status:", response.status);
        console.log("Loan report response:", responseText);

        // ======================================================
        // HANDLE 404
        // ======================================================

        if (response.status === 404) {
          throw new Error(
            "Loan report API endpoint was not found (404). Make sure app/api/member/loan-report/route.ts exists."
          );
        }

        // ======================================================
        // SAFE JSON PARSING
        // ======================================================

        let data: {
          memberName?: string;
          loans?: Loan[];
          error?: string;
        };

        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Server returned non-JSON:", responseText);
          console.error("JSON parse error:", parseError);

          throw new Error(
            `Server returned an invalid response (${response.status}). Check the browser console and terminal for the API error.`
          );
        }

        // ======================================================
        // HANDLE HTTP ERROR
        // ======================================================

        if (!response.ok) {
          throw new Error(
            data?.error ||
              `Failed to load loan report. HTTP ${response.status}`
          );
        }

        if (!mounted) return;

        // ======================================================
        // MEMBER NAME
        // ======================================================

        const name = data?.memberName || "Member";

        setMemberName(name);

        // ======================================================
        // LOANS
        // ======================================================

        const loanData = Array.isArray(data?.loans)
          ? data.loans
          : [];

        setLoans(loanData);
      } catch (err) {
        console.error("Loan report error:", err);

        if (!mounted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your loan report."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchLoanReport();

    return () => {
      mounted = false;
    };
  }, []);

  // ============================================================
  // CALCULATE LOAN
  // ============================================================

  const calculateLoan = (loan: Loan): LoanCalculation => {
    const loanAmount = Number(loan.loan_amount) || 0;
    const amountPaid = Number(loan.amount_paid) || 0;

    const dueDate = new Date(loan.due_date);
    const today = new Date();

    // ==========================================================
    // OUTSTANDING
    // ==========================================================

    const outstanding = Math.max(
      loanAmount - amountPaid,
      0
    );

    // ==========================================================
    // CATEGORY
    // ==========================================================

    const category = String(
      loan.loan_category || ""
    )
      .toLowerCase()
      .trim();

    const isSaver =
      category === "loan_savers" ||
      category === "loan_saver" ||
      category === "saver" ||
      category === "savers" ||
      category === "loan saver";

    // ==========================================================
    // DEFAULT RATES
    // ==========================================================

    /*
     * Saver:
     *   Default charge = 5%
     *   Daily rate     = 0.2%
     *
     * Borrower:
     *   Default charge = 10%
     *   Daily rate     = 0.4%
     */

    const defaultRate = isSaver ? 0.05 : 0.1;
    const dailyRate = isSaver ? 0.002 : 0.004;

    // ==========================================================
    // DEFAULT CALCULATION
    // ==========================================================

    let defaultCharge = 0;
    let daysOverdue = 0;

    if (
      !Number.isNaN(dueDate.getTime()) &&
      today > dueDate &&
      outstanding > 0
    ) {
      defaultCharge = defaultRate * outstanding;

      const difference =
        today.getTime() - dueDate.getTime();

      daysOverdue = Math.max(
        Math.floor(
          difference / (1000 * 60 * 60 * 24)
        ),
        0
      );
    }

    // ==========================================================
    // DAILY GROWTH
    // ==========================================================

    const dailyGrowth =
      outstanding *
      dailyRate *
      daysOverdue;

    // ==========================================================
    // TOTAL DUE
    // ==========================================================

    const totalDue =
      outstanding +
      defaultCharge +
      dailyGrowth;

    // ==========================================================
    // REPAYMENT PROGRESS
    // ==========================================================

    const progressPercent =
      loanAmount > 0
        ? Math.min(
            Math.max(
              (amountPaid / loanAmount) * 100,
              0
            ),
            100
          )
        : 0;

    return {
      ...loan,
      loan_amount: loanAmount,
      amount_paid: amountPaid,
      outstanding,
      defaultRate,
      dailyRate,
      defaultCharge,
      daysOverdue,
      dailyGrowth,
      totalDue,
      progressPercent,
    };
  };

  // ============================================================
  // PROCESSED LOANS
  // ============================================================

  const calculations = loans.map(calculateLoan);

  // ============================================================
  // SUMMARY TOTALS
  // ============================================================

  const totalLoanCollected = calculations.reduce(
    (sum, loan) =>
      sum + Number(loan.loan_amount || 0),
    0
  );

  const totalOutstanding = calculations.reduce(
    (sum, loan) =>
      sum + Number(loan.outstanding || 0),
    0
  );

  const totalDefaultCharges = calculations.reduce(
    (sum, loan) =>
      sum + Number(loan.defaultCharge || 0),
    0
  );

  const totalDueWithCharges = calculations.reduce(
    (sum, loan) =>
      sum + Number(loan.totalDue || 0),
    0
  );

  // ============================================================
  // FORMAT CURRENCY
  // ============================================================

  const formatCurrency = (
    value: number | string
  ) => {
    const amount = Number(value) || 0;

    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date: string) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <LoanNavbar />

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">

        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading && (
          <div className="flex min-h-[500px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

              <p className="text-sm font-semibold text-slate-500">
                Loading your loan report...
              </p>
            </div>
          </div>
        )}

        {/* ====================================================
            ERROR
        ==================================================== */}

        {!loading && error && (
          <div className="flex min-h-[500px] items-center justify-center">
            <div className="w-full max-w-lg rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm">

              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50">
                <AlertTriangle className="h-7 w-7 text-rose-600" />
              </div>

              <h2 className="text-xl font-extrabold text-slate-900">
                Unable to Load Loan Report
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {error}
              </p>

              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    window.location.reload()
                  }
                  className="rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-700"
                >
                  Try Again
                </button>

                <Link
                  href="/member/dashboard"
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Back to Dashboard
                </Link>
              </div>

            </div>
          </div>
        )}

        {/* ====================================================
            REPORT
        ==================================================== */}

        {!loading && !error && (
          <div className="space-y-8">

            {/* ==================================================
                HEADER
            ================================================== */}

            <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">

              <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

              <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                <div className="max-w-2xl">

                  <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-300">
                    <Receipt className="h-4 w-4" />
                    Member Loan Report
                  </div>

                  <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                    Loan Report
                  </h1>

                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    Welcome{" "}
                    <span className="font-bold text-white">
                      {memberName}
                    </span>
                    . Review your loans, repayment
                    progress, outstanding balances and
                    applicable charges.
                  </p>

                </div>

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                  <Landmark className="h-8 w-8" />
                </div>

              </div>
            </section>

            {/* ==================================================
                SUMMARY
            ================================================== */}

            <section>

              <div className="mb-4">
                <h2 className="text-xl font-extrabold text-slate-900">
                  Summary
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Overall position of your current and
                  previous loans.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <SummaryCard
                  title="Total Loan Collected"
                  value={formatCurrency(
                    totalLoanCollected
                  )}
                  icon={Wallet}
                  iconBg="bg-blue-50"
                  iconColor="text-blue-600"
                  valueColor="text-blue-700"
                />

                <SummaryCard
                  title="Total Outstanding"
                  value={formatCurrency(
                    totalOutstanding
                  )}
                  icon={TrendingDown}
                  iconBg="bg-amber-50"
                  iconColor="text-amber-600"
                  valueColor="text-amber-700"
                />

                <SummaryCard
                  title="Total Default Charges"
                  value={formatCurrency(
                    totalDefaultCharges
                  )}
                  icon={AlertTriangle}
                  iconBg="bg-rose-50"
                  iconColor="text-rose-600"
                  valueColor="text-rose-700"
                />

                <SummaryCard
                  title="Total Due With Charges"
                  value={formatCurrency(
                    totalDueWithCharges
                  )}
                  icon={Banknote}
                  iconBg="bg-emerald-50"
                  iconColor="text-emerald-600"
                  valueColor="text-emerald-700"
                />

              </div>
            </section>

            {/* ==================================================
                LOANS
            ================================================== */}

            <section>

              <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">

                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Your Loans
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Detailed breakdown of your loan
                    obligations.
                  </p>
                </div>

                <span className="inline-flex w-fit items-center rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                  {calculations.length}{" "}
                  {calculations.length === 1
                    ? "Loan"
                    : "Loans"}
                </span>

              </div>

              {calculations.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <FileText className="h-7 w-7" />
                  </div>

                  <h3 className="mt-4 text-base font-bold text-slate-900">
                    No Loan Records Found
                  </h3>

                  <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                    You currently do not have any loan
                    records available.
                  </p>

                  <Link
                    href="/member/loan/loan_saver_borrower"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                  >
                    <Banknote className="h-4 w-4" />
                    Apply for a Loan
                  </Link>

                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                  {calculations.map((loan) => (
                    <LoanCard
                      key={loan.loan_id}
                      loan={loan}
                      formatCurrency={formatCurrency}
                      formatDate={formatDate}
                    />
                  ))}

                </div>
              )}

            </section>

            {/* ==================================================
                REPAYMENT TRACKING
            ================================================== */}

            {calculations.length > 0 && (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                <div className="mb-6 flex items-start gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <TrendingUp className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      Monthly Loan Repayment Tracking
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Compare the amount paid against your
                      outstanding loan balance.
                    </p>
                  </div>

                </div>

                <RepaymentChart
                  loans={calculations}
                  formatCurrency={formatCurrency}
                />

              </section>
            )}

          </div>
        )}

      </main>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-medium text-slate-500">
            © {new Date().getFullYear()} DCG Multipurpose
            Cooperative Society Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  valueColor,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  valueColor: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">

      <div className="flex items-start justify-between gap-4">

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {title}
          </p>

          <p
            className={`mt-2 text-xl font-extrabold ${valueColor}`}
          >
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
        >
          <Icon className="h-5 w-5" />
        </div>

      </div>

    </div>
  );
}

// ============================================================
// LOAN CARD
// ============================================================

function LoanCard({
  loan,
  formatCurrency,
  formatDate,
}: {
  loan: LoanCalculation;
  formatCurrency: (
    value: number | string
  ) => string;
  formatDate: (date: string) => string;
}) {
  const isOverdue =
    loan.daysOverdue > 0 &&
    loan.outstanding > 0;

  const progress = Math.min(
    Math.max(loan.progressPercent, 0),
    100
  );

  const category = String(
    loan.loan_category || "Loan"
  )
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );

  return (
    <div className="group rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md sm:p-6">

      {/* ====================================================
          CARD HEADER
      ==================================================== */}

      <div className="flex items-start justify-between gap-4 border-b -mt-2 border-slate-100 pb-4">

        <div>
          <div className="flex flex-wrap items-center gap-2">

            <span className="text-base font-extrabold text-slate-900">
              Loan #{loan.loan_id}
            </span>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">
              {category}
            </span>

          </div>

          <p className="mt-1 text-xs text-slate-500">
            Started {formatDate(loan.start_date)}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Landmark className="h-5 w-5" />
        </div>

      </div>

      {/* ====================================================
          LOAN DETAILS
      ==================================================== */}

      <div className="mt-5 grid grid-cols-2 gap-4">

        <DetailItem
          label="Loan Amount"
          value={formatCurrency(loan.loan_amount)}
        />

        <DetailItem
          label="Amount Paid"
          value={formatCurrency(loan.amount_paid)}
          valueClass="text-emerald-700"
        />

        <DetailItem
          label="Outstanding"
          value={formatCurrency(loan.outstanding)}
          valueClass={
            loan.outstanding > 0
              ? "text-amber-700"
              : "text-emerald-700"
          }
        />

        <DetailItem
          label="Due Date"
          value={formatDate(loan.due_date)}
          icon={
            <CalendarDays className="h-3.5 w-3.5" />
          }
        />

      </div>

      {/* ====================================================
          CHARGES
      ==================================================== */}

      <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4">

        <div className="flex items-center justify-between gap-4 text-sm">

          <span className="font-medium text-slate-500">
            Default Charge (
            {loan.defaultRate * 100}%)
          </span>

          <span className="font-bold text-slate-800">
            {formatCurrency(loan.defaultCharge)}
          </span>

        </div>

        <div className="flex items-center justify-between gap-4 text-sm">

          <span className="font-medium text-slate-500">
            Daily Growth (
            {loan.dailyRate * 100}% ×{" "}
            {loan.daysOverdue} days)
          </span>

          <span className="font-bold text-slate-800">
            {formatCurrency(loan.dailyGrowth)}
          </span>

        </div>

      </div>

      {/* ====================================================
          TOTAL DUE
      ==================================================== */}

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-rose-100 bg-rose-50 p-4">

        <div>
          <span className="text-sm font-bold text-rose-700">
            Total Due
          </span>

          {isOverdue && (
            <p className="mt-1 text-[11px] font-semibold text-rose-500">
              {loan.daysOverdue}{" "}
              {loan.daysOverdue === 1
                ? "day"
                : "days"}{" "}
              overdue
            </p>
          )}
        </div>

        <span className="text-lg font-extrabold text-rose-700">
          {formatCurrency(loan.totalDue)}
        </span>

      </div>

      {/* ====================================================
          PROGRESS
      ==================================================== */}

      <div className="mt-5">

        <div className="mb-2 flex items-center justify-between text-xs">

          <span className="font-bold text-slate-600">
            Repayment Progress
          </span>

          <span className="font-extrabold text-emerald-700">
            {loan.progressPercent.toFixed(1)}%
          </span>

        </div>

        <div className="h-3 overflow-hidden rounded-full bg-slate-100">

          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

        <div className="mt-2 flex justify-between text-[11px] text-slate-400">

          <span>
            Paid:{" "}
            {formatCurrency(loan.amount_paid)}
          </span>

          <span>
            Loan:{" "}
            {formatCurrency(loan.loan_amount)}
          </span>

        </div>

      </div>

      {/* ====================================================
          OVERDUE NOTICE
      ==================================================== */}

      {isOverdue && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">

          <AlertTriangle className="h-4 w-4 shrink-0" />

          This loan is{" "}
          {loan.daysOverdue}{" "}
          {loan.daysOverdue === 1
            ? "day"
            : "days"}{" "}
          overdue.

        </div>
      )}

    </div>
  );
}

// ============================================================
// DETAIL ITEM
// ============================================================

function DetailItem({
  label,
  value,
  valueClass = "text-slate-900",
  icon,
}: {
  label: string;
  value: string;
  valueClass?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 flex items-center gap-1 text-sm font-extrabold ${valueClass}`}
      >
        {icon}
        {value}
      </p>
    </div>
  );
}

// ============================================================
// REPAYMENT CHART
// ============================================================

function RepaymentChart({
  loans,
  formatCurrency,
}: {
  loans: LoanCalculation[];
  formatCurrency: (
    value: number | string
  ) => string;
}) {
  if (loans.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-50 p-8 text-center">
        <p className="text-sm font-medium text-slate-500">
          No repayment data available for the chart.
        </p>
      </div>
    );
  }

  const maxValue = Math.max(
    ...loans.flatMap((loan) => [
      Number(loan.amount_paid) || 0,
      Number(loan.outstanding) || 0,
    ]),
    1
  );

  return (
    <div className="space-y-5">

      {loans.map((loan) => {
        const amountPaid =
          Number(loan.amount_paid) || 0;

        const outstanding =
          Number(loan.outstanding) || 0;

        const paidWidth =
          (amountPaid / maxValue) * 100;

        const outstandingWidth =
          (outstanding / maxValue) * 100;

        return (
          <div key={loan.loan_id}>

            <div className="mb-2 flex items-center justify-between">

              <span className="text-xs font-extrabold text-slate-700">
                Loan #{loan.loan_id}
              </span>

              <span className="text-xs font-bold text-slate-400">
                {formatCurrency(loan.loan_amount)}
              </span>

            </div>

            <div className="space-y-2">

              {/* PAID */}

              <div className="flex items-center gap-3">

                <div className="w-20 shrink-0 text-[11px] font-bold text-slate-500">
                  Paid
                </div>

                <div className="h-5 flex-1 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{
                      width: `${Math.min(
                        Math.max(paidWidth, 1),
                        100
                      )}%`,
                    }}
                  />

                </div>

                <div className="w-28 text-right text-xs font-bold text-emerald-700">
                  {formatCurrency(amountPaid)}
                </div>

              </div>

              {/* OUTSTANDING */}

              <div className="flex items-center gap-3">

                <div className="w-20 shrink-0 text-[11px] font-bold text-slate-500">
                  Outstanding
                </div>

                <div className="h-5 flex-1 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{
                      width: `${Math.min(
                        Math.max(outstandingWidth, 1),
                        100
                      )}%`,
                    }}
                  />

                </div>

                <div className="w-28 text-right text-xs font-bold text-amber-700">
                  {formatCurrency(outstanding)}
                </div>

              </div>

            </div>

          </div>
        );
      })}

      {/* LEGEND */}

      <div className="flex flex-wrap gap-5 border-t border-slate-100 pt-5">

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="h-3 w-3 rounded-full bg-emerald-500" />
          Amount Paid
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="h-3 w-3 rounded-full bg-amber-500" />
          Outstanding
        </div>

      </div>

    </div>
  );
}
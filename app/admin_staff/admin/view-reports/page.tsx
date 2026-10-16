"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Shield,
  Loader2,
  BarChart3,
  Users,
  CreditCard,
  PiggyBank,
  Building2,
  Receipt,
  Calendar,
  RefreshCw,
  TrendingUp,
  Wallet,
} from "lucide-react";

import {
  MemberStatusSummary,
  LoanStats,
  SavingStats,
  FixedDepositStats,
  RecentPayment,
} from "@/types/adminReports";

export default function AdminReportsPage() {
  const [membersSummary, setMembersSummary] = useState<
    MemberStatusSummary[]
  >([]);

  const [loanStats, setLoanStats] = useState<LoanStats | null>(null);
  const [savingStats, setSavingStats] = useState<SavingStats | null>(null);
  const [fdStats, setFdStats] = useState<FixedDepositStats | null>(null);
  const [payments, setPayments] = useState<RecentPayment[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /*
   * ============================================================
   * FETCH ADMIN REPORTS
   * ============================================================
   */
  const fetchReports = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const response = await fetch(
        "/api/admin_staff/admin/reports",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        }
      );

      /*
       * --------------------------------------------------------
       * Check response content type BEFORE response.json()
       * --------------------------------------------------------
       *
       * If Next.js returns a 404/500 HTML page, calling
       * response.json() immediately will cause:
       *
       * Unexpected token '<'
       *
       * or:
       *
       * Non-JSON server response
       */
      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await response.text();

        console.error(
          "Non-JSON server response:",
          text
        );

        throw new Error(
          `Server returned an unexpected response (${response.status}).`
        );
      }

      /*
       * --------------------------------------------------------
       * Parse JSON response
       * --------------------------------------------------------
       */
      const data = await response.json();

      console.log(
        "ADMIN REPORTS DATA:",
        data
      );

      /*
       * --------------------------------------------------------
       * Handle API errors
       * --------------------------------------------------------
       */
      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to load reports."
        );
      }

      /*
       * --------------------------------------------------------
       * Store database results in React state
       * --------------------------------------------------------
       */
      setMembersSummary(
        Array.isArray(data.membersSummary)
          ? data.membersSummary
          : []
      );

      setLoanStats(
        data.loanStats ?? null
      );

      setSavingStats(
        data.savingStats ?? null
      );

      setFdStats(
        data.fdStats ?? null
      );

      setPayments(
        Array.isArray(data.payments)
          ? data.payments
          : []
      );

    } catch (err) {
      console.error(
        "Report loading error:",
        err
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Network connection error. Could not load report overview."
        );
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  /*
   * ============================================================
   * INITIAL LOAD
   * ============================================================
   */
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  /*
   * ============================================================
   * FORMAT CURRENCY
   * ============================================================
   */
  const formatCurrency = (
    value: number | string | null | undefined
  ) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "0.00";
    }

    const numericValue =
      typeof value === "string"
        ? Number.parseFloat(value)
        : value;

    if (Number.isNaN(numericValue)) {
      return "0.00";
    }

    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  };

  /*
   * ============================================================
   * FORMAT DATE
   * ============================================================
   */
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);

      if (Number.isNaN(date.getTime())) {
        return dateString;
      }

      return date.toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return dateString;
    }
  };

  /*
   * ============================================================
   * CAPITALIZE
   * ============================================================
   */
  const capitalize = (value: string) => {
    if (!value) return "";

    return (
      value.charAt(0).toUpperCase() +
      value.slice(1)
    );
  };

  /*
   * ============================================================
   * TOTAL MEMBERS
   * ============================================================
   */
  const totalMembers = membersSummary.reduce(
    (total, item) =>
      total + Number(item.count || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex -mt-28 flex-col font-sans">

      {/* =========================================================
          NAVBAR
      ========================================================= */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Logo / Portal */}
            <div className="flex items-center gap-3">
              <Link
                href="/admin_staff/staff/login"
                className="flex items-center gap-2"
              >
                <Image
                  src="/images/logo2.png"
                  alt="DCG Cooperative Logo"
                  width={140}
                  height={40}
                  className="h-9 w-auto object-contain"
                  priority
                />
              </Link>

              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white">
                <Shield className="h-3 w-3 text-emerald-400" />
                Staff Portal
              </span>
            </div>

            {/* Back button */}
            <Link
              href="/admin_staff/admin/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />

              <span className="hidden sm:inline">
                Back to Dashboard
              </span>

              <span className="sm:hidden">
                Back
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* =========================================================
          MAIN
      ========================================================= */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 mt-2 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">

          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div className="max-w-3xl space-y-3">

              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                <BarChart3 className="h-3.5 w-3.5" />
                Reports & Analytics
              </span>

              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Admin Reports Overview
              </h1>

              <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
                Comprehensive system analytics covering members, loans,
                savings, fixed deposits, and recent payment transactions.
              </p>

            </div>

            {/* Refresh */}
            <button
              type="button"
              onClick={() => fetchReports(true)}
              disabled={
                isRefreshing ||
                isLoading
              }
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isRefreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              {isRefreshing
                ? "Refreshing..."
                : "Refresh Reports"}
            </button>

          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800">

            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-100">
              !
            </div>

            <div>
              <p className="font-bold">
                Unable to load reports
              </p>

              <p className="mt-0.5 text-rose-700">
                {error}
              </p>
            </div>

          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-20 text-center shadow-sm">

            <Loader2 className="mx-auto mb-3 h-7 w-7 animate-spin text-emerald-600" />

            <p className="text-xs font-semibold text-slate-500">
              Loading report overview...
            </p>

            <p className="mt-1 text-[11px] text-slate-400">
              Gathering members, loans, savings and payment information.
            </p>

          </div>
        ) : (
          <>

            {/* =====================================================
                QUICK STATISTICS
            ===================================================== */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {/* Members */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Total Members
                    </p>

                    <p className="mt-2 font-mono text-2xl font-extrabold text-slate-900">
                      {totalMembers.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Users className="h-5 w-5" />
                  </div>

                </div>

                <p className="mt-3 text-[11px] text-slate-500">
                  Members across all account statuses
                </p>

              </div>

              {/* Loans */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Total Loans
                    </p>

                    <p className="mt-2 font-mono text-2xl font-extrabold text-slate-900">
                      {Number(
                        loanStats?.total_loans ?? 0
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CreditCard className="h-5 w-5" />
                  </div>

                </div>

                <p className="mt-3 font-mono text-xs font-bold text-emerald-700">
                  ₦
                  {formatCurrency(
                    loanStats?.total_amount
                  )}
                </p>

              </div>

              {/* Savings */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Total Savers
                    </p>

                    <p className="mt-2 font-mono text-2xl font-extrabold text-slate-900">
                      {Number(
                        savingStats?.total_savers ?? 0
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <PiggyBank className="h-5 w-5" />
                  </div>

                </div>

                <p className="mt-3 font-mono text-xs font-bold text-emerald-700">
                  ₦
                  {formatCurrency(
                    savingStats?.total_saved
                  )}
                </p>

              </div>

              {/* Fixed Deposits */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Fixed Deposits
                    </p>

                    <p className="mt-2 font-mono text-2xl font-extrabold text-slate-900">
                      {Number(
                        fdStats?.total_fds ?? 0
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Building2 className="h-5 w-5" />
                  </div>

                </div>

                <p className="mt-3 font-mono text-xs font-bold text-emerald-700">
                  ₦
                  {formatCurrency(
                    fdStats?.total_fd_amount
                  )}
                </p>

              </div>

            </div>

            {/* =====================================================
                REPORT SECTIONS
            ===================================================== */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

              {/* Member Status */}
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-5 flex items-center justify-between">

                  <div>

                    <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                      <Users className="h-4 w-4 text-emerald-600" />
                      Member Status Summary
                    </h2>

                    <p className="mt-1 text-[11px] text-slate-400">
                      Current membership distribution
                    </p>

                  </div>

                </div>

                {membersSummary.length > 0 ? (
                  <div className="overflow-hidden rounded-xl border border-slate-100">

                    <table className="w-full text-xs">

                      <thead className="bg-slate-50">

                        <tr className="border-b border-slate-100">

                          <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Status
                          </th>

                          <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Count
                          </th>

                        </tr>

                      </thead>

                      <tbody className="divide-y divide-slate-100">

                        {membersSummary.map(
                          (row, index) => (
                            <tr
                              key={`${row.status}-${index}`}
                              className="transition-colors hover:bg-slate-50"
                            >

                              <td className="px-4 py-3 font-semibold text-slate-700">
                                {capitalize(
                                  row.status
                                )}
                              </td>

                              <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                                {Number(
                                  row.count
                                ).toLocaleString()}
                              </td>

                            </tr>
                          )
                        )}

                      </tbody>

                    </table>

                  </div>
                ) : (
                  <EmptyState text="No member status data available." />
                )}

              </section>

              {/* Loan Summary */}
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

                <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  Loan Summary
                </h2>

                <p className="mt-1 text-[11px] text-slate-400">
                  Overall loan portfolio
                </p>

                <div className="mt-6 space-y-4">

                  <MetricRow
                    label="Total Loans"
                    value={Number(
                      loanStats?.total_loans ?? 0
                    ).toLocaleString()}
                  />

                  <MetricRow
                    label="Total Loan Amount"
                    value={`₦${formatCurrency(
                      loanStats?.total_amount
                    )}`}
                    valueClassName="text-emerald-700"
                  />

                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 p-4">

                  <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                    Loan portfolio overview
                  </div>

                </div>

              </section>

              {/* Savings Summary */}
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

                <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                  <PiggyBank className="h-4 w-4 text-emerald-600" />
                  Savings Summary
                </h2>

                <p className="mt-1 text-[11px] text-slate-400">
                  Member savings position
                </p>

                <div className="mt-6 space-y-4">

                  <MetricRow
                    label="Total Savers"
                    value={Number(
                      savingStats?.total_savers ?? 0
                    ).toLocaleString()}
                  />

                  <MetricRow
                    label="Total Saved Amount"
                    value={`₦${formatCurrency(
                      savingStats?.total_saved
                    )}`}
                    valueClassName="text-emerald-700"
                  />

                </div>

                <div className="mt-6 rounded-2xl bg-emerald-50 p-4">

                  <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-700">
                    <Wallet className="h-3.5 w-3.5" />
                    Current savings position
                  </div>

                </div>

              </section>

            </div>

            {/* =====================================================
                FIXED DEPOSIT
            ===================================================== */}
            {fdStats && (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                      <Building2 className="h-4 w-4 text-emerald-600" />
                      Fixed Deposit Summary
                    </h2>

                    <p className="mt-1 text-[11px] text-slate-400">
                      Current fixed deposit portfolio
                    </p>

                  </div>

                  <div className="rounded-xl bg-emerald-50 px-4 py-2 text-right">

                    <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">
                      Total FD Value
                    </p>

                    <p className="font-mono text-sm font-extrabold text-emerald-700">
                      ₦
                      {formatCurrency(
                        fdStats.total_fd_amount
                      )}
                    </p>

                  </div>

                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Total Fixed Deposits
                    </p>

                    <p className="mt-1 font-mono text-xl font-extrabold text-slate-900">
                      {Number(
                        fdStats.total_fds
                      ).toLocaleString()}
                    </p>

                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Total Amount Deposited
                    </p>

                    <p className="mt-1 font-mono text-xl font-extrabold text-emerald-700">
                      ₦
                      {formatCurrency(
                        fdStats.total_fd_amount
                      )}
                    </p>

                  </div>

                </div>

              </section>
            )}

            {/* =====================================================
                RECENT PAYMENTS
            ===================================================== */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

              <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                    <Receipt className="h-4 w-4 text-emerald-600" />
                    Recent Payments
                  </h2>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Latest payment transactions recorded in the system
                  </p>

                </div>

                <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">
                  Last {payments.length} transactions
                </span>

              </div>

              {payments.length > 0 ? (
                <div className="overflow-x-auto">

                  <table className="w-full min-w-[650px] text-xs">

                    <thead className="bg-slate-50">

                      <tr className="border-b border-slate-100">

                        <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Member
                        </th>

                        <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Amount Paid
                        </th>

                        <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Date
                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-slate-100">

                      {payments.map(
                        (payment) => (
                          <tr
                            key={payment.id}
                            className="transition-colors hover:bg-slate-50/70"
                          >

                            <td className="px-6 py-4">

                              <div className="font-bold text-slate-900">
                                {payment.full_name}
                              </div>

                              <div className="mt-0.5 text-[10px] text-slate-400">
                                Payment #{payment.id}
                              </div>

                            </td>

                            <td className="px-6 py-4">

                              <span className="font-mono font-extrabold text-emerald-700">
                                ₦
                                {formatCurrency(
                                  payment.amount_paid
                                )}
                              </span>

                            </td>

                            <td className="px-6 py-4 text-right">

                              <span className="inline-flex items-center gap-1 text-slate-500">

                                <Calendar className="h-3 w-3 text-slate-400" />

                                {formatDate(
                                  payment.created_at
                                )}

                              </span>

                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>
              ) : (
                <div className="p-12 text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <Receipt className="h-6 w-6" />
                  </div>

                  <p className="mt-3 text-xs font-semibold text-slate-500">
                    No payment transactions recorded.
                  </p>

                </div>
              )}

            </section>

          </>
        )}

      </main>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">

        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">

          <Link
            href="/admin_staff/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 transition-colors hover:text-emerald-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Staff Dashboard
          </Link>

          <p className="mt-2 text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} DCG Multipurpose Cooperative
            Society Ltd. All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  );
}

/* =============================================================
   REUSABLE COMPONENTS
============================================================= */

function MetricRow({
  label,
  value,
  valueClassName = "text-slate-900",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-slate-100 pb-4">

      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>

      <strong
        className={`font-mono text-base font-extrabold ${valueClassName}`}
      >
        {value}
      </strong>

    </div>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-6 text-center">

      <Users className="mx-auto h-6 w-6 text-slate-300" />

      <p className="mt-2 text-[11px] font-medium text-slate-400">
        {text}
      </p>

    </div>
  );
}
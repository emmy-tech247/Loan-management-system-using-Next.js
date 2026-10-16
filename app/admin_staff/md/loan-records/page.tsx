"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  CircleDollarSign,
  Clock,
  CreditCard,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";

/**
 * ==============================================================
 * Types
 * ==============================================================
 */

type FilterType = "all" | "day" | "month" | "3months";

type Loan = {
  loan_id: number;
  member_id: number;
  full_name: string;
  loan_amount: number;
  interest_rate: number;
  start_date: string;
  end_date: string;
  loan_status: string;
  purpose: string | null;
  guarantor_name: string | null;
  monthly_repayment: number;
  amount_paid: number;
  loan_balance: number;
};

type Summary = {
  total_loan_given: number;
  total_repaid: number;
  total_outstanding: number;
  total_defaulted: number;
};

type ApiResponse = {
  success: boolean;
  filter: FilterType;
  summary: Summary;
  loans: Loan[];
  message?: string;
};

/**
 * ==============================================================
 * Helpers
 * ==============================================================
 */

const formatCurrency = (value: number | string) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (value: string | Date) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const getStatusClasses = (status: string) => {
  switch (status.toLowerCase()) {
    case "approved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "active":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "completed":
    case "paid":
      return "bg-slate-100 text-slate-700 border-slate-200";

    case "defaulted":
      return "bg-rose-50 text-rose-700 border-rose-200";

    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "rejected":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

/**
 * ==============================================================
 * Page
 * ==============================================================
 */

export default function AdminLoanRecordsPage() {
  const [filter, setFilter] = useState<FilterType>("all");

  const [loans, setLoans] = useState<Loan[]>([]);

  const [summary, setSummary] = useState<Summary>({
    total_loan_given: 0,
    total_repaid: 0,
    total_outstanding: 0,
    total_defaulted: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [refreshing, setRefreshing] = useState(false);

  /**
   * ------------------------------------------------------------
   * Fetch records
   * ------------------------------------------------------------
   */

  const fetchLoans = useCallback(async () => {
    try {
      setError("");

      const response = await fetch(
        `/api/admin_staff/md/loan-records?filter=${filter}`,
        {
          cache: "no-store",
        }
      );

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load loan records"
        );
      }

      setLoans(data.loans || []);

      setSummary(
        data.summary || {
          total_loan_given: 0,
          total_repaid: 0,
          total_outstanding: 0,
          total_defaulted: 0,
        }
      );
    } catch (err) {
      console.error("Loan records error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load loan records"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  /**
   * ------------------------------------------------------------
   * Search
   * ------------------------------------------------------------
   */

  const filteredLoans = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return loans;
    }

    return loans.filter((loan) => {
      return (
        String(loan.loan_id).includes(query) ||
        String(loan.member_id).includes(query) ||
        loan.full_name?.toLowerCase().includes(query) ||
        loan.loan_status?.toLowerCase().includes(query) ||
        loan.purpose?.toLowerCase().includes(query) ||
        loan.guarantor_name?.toLowerCase().includes(query)
      );
    });
  }, [loans, searchQuery]);

  /**
   * ------------------------------------------------------------
   * Refresh
   * ------------------------------------------------------------
   */

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLoans();
  };

  /**
   * ------------------------------------------------------------
   * CSV Export
   * ------------------------------------------------------------
   */

  const handleExcelExport = () => {
    if (!filteredLoans.length) return;

    const headers = [
      "Loan ID",
      "Member ID",
      "Full Name",
      "Loan Amount",
      "Interest Rate",
      "Start Date",
      "End Date",
      "Status",
      "Purpose",
      "Guarantor",
      "Monthly Repayment",
      "Amount Paid",
      "Loan Balance",
    ];

    const csvRows = filteredLoans.map((loan) => [
      loan.loan_id,
      loan.member_id,
      loan.full_name,
      loan.loan_amount,
      `${loan.interest_rate}%`,
      formatDate(loan.start_date),
      formatDate(loan.end_date),
      loan.loan_status,
      loan.purpose || "",
      loan.guarantor_name || "",
      loan.monthly_repayment,
      loan.amount_paid,
      loan.loan_balance,
    ]);

    const csv = [
      headers,
      ...csvRows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `loan-records-${filter}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /**
   * ------------------------------------------------------------
   * Render
   * ------------------------------------------------------------
   */

  return (
    <div className="min-h-screen bg-slate-50 font-sans -mt-28 text-slate-900">
      {/* ========================================================
          Navbar
      ======================================================== */}

      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/admin_staff/staff/login"
              className="flex items-center gap-2"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Wallet className="h-5 w-5 text-emerald-400" />
              </div>

              <div>
                <p className="text-sm font-extrabold text-slate-900">
                  Loan Management
                </p>

                <p className="text-[10px] font-medium text-slate-500">
                  Executive Portal
                </p>
              </div>
            </Link>
          </div>

          <Link
            href="/admin_staff/md/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">
              Back to Dashboard
            </span>
          </Link>
        </div>
      </nav>

      {/* ========================================================
          Main
      ======================================================== */}

      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 mt-2 sm:px-6 lg:px-8">
        {/* Header */}

        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
              <CreditCard className="h-3.5 w-3.5" />
              Loan Administration
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              All Loan Records
            </h1>

            <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
              Review loan disbursements, repayments, outstanding
              balances, guarantors, loan status, and default exposure
              across the cooperative.
            </p>
          </div>
        </section>

        {/* ======================================================
            Summary Cards
        ====================================================== */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Total Loan */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Total Loan Given Out
                </p>

                <p className="mt-2 text-xl font-extrabold text-slate-900">
                  {formatCurrency(summary.total_loan_given)}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
              <CircleDollarSign className="h-3.5 w-3.5" />
              Total approved loan value
            </div>
          </div>

          {/* Repaid */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Total Amount Repaid
                </p>

                <p className="mt-2 text-xl font-extrabold text-emerald-700">
                  {formatCurrency(summary.total_repaid)}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingDown className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
              <Wallet className="h-3.5 w-3.5" />
              Payments received
            </div>
          </div>

          {/* Outstanding */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Total Outstanding
                </p>

                <p className="mt-2 text-xl font-extrabold text-amber-600">
                  {formatCurrency(summary.total_outstanding)}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
              <Calendar className="h-3.5 w-3.5" />
              Current loan exposure
            </div>
          </div>

          {/* Defaulted */}

          <div className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Total Defaulted
                </p>

                <p className="mt-2 text-xl font-extrabold text-rose-600">
                  {formatCurrency(summary.total_defaulted)}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <ShieldAlert className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-rose-400">
              <ShieldAlert className="h-3.5 w-3.5" />
              Defaulted loan exposure
            </div>
          </div>
        </section>

        {/* ======================================================
            Controls
        ====================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Filter */}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label
                htmlFor="loan-filter"
                className="text-xs font-bold text-slate-600"
              >
                Filter by:
              </label>

              <div className="relative">
                <select
                  id="loan-filter"
                  value={filter}
                  onChange={(e) =>
                    setFilter(e.target.value as FilterType)
                  }
                  className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3 pr-10 text-xs font-bold text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="all">All Loans</option>
                  <option value="day">Today</option>
                  <option value="month">This Month</option>
                  <option value="3months">
                    Last 3 Months
                  </option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Search */}

            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="Search loan, member, guarantor..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Actions */}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={handleExcelExport}
                disabled={!filteredLoans.length}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>
        </section>

        {/* ======================================================
            Error
        ====================================================== */}

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />

              <div>
                <p className="text-sm font-bold text-rose-800">
                  Unable to load loan records
                </p>

                <p className="mt-1 text-xs text-rose-600">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================
            Loading
        ====================================================== */}

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />

            <p className="mt-4 text-sm font-bold text-slate-700">
              Loading loan records...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Please wait while the financial records are retrieved.
            </p>
          </div>
        ) : (
          <>
            {/* ==================================================
                Table Header
            ================================================== */}

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">
                    Loan Records
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Showing{" "}
                    <span className="font-bold text-slate-700">
                      {filteredLoans.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-slate-700">
                      {loans.length}
                    </span>{" "}
                    records
                  </p>
                </div>

                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600">
                  <Users className="h-3.5 w-3.5" />
                  {loans.length} Loans
                </div>
              </div>

              {/* ==================================================
                  Responsive Table
              ================================================== */}

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1500px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="whitespace-nowrap px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                        Loan ID
                      </th>

                      <th className="whitespace-nowrap px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                        Member
                      </th>

                      <th className="whitespace-nowrap px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                        Loan Amount
                      </th>

                      <th className="whitespace-nowrap px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                        Interest
                      </th>

                      <th className="whitespace-nowrap px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                        Start Date
                      </th>

                      <th className="whitespace-nowrap px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                        End Date
                      </th>

                      <th className="whitespace-nowrap px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="whitespace-nowrap px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                        Purpose
                      </th>

                      <th className="whitespace-nowrap px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                        Guarantor
                      </th>

                      <th className="whitespace-nowrap px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                        Monthly Repayment
                      </th>

                      <th className="whitespace-nowrap px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                        Amount Paid
                      </th>

                      <th className="whitespace-nowrap px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                        Balance
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredLoans.length > 0 ? (
                      filteredLoans.map((loan) => (
                        <tr
                          key={loan.loan_id}
                          className="transition-colors hover:bg-slate-50/80"
                        >
                          {/* Loan ID */}

                          <td className="px-4 py-4">
                            <span className="font-mono text-xs font-bold text-slate-700">
                              #{loan.loan_id}
                            </span>
                          </td>

                          {/* Member */}

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                <UserRound className="h-4 w-4" />
                              </div>

                              <div>
                                <p className="whitespace-nowrap text-xs font-bold text-slate-900">
                                  {loan.full_name}
                                </p>

                                <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                                  Member #{loan.member_id}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Loan Amount */}

                          <td className="whitespace-nowrap px-4 py-4 text-xs font-bold text-slate-900">
                            {formatCurrency(loan.loan_amount)}
                          </td>

                          {/* Interest */}

                          <td className="whitespace-nowrap px-4 py-4">
                            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                              {loan.interest_rate}%
                            </span>
                          </td>

                          {/* Start */}

                          <td className="whitespace-nowrap px-4 py-4 text-xs font-medium text-slate-600">
                            {formatDate(loan.start_date)}
                          </td>

                          {/* End */}

                          <td className="whitespace-nowrap px-4 py-4 text-xs font-medium text-slate-600">
                            {formatDate(loan.end_date)}
                          </td>

                          {/* Status */}

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-extrabold capitalize ${getStatusClasses(
                                loan.loan_status
                              )}`}
                            >
                              {loan.loan_status}
                            </span>
                          </td>

                          {/* Purpose */}

                          <td className="max-w-[180px] px-4 py-4">
                            <p className="truncate text-xs font-medium text-slate-600">
                              {loan.purpose || "—"}
                            </p>
                          </td>

                          {/* Guarantor */}

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                <Users className="h-3.5 w-3.5" />
                              </div>

                              <span className="whitespace-nowrap text-xs font-semibold text-slate-700">
                                {loan.guarantor_name || "—"}
                              </span>
                            </div>
                          </td>

                          {/* Monthly Repayment */}

                          <td className="whitespace-nowrap px-4 py-4 text-xs font-bold text-slate-700">
                            {formatCurrency(
                              loan.monthly_repayment
                            )}
                          </td>

                          {/* Amount Paid */}

                          <td className="whitespace-nowrap px-4 py-4 text-xs font-bold text-emerald-700">
                            {formatCurrency(loan.amount_paid)}
                          </td>

                          {/* Balance */}

                          <td className="whitespace-nowrap px-4 py-4">
                            <span
                              className={`text-xs font-extrabold ${
                                Number(loan.loan_balance) > 0
                                  ? "text-amber-600"
                                  : "text-emerald-600"
                              }`}
                            >
                              {formatCurrency(loan.loan_balance)}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={13}
                          className="px-6 py-16 text-center"
                        >
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                            <Search className="h-6 w-6" />
                          </div>

                          <h3 className="mt-4 text-sm font-extrabold text-slate-900">
                            No loan records found
                          </h3>

                          <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                            No loan records match the selected filter
                            or search query.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>

      {/* ========================================================
          Footer
      ======================================================== */}

      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} DCG Multipurpose
            Cooperative Society Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Landmark,
  Search,
  RefreshCw,
  Shield,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  AlertTriangle,
  XCircle,
  Wallet,
  Percent,
} from "lucide-react";

type FilterType = "all" | "day" | "month" | "3months";

interface Loan {
  loan_id: number;
  member_id: number;
  full_name: string;
  loan_amount: number;
  interest_rate: number;
  start_date: string;
  end_date: string;
  loan_status: string;
  purpose: string;
  guarantor_name: string;
  monthly_repayment: number;
  amount_paid: number;
  loan_balance: number;
}

interface Summary {
  total_loan_given: number;
  total_repaid: number;
  total_outstanding: number;
  total_defaulted: number;
}

const emptySummary: Summary = {
  total_loan_given: 0,
  total_repaid: 0,
  total_outstanding: 0,
  total_defaulted: 0,
};

export default function AdminLoansPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [loans, setLoans] = useState<Loan[]>([]);
  const [summary, setSummary] = useState<Summary>(emptySummary);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLoans = async (selectedFilter: FilterType) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin_staff/md/loans?filter=${selectedFilter}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch loan records");
      }

      setLoans(data.loans || []);
      setSummary(data.summary || emptySummary);
    } catch (err) {
      console.error("Loan records error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load loan records."
      );

      setLoans([]);
      setSummary(emptySummary);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans(filter);
  }, [filter]);

  const filteredLoans = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

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

  const formatMoney = (value: number | string) => {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (value: string) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusConfig = (status: string) => {
    const normalized = status?.toLowerCase();

    switch (normalized) {
      case "approved":
        return {
          label: "Approved",
          className:
            "border-blue-200 bg-blue-50 text-blue-700",
          icon: CheckCircle2,
        };

      case "active":
        return {
          label: "Active",
          className:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
          icon: TrendingUp,
        };

      case "completed":
        return {
          label: "Completed",
          className:
            "border-green-200 bg-green-50 text-green-700",
          icon: CheckCircle2,
        };

      case "pending":
        return {
          label: "Pending",
          className:
            "border-amber-200 bg-amber-50 text-amber-700",
          icon: Clock3,
        };

      case "defaulted":
        return {
          label: "Defaulted",
          className:
            "border-rose-200 bg-rose-50 text-rose-700",
          icon: AlertTriangle,
        };

      case "rejected":
        return {
          label: "Rejected",
          className:
            "border-red-200 bg-red-50 text-red-700",
          icon: XCircle,
        };

      default:
        return {
          label:
            status?.charAt(0).toUpperCase() +
              status?.slice(1) || "Unknown",
          className:
            "border-slate-200 bg-slate-100 text-slate-600",
          icon: Landmark,
        };
    }
  };

  const exportUrl = (type: "pdf" | "excel") => {
    return `/api/admin_staff/md/loans/export?filter=${filter}&type=${type}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo / Title */}
            <div className="flex items-center gap-3">
              <Link
                href="/admin_staff/staff/login"
                className="flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-emerald-400">
                  <Landmark className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-extrabold text-slate-900">
                    Loan Records
                  </p>

                  <p className="hidden text-[10px] font-medium text-slate-400 sm:block">
                    Executive Financial Operations
                  </p>
                </div>
              </Link>

              <span className="hidden items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white md:inline-flex">
                <Shield className="h-3 w-3 text-emerald-400" />
                Executive Portal
              </span>
            </div>

            {/* Dashboard button */}
            <Link
              href="/admin_staff/md/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">
                MD Dashboard
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Wallet className="h-3.5 w-3.5" />
              Loan Management
            </span>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              All Loan Records
            </h1>

            <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
              Monitor loan disbursements, repayments, outstanding balances,
              defaulted loans, guarantors and repayment schedules.
            </p>
          </div>
        </section>

        {/* Summary Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Total Given */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Total Loan Given Out
                </p>

                <p className="mt-2 text-xl font-extrabold text-slate-900">
                  ₦{formatMoney(summary.total_loan_given)}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-[10px] font-semibold text-blue-600">
              <TrendingUp className="h-3.5 w-3.5" />
              Total disbursement value
            </div>
          </div>

          {/* Repaid */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Total Amount Repaid
                </p>

                <p className="mt-2 text-xl font-extrabold text-slate-900">
                  ₦{formatMoney(summary.total_repaid)}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingDown className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Total repayment value
            </div>
          </div>

          {/* Outstanding */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Total Outstanding Loan
                </p>

                <p className="mt-2 text-xl font-extrabold text-slate-900">
                  ₦{formatMoney(summary.total_outstanding)}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock3 className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-[10px] font-semibold text-amber-600">
              <Wallet className="h-3.5 w-3.5" />
              Current outstanding balance
            </div>
          </div>

          {/* Defaulted */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Total Defaulted Amount
                </p>

                <p className="mt-2 text-xl font-extrabold text-rose-600">
                  ₦{formatMoney(summary.total_defaulted)}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-[10px] font-semibold text-rose-600">
              <AlertTriangle className="h-3.5 w-3.5" />
              Defaulted loan exposure
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            {/* Filter tabs */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-slate-100 p-1">
              <div className="mr-1 hidden items-center gap-1.5 px-2 text-xs font-bold text-slate-500 sm:flex">
                <Filter className="h-3.5 w-3.5" />
                Period
              </div>

              {[
                { id: "all", label: "All" },
                { id: "day", label: "Today" },
                { id: "month", label: "This Month" },
                { id: "3months", label: "Last 3 Months" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() =>
                    setFilter(item.id as FilterType)
                  }
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    filter === item.id
                      ? "bg-white font-bold text-slate-900 shadow-xs"
                      : "text-slate-500 hover:bg-white/60 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Search / Refresh */}
            <div className="flex w-full gap-2 xl:w-auto">
              <div className="relative w-full xl:w-80">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  placeholder="Search loan records..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <button
                type="button"
                onClick={() => fetchLoans(filter)}
                disabled={loading}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loading ? "animate-spin" : ""
                  }`}
                />

                <span className="hidden sm:inline">
                  Refresh
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Export / Record Count */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">
              Loan Records
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              {loading
                ? "Loading loan records..."
                : `${filteredLoans.length} loan${
                    filteredLoans.length === 1 ? "" : "s"
                  } found`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={exportUrl("pdf")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100"
            >
              <FileText className="h-4 w-4" />
              Export PDF
            </a>

            <a
              href={exportUrl("excel")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export Excel
            </a>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
            <XCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        {/* Loan Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1500px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Loan ID
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Member
                  </th>

                  <th className="px-5 py-4 text-right text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Loan Amount
                  </th>

                  <th className="px-5 py-4 text-right text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Interest
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Start Date
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    End Date
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Purpose
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Guarantor
                  </th>

                  <th className="px-5 py-4 text-right text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Monthly Repayment
                  </th>

                  <th className="px-5 py-4 text-right text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Amount Paid
                  </th>

                  <th className="px-5 py-4 text-right text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Balance
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 7 }).map((_, index) => (
                    <tr key={index}>
                      {Array.from({ length: 12 }).map(
                        (__, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-5 py-5"
                          >
                            <div className="h-4 animate-pulse rounded bg-slate-100" />
                          </td>
                        )
                      )}
                    </tr>
                  ))
                ) : filteredLoans.length > 0 ? (
                  filteredLoans.map((loan) => {
                    const status =
                      getStatusConfig(loan.loan_status);

                    const StatusIcon = status.icon;

                    return (
                      <tr
                        key={loan.loan_id}
                        className="group transition-colors hover:bg-slate-50"
                      >
                        {/* Loan ID */}
                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                              <Landmark className="h-3.5 w-3.5" />
                            </div>

                            <span className="text-xs font-extrabold text-slate-700">
                              #{loan.loan_id}
                            </span>
                          </div>
                        </td>

                        {/* Member */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                              <User className="h-4 w-4" />
                            </div>

                            <div>
                              <p className="text-xs font-bold text-slate-900">
                                {loan.full_name ||
                                  "Unknown Member"}
                              </p>

                              <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                                Member #{loan.member_id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Loan Amount */}
                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          <span className="text-xs font-extrabold text-slate-900">
                            ₦{formatMoney(loan.loan_amount)}
                          </span>
                        </td>

                        {/* Interest */}
                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-2 py-1 text-[10px] font-bold text-purple-700">
                            <Percent className="h-3 w-3" />
                            {loan.interest_rate}%
                          </span>
                        </td>

                        {/* Start Date */}
                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-3.5 w-3.5 text-slate-400" />

                            <span className="text-xs font-medium text-slate-600">
                              {formatDate(loan.start_date)}
                            </span>
                          </div>
                        </td>

                        {/* End Date */}
                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-3.5 w-3.5 text-slate-400" />

                            <span className="text-xs font-medium text-slate-600">
                              {formatDate(loan.end_date)}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${status.className}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </span>
                        </td>

                        {/* Purpose */}
                        <td className="max-w-[180px] px-5 py-4">
                          <span
                            className="block truncate text-xs font-medium text-slate-600"
                            title={loan.purpose}
                          >
                            {loan.purpose || "—"}
                          </span>
                        </td>

                        {/* Guarantor */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-3.5 w-3.5 text-slate-400" />

                            <span className="text-xs font-medium text-slate-600">
                              {loan.guarantor_name || "—"}
                            </span>
                          </div>
                        </td>

                        {/* Monthly repayment */}
                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          <span className="text-xs font-bold text-slate-700">
                            ₦
                            {formatMoney(
                              loan.monthly_repayment
                            )}
                          </span>
                        </td>

                        {/* Amount paid */}
                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          <span className="text-xs font-bold text-emerald-700">
                            ₦{formatMoney(loan.amount_paid)}
                          </span>
                        </td>

                        {/* Balance */}
                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          <span
                            className={`text-xs font-extrabold ${
                              Number(loan.loan_balance) > 0
                                ? "text-rose-600"
                                : "text-emerald-600"
                            }`}
                          >
                            ₦{formatMoney(loan.loan_balance)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={12}
                      className="px-5 py-16 text-center"
                    >
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <Search className="h-6 w-6" />
                      </div>

                      <h3 className="mt-4 text-sm font-bold text-slate-900">
                        No loan records found
                      </h3>

                      <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                        No loan records match your selected period
                        or search query.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Back */}
        <div className="flex justify-center pt-2">
          <Link
            href="/admin_staff/md/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to MD Dashboard
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} DCG Multipurpose Cooperative
            Society Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
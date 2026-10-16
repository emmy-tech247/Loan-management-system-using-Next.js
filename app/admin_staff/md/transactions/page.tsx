"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  Filter,
  RefreshCw,
  Search,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Landmark,
  CalendarDays,
  User,
  Hash,
  Receipt,
} from "lucide-react";

type FilterType = "all" | "daily" | "monthly" | "3months";

interface Transaction {
  transaction_id: number;
  member_id: number;
  full_name: string | null;
  transaction_type: string;
  amount: number;
  transaction_date: string;
  reference: string;
}

export default function AdminTransactionsPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  // ============================================================
  // FETCH FINANCIAL TRANSACTIONS
  // ============================================================

  const fetchTransactions = async (
    selectedFilter: FilterType
  ) => {
    try {
      setLoading(true);
      setError("");

      // ============================================================
      // CONVERT FRONTEND FILTER NAMES TO API FILTER NAMES
      // ============================================================

      const apiFilter =
        selectedFilter === "daily"
          ? "daily"
          : selectedFilter === "monthly"
          ? "monthly"
          : selectedFilter === "3months"
          ? "3months"
          : "all";

      const url =
        `/api/admin_staff/md/transactions` +
        `?filter=${encodeURIComponent(apiFilter)}`;

      console.log(
        "Fetching financial transactions:",
        url
      );

      // ============================================================
      // FETCH API
      // ============================================================

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      // ============================================================
      // CHECK RESPONSE CONTENT TYPE
      // ============================================================

      const contentType =
        response.headers.get("content-type") || "";

      console.log(
        "Transactions API status:",
        response.status
      );

      console.log(
        "Transactions API content type:",
        contentType
      );

      // ============================================================
      // HANDLE NON-JSON RESPONSE
      // ============================================================

      if (
        !contentType
          .toLowerCase()
          .includes("application/json")
      ) {
        const text = await response.text();

        console.error(
          "Non-JSON transactions response:",
          text.substring(0, 500)
        );

        if (response.status === 404) {
          throw new Error(
            "Financial transactions API was not found. Check that app/api/admin_staff/md/transactions/route.ts exists."
          );
        }

        if (response.status === 401) {
          throw new Error(
            "Your staff login session has expired. Please log in again."
          );
        }

        if (response.status === 403) {
          throw new Error(
            "You are not authorized to view financial transactions."
          );
        }

        if (response.status === 405) {
          throw new Error(
            "The financial transactions API does not support GET requests."
          );
        }

        throw new Error(
          `Server returned a non-JSON response (${response.status}).`
        );
      }

      // ============================================================
      // READ JSON
      // ============================================================

      const result = await response.json();

      console.log(
        "Financial Transactions API response:",
        result
      );

      // ============================================================
      // HANDLE HTTP ERRORS
      // ============================================================

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            `Failed to load financial transactions (${response.status}).`
        );
      }

      // ============================================================
      // VALIDATE RESPONSE
      // ============================================================

      if (
        !result ||
        result.success !== true
      ) {
        throw new Error(
          result?.message ||
            "Invalid response from financial transactions server."
        );
      }

      if (
        !Array.isArray(
          result.transactions
        )
      ) {
        throw new Error(
          "The server returned an invalid transactions list."
        );
      }

      // ============================================================
      // NORMALIZE TRANSACTION DATA
      // ============================================================

      const normalizedTransactions: Transaction[] =
        result.transactions.map(
          (transaction: any) => ({
            transaction_id: Number(
              transaction.transaction_id ?? 0
            ),

            member_id: Number(
              transaction.member_id ?? 0
            ),

            full_name:
              transaction.full_name ||
              "Unknown Member",

            transaction_type: String(
              transaction.transaction_type ||
                "unknown"
            ),

            amount: Number(
              transaction.amount ?? 0
            ),

            transaction_date:
              transaction.transaction_date ||
              transaction.created_at ||
              "",

            reference:
              transaction.reference ||
              "",
          })
        );

      setTransactions(
        normalizedTransactions
      );
    } catch (err) {
      console.error(
        "Financial transactions error:",
        err
      );

      setTransactions([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load financial transactions."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD TRANSACTIONS WHEN FILTER CHANGES
  // ============================================================

  useEffect(() => {
    fetchTransactions(filter);
  }, [filter]);

  // ============================================================
  // SEARCH FILTER
  // ============================================================

  const filteredTransactions =
    transactions.filter((transaction) => {
      const search =
        searchQuery.toLowerCase().trim();

      return (
        String(
          transaction.transaction_id
        ).includes(search) ||
        String(
          transaction.member_id
        ).includes(search) ||
        transaction.full_name
          ?.toLowerCase()
          .includes(search) ||
        transaction.transaction_type
          .toLowerCase()
          .includes(search) ||
        transaction.reference
          .toLowerCase()
          .includes(search)
      );
    });

  // ============================================================
  // FORMAT AMOUNT
  // ============================================================

  const formatAmount = (
    amount: number
  ) => {
    return new Intl.NumberFormat(
      "en-NG",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(amount);
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (
    date: string
  ) => {
    if (!date) {
      return "—";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleString(
      "en-NG",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  // ============================================================
  // TRANSACTION ICON
  // ============================================================

  const getTransactionIcon = (
    type: string
  ) => {
    switch (
      type.toLowerCase()
    ) {
      case "loan_disbursement":
        return ArrowUpCircle;

      case "loan_repayment":
        return ArrowDownCircle;

      case "fixed_deposit":
        return Landmark;

      case "savings":
        return Wallet;

      default:
        return Wallet;
    }
  };

  // ============================================================
  // TRANSACTION STYLE
  // ============================================================

  const getTransactionStyle = (
    type: string
  ) => {
    switch (
      type.toLowerCase()
    ) {
      case "loan_disbursement":
        return {
          wrapper:
            "bg-blue-50 text-blue-700 border-blue-100",
          badge:
            "bg-blue-50 text-blue-700 border-blue-200",
        };

      case "loan_repayment":
        return {
          wrapper:
            "bg-emerald-50 text-emerald-700 border-emerald-100",
          badge:
            "bg-emerald-50 text-emerald-700 border-emerald-200",
        };

      case "fixed_deposit":
        return {
          wrapper:
            "bg-purple-50 text-purple-700 border-purple-100",
          badge:
            "bg-purple-50 text-purple-700 border-purple-200",
        };

      case "savings":
        return {
          wrapper:
            "bg-amber-50 text-amber-700 border-amber-100",
          badge:
            "bg-amber-50 text-amber-700 border-amber-200",
        };

      default:
        return {
          wrapper:
            "bg-slate-100 text-slate-700 border-slate-200",
          badge:
            "bg-slate-100 text-slate-700 border-slate-200",
        };
    }
  };

  // ============================================================
  // FORMAT TRANSACTION TYPE
  // ============================================================

  const formatTransactionType = (
    type: string
  ) => {
    return type
      .replace(/_/g, " ")
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
  };

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50 font-sans -mt-28 text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/admin_staff/staff/login"
                className="flex items-center gap-2"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-emerald-400">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-extrabold text-slate-900">
                    Financial Transactions
                  </p>

                  <p className="hidden text-[10px] font-medium text-slate-400 sm:block">
                    Executive Financial Records
                  </p>
                </div>
              </Link>

              <span className="hidden items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white md:inline-flex">
                <Receipt className="h-3 w-3 text-emerald-400" />
                Financial Operations
              </span>
            </div>

            <Link
              href="/admin_staff/md/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <ArrowLeft className="h-4 w-4" />

              <span className="hidden sm:inline">
                Dashboard
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 mt-2 sm:px-6 lg:px-8">
        {/* Header */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">
          <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              <ShieldIcon />
              Financial Control Center
            </span>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Financial Transactions
            </h1>

            <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
              View savings, loan disbursements, loan
              repayments, and fixed deposit transactions
              across the cooperative society.
            </p>
          </div>
        </section>

        {/* Filter + Search */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-slate-100 p-1">
              <div className="mr-1 hidden items-center gap-1.5 px-2 text-xs font-bold text-slate-500 sm:flex">
                <Filter className="h-3.5 w-3.5" />
                Period
              </div>

              {[
                {
                  id: "all",
                  label: "All",
                },
                {
                  id: "daily",
                  label: "Today",
                },
                {
                  id: "monthly",
                  label: "This Month",
                },
                {
                  id: "3months",
                  label: "Last 3 Months",
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() =>
                    setFilter(
                      item.id as FilterType
                    )
                  }
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    filter === item.id
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:bg-white/60 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Search + Refresh */}
            <div className="flex w-full gap-2 lg:w-auto">
              <div className="relative w-full lg:w-80">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(
                      e.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <button
                onClick={() =>
                  fetchTransactions(filter)
                }
                disabled={loading}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loading
                      ? "animate-spin"
                      : ""
                  }`}
                />

                <span className="hidden sm:inline">
                  Refresh
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Download */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">
              Transaction Records
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              {loading
                ? "Loading records..."
                : `${filteredTransactions.length} transaction${
                    filteredTransactions.length ===
                    1
                      ? ""
                      : "s"
                  } found`}
            </p>
          </div>

          <a
            href={`/api/admin_staff/md/transactions/download?filter=${encodeURIComponent(
              filter
            )}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
          >
            <Download className="h-4 w-4" />
            Download Report
          </a>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        {/* Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    ID
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Member
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Type
                  </th>

                  <th className="px-5 py-4 text-right text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Amount
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Date
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Reference
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({
                    length: 6,
                  }).map((_, index) => (
                    <tr key={index}>
                      {Array.from({
                        length: 6,
                      }).map(
                        (
                          __,
                          cellIndex
                        ) => (
                          <td
                            key={
                              cellIndex
                            }
                            className="px-5 py-5"
                          >
                            <div className="h-4 animate-pulse rounded bg-slate-100" />
                          </td>
                        )
                      )}
                    </tr>
                  ))
                ) : filteredTransactions.length >
                  0 ? (
                  filteredTransactions.map(
                    (transaction) => {
                      const Icon =
                        getTransactionIcon(
                          transaction.transaction_type
                        );

                      const styles =
                        getTransactionStyle(
                          transaction.transaction_type
                        );

                      return (
                        <tr
                          key={`${transaction.transaction_type}-${transaction.transaction_id}`}
                          className="group transition-colors hover:bg-slate-50"
                        >
                          {/* ID */}
                          <td className="whitespace-nowrap px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                <Hash className="h-3.5 w-3.5" />
                              </div>

                              <span className="text-xs font-bold text-slate-700">
                                {
                                  transaction.transaction_id
                                }
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
                                  {transaction.full_name ||
                                    "Unknown Member"}
                                </p>

                                <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                                  Member #
                                  {
                                    transaction.member_id
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Type */}
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${styles.badge}`}
                            >
                              <Icon className="h-3 w-3" />

                              {formatTransactionType(
                                transaction.transaction_type
                              )}
                            </span>
                          </td>

                          {/* Amount */}
                          <td className="whitespace-nowrap px-5 py-4 text-right">
                            <span className="text-sm font-extrabold text-slate-900">
                              ₦
                              {formatAmount(
                                transaction.amount
                              )}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="whitespace-nowrap px-5 py-4">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-3.5 w-3.5 text-slate-400" />

                              <span className="text-xs font-medium text-slate-600">
                                {formatDate(
                                  transaction.transaction_date
                                )}
                              </span>
                            </div>
                          </td>

                          {/* Reference */}
                          <td className="px-5 py-4">
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-[10px] font-bold text-slate-600">
                              {transaction.reference ||
                                "—"}
                            </span>
                          </td>
                        </tr>
                      );
                    }
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center"
                    >
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <Search className="h-6 w-6" />
                      </div>

                      <h3 className="mt-4 text-sm font-bold text-slate-900">
                        No transactions found
                      </h3>

                      <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                        There are no financial
                        transactions matching the
                        selected period or search
                        query.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Back button */}
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
            © {new Date().getFullYear()} DCG
            Multipurpose Cooperative Society Ltd.
            All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ============================================================
// SHIELD ICON
// ============================================================

function ShieldIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />

      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

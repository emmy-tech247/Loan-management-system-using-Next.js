"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  Wallet,
  Download,
  RefreshCw,
  Search,
  CalendarDays,
  FileText,
  AlertTriangle,
  Loader2,
  TrendingUp,
  Landmark,
  PiggyBank,
  ArrowDownCircle,
} from "lucide-react";

type Transaction = {
  transaction_id: number;
  member_id: number;
  full_name: string | null;
  transaction_type: string;
  amount: number;
  transaction_date: string;
  reference: string;
};

type ApiResponse = {
  success: boolean;
  filter?: string;
  count?: number;
  totalAmount?: number;
  transactions?: Transaction[];
  message?: string;
};

const filters = [
  { id: "all", label: "All Transactions" },
  { id: "daily", label: "Today" },
  { id: "monthly", label: "This Month" },
  { id: "3months", label: "Last 3 Months" },
];

function formatTransactionType(type: string) {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getTypeStyle(type: string) {
  switch (type) {
    case "loan_disbursement":
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        icon: ArrowDownCircle,
      };

    case "loan_repayment":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        icon: TrendingUp,
      };

    case "fixed_deposit":
      return {
        bg: "bg-violet-50",
        text: "text-violet-700",
        border: "border-violet-200",
        icon: Landmark,
      };

    case "savings_deposit":
      return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: PiggyBank,
      };

    case "savings_withdrawal":
      return {
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
        icon: ArrowDownCircle,
      };

    case "savings":
    default:
      return {
        bg: "bg-slate-50",
        text: "text-slate-700",
        border: "border-slate-200",
        icon: PiggyBank,
      };
  }
}

export default function FinancialTransactionsPage() {
  const searchParams = useSearchParams();

  const currentFilter =
    searchParams.get("filter") || "all";

  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  /*
  ============================================================
  FETCH FINANCIAL TRANSACTIONS
  ============================================================
  */

  const fetchTransactions = async () => {
    try {
      setErrorMessage(null);

      const url = `/api/admin_staff/admin/transactions?filter=${encodeURIComponent(
        currentFilter
      )}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      // Read the response as TEXT first.
      // This prevents JSON.parse() from crashing when Next.js
      // returns an HTML error page.
      const rawResponse = await res.text();

      const contentType =
        res.headers.get("content-type") || "";

      console.log(
        "Transactions API status:",
        res.status
      );

      console.log(
        "Transactions API content-type:",
        contentType
      );

      console.log(
        "Transactions API response:",
        rawResponse
      );

      // If the server did not return JSON
      if (
        !contentType
          .toLowerCase()
          .includes("application/json")
      ) {
        throw new Error(
          `Server returned an unexpected response (${res.status}). ` +
            `Expected JSON but received ${
              contentType ||
              "unknown content type"
            }.`
        );
      }

      let data: ApiResponse;

      try {
        data =
          JSON.parse(
            rawResponse
          ) as ApiResponse;
      } catch (parseError) {
        console.error(
          "Invalid JSON returned by transactions API:",
          parseError
        );

        console.error(
          "Raw server response:",
          rawResponse
        );

        throw new Error(
          "The transactions server returned invalid JSON. Check the browser console and Next.js terminal for the actual server error."
        );
      }

      if (!res.ok) {
        throw new Error(
          data?.message ||
            `Failed to load transactions. Server returned ${res.status}.`
        );
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            "Failed to load financial transactions."
        );
      }

      setTransactions(
        data.transactions || []
      );

    } catch (error) {
      console.error(
        "FETCH TRANSACTIONS ERROR:",
        error
      );

      setTransactions([]);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load financial transactions."
      );

    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);

    fetchTransactions();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilter]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTransactions();
  };

  /*
  ============================================================
  SEARCH / FILTER TRANSACTIONS
  ============================================================
  */

  const filteredTransactions =
    transactions.filter((transaction) => {
      const query =
        searchQuery.toLowerCase().trim();

      if (!query) {
        return true;
      }

      return (
        String(
          transaction.transaction_id
        ).includes(query) ||

        String(
          transaction.member_id
        ).includes(query) ||

        transaction.full_name
          ?.toLowerCase()
          .includes(query) ||

        transaction.transaction_type
          .toLowerCase()
          .includes(query) ||

        transaction.reference
          .toLowerCase()
          .includes(query)
      );
    });

  /*
  ============================================================
  TOTAL AMOUNT
  ============================================================
  */

  const totalAmount =
    filteredTransactions.reduce(
      (sum, transaction) =>
        sum +
        Number(
          transaction.amount || 0
        ),
      0
    );

  /*
  ============================================================
  FORMAT CURRENCY
  ============================================================
  */

  const formatAmount = (
    amount: number
  ) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);

  /*
  ============================================================
  FORMAT DATE
  ============================================================
  */

  const formatDate = (
    date: string
  ) => {
    if (!date) {
      return "-";
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
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans -mt-28 text-slate-900">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="flex h-16 items-center justify-between gap-4">

            <div className="flex items-center gap-3 min-w-0">

              <Link
                href="/staff_login/login"
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

              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold text-white">

                <Shield className="h-3 w-3 text-emerald-400" />

                Executive Portal

              </span>

            </div>

            <div className="flex items-center gap-2">

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors disabled:opacity-50"
              >

                <RefreshCw
                  className={`h-4 w-4 ${
                    isRefreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />

                <span className="hidden sm:inline">
                  Refresh
                </span>

              </button>

              <Link
                href="/admin_staff/admin/dashboard"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >

                <ArrowLeft className="h-4 w-4" />

                <span className="hidden sm:inline">
                  Dashboard
                </span>

              </Link>

            </div>

          </div>

        </div>

      </nav>

      {/* Main */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 mt-2 sm:px-6 lg:px-8 space-y-6">

        {/* Header Banner */}
        <section className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">

          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div className="space-y-3 max-w-2xl">

              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">

                <Wallet className="h-3.5 w-3.5" />

                Financial Operations

              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Financial Transactions
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Review savings, loan disbursements,
                loan repayments and fixed deposit
                transactions across the cooperative.
              </p>

            </div>

            <div className="shrink-0 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-5 py-4">

              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                Records Found
              </p>

              <p className="text-2xl font-extrabold text-white">
                {filteredTransactions.length}
              </p>

            </div>

          </div>

        </section>

        {/* Filter + Search */}
        <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/60 rounded-2xl text-xs font-semibold text-slate-600">

            {filters.map(
              (filter) => (
                <Link
                  key={filter.id}
                  href={`/admin_staff/md/transactions?filter=${filter.id}`}
                  className={`px-3 py-2 rounded-xl transition-all ${
                    currentFilter ===
                    filter.id
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  {filter.label}
                </Link>
              )
            )}

          </div>

          <div className="flex flex-col sm:flex-row gap-3">

            <div className="relative w-full sm:w-72">

              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-xs"
              />

            </div>

            <a
              href={`/api/admin_staff/md/transactions/download?filter=${encodeURIComponent(
                currentFilter
              )}`}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
            >

              <Download className="h-4 w-4" />

              Download Report

            </a>

          </div>

        </section>

        {/* Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Transactions
                </p>

                <p className="mt-1 text-xl font-extrabold text-slate-900">
                  {filteredTransactions.length}
                </p>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">

                <FileText className="h-5 w-5" />

              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Total Amount
                </p>

                <p className="mt-1 text-lg font-extrabold text-emerald-700">
                  {formatAmount(
                    totalAmount
                  )}
                </p>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">

                <TrendingUp className="h-5 w-5" />

              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Current Filter
                </p>

                <p className="mt-1 text-sm font-extrabold text-slate-900">

                  {filters.find(
                    (f) =>
                      f.id ===
                      currentFilter
                  )?.label ||
                    "All Transactions"}

                </p>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

                <CalendarDays className="h-5 w-5" />

              </div>

            </div>

          </div>

        </section>

        {/* Error */}
        {errorMessage && (

          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 flex items-center gap-2">

            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />

            {errorMessage}

          </div>

        )}

        {/* Transactions Table */}
        <section className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">

          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">

            <div>

              <h2 className="text-sm font-extrabold text-slate-900">
                Transaction Records
              </h2>

              <p className="text-[11px] text-slate-400 mt-0.5">
                Latest financial activity
              </p>

            </div>

            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">

              <Wallet className="h-4 w-4 text-emerald-600" />

              {filteredTransactions.length} records

            </div>

          </div>

          {isLoading ? (

            <div className="p-20 text-center">

              <Loader2 className="h-7 w-7 animate-spin mx-auto mb-3 text-emerald-600" />

              <p className="text-xs font-medium text-slate-400">
                Loading financial transactions...
              </p>

            </div>

          ) : filteredTransactions.length > 0 ? (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[950px]">

                <thead>

                  <tr className="bg-slate-50 border-b border-slate-200">

                    <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                      ID
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                      Member ID
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                      Member
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                      Type
                    </th>

                    <th className="px-5 py-3 text-right text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                      Amount
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                      Date
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                      Reference
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredTransactions.map(
                    (transaction) => {

                      const typeStyle =
                        getTypeStyle(
                          transaction.transaction_type
                        );

                      const TypeIcon =
                        typeStyle.icon;

                      return (

                        <tr
                          key={`${transaction.transaction_type}-${transaction.transaction_id}`}
                          className="hover:bg-slate-50/80 transition-colors"
                        >

                          <td className="px-5 py-4 text-xs font-bold text-slate-700">
                            #{transaction.transaction_id}
                          </td>

                          <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                            {transaction.member_id}
                          </td>

                          <td className="px-5 py-4">

                            <div className="font-bold text-xs text-slate-900">
                              {transaction.full_name ||
                                "Unknown Member"}
                            </div>

                          </td>

                          <td className="px-5 py-4">

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}
                            >

                              <TypeIcon className="h-3 w-3" />

                              {formatTransactionType(
                                transaction.transaction_type
                              )}

                            </span>

                          </td>

                          <td className="px-5 py-4 text-right">

                            <span className="text-xs font-extrabold text-slate-900">

                              {formatAmount(
                                Number(
                                  transaction.amount
                                )
                              )}

                            </span>

                          </td>

                          <td className="px-5 py-4">

                            <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">

                              {formatDate(
                                transaction.transaction_date
                              )}

                            </span>

                          </td>

                          <td className="px-5 py-4">

                            <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">

                              {transaction.reference}

                            </span>

                          </td>

                        </tr>

                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          ) : (

            <div className="p-16 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                <FileText className="h-6 w-6" />

              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-900">
                No records found
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                No financial transactions match
                the selected filter or search
                criteria.
              </p>

            </div>

          )}

        </section>

        {/* Back Button */}
        <div className="flex justify-center">

          <Link
            href="/admin_staff/md/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-xs"
          >

            <ArrowLeft className="h-4 w-4" />

            Back to Admin Dashboard

          </Link>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">

        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">

          <p className="text-xs text-slate-500">

            &copy;{" "}
            {new Date().getFullYear()}{" "}
            DCG Multipurpose Cooperative
            Society Ltd. All rights reserved.

          </p>

        </div>

      </footer>

    </div>
  );
}

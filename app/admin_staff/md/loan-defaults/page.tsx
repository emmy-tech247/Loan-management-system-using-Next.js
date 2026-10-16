"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import Image from "next/image";

import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  Users,
  WalletCards,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================

type LoanRecord = {
  member_id: number;
  full_name: string;
  loan_id: number;
  loan_amount: number;
  amount_paid: number;
  start_date: string | null;
  due_date: string | null;
  loan_category: string;
  outstanding: number;
  days_overdue: number;
  default_charge: number;
  daily_growth: number;
  total_due: number;
};

type Totals = {
  loanCollected: number;
  outstanding: number;
  defaultCharges: number;
  dueWithCharges: number;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  loans?: LoanRecord[];
  totals?: Totals;
  count?: number;
};

// ============================================================
// DEFAULT TOTALS
// ============================================================

const defaultTotals: Totals = {
  loanCollected: 0,
  outstanding: 0,
  defaultCharges: 0,
  dueWithCharges: 0,
};

// ============================================================
// HELPERS
// ============================================================

function formatCurrency(value: number) {
  return `₦${Number(value || 0).toLocaleString(
    "en-NG",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}

function formatDate(
  value: string | null
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-NG",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatCategory(
  category: string
) {
  const normalized = category
    .replace(/[_-]+/g, " ")
    .trim();

  if (!normalized) {
    return "Unknown";
  }

  return normalized
    .split(" ")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
    )
    .join(" ");
}

// ============================================================
// PAGE
// ============================================================

export default function LoanDefaultsPage() {
  const [loans, setLoans] =
    useState<LoanRecord[]>([]);

  const [totals, setTotals] =
    useState<Totals>(defaultTotals);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  // ==========================================================
  // FETCH LOANS
  // ==========================================================

  const fetchLoans = useCallback(
    async (
      isRefresh = false
    ) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await fetch(
          "/api/admin_staff/md/loan-defaults",
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept:
                "application/json",
            },
            cache: "no-store",
          }
        );

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        // ------------------------------------------------------
        // NON-JSON RESPONSE
        // ------------------------------------------------------

        if (
          !contentType.includes(
            "application/json"
          )
        ) {
          const text =
            await response.text();

          console.error(
            "LOAN DEFAULTS API RETURNED NON-JSON:",
            {
              status:
                response.status,
              contentType,
              response: text,
            }
          );

          throw new Error(
            `Unexpected server response (${response.status}).`
          );
        }

        // ------------------------------------------------------
        // JSON RESPONSE
        // ------------------------------------------------------

        const data =
          (await response.json()) as ApiResponse;

        console.log(
          "LOAN DEFAULTS API RESPONSE:",
          {
            status:
              response.status,
            data,
          }
        );

        // ------------------------------------------------------
        // AUTH ERRORS
        // ------------------------------------------------------

        if (
          response.status === 401
        ) {
          throw new Error(
            data?.message ||
              "Your staff login session has expired. Please log in again."
          );
        }

        if (
          response.status === 403
        ) {
          throw new Error(
            data?.message ||
              "Access denied. You are not authorized to view loan defaults."
          );
        }

        if (
          response.status === 404
        ) {
          throw new Error(
            data?.message ||
              "Loan records API was not found. Please check the API route."
          );
        }

        // ------------------------------------------------------
        // SERVER ERROR
        // ------------------------------------------------------

        if (
          response.status >= 500
        ) {
          throw new Error(
            data?.error ||
              data?.message ||
              "The server encountered an error while loading loan records."
          );
        }

        // ------------------------------------------------------
        // OTHER HTTP ERROR
        // ------------------------------------------------------

        if (!response.ok) {
          throw new Error(
            data?.message ||
              `Failed to load loan records. Server returned ${response.status}.`
          );
        }

        // ------------------------------------------------------
        // APPLICATION ERROR
        // ------------------------------------------------------

        if (
          data?.success !== true
        ) {
          throw new Error(
            data?.message ||
              "The server did not return valid loan records."
          );
        }

        // ------------------------------------------------------
        // STORE LOANS
        // ------------------------------------------------------

        setLoans(
          Array.isArray(
            data.loans
          )
            ? data.loans
            : []
        );

        // ------------------------------------------------------
        // STORE TOTALS
        // ------------------------------------------------------

        setTotals(
          data.totals || defaultTotals
        );
      } catch (err) {
        console.error(
          "❌ FETCH LOAN DEFAULTS ERROR:",
          err
        );

        const message =
          err instanceof Error
            ? err.message
            : "Unable to load loan records.";

        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  // ==========================================================
  // FILTER LOANS
  // ==========================================================

  const filteredLoans = useMemo(() => {
    const query =
      searchQuery
        .trim()
        .toLowerCase();

    return loans.filter(
      (loan) => {
        // ------------------------------------------------------
        // SEARCH
        // ------------------------------------------------------

        const matchesSearch =
          !query ||
          loan.full_name
            .toLowerCase()
            .includes(query) ||
          String(
            loan.member_id
          ).includes(query) ||
          String(
            loan.loan_id
          ).includes(query);

        // ------------------------------------------------------
        // CATEGORY
        // ------------------------------------------------------

        const normalizedCategory =
          loan.loan_category
            .trim()
            .toLowerCase()
            .replace(
              /[\s-]+/g,
              "_"
            );

        let matchesCategory =
          true;

        if (
          categoryFilter ===
          "monthly_saver"
        ) {
          matchesCategory = [
            "monthly_saver",
            "monthly_savings",
            "monthly_saver_loan",
          ].includes(
            normalizedCategory
          );
        }

        if (
          categoryFilter ===
          "borrower"
        ) {
          matchesCategory = [
            "borrower",
            "borrow",
          ].includes(
            normalizedCategory
          );
        }

        // ------------------------------------------------------
        // STATUS
        // ------------------------------------------------------

        const isOverdue =
          loan.days_overdue > 0 &&
          loan.outstanding > 0;

        let matchesStatus =
          true;

        if (
          statusFilter ===
          "overdue"
        ) {
          matchesStatus =
            isOverdue;
        }

        if (
          statusFilter ===
          "current"
        ) {
          matchesStatus =
            !isOverdue;
        }

        return (
          matchesSearch &&
          matchesCategory &&
          matchesStatus
        );
      }
    );
  }, [
    loans,
    searchQuery,
    categoryFilter,
    statusFilter,
  ]);

  // ==========================================================
  // COUNTS
  // ==========================================================

  const overdueCount =
    loans.filter(
      (loan) =>
        loan.days_overdue > 0 &&
        loan.outstanding > 0
    ).length;

  const currentCount =
    loans.length - overdueCount;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main className="min-h-screen bg-slate-50 -mt-28 text-slate-900">
      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/admin_staff/md/dashboard"
              className="flex shrink-0 items-center gap-2 rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Back to dashboard"
            >
              <ArrowLeft
                className="h-5 w-5"
              />
            </Link>

            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-slate-200 bg-white">
                <Image
                  src="/images/logo2.png"
                  alt="DCG Cooperative Society"
                  fill
                  sizes="40px"
                  className="object-contain p-1"
                  priority
                />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-base font-extrabold text-slate-900 sm:text-lg">
                  Loan Defaults
                </h1>

                <p className="hidden text-xs font-medium text-slate-500 sm:block">
                  Loan monitoring & default analysis
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchLoans(true)
            }
            disabled={
              loading ||
              refreshing
            }
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}

            <span className="hidden sm:inline">
              Refresh
            </span>
          </button>
        </div>
      </header>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div className="mx-auto max-w-7xl px-4 py-6 mt-4 sm:px-6 lg:px-8">
        {/* ====================================================
            PAGE HEADER
        ==================================================== */}

        <section className="mb-6">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-6 text-white shadow-lg sm:p-8">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-emerald-100">
                  <ShieldAlert className="h-4 w-4" />
                  Loan Monitoring
                </div>

                <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Loan Default Records
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  Monitor disbursed loans, outstanding
                  balances, overdue days, default charges,
                  and total amounts due.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                <Users className="h-5 w-5 text-emerald-300" />

                <div>
                  <p className="text-xs font-medium text-slate-300">
                    Total Loan Records
                  </p>

                  <p className="text-xl font-black">
                    {loans.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

              <div className="min-w-0">
                <p className="font-extrabold">
                  Unable to load loan records
                </p>

                <p className="mt-1 break-words font-medium">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    fetchLoans(true)
                  }
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-rose-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-800"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            SUMMARY CARDS
        ==================================================== */}

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Loan Collected
                </p>

                <p className="mt-2 text-xl font-black text-slate-900">
                  {formatCurrency(
                    totals.loanCollected
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <WalletCards className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Outstanding
                </p>

                <p className="mt-2 text-xl font-black text-slate-900">
                  {formatCurrency(
                    totals.outstanding
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Default Charges
                </p>

                <p className="mt-2 text-xl font-black text-slate-900">
                  {formatCurrency(
                    totals.defaultCharges
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-rose-50 p-3 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Total Due
                </p>

                <p className="mt-2 text-xl font-black text-slate-900">
                  {formatCurrency(
                    totals.dueWithCharges
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            STATUS SUMMARY
        ==================================================== */}

        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-rose-100 p-3 text-rose-700">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-rose-600">
                  Overdue
                </p>

                <p className="text-2xl font-black text-rose-900">
                  {overdueCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                  Current
                </p>

                <p className="text-2xl font-black text-emerald-900">
                  {currentCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
                <Users className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Total Records
                </p>

                <p className="text-2xl font-black text-slate-900">
                  {loans.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            FILTERS
        ==================================================== */}

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto]">
            {/* SEARCH */}

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder="Search member name, member ID or loan ID..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* CATEGORY */}

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value
                )
              }
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="all">
                All Categories
              </option>

              <option value="monthly_saver">
                Monthly Saver
              </option>

              <option value="borrower">
                Borrower
              </option>
            </select>

            {/* STATUS */}

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="all">
                All Statuses
              </option>

              <option value="overdue">
                Overdue
              </option>

              <option value="current">
                Current
              </option>
            </select>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">
            <span>
              Showing{" "}
              <strong className="text-slate-900">
                {filteredLoans.length}
              </strong>{" "}
              of{" "}
              <strong className="text-slate-900">
                {loans.length}
              </strong>{" "}
              records
            </span>

            {(searchQuery ||
              categoryFilter !==
                "all" ||
              statusFilter !==
                "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter(
                    "all"
                  );
                  setStatusFilter(
                    "all"
                  );
                }}
                className="font-bold text-emerald-700 hover:text-emerald-800"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />

            <p className="mt-4 text-sm font-bold text-slate-700">
              Loading loan records...
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Please wait while the system retrieves the
              latest loan data.
            </p>
          </div>
        ) : (
          <>
            {/* ==================================================
                DESKTOP TABLE
            ================================================== */}

            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left">
                      <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                        Member
                      </th>

                      <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                        Loan
                      </th>

                      <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                        Category
                      </th>

                      <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                        Loan Amount
                      </th>

                      <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                        Paid
                      </th>

                      <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                        Outstanding
                      </th>

                      <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                        Due Date
                      </th>

                      <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                        Charges
                      </th>

                      <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                        Total Due
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredLoans.length ===
                    0 ? (
                      <tr>
                        <td
                          colSpan={10}
                          className="px-6 py-14 text-center"
                        >
                          <div className="flex flex-col items-center">
                            <Search className="h-8 w-8 text-slate-300" />

                            <p className="mt-3 text-sm font-bold text-slate-700">
                              No loan records found
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Try changing your search or filters.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredLoans.map(
                        (loan) => {
                          const overdue =
                            loan.days_overdue >
                              0 &&
                            loan.outstanding >
                              0;

                          return (
                            <tr
                              key={
                                loan.loan_id
                              }
                              className="border-b border-slate-100 transition hover:bg-slate-50"
                            >
                              <td className="px-5 py-4">
                                <div>
                                  <p className="font-bold text-slate-900">
                                    {
                                      loan.full_name
                                    }
                                  </p>

                                  <p className="mt-0.5 text-xs font-semibold text-slate-500">
                                    Member #
                                    {
                                      loan.member_id
                                    }
                                  </p>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <span className="font-bold text-slate-800">
                                  #
                                  {
                                    loan.loan_id
                                  }
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                                  {formatCategory(
                                    loan.loan_category
                                  )}
                                </span>
                              </td>

                              <td className="px-5 py-4 font-bold text-slate-800">
                                {formatCurrency(
                                  loan.loan_amount
                                )}
                              </td>

                              <td className="px-5 py-4 font-bold text-emerald-700">
                                {formatCurrency(
                                  loan.amount_paid
                                )}
                              </td>

                              <td className="px-5 py-4 font-black text-amber-700">
                                {formatCurrency(
                                  loan.outstanding
                                )}
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                  <CalendarDays className="h-4 w-4 text-slate-400" />

                                  {formatDate(
                                    loan.due_date
                                  )}
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                {overdue ? (
                                  <div>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-black text-rose-700">
                                      <AlertTriangle className="h-3.5 w-3.5" />
                                      Overdue
                                    </span>

                                    <p className="mt-1 text-xs font-bold text-rose-600">
                                      {
                                        loan.days_overdue
                                      }{" "}
                                      days
                                    </p>
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-700">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Current
                                  </span>
                                )}
                              </td>

                              <td className="px-5 py-4">
                                <div className="text-sm">
                                  <p className="font-bold text-rose-700">
                                    {formatCurrency(
                                      loan.default_charge
                                    )}
                                  </p>

                                  {loan.daily_growth >
                                    0 && (
                                    <p className="mt-0.5 text-xs font-semibold text-slate-500">
                                      Daily growth:{" "}
                                      {formatCurrency(
                                        loan.daily_growth
                                      )}
                                    </p>
                                  )}
                                </div>
                              </td>

                              <td className="px-5 py-4 font-black text-slate-900">
                                {formatCurrency(
                                  loan.total_due
                                )}
                              </td>
                            </tr>
                          );
                        }
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ==================================================
                MOBILE CARDS
            ================================================== */}

            <div className="space-y-4 lg:hidden">
              {filteredLoans.length ===
              0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                  <Search className="mx-auto h-8 w-8 text-slate-300" />

                  <p className="mt-3 text-sm font-bold text-slate-700">
                    No loan records found
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Try changing your search or filters.
                  </p>
                </div>
              ) : (
                filteredLoans.map(
                  (loan) => {
                    const overdue =
                      loan.days_overdue >
                        0 &&
                      loan.outstanding >
                        0;

                    return (
                      <article
                        key={
                          loan.loan_id
                        }
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                      >
                        {/* CARD HEADER */}

                        <div className="border-b border-slate-100 bg-slate-50 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-black text-slate-900">
                                {
                                  loan.full_name
                                }
                              </p>

                              <p className="mt-1 text-xs font-semibold text-slate-500">
                                Member #
                                {
                                  loan.member_id
                                }{" "}
                                • Loan #
                                {
                                  loan.loan_id
                                }
                              </p>
                            </div>

                            {overdue ? (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-black text-rose-700">
                                <AlertTriangle className="h-3 w-3" />
                                Overdue
                              </span>
                            ) : (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-black text-emerald-700">
                                <CheckCircle2 className="h-3 w-3" />
                                Current
                              </span>
                            )}
                          </div>
                        </div>

                        {/* CARD BODY */}

                        <div className="p-4">
                          <div className="mb-4">
                            <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                              {formatCategory(
                                loan.loan_category
                              )}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-slate-50 p-3">
                              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                Loan Amount
                              </p>

                              <p className="mt-1 text-sm font-black text-slate-900">
                                {formatCurrency(
                                  loan.loan_amount
                                )}
                              </p>
                            </div>

                            <div className="rounded-xl bg-emerald-50 p-3">
                              <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-600">
                                Amount Paid
                              </p>

                              <p className="mt-1 text-sm font-black text-emerald-800">
                                {formatCurrency(
                                  loan.amount_paid
                                )}
                              </p>
                            </div>

                            <div className="rounded-xl bg-amber-50 p-3">
                              <p className="text-[11px] font-bold uppercase tracking-wide text-amber-600">
                                Outstanding
                              </p>

                              <p className="mt-1 text-sm font-black text-amber-800">
                                {formatCurrency(
                                  loan.outstanding
                                )}
                              </p>
                            </div>

                            <div className="rounded-xl bg-blue-50 p-3">
                              <p className="text-[11px] font-bold uppercase tracking-wide text-blue-600">
                                Due Date
                              </p>

                              <p className="mt-1 text-sm font-black text-blue-800">
                                {formatDate(
                                  loan.due_date
                                )}
                              </p>
                            </div>
                          </div>

                          {/* OVERDUE INFO */}

                          {overdue && (
                            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3">
                              <div className="flex items-center gap-2">
                                <Clock3 className="h-4 w-4 text-rose-600" />

                                <span className="text-xs font-black text-rose-700">
                                  {
                                    loan.days_overdue
                                  }{" "}
                                  days overdue
                                </span>
                              </div>
                            </div>
                          )}

                          {/* CHARGES */}

                          <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                            <div className="flex items-center justify-between gap-3 text-sm">
                              <span className="font-semibold text-slate-500">
                                Default Charge
                              </span>

                              <span className="font-bold text-rose-700">
                                {formatCurrency(
                                  loan.default_charge
                                )}
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 text-sm">
                              <span className="font-semibold text-slate-500">
                                Daily Growth
                              </span>

                              <span className="font-bold text-slate-700">
                                {formatCurrency(
                                  loan.daily_growth
                                )}
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-900 p-3">
                              <span className="text-sm font-bold text-white">
                                Total Due
                              </span>

                              <span className="text-base font-black text-white">
                                {formatCurrency(
                                  loan.total_due
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  }
                )
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
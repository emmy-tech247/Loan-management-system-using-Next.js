"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import Image from "next/image";

import {
  ArrowLeft,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  Wallet,
  AlertTriangle,
  Shield,
  ChevronRight,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================

type SavingsTransaction = {
  saved_id: number;
  member_id: number | string;
  amount_saved: number | string | null;
  receipt_file: string;
  status: string;
  created_at?: string;
  acknowledged_by_admin1?: number;
  forwarded_to_admin2?: number;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  error?: string;
  transactions?: SavingsTransaction[];
  count?: number;
};

// ============================================================
// PAGE
// ============================================================

export default function AcknowledgeTopupsPage() {
  const [transactions, setTransactions] = useState<
    SavingsTransaction[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [processingId, setProcessingId] = useState<
    number | null
  >(null);

  const [error, setError] = useState("");

  // Prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);

  // ==========================================================
  // FETCH PENDING TRANSACTIONS
  // ==========================================================

  const fetchPendingTransactions = useCallback(
    async (refresh = false) => {
      try {
        setError("");

        if (refresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const response = await fetch(
          "/api/admin_staff/admin/acknowledge-topups",
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const contentType =
          response.headers.get("content-type") || "";

        const responseText = await response.text();

        // ------------------------------------------------------
        // Prevent HTML / Next.js error page from being parsed
        // as JSON
        // ------------------------------------------------------

        if (!contentType.includes("application/json")) {
          console.error(
            "Non-JSON server response:",
            responseText
          );

          throw new Error(
            `Server returned an unexpected response (${response.status}).`
          );
        }

        let data: ApiResponse;

        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error(
            "Invalid JSON response:",
            responseText,
            parseError
          );

          throw new Error(
            "The server returned invalid JSON."
          );
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.error ||
              data.message ||
              "Failed to load pending savings transactions."
          );
        }

        setTransactions(data.transactions || []);
      } catch (err: unknown) {
        console.error(
          "fetchPendingTransactions error:",
          err
        );

        const message =
          err instanceof Error
            ? err.message
            : String(err);

        setError(message);
        setTransactions([]);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  // ==========================================================
  // ACKNOWLEDGE TRANSACTION
  // ==========================================================

  const acknowledgeTransaction = useCallback(
    async (savedId: number) => {
      try {
        setProcessingId(savedId);
        setError("");

        const response = await fetch(
          "/api/admin_staff/admin/acknowledge-topups/action",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              saved_id: savedId,
            }),
          }
        );

        const contentType =
          response.headers.get("content-type") || "";

        const responseText = await response.text();

        if (!contentType.includes("application/json")) {
          console.error(
            "Non-JSON acknowledgement response:",
            responseText
          );

          throw new Error(
            `Server returned an unexpected response (${response.status}).`
          );
        }

        let data: ApiResponse;

        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error(
            "Invalid acknowledgement JSON:",
            responseText,
            parseError
          );

          throw new Error(
            "The server returned invalid JSON."
          );
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.error ||
              data.message ||
              "Failed to acknowledge the savings transaction."
          );
        }

        // Remove acknowledged transaction immediately
        setTransactions((current) =>
          current.filter(
            (transaction) =>
              transaction.saved_id !== savedId
          )
        );
      } catch (err: unknown) {
        console.error(
          "acknowledgeTransaction error:",
          err
        );

        const message =
          err instanceof Error
            ? err.message
            : String(err);

        setError(message);
      } finally {
        setProcessingId(null);
      }
    },
    []
  );

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    setIsMounted(true);
    fetchPendingTransactions();
  }, [fetchPendingTransactions]);

  // ==========================================================
  // FORMAT AMOUNT
  // ==========================================================

  const formatAmount = (
    amount: number | string | null
  ) => {
    const numericAmount = Number(amount || 0);

    return numericAmount.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (date?: string) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ==========================================================
  // FORMAT TIME
  // ==========================================================

  const formatTime = (date?: string) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==========================================================
  // TOTAL PENDING AMOUNT
  // ==========================================================

  const totalPendingAmount = transactions.reduce(
    (total, transaction) =>
      total + Number(transaction.amount_saved || 0),
    0
  );

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans -mt-28 text-slate-900">

      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Logo / Portal */}
            <div className="flex items-center gap-3">

              <Link
                href="/admin_staff/admin/dashboard"
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
                Staff Portal
              </span>
            </div>

            {/* Back Button */}
            <Link
              href="/admin_staff/admin/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
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

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 mt-2 sm:px-6 lg:px-8 space-y-6">

        {/* ====================================================
            HEADER BANNER
        ==================================================== */}

        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">

          <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div className="max-w-2xl">

              <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-xs">
                <Wallet className="h-3.5 w-3.5" />
                Savings Operations
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Manual Savings Acknowledgement
              </h1>

              <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
                Review submitted manual savings payments,
                verify the supporting receipts, and acknowledge
                pending transactions.
              </p>
            </div>

            {/* Refresh */}

            <button
              type="button"
              onClick={() =>
                fetchPendingTransactions(true)
              }
              disabled={
                isMounted &&
                (isLoading || isRefreshing)
              }
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-900 shadow-sm transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
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
                : "Refresh"}
            </button>
          </div>
        </section>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-xs">
            <div className="flex items-start gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
              </div>

              <div>
                <p className="text-sm font-bold text-rose-800">
                  Unable to load savings transactions
                </p>

                <p className="mt-1 text-xs leading-relaxed text-rose-700">
                  {error}
                </p>
              </div>

            </div>
          </div>
        )}

        {/* ====================================================
            SUMMARY CARDS
        ==================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Pending */}

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-shadow hover:shadow-md">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Pending Transactions
                </p>

                <p className="mt-2 text-2xl font-extrabold text-slate-900">
                  {transactions.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Awaiting acknowledgement
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>

            </div>
          </div>

          {/* Amount */}

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-shadow hover:shadow-md">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Total Pending Amount
                </p>

                <p className="mt-2 text-2xl font-extrabold text-slate-900">
                  ₦{formatAmount(totalPendingAmount)}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Manual savings awaiting review
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <Wallet className="h-5 w-5 text-emerald-600" />
              </div>

            </div>
          </div>
        </div>

        {/* ====================================================
            TRANSACTIONS
        ==================================================== */}

        <section className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs">

          {/* Section Header */}

          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Pending Savings Transactions
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Transactions requiring staff acknowledgement.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-50 border border-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
              <Clock className="h-3.5 w-3.5" />
              {transactions.length} Pending
            </div>

          </div>

          {/* ==================================================
              LOADING
          ================================================== */}

          {isLoading && (
            <div className="flex min-h-[320px] items-center justify-center p-8">

              <div className="flex flex-col items-center">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-700">
                  Loading pending savings...
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Please wait while transactions are retrieved.
                </p>

              </div>
            </div>
          )}

          {/* ==================================================
              EMPTY STATE
          ================================================== */}

          {!isLoading &&
            !error &&
            transactions.length === 0 && (
              <div className="flex min-h-[320px] flex-col items-center justify-center p-8 text-center">

                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>

                <h2 className="mt-5 text-base font-extrabold text-slate-900">
                  No Pending Savings
                </h2>

                <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-500">
                  There are currently no pending manual
                  savings transactions requiring
                  acknowledgement.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    fetchPendingTransactions(true)
                  }
                  disabled={
                    isMounted &&
                    isRefreshing
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${
                      isRefreshing
                        ? "animate-spin"
                        : ""
                    }`}
                  />
                  Check Again
                </button>

              </div>
            )}

          {/* ==================================================
              DESKTOP TABLE
          ================================================== */}

          {!isLoading &&
            transactions.length > 0 && (
              <div className="hidden overflow-x-auto md:block">

                <table className="min-w-full">

                  <thead className="bg-slate-50/80">

                    <tr>

                      <th className="px-6 py-4 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Transaction
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Member
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Amount
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Receipt
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Submitted
                      </th>

                      <th className="px-6 py-4 text-right text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {transactions.map(
                      (transaction) => {
                        const isProcessing =
                          processingId ===
                          transaction.saved_id;

                        return (
                          <tr
                            key={
                              transaction.saved_id
                            }
                            className="group transition-colors hover:bg-slate-50/70"
                          >

                            {/* Transaction */}

                            <td className="whitespace-nowrap px-6 py-4">

                              <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-600">
                                  <FileText className="h-4 w-4" />
                                </div>

                                <div>
                                  <p className="text-xs font-extrabold text-slate-900">
                                    #
                                    {
                                      transaction.saved_id
                                    }
                                  </p>

                                  <p className="mt-0.5 text-[10px] text-slate-400">
                                    Savings transaction
                                  </p>
                                </div>

                              </div>

                            </td>

                            {/* Member */}

                            <td className="whitespace-nowrap px-6 py-4">

                              <p className="text-xs font-bold text-slate-800">
                                Member #
                                {
                                  transaction.member_id
                                }
                              </p>

                            </td>

                            {/* Amount */}

                            <td className="whitespace-nowrap px-6 py-4">

                              <p className="text-sm font-extrabold text-emerald-700">
                                ₦
                                {formatAmount(
                                  transaction.amount_saved
                                )}
                              </p>

                            </td>

                            {/* Receipt */}

                            <td className="px-6 py-4">

                              {transaction.receipt_file ? (
                                <a
                                  href={
                                    transaction.receipt_file
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  View Receipt
                                  <ChevronRight className="h-3 w-3" />
                                </a>
                              ) : (
                                <span className="text-xs font-medium text-slate-400">
                                  No receipt
                                </span>
                              )}

                            </td>

                            {/* Date */}

                            <td className="whitespace-nowrap px-6 py-4">

                              <p className="text-xs font-semibold text-slate-700">
                                {formatDate(
                                  transaction.created_at
                                )}
                              </p>

                              <p className="mt-0.5 text-[10px] text-slate-400">
                                {formatTime(
                                  transaction.created_at
                                )}
                              </p>

                            </td>

                            {/* Action */}

                            <td className="whitespace-nowrap px-6 py-4 text-right">

                              <button
                                type="button"
                                onClick={() =>
                                  acknowledgeTransaction(
                                    transaction.saved_id
                                  )
                                }
                                disabled={
                                  isMounted &&
                                  (isProcessing ||
                                    processingId !==
                                      null)
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-xs transition-all hover:bg-emerald-700 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isProcessing ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    Acknowledge
                                  </>
                                )}
                              </button>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>
              </div>
            )}

          {/* ==================================================
              MOBILE CARDS
          ================================================== */}

          {!isLoading &&
            transactions.length > 0 && (
              <div className="divide-y divide-slate-100 md:hidden">

                {transactions.map(
                  (transaction) => {
                    const isProcessing =
                      processingId ===
                      transaction.saved_id;

                    return (
                      <div
                        key={
                          transaction.saved_id
                        }
                        className="p-5"
                      >

                        {/* Top */}

                        <div className="flex items-start justify-between gap-4">

                          <div className="flex items-start gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                              <FileText className="h-5 w-5" />
                            </div>

                            <div>
                              <p className="text-xs font-extrabold text-slate-900">
                                Transaction #
                                {
                                  transaction.saved_id
                                }
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                Member #
                                {
                                  transaction.member_id
                                }
                              </p>
                            </div>

                          </div>

                          <p className="whitespace-nowrap text-sm font-extrabold text-emerald-700">
                            ₦
                            {formatAmount(
                              transaction.amount_saved
                            )}
                          </p>

                        </div>

                        {/* Details */}

                        <div className="mt-5 grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4">

                          <div>
                            <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                              Date
                            </p>

                            <p className="mt-1 text-xs font-bold text-slate-700">
                              {formatDate(
                                transaction.created_at
                              )}
                            </p>

                            <p className="mt-0.5 text-[10px] text-slate-400">
                              {formatTime(
                                transaction.created_at
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                              Status
                            </p>

                            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold text-amber-700">
                              <Clock className="h-3 w-3" />
                              Pending
                            </span>
                          </div>

                        </div>

                        {/* Buttons */}

                        <div className="mt-4 flex flex-col gap-2 sm:flex-row">

                          {transaction.receipt_file && (
                            <a
                              href={
                                transaction.receipt_file
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
                            >
                              <FileText className="h-4 w-4" />
                              View Receipt
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              acknowledgeTransaction(
                                transaction.saved_id
                              )
                            }
                            disabled={
                              isMounted &&
                              (isProcessing ||
                                processingId !==
                                  null)
                            }
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-extrabold text-white transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                Acknowledge
                              </>
                            )}
                          </button>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

        </section>
      </main>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">

          <p className="text-xs text-slate-500">
            &copy; 2026 DCG Multipurpose Cooperative Society Ltd.
            All rights reserved.
          </p>

          <p className="mt-1 text-[10px] text-slate-400">
            Prosperity Built on Integrity
          </p>

        </div>
      </footer>

    </div>
  );
}
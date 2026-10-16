"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  User,
  Phone,
  DollarSign,
  Calendar,
  Percent,
  FileText,
  Check,
  Clock,
  Send,
  RefreshCw,
} from "lucide-react";

import { AccountantLoanRequestItem } from "@/types/accountant/Loan/Acknowledge";

export default function AccountantLoanAcknowledgePage() {
  const [loans, setLoans] = useState<AccountantLoanRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  /**
   * Convert database status values into readable labels.
   */
  const formatStatus = (value?: string | null) => {
    if (!value) return "Unknown";

    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  /**
   * Format Nigerian currency.
   */
  const formatCurrency = (value: number | string | null | undefined) => {
    const numericValue =
      typeof value === "string" ? Number.parseFloat(value) : Number(value);

    if (!Number.isFinite(numericValue)) {
      return "0.00";
    }

    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  };

  /**
   * Fetch accountant loan queue.
   *
   * Uses:
   * - credentials: include
   * - no-store cache
   * - JSON content validation
   * - safe response parsing
   * - useful HTTP error messages
   */
  const fetchLoans = useCallback(async () => {
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const response = await fetch(
        "/api/admin_staff/accountant/loan-requests",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const contentType = response.headers.get("content-type") || "";

      const rawResponse = await response.text();

      let data: {
        success?: boolean;
        message?: string;
        loans?: AccountantLoanRequestItem[];
      } = {};

      /**
       * Only parse JSON when the server actually returned JSON.
       */
      if (contentType.includes("application/json")) {
        try {
          data = JSON.parse(rawResponse);
        } catch (parseError) {
          console.error(
            "Failed to parse loan queue JSON response:",
            parseError
          );

          setStatusMessage({
            text: "The server returned an invalid JSON response.",
            type: "error",
          });

          return;
        }
      } else {
        /**
         * The API may have returned HTML, a Next.js error page,
         * a 404 page, or another non-JSON response.
         */
        console.error(
          "Loan queue returned a non-JSON response:",
          response.status,
          rawResponse
        );

        if (response.status === 404) {
          setStatusMessage({
            text:
              "Loan queue API route was not found. Please check the API route path.",
            type: "error",
          });
        } else if (response.status === 405) {
          setStatusMessage({
            text: "The loan queue API does not support the GET method.",
            type: "error",
          });
        } else if (response.status === 401) {
          setStatusMessage({
            text:
              "Accountant login session has expired. Please log in again.",
            type: "error",
          });
        } else if (response.status === 403) {
          setStatusMessage({
            text:
              "Access denied. Only an authenticated accountant can access this loan queue.",
            type: "error",
          });
        } else if (response.status >= 500) {
          setStatusMessage({
            text:
              "The loan queue server encountered an error. Please try again.",
            type: "error",
          });
        } else {
          setStatusMessage({
            text: `Unable to retrieve loan queue. Server returned HTTP ${response.status}.`,
            type: "error",
          });
        }

        return;
      }

      /**
       * Handle valid JSON but unsuccessful HTTP/API responses.
       */
      if (!response.ok || !data.success) {
        setStatusMessage({
          text: data.message || "Failed to load loan requests.",
          type: "error",
        });

        return;
      }

      /**
       * Make sure loans is always an array.
       */
      setLoans(Array.isArray(data.loans) ? data.loans : []);
    } catch (error) {
      console.error("Failed to load accountant loan queue:", error);

      setStatusMessage({
        text: "Unable to connect to the loan queue server.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Initial queue load.
   */
  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  /**
   * Acknowledge and forward loan to MD/Admin2.
   */
  const handleAcknowledge = async (loanId: number) => {
    const selectedLoan = loans.find((loan) => loan.loan_id === loanId);

    if (!selectedLoan) {
      setStatusMessage({
        text: "Loan request could not be found.",
        type: "error",
      });

      return;
    }

    if (selectedLoan.accountant_status === "acknowledged") {
      setStatusMessage({
        text: "This loan has already been acknowledged.",
        type: "error",
      });

      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to acknowledge this loan and forward it to the Managing Director?"
    );

    if (!confirmed) {
      return;
    }

    setProcessingId(loanId);
    setStatusMessage(null);

    try {
      const response = await fetch(
        "/api/admin_staff/accountant/loan-requests/acknowledge",
        {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            loanId,
          }),
        }
      );

      const contentType = response.headers.get("content-type") || "";

      const rawResponse = await response.text();

      let data: {
        success?: boolean;
        message?: string;
        loan?: {
          loan_id?: number;
          loan_status?: string;
          accountant_status?: string;
          admin2_status?: string;
          forwarded_to_admin_by?: number;
        };
      } = {};

      /**
       * Safely parse acknowledgement response.
       */
      if (contentType.includes("application/json")) {
        try {
          data = JSON.parse(rawResponse);
        } catch (parseError) {
          console.error(
            "Failed to parse acknowledgement JSON response:",
            parseError
          );

          setStatusMessage({
            text: "The server returned an invalid JSON response.",
            type: "error",
          });

          return;
        }
      } else {
        console.error(
          "Loan acknowledgement returned a non-JSON response:",
          response.status,
          rawResponse
        );

        if (response.status === 404) {
          setStatusMessage({
            text:
              "Loan acknowledgement API route was not found. Please check the API route.",
            type: "error",
          });
        } else if (response.status === 405) {
          setStatusMessage({
            text:
              "The loan acknowledgement API does not support the POST method.",
            type: "error",
          });
        } else if (response.status === 401) {
          setStatusMessage({
            text:
              "Accountant login session has expired. Please log in again.",
            type: "error",
          });
        } else if (response.status === 403) {
          setStatusMessage({
            text:
              "Access denied. Accountant authorization is required.",
            type: "error",
          });
        } else {
          setStatusMessage({
            text:
              `Unable to process the loan acknowledgement. Server returned HTTP ${response.status}.`,
            type: "error",
          });
        }

        return;
      }

      /**
       * Handle API-level failure.
       */
      if (!response.ok || !data.success) {
        setStatusMessage({
          text: data.message || "Failed to update loan status.",
          type: "error",
        });

        return;
      }

      setStatusMessage({
        text:
          data.message ||
          "Loan acknowledged and forwarded successfully.",
        type: "success",
      });

      /**
       * Update the card immediately without another
       * request to the server.
       *
       * IMPORTANT:
       * "forwarded_to_admin2" is NOT a valid value in the
       * loans.loan_status ENUM.
       *
       * The database keeps loan_status as:
       * forwarded_to_accountant
       *
       * while accountant_status becomes:
       * acknowledged
       *
       * and admin2_status becomes:
       * pending
       */
      setLoans((currentLoans) =>
        currentLoans.map((loan) =>
          loan.loan_id === loanId
            ? {
                ...loan,
                accountant_status: "acknowledged",
                loan_status: "forwarded_to_accountant",
                ...(data.loan?.admin2_status
                  ? {
                      admin2_status: data.loan.admin2_status,
                    }
                  : {}),
              }
            : loan
        )
      );
    } catch (error) {
      console.error("Loan acknowledgement error:", error);

      setStatusMessage({
        text: "Unable to connect to the loan acknowledgement server.",
        type: "error",
      });
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * Statistics.
   */
  const pendingLoans = loans.filter(
    (loan) => loan.accountant_status !== "acknowledged"
  ).length;

  const acknowledgedLoans = loans.filter(
    (loan) => loan.accountant_status === "acknowledged"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans -mt-28 text-slate-900">
      {/* =========================================================
          NAVBAR
      ========================================================= */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo + Portal */}
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
                Accountant Portal
              </span>
            </div>

            {/* Back */}
            <Link
              href="/admin_staff/accountant/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />

              <span className="hidden sm:inline">
                Back to Dashboard
              </span>

              <span className="sm:hidden">Back</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* =========================================================
          MAIN
      ========================================================= */}
      <main className="mx-auto flex-1 w-full max-w-7xl space-y-6 px-4 py-8 mt-2 sm:px-6 lg:px-8">
        {/* =======================================================
            HERO
        ======================================================= */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">
          {/* Decorative glow */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-sm">
                <Shield className="h-3.5 w-3.5" />
                Accountant Loan Review
              </span>

              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Loans Pending Accountant Review
              </h1>

              <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
                Review member loan applications, acknowledge eligible
                requests, and forward them to the Managing Director approval
                queue.
              </p>
            </div>

            {/* Summary */}
            <div className="grid shrink-0 grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Pending
                </p>

                <p className="mt-1 text-2xl font-extrabold text-amber-300">
                  {pendingLoans}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Acknowledged
                </p>

                <p className="mt-1 text-2xl font-extrabold text-emerald-300">
                  {acknowledgedLoans}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================
            STATUS MESSAGE
        ======================================================= */}
        {statusMessage && (
          <div
            role="alert"
            className={`flex items-center gap-2 rounded-2xl border p-4 text-xs font-medium ${
              statusMessage.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            )}

            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* =======================================================
            QUEUE HEADER
        ======================================================= */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">
              Loan Request Queue
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Review the details below before forwarding each request.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchLoans}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                isLoading ? "animate-spin" : ""
              }`}
            />

            Refresh Queue
          </button>
        </div>

        {/* =======================================================
            LOADING
        ======================================================= */}
        {isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-20 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900">
              Loading loan requests
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Retrieving the accountant review queue...
            </p>
          </div>
        ) : loans.length > 0 ? (
          /* =====================================================
             LOAN CARDS
          ===================================================== */
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {loans.map((row) => {
              const isAcknowledged =
                row.accountant_status === "acknowledged";

              const isProcessing = processingId === row.loan_id;

              return (
                <article
                  key={row.loan_id}
                  className="group relative rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md sm:p-6"
                >
                  {/* =================================================
                      CARD HEADER
                  ================================================= */}
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                        <FileText className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Loan Request
                        </p>

                        <h3 className="mt-0.5 font-mono text-sm font-extrabold text-slate-900">
                          #{row.loan_id}
                        </h3>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                        isAcknowledged
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                      }`}
                    >
                      {formatStatus(row.loan_status)}
                    </span>
                  </div>

                  {/* =================================================
                      MEMBER INFORMATION
                  ================================================= */}
                  <section className="mt-5">
                    <div className="mb-3 flex items-center gap-2">
                      <User className="h-4 w-4 text-emerald-600" />

                      <h4 className="text-xs font-extrabold text-slate-900">
                        Member Information
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Full Name
                        </span>

                        <p className="mt-1 text-xs font-bold text-slate-900">
                          {row.full_name || "Unknown Member"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <Phone className="h-3 w-3" />
                          Phone
                        </span>

                        <p className="mt-1 font-mono text-xs font-medium text-slate-800">
                          {row.phone_number || "Not available"}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* =================================================
                      LOAN DETAILS
                  ================================================= */}
                  <section className="mt-5">
                    <div className="mb-3 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-emerald-600" />

                      <h4 className="text-xs font-extrabold text-slate-900">
                        Loan Details
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {/* Amount */}
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                          Loan Amount
                        </span>

                        <p className="mt-1 font-mono text-sm font-extrabold text-emerald-700">
                          ₦{formatCurrency(row.loan_amount)}
                        </p>
                      </div>

                      {/* Tenure */}
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <Calendar className="h-3 w-3" />
                          Tenure
                        </span>

                        <p className="mt-1 text-xs font-bold text-slate-800">
                          {row.tenure_month}{" "}
                          {row.tenure_month === 1 ? "Month" : "Months"}
                        </p>
                      </div>

                      {/* Interest */}
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <Percent className="h-3 w-3" />
                          Interest
                        </span>

                        <p className="mt-1 text-xs font-bold text-slate-800">
                          {row.interest_rate}%
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* =================================================
                      ACCOUNTANT STATUS
                  ================================================= */}
                  <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Accountant Review Status
                        </p>

                        <div className="mt-1.5">
                          {isAcknowledged ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-600">
                              <Check className="h-4 w-4" />
                              Acknowledged
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-600">
                              <Clock className="h-4 w-4" />
                              Pending Review
                            </span>
                          )}
                        </div>
                      </div>

                      {isAcknowledged && (
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* =================================================
                      ACTION
                  ================================================= */}
                  <div className="mt-5">
                    {isAcknowledged ? (
                      <button
                        type="button"
                        disabled
                        className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 py-3 text-xs font-bold text-slate-500"
                      >
                        <Check className="h-4 w-4" />
                        Already Acknowledged
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleAcknowledge(row.loan_id)}
                        aria-label={`Acknowledge loan ${row.loan_id} and forward to Managing Director`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 text-emerald-400" />
                            Acknowledge & Forward to MD
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* =====================================================
             EMPTY STATE
          ===================================================== */
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm sm:p-20">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FileText className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900">
              No loan requests available
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
              There are currently no loan applications waiting for
              accountant review.
            </p>

            <button
              type="button"
              onClick={fetchLoans}
              disabled={isLoading}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${
                  isLoading ? "animate-spin" : ""
                }`}
              />

              Refresh Queue
            </button>
          </div>
        )}
      </main>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl space-y-2 px-4 text-center sm:px-6 lg:px-8">
          <Link
            href="/admin_staff/accountant/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Accountant Dashboard
          </Link>

          <p className="text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} DCG Multipurpose Cooperative
            Society Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
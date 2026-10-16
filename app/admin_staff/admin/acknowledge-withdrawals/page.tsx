"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Shield,
  Loader2,
  WalletCards,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  User,
  HelpCircle,
  Clock3,
  CheckCircle,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import { WithdrawalRequest } from "@/types/acknowledgeWithdrawals";

type ApiResponse = {
  success: boolean;
  message?: string;
  error?: string;
  withdrawals?: WithdrawalRequest[];
  count?: number;
};

export default function AcknowledgeWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<
    WithdrawalRequest[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingId, setProcessingId] =
    useState<number | null>(null);

  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const [isMounted, setIsMounted] = useState(false);

  /*
   * ============================================================
   * FETCH WITHDRAWALS
   * ============================================================
   */
  const fetchWithdrawals = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setStatusMessage(null);

      try {
        const res = await fetch(
          "/api/admin_staff/admin/acknowledge-withdrawals",
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }
        );

        /*
         * Read text first instead of directly calling res.json().
         * This protects the page when Next.js returns HTML.
         */
        const contentType =
          res.headers.get("content-type") || "";

        const responseText = await res.text();

        if (!contentType.includes("application/json")) {
          console.error(
            "Unexpected server response:",
            responseText
          );

          throw new Error(
            `Server returned an unexpected response (${res.status}).`
          );
        }

        let json: ApiResponse;

        try {
          json = JSON.parse(responseText);
        } catch {
          throw new Error(
            `Invalid JSON response from server (${res.status}).`
          );
        }

        if (!res.ok || !json.success) {
          throw new Error(
            json.error ||
              json.message ||
              "Failed to load withdrawal requests."
          );
        }

        setWithdrawals(
          Array.isArray(json.withdrawals)
            ? json.withdrawals
            : []
        );
      } catch (error: unknown) {
        console.error(
          "fetchWithdrawals error:",
          error
        );

        const message =
          error instanceof Error
            ? error.message
            : "Network error. Could not retrieve pending withdrawals.";

        setStatusMessage({
          text: message,
          type: "error",
        });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  /*
   * ============================================================
   * INITIAL LOAD
   * ============================================================
   */
  useEffect(() => {
    setIsMounted(true);
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  /*
   * ============================================================
   * ACKNOWLEDGE WITHDRAWAL
   * ============================================================
   */
  const handleAcknowledge = async (
    savedId: number
  ) => {
    setProcessingId(savedId);
    setStatusMessage(null);

    try {
      const res = await fetch(
        "/api/admin_staff/admin/acknowledge-withdrawals/action",
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
        res.headers.get("content-type") || "";

      const responseText = await res.text();

      if (!contentType.includes("application/json")) {
        console.error(
          "Unexpected acknowledgement response:",
          responseText
        );

        throw new Error(
          `Server returned an unexpected response (${res.status}).`
        );
      }

      let json: ApiResponse;

      try {
        json = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Invalid JSON response from server (${res.status}).`
        );
      }

      if (!res.ok || !json.success) {
        throw new Error(
          json.error ||
            json.message ||
            "Failed to acknowledge withdrawal."
        );
      }

      setStatusMessage({
        text:
          json.message ||
          "Withdrawal acknowledged successfully.",
        type: "success",
      });

      /*
       * Remove the acknowledged withdrawal immediately.
       */
      setWithdrawals((previous) =>
        previous.filter(
          (item) => item.saved_id !== savedId
        )
      );
    } catch (error: unknown) {
      console.error(
        "handleAcknowledge error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Network error. Failed to complete withdrawal acknowledgement.";

      setStatusMessage({
        text: message,
        type: "error",
      });
    } finally {
      setProcessingId(null);
    }
  };

  /*
   * ============================================================
   * FORMATTING
   * ============================================================
   */
  const formatCurrency = (
    value: number | string | null | undefined
  ) => {
    const numericValue =
      typeof value === "string"
        ? Number.parseFloat(value)
        : Number(value ?? 0);

    if (!Number.isFinite(numericValue)) {
      return "0.00";
    }

    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  };

  const formatDate = (
    dateValue: string | undefined
  ) => {
    if (!dateValue) {
      return "Unknown date";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalPending = withdrawals.reduce(
    (total, withdrawal) => {
      const amount =
        typeof withdrawal.amount === "string"
          ? Number.parseFloat(withdrawal.amount)
          : Number(withdrawal.amount || 0);

      return total + (Number.isFinite(amount) ? amount : 0);
    },
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col -mt-28 font-sans text-slate-900">

      {/* ======================================================
          NAVBAR
      ======================================================= */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

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

            <Link
              href="/admin_staff/admin/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
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
      ======================================================= */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 mt-2 sm:px-6 lg:px-8 space-y-6">

        {/* ====================================================
            DARK EXECUTIVE BANNER
        ===================================================== */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">

          <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-emerald-400/5 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div className="max-w-2xl space-y-3">

              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-xs">
                <WalletCards className="h-3.5 w-3.5" />
                Financial Operations
              </span>

              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Pending Withdrawals
              </h1>

              <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
                Review member withdrawal requests and
                acknowledge approved transactions from the
                staff control center.
              </p>

            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">

              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300">
                    <Clock3 className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Pending Requests
                    </p>

                    <p className="text-xl font-extrabold text-white">
                      {withdrawals.length}
                    </p>
                  </div>

                </div>
              </div>

              <button
                type="button"
                onClick={() => fetchWithdrawals(true)}
                disabled={
                  isMounted
                    ? isLoading || isRefreshing
                    : undefined
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
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

          </div>
        </section>

        {/* ====================================================
            STATUS MESSAGE
        ===================================================== */}
        {statusMessage && (
          <div
            className={`flex items-center gap-3 rounded-2xl border p-4 text-xs font-semibold ${
              statusMessage.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
            )}

            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* ====================================================
            SUMMARY
        ===================================================== */}
        {!isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Pending Requests
              </p>

              <p className="mt-2 text-2xl font-extrabold text-slate-900">
                {withdrawals.length}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Withdrawal requests awaiting acknowledgement.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Total Pending Amount
              </p>

              <p className="mt-2 text-2xl font-extrabold text-emerald-700">
                ₦{formatCurrency(totalPending)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Total value of pending withdrawals.
              </p>
            </div>

          </div>
        )}

        {/* ====================================================
            CONTENT CARD
        ===================================================== */}
        <section className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs">

          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

            <div className="flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <WalletCards className="h-4 w-4" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Withdrawal Queue
                </h2>

                <p className="mt-0.5 text-[11px] text-slate-500">
                  Member savings withdrawal requests awaiting acknowledgement.
                </p>
              </div>

            </div>

            <div
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold ${
                withdrawals.length > 0
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {withdrawals.length > 0 ? (
                <>
                  <Clock3 className="h-3.5 w-3.5" />
                  Action Required
                </>
              ) : (
                <>
                  <CheckCircle className="h-3.5 w-3.5" />
                  Queue Clear
                </>
              )}
            </div>

          </div>

          {/* ==================================================
              LOADING
          =================================================== */}
          {isLoading ? (
            <div className="p-20 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-emerald-600">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-900">
                Loading withdrawal queue
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Retrieving pending member withdrawals...
              </p>

            </div>
          ) : withdrawals.length > 0 ? (
            <>
              {/* ================================================
                  DESKTOP TABLE
              ================================================= */}
              <div className="hidden overflow-x-auto md:block">

                <table className="w-full text-left text-xs">

                  <thead className="bg-slate-50/80">
                    <tr className="border-b border-slate-100">

                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Member
                      </th>

                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Amount
                      </th>

                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Reason
                      </th>

                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Date
                      </th>

                      <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Action
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {withdrawals.map((w) => (
                      <tr
                        key={w.saved_id}
                        className="group transition-colors hover:bg-slate-50/70"
                      >

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-600">
                              <User className="h-4 w-4" />
                            </div>

                            <div>
                              <p className="font-bold text-slate-900">
                                {w.full_name}
                              </p>

                              <p className="mt-0.5 text-[10px] text-slate-400">
                                Withdrawal Request
                              </p>
                            </div>

                          </div>

                        </td>

                        <td className="px-6 py-4">
                          <span className="font-mono text-sm font-extrabold text-emerald-700">
                            ₦{formatCurrency(w.amount)}
                          </span>
                        </td>

                        <td className="px-6 py-4">

                          <div className="flex max-w-xs items-center gap-1.5">

                            <HelpCircle className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                            <span className="font-medium text-slate-700">
                              {w.reason}
                            </span>

                          </div>

                        </td>

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-1.5 font-medium text-slate-500">

                            <Calendar className="h-3.5 w-3.5 text-slate-400" />

                            <span>
                              {formatDate(w.created_at)}
                            </span>

                          </div>

                        </td>

                        <td className="px-6 py-4 text-right">

                          <button
                            type="button"
                            onClick={() =>
                              handleAcknowledge(
                                w.saved_id
                              )
                            }
                            disabled={
                              isMounted
                                ? processingId ===
                                  w.saved_id
                                : undefined
                            }
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-[11px] font-bold text-white shadow-xs transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {processingId ===
                            w.saved_id ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Acknowledge
                              </>
                            )}
                          </button>

                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>

              {/* ================================================
                  MOBILE
              ================================================= */}
              <div className="divide-y divide-slate-100 md:hidden">

                {withdrawals.map((w) => (
                  <div
                    key={w.saved_id}
                    className="space-y-4 p-5"
                  >

                    <div className="flex items-center justify-between gap-3">

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                          <User className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {w.full_name}
                          </p>

                          <p className="text-[10px] text-slate-400">
                            Withdrawal Request
                          </p>
                        </div>

                      </div>

                      <span className="whitespace-nowrap font-mono text-sm font-extrabold text-emerald-700">
                        ₦{formatCurrency(w.amount)}
                      </span>

                    </div>

                    <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">

                      <div className="flex items-start gap-2">

                        <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Reason
                          </p>

                          <p className="mt-0.5 text-xs font-semibold text-slate-700">
                            {w.reason}
                          </p>
                        </div>

                      </div>

                      <div className="flex items-start gap-2">

                        <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Submitted
                          </p>

                          <p className="mt-0.5 text-xs font-semibold text-slate-700">
                            {formatDate(w.created_at)}
                          </p>
                        </div>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleAcknowledge(w.saved_id)
                      }
                      disabled={
                        isMounted
                          ? processingId ===
                            w.saved_id
                          : undefined
                      }
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {processingId ===
                      w.saved_id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Acknowledge Withdrawal
                        </>
                      )}
                    </button>

                  </div>
                ))}

              </div>
            </>
          ) : (
            /* ================================================
               EMPTY
            ================================================= */
            <div className="p-12 text-center sm:p-20">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-900">
                No pending withdrawals
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                The withdrawal queue is currently clear.
                New member withdrawal requests will appear
                here when they require acknowledgement.
              </p>

              <Link
                href="/admin_staff/admin/dashboard"
                className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-600"
              >
                Back to Dashboard
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>

            </div>
          )}

        </section>
      </main>

      {/* ======================================================
          FOOTER
      ======================================================= */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">

        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">

          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">

            <Link
              href="/admin_staff/admin/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 transition-colors hover:text-emerald-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Staff Dashboard
            </Link>

            <p className="text-[11px] text-slate-500">
              &copy; 2026 DCG Multipurpose Cooperative Society Ltd.
              All rights reserved.
            </p>

          </div>

        </div>

      </footer>

    </div>
  );
}
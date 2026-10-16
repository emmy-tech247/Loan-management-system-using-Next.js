"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import {
  ArrowLeft,
  Shield,
  Loader2,
  CheckCircle2,
  FileText,
  BadgeAlert,
  Calendar,
  CreditCard,
  User,
  LogOut,
  Bell,
  RefreshCw,
} from "lucide-react";

import { PendingPayment } from "@/types/acknowledgeDeposits";

export default function AcknowledgeDepositsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const showSuccessBanner =
    searchParams.get("success") === "true";

  const [payments, setPayments] =
    useState<PendingPayment[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [actionLoadingId, setActionLoadingId] =
    useState<number | null>(null);

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  /*
   * Safely parse API responses.
   * Prevents HTML error pages from causing:
   * Unexpected token '<'
   */
  const parseResponse = async (
    response: Response
  ) => {
    const contentType =
      response.headers.get("content-type") || "";

    const text = await response.text();

    if (
      !contentType
        .toLowerCase()
        .includes("application/json")
    ) {
      throw new Error(
        `Server returned an unexpected response (${response.status}).`
      );
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(
        `Server returned invalid JSON (${response.status}).`
      );
    }
  };

  /*
   * Fetch pending deposits
   */
  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "/api/admin_staff/admin/acknowledge-deposits/pending",
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const json =
        await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          json?.message ||
            `Unable to retrieve deposits (${response.status}).`
        );
      }

      if (
        !json ||
        json.success !== true
      ) {
        throw new Error(
          json?.message ||
            "Unable to retrieve pending deposits."
        );
      }

      if (!Array.isArray(json.payments)) {
        throw new Error(
          "Invalid server response. Payments data was not returned as an array."
        );
      }

      setPayments(json.payments);
    } catch (err) {
      console.error(
        "Pending deposits error:",
        err
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Could not retrieve pending deposit records."
        );
      }

      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  /*
   * Acknowledge deposit
   */
  const handleAcknowledge = async (
    savedId: number
  ) => {
    if (actionLoadingId !== null) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to acknowledge this deposit?"
    );

    if (!confirmed) {
      return;
    }

    setActionLoadingId(savedId);
    setError(null);

    try {
      const response = await fetch(
        "/api/admin_staff/admin/acknowledge-deposits/verify",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            saved_id: savedId,
            action: "acknowledge",
          }),
        }
      );

      const json =
        await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          json?.message ||
            `Failed to acknowledge deposit (${response.status}).`
        );
      }

      if (
        !json ||
        json.success !== true
      ) {
        throw new Error(
          json?.message ||
            "The deposit could not be acknowledged."
        );
      }

      /*
       * Reload pending deposits.
       * The acknowledged record should disappear
       * because its status is no longer "pending".
       */
      await fetchPayments();

      /*
       * Show success message.
       */
      router.push(
        "/admin1/acknowledge-deposits?success=true"
      );
    } catch (err) {
      console.error(
        "Acknowledge deposit error:",
        err
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Unable to complete deposit acknowledgment."
        );
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  /*
   * Logout
   */
  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch(
        "/api/auth/logout",
        {
          method: "POST",
        }
      );
    } catch (err) {
      console.error(
        "Logout error:",
        err
      );
    } finally {
      router.push(
        "/admin_staff/staff"
      );
    }
  };

  /*
   * Currency formatting
   */
  const formatCurrency = (
    value: number | string
  ) => {
    const numericValue =
      typeof value === "string"
        ? Number.parseFloat(value)
        : value;

    if (!Number.isFinite(numericValue)) {
      return "0.00";
    }

    return new Intl.NumberFormat(
      "en-NG",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(numericValue);
  };

  /*
   * Date formatting
   */
  const formatDate = (
    dateString: string
  ) => {
    if (!dateString) {
      return "Date unavailable";
    }

    const date =
      new Date(dateString);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
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
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans -mt-28 text-slate-900">

      {/* =========================================================
          NAVIGATION
      ========================================================= */}

      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="flex h-16 items-center justify-between">

            {/* Logo */}

            <div className="flex items-center gap-3">

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

                Staff Portal

              </span>

            </div>

            {/* Right navigation */}

            <div className="flex items-center gap-3">

              {payments.length > 0 &&
                !isLoading &&
                !error && (

                  <div className="hidden md:flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">

                    <Bell className="h-3.5 w-3.5 text-amber-600 animate-pulse" />

                    {payments.length} Pending

                  </div>
                )}

              <Link
                href="/admin_staff/admin/dashboard"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >

                <ArrowLeft className="h-4 w-4" />

                <span className="hidden sm:inline">
                  Back to Dashboard
                </span>

              </Link>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors disabled:opacity-50"
              >

                <LogOut className="h-4 w-4" />

                <span className="hidden sm:inline">
                  {isLoggingOut
                    ? "Logging out..."
                    : "Logout"}
                </span>

              </button>

            </div>

          </div>

        </div>

      </nav>

      {/* =========================================================
          MAIN
      ========================================================= */}

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 mt-2 lg:px-8 space-y-6">

        {/* HERO */}

        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-md">

          <div className="absolute top-0 right-0 -mt-12 -mr-12 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-emerald-400/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-3">

            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-xs">

              <CreditCard className="h-3.5 w-3.5" />

              Financial Operations

            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Payments Awaiting Acknowledgment
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Review and confirm member savings deposits
              submitted for ledger crediting. Verify the
              payment details before acknowledging each
              transaction.
            </p>

            {!isLoading && !error && (

              <div className="pt-2">

                <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200">

                  <CreditCard className="h-4 w-4 text-emerald-400" />

                  <span>
                    {payments.length === 0
                      ? "No pending deposits"
                      : `${payments.length} deposit${
                          payments.length === 1
                            ? ""
                            : "s"
                        } awaiting acknowledgment`}
                  </span>

                </div>

              </div>
            )}

          </div>

        </section>

        {/* SUCCESS */}

        {showSuccessBanner && !error && (

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2 shadow-xs">

            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100">

              <CheckCircle2 className="h-4 w-4 text-emerald-600" />

            </div>

            <span>
              Deposit acknowledged successfully.
            </span>

          </div>
        )}

        {/* ERROR */}

        {error && (

          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 flex items-start gap-3 shadow-xs">

            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-100">

              <BadgeAlert className="h-4 w-4 text-rose-600" />

            </div>

            <div className="flex-1">

              <p className="font-bold text-rose-900">
                Unable to complete request
              </p>

              <p className="mt-0.5">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchPayments}
                disabled={isLoading}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white border border-rose-200 px-3 py-2 text-[11px] font-bold text-rose-700 hover:bg-rose-100 transition-colors disabled:opacity-50"
              >

                <RefreshCw className="h-3.5 w-3.5" />

                Try Again

              </button>

            </div>

          </div>
        )}

        {/* TITLE */}

        {!isLoading &&
          !error &&
          payments.length > 0 && (

            <div>

              <h2 className="text-sm font-extrabold text-slate-900">
                Pending Deposit Requests
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Review the details below and acknowledge valid
                deposits.
              </p>

            </div>
          )}

        {/* LOADING */}

        {isLoading ? (

          <div className="rounded-3xl border border-slate-200 bg-white p-20 text-center shadow-xs">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">

              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />

            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900">
              Loading pending deposits...
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Retrieving deposit records from the database.
            </p>

          </div>

        ) : error ? (

          /* ERROR STATE */

          <div className="rounded-3xl border border-rose-200 bg-white p-12 sm:p-16 text-center shadow-xs">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">

              <BadgeAlert className="h-7 w-7" />

            </div>

            <h3 className="mt-4 text-sm font-extrabold text-slate-900">
              Could Not Load Deposits
            </h3>

            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              The system could not retrieve the pending
              deposit records.
            </p>

            <button
              type="button"
              onClick={fetchPayments}
              className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
            >

              <RefreshCw className="h-3.5 w-3.5" />

              Retry Request

            </button>

          </div>

        ) : payments.length > 0 ? (

          /* PAYMENT LIST */

          <div className="grid grid-cols-1 gap-4">

            {payments.map((payment) => {

              const isActionLoading =
                actionLoadingId ===
                payment.saved_id;

              return (

                <article
                  key={payment.saved_id}
                  className="group rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-slate-300 transition-all"
                >

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                    <div className="min-w-0 flex-1 space-y-4">

                      {/* MEMBER */}

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">

                        <div className="flex items-center gap-2 min-w-0">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">

                            <User className="h-4 w-4" />

                          </div>

                          <div className="min-w-0">

                            <h3 className="text-sm font-extrabold text-slate-900 truncate">
                              {payment.full_name}
                            </h3>

                            <p className="text-[11px] text-slate-500">
                              Member payment request
                            </p>

                          </div>

                        </div>

                        <span className="w-fit text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                          ID: {payment.member_id}
                        </span>

                      </div>

                      {/* DETAILS */}

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

                        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">

                          <span className="text-[10px] uppercase tracking-wide font-bold text-emerald-600">
                            Amount
                          </span>

                          <p className="mt-1 text-lg font-extrabold font-mono text-emerald-700">
                            ₦
                            {formatCurrency(
                              payment.amount
                            )}
                          </p>

                        </div>

                        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">

                          <span className="text-[10px] uppercase tracking-wide font-bold text-slate-400">
                            Reference
                          </span>

                          <p className="mt-1 text-xs font-bold font-mono text-slate-900 break-all">
                            {payment.reference ||
                              "N/A"}
                          </p>

                        </div>

                        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">

                          <span className="text-[10px] uppercase tracking-wide font-bold text-slate-400">
                            Submitted
                          </span>

                          <div className="mt-1 flex items-start gap-1.5 text-xs font-semibold text-slate-700">

                            <Calendar className="h-3.5 w-3.5 mt-0.5 shrink-0 text-slate-400" />

                            <span>
                              {formatDate(
                                payment.created_at
                              )}
                            </span>

                          </div>

                        </div>

                      </div>

                      {/* RECEIPT */}

                      {payment.receipt_file && (

                        <div className="border-t border-slate-100 pt-3">

                          <a
                            href={
                              payment.receipt_file
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                          >

                            <FileText className="h-4 w-4" />

                            View Uploaded Receipt

                          </a>

                        </div>
                      )}

                    </div>

                    {/* ACTION */}

                    <div className="w-full lg:w-auto shrink-0">

                      <button
                        onClick={() =>
                          handleAcknowledge(
                            payment.saved_id
                          )
                        }
                        disabled={
                          isActionLoading
                        }
                        className="w-full lg:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-extrabold text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs hover:shadow-md"
                      >

                        {isActionLoading ? (

                          <Loader2 className="h-4 w-4 animate-spin" />

                        ) : (

                          <CheckCircle2 className="h-4 w-4" />

                        )}

                        {isActionLoading
                          ? "Processing..."
                          : "Acknowledge Deposit"}

                      </button>

                      <p className="text-[10px] text-slate-400 text-center mt-2">
                        Confirm this payment has been received.
                      </p>

                    </div>

                  </div>

                </article>
              );
            })}

          </div>

        ) : (

          /* EMPTY */

          <div className="rounded-3xl border border-slate-200 bg-white p-12 sm:p-16 text-center shadow-xs">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

              <BadgeAlert className="h-7 w-7" />

            </div>

            <h3 className="mt-4 text-sm font-extrabold text-slate-900">
              No Pending Deposits
            </h3>

            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              There are currently no new member deposits waiting
              for acknowledgment.
            </p>

            <button
              type="button"
              onClick={fetchPayments}
              className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
            >

              <RefreshCw className="h-3.5 w-3.5" />

              Refresh

            </button>

          </div>
        )}

      </main>

      {/* FOOTER */}

      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">

        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 space-y-2">

          <Link
            href="/admin_staff/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >

            <ArrowLeft className="h-3.5 w-3.5" />

            Back to Staff Dashboard

          </Link>

          <p className="text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} DCG Multipurpose
            Cooperative Society Ltd. All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  );
}
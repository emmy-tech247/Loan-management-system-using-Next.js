"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Shield,
  Loader2,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Percent,
  LogOut,
  Clock,
  FileCheck,
  RefreshCw,
} from "lucide-react";

import { FixedDepositApprovalItem } from "@/types/acknowledgeFd";

type ApiResponse = {
  success?: boolean;
  message?: string;
  error?: string;

  pendingApprovals?: FixedDepositApprovalItem[];

  details?: {
    fixedDepositsTable?: boolean;
    fdActionsTable?: boolean;
    fixedDepositColumns?: string[];
    fdActionColumns?: string[];
  };
};

export default function AcknowledgeFdPage() {
  const router = useRouter();

  // ============================================================
  // STATE
  // ============================================================

  const [approvals, setApprovals] =
    useState<FixedDepositApprovalItem[]>([]);

  const [isLoading, setIsLoading] =
    useState<boolean>(true);

  const [isRefreshing, setIsRefreshing] =
    useState<boolean>(false);

  const [processingId, setProcessingId] =
    useState<number | null>(null);

  const [isLoggingOut, setIsLoggingOut] =
    useState<boolean>(false);

  const [isMounted, setIsMounted] =
    useState<boolean>(false);

  const [statusMessage, setStatusMessage] =
    useState<{
      text: string;
      type: "success" | "error";
    } | null>(null);

  // ============================================================
  // FETCH PENDING FIXED DEPOSITS
  // ============================================================

  const fetchPendingApprovals = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setStatusMessage(null);

      try {
        const res = await fetch(
          "/api/admin_staff/admin/acknowledge-fd",
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }
        );

        // ------------------------------------------------------
        // Read response as text first.
        // This protects against HTML 404/500 responses.
        // ------------------------------------------------------

        const contentType =
          res.headers.get("content-type") || "";

        const rawText = await res.text();

        let json: ApiResponse = {};

        if (
          contentType
            .toLowerCase()
            .includes("application/json")
        ) {
          try {
            json = JSON.parse(rawText);
          } catch (parseError) {
            console.error(
              "Failed to parse fixed deposit API response:",
              parseError
            );

            throw new Error(
              "The server returned invalid JSON."
            );
          }
        } else {
          console.error(
            "Non-JSON fixed deposit API response:",
            rawText.substring(0, 1000)
          );

          throw new Error(
            `Server returned an unexpected response (${res.status}).`
          );
        }

        // ------------------------------------------------------
        // SUCCESS
        // ------------------------------------------------------

        if (res.ok && json.success) {
          setApprovals(
            Array.isArray(json.pendingApprovals)
              ? json.pendingApprovals
              : []
          );

          setStatusMessage(null);

          return;
        }

        // ------------------------------------------------------
        // SERVER ERROR
        // ------------------------------------------------------

        const errorMessage =
          json.error ||
          json.message ||
          `Failed to load pending fixed deposit applications. HTTP ${res.status}.`;

        console.error(
          "Fixed deposit API error:",
          json
        );

        throw new Error(errorMessage);
      } catch (error: unknown) {
        console.error(
          "Fetch pending fixed deposit applications error:",
          error
        );

        const message =
          error instanceof Error
            ? error.message
            : "Network error. Could not retrieve pending approvals.";

        setStatusMessage({
          text: message,
          type: "error",
        });

        setApprovals([]);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    setIsMounted(true);
    fetchPendingApprovals();
  }, [fetchPendingApprovals]);

  // ============================================================
  // ACKNOWLEDGE FIXED DEPOSIT
  // ============================================================

  const handleAcknowledge = async (
    approvalId: number,
    fdId: number
  ) => {
    setProcessingId(fdId);
    setStatusMessage(null);

    try {
      const res = await fetch(
        "/api/admin_staff/admin/acknowledge-fd/action",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            action: "acknowledge",
            approval_id: approvalId,
            fd_id: fdId,
          }),
        }
      );

      const contentType =
        res.headers.get("content-type") || "";

      const rawText = await res.text();

      let json: {
        success?: boolean;
        message?: string;
        error?: string;
      } = {};

      if (
        contentType
          .toLowerCase()
          .includes("application/json")
      ) {
        try {
          json = JSON.parse(rawText);
        } catch {
          throw new Error(
            "The acknowledgment server returned invalid JSON."
          );
        }
      } else {
        console.error(
          "Non-JSON acknowledgment response:",
          rawText.substring(0, 1000)
        );

        throw new Error(
          `Server returned an unexpected response (${res.status}).`
        );
      }

      if (res.ok && json.success) {
        setStatusMessage({
          text:
            json.message ||
            "Fixed deposit acknowledged successfully.",
          type: "success",
        });

        setApprovals((prev) =>
          prev.filter(
            (item) => item.fd_id !== fdId
          )
        );
      } else {
        throw new Error(
          json.error ||
            json.message ||
            "Failed to acknowledge fixed deposit."
        );
      }
    } catch (error: unknown) {
      console.error(
        "Acknowledge fixed deposit error:",
        error
      );

      setStatusMessage({
        text:
          error instanceof Error
            ? error.message
            : "Network error. Failed to complete acknowledgment action.",
        type: "error",
      });
    } finally {
      setProcessingId(null);
    }
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      router.push("/staff");
    }
  };

  // ============================================================
  // FORMAT CURRENCY
  // ============================================================

  const formatCurrency = (
    val: number | string | null | undefined
  ): string => {
    if (val === null || val === undefined) {
      return "0.00";
    }

    const numericVal =
      typeof val === "string"
        ? parseFloat(val)
        : val;

    if (Number.isNaN(numericVal)) {
      return "0.00";
    }

    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericVal);
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (
    dateValue: string | Date | null | undefined
  ): string => {
    if (!dateValue) {
      return "—";
    }

    try {
      const date = new Date(dateValue);

      if (Number.isNaN(date.getTime())) {
        return String(dateValue);
      }

      const day = String(
        date.getDate()
      ).padStart(2, "0");

      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const month =
        months[date.getMonth()];

      const year =
        date.getFullYear();

      return `${day} ${month} ${year}`;
    } catch {
      return String(dateValue);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans -mt-28 text-slate-900">

      {/* =======================================================
          NAVBAR
      ======================================================= */}

      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="flex h-16 items-center justify-between">

            {/* LOGO */}

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

            {/* NAVIGATION */}

            <div className="flex items-center gap-2 sm:gap-3">

              {/* PENDING */}

              <div className="hidden md:flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700">

                <Clock className="h-3.5 w-3.5 text-amber-600" />

                {approvals.length} Pending

              </div>

              {/* REFRESH */}

              <button
                type="button"
                onClick={() =>
                  fetchPendingApprovals(true)
                }
                disabled={
                  isMounted &&
                  (isRefreshing || isLoading)
                }
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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

              {/* BACK */}

              <Link
                href="/admin_staff/admin/dashboard"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              >

                <ArrowLeft className="h-4 w-4" />

                <span className="hidden sm:inline">
                  Dashboard
                </span>

              </Link>

              {/* LOGOUT */}

              <button
                type="button"
                onClick={handleLogout}
                disabled={
                  isMounted && isLoggingOut
                }
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
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

      {/* =======================================================
          MAIN
      ======================================================= */}

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 mt-2 sm:px-6 lg:px-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">

          <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-emerald-400/5 blur-3xl" />

          <div className="relative z-10 max-w-3xl space-y-3">

            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-[11px] font-bold text-emerald-300 backdrop-blur-sm">

              <Building2 className="h-3.5 w-3.5" />

              Fixed Deposit Management

            </span>

            <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Acknowledge Fixed Deposit Applications
            </h1>

            <p className="max-w-2xl text-xs leading-relaxed text-slate-300 sm:text-sm">
              Review pending fixed deposit applications submitted by
              cooperative members and acknowledge approved applications
              from the staff portal.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">

              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">

                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Pending Applications
                </p>

                <p className="mt-0.5 text-lg font-extrabold text-white">
                  {approvals.length}
                </p>

              </div>

              <div className="rounded-xl border border-emerald-400/10 bg-emerald-500/10 px-4 py-2 backdrop-blur-sm">

                <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                  Status
                </p>

                <p className="mt-0.5 text-sm font-bold text-emerald-300">

                  {approvals.length > 0
                    ? "Action Required"
                    : "Queue Clear"}

                </p>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            STATUS MESSAGE
        ===================================================== */}

        {statusMessage && (

          <div
            className={`mt-6 flex items-start gap-3 rounded-2xl border p-4 text-xs font-semibold shadow-sm ${
              statusMessage.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >

            {statusMessage.type === "success" ? (

              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

            ) : (

              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />

            )}

            <span>
              {statusMessage.text}
            </span>

          </div>

        )}

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <div className="mt-6">

          {isLoading ? (

            <div className="rounded-3xl border border-slate-200 bg-white p-20 text-center shadow-sm">

              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">

                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />

              </div>

              <h2 className="text-sm font-bold text-slate-900">
                Loading pending approvals
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Retrieving fixed deposit applications...
              </p>

            </div>

          ) : (

            <div className="space-y-6">

              {/* =================================================
                  QUEUE
              ================================================= */}

              <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

                <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

                      <FileCheck className="h-5 w-5" />

                    </div>

                    <div>

                      <h2 className="text-sm font-extrabold text-slate-900">
                        Pending Approvals Queue
                      </h2>

                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Fixed deposit applications awaiting acknowledgment.
                      </p>

                    </div>

                  </div>

                  <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-600">

                    <Clock className="h-3.5 w-3.5 text-slate-400" />

                    {approvals.length}{" "}

                    {approvals.length === 1
                      ? "Application"
                      : "Applications"}

                  </div>

                </div>

                {approvals.length > 0 ? (

                  <div className="overflow-x-auto">

                    <table className="w-full min-w-[850px] text-left text-xs">

                      <thead>

                        <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] uppercase tracking-wider text-slate-400">

                          <th className="px-6 py-3 font-extrabold">
                            FD ID
                          </th>

                          <th className="px-6 py-3 font-extrabold">
                            Amount
                          </th>

                          <th className="px-6 py-3 font-extrabold">
                            Tenure
                          </th>

                          <th className="px-6 py-3 font-extrabold">
                            Interest Rate
                          </th>

                          <th className="px-6 py-3 font-extrabold">
                            Start Date
                          </th>

                          <th className="px-6 py-3 text-right font-extrabold">
                            Action
                          </th>

                        </tr>

                      </thead>

                      <tbody className="divide-y divide-slate-50">

                        {approvals.map((fd) => (

                          <tr
                            key={fd.fd_id}
                            className="group transition-colors hover:bg-slate-50/70"
                          >

                            <td className="px-6 py-4">

                              <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-bold text-slate-700">
                                #{fd.fd_id}
                              </span>

                            </td>

                            <td className="px-6 py-4">

                              <div className="font-mono text-sm font-extrabold text-emerald-700">

                                ₦
                                {formatCurrency(
                                  fd.amount_deposited
                                )}

                              </div>

                            </td>

                            <td className="px-6 py-4">

                              <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">

                                {fd.tenure_months} months

                              </span>

                            </td>

                            <td className="px-6 py-4">

                              <span className="inline-flex items-center gap-1 font-semibold text-slate-700">

                                {fd.interest_rate}

                                <Percent className="h-3 w-3 text-emerald-600" />

                              </span>

                            </td>

                            <td className="px-6 py-4">

                              <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">

                                <Calendar className="h-3.5 w-3.5 text-slate-400" />

                                {formatDate(
                                  fd.start_date
                                )}

                              </span>

                            </td>

                            <td className="px-6 py-4 text-right">

                              <button
                                type="button"
                                onClick={() =>
                                  handleAcknowledge(
                                    fd.approval_id,
                                    fd.fd_id
                                  )
                                }
                                disabled={
                                  isMounted &&
                                  processingId === fd.fd_id
                                }
                                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2.5 text-[11px] font-extrabold text-white shadow-sm transition-all hover:bg-emerald-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                              >

                                {processingId ===
                                fd.fd_id ? (

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

                ) : (

                  <div className="p-12 text-center sm:p-16">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">

                      <CheckCircle2 className="h-7 w-7" />

                    </div>

                    <h3 className="mt-4 text-sm font-extrabold text-slate-900">
                      No Pending Applications
                    </h3>

                    <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500">
                      There are currently no fixed deposit applications
                      waiting for acknowledgment.
                    </p>

                    <Link
                      href="/admin_staff/admin/dashboard"
                      className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-600"
                    >

                      <ArrowLeft className="h-3.5 w-3.5" />

                      Return to Dashboard

                    </Link>

                  </div>

                )}

              </section>

              {/* =================================================
                  INFORMATION
              ================================================= */}

              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">

                    <Building2 className="h-4 w-4" />

                  </div>

                  <div>

                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Fixed Deposit Processing
                    </h3>

                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      Review the deposit amount, tenure, interest rate,
                      and start date before acknowledging an application.
                      Acknowledged applications are removed from this
                      pending queue.
                    </p>

                  </div>

                </div>

              </section>

            </div>

          )}

        </div>

      </main>

      {/* =======================================================
          FOOTER
      ======================================================= */}

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
            &copy; 2026 DCG Multipurpose Cooperative Society Ltd.
            All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  );
}
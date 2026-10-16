"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  Shield,
  LogOut,
  Bell,
  Landmark,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowLeft,
  Clock3,
  User,
  CalendarDays,
  AlertTriangle,
  Loader2,
} from "lucide-react";

type FDWithdrawal = {
  id: number;
  member_id: number;
  action_type: "withdraw" | "rollover" | string;
  status:
    | "pending"
    | "acknowledged"
    | "confirmed"
    | "rejected"
    | string;
  created_at: string;
  full_name: string;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  withdrawals?: FDWithdrawal[];
  error?: string;
};

export default function FDWithdrawalsPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<
    FDWithdrawal[]
  >([]);

  const [loading, setLoading] =
    useState(false);

  const [processingId, setProcessingId] =
    useState<number | null>(null);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState<"success" | "error" | "">("");

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  const [isMounted, setIsMounted] =
    useState(false);

  /* ============================================================
     SAFE JSON RESPONSE
  ============================================================ */

  const readJsonResponse = async (
    response: Response
  ): Promise<ApiResponse> => {
    const text =
      await response.text();

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    console.log(
      "FD WITHDRAWAL API RESPONSE:",
      {
        status: response.status,
        statusText:
          response.statusText,
        contentType,
        text,
      }
    );

    if (!text.trim()) {
      return {
        success: false,
        message: `Server returned an empty response (${response.status}).`,
      };
    }

    if (
      contentType.includes(
        "application/json"
      )
    ) {
      try {
        return JSON.parse(
          text
        ) as ApiResponse;
      } catch {
        return {
          success: false,
          message:
            "The server returned invalid JSON.",
        };
      }
    }

    if (
      text.includes(
        "<!DOCTYPE html"
      ) ||
      text.includes("<html")
    ) {
      return {
        success: false,
        message:
          response.status === 404
            ? "The FD withdrawal API route was not found."
            : "The server returned an HTML error page instead of JSON.",
      };
    }

    try {
      return JSON.parse(
        text
      ) as ApiResponse;
    } catch {
      return {
        success: false,
        message:
          text ||
          `Unexpected server response (${response.status}).`,
      };
    }
  };

  /* ============================================================
     FETCH REQUESTS
  ============================================================ */

  const fetchRequests =
    useCallback(async () => {
      setLoading(true);
      setMessage("");
      setMessageType("");

      try {
        const response =
          await fetch(
            "/api/admin_staff/md/fd-withdrawals",
            {
              method: "GET",
              credentials: "include",
              cache: "no-store",
              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        const data =
          await readJsonResponse(
            response
          );

        console.log(
          "FD WITHDRAWALS DATA:",
          data
        );

        if (
          !response.ok ||
          data.success === false
        ) {
          throw new Error(
            data.message ||
              data.error ||
              `Failed to load requests (${response.status}).`
          );
        }

        setRequests(
          Array.isArray(
            data.withdrawals
          )
            ? data.withdrawals
            : []
        );
      } catch (error) {
        console.error(
          "fetchRequests error:",
          error
        );

        setRequests([]);

        setMessage(
          error instanceof Error
            ? error.message
            : "Failed to load requests."
        );

        setMessageType("error");
      } finally {
        setLoading(false);
      }
    }, []);

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    setIsMounted(true);
    fetchRequests();
  }, [fetchRequests]);

  /* ============================================================
     CONFIRM / REJECT
  ============================================================ */

  const handleDecision = async (
    id: number,
    action: "confirm" | "reject"
  ) => {
    const request =
      requests.find(
        (item) =>
          item.id === id
      );

    if (!request) {
      return;
    }

    const actionLabel =
      action === "confirm"
        ? "confirm"
        : "reject";

    const confirmed =
      window.confirm(
        `Are you sure you want to ${actionLabel} this ${request.action_type} request?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(id);
      setMessage("");
      setMessageType("");

      const response =
        await fetch(
          "/api/admin_staff/md/fd-withdrawals",
          {
            method: "POST",
            credentials: "include",
            cache: "no-store",
            headers: {
              "Content-Type":
                "application/json",
              Accept:
                "application/json",
            },
            body: JSON.stringify({
              id,
              action,
            }),
          }
        );

      const data =
        await readJsonResponse(
          response
        );

      console.log(
        "FD WITHDRAWAL DECISION:",
        data
      );

      if (
        !response.ok ||
        data.success === false
      ) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to process request."
        );
      }

      setMessage(
        data.message ||
          "Request processed successfully."
      );

      setMessageType(
        "success"
      );

      setRequests(
        (current) =>
          current.filter(
            (item) =>
              item.id !== id
          )
      );
    } catch (error) {
      console.error(
        "handleDecision error:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to process request."
      );

      setMessageType(
        "error"
      );
    } finally {
      setProcessingId(null);
    }
  };

  /* ============================================================
     LOGOUT
  ============================================================ */

  const handleLogout =
    async () => {
      if (isLoggingOut) {
        return;
      }

      setIsLoggingOut(true);

      try {
        await fetch(
          "/api/admin_staff/logout",
          {
            method: "POST",
            credentials:
              "include",
            cache: "no-store",
            headers: {
              Accept:
                "application/json",
            },
          }
        );
      } catch (error) {
        console.error(
          "Logout error:",
          error
        );
      } finally {
        router.push("/staff");
        router.refresh();
      }
    };

  /* ============================================================
     DATE FORMAT
  ============================================================ */

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
        dateStyle:
          "medium",
        timeStyle:
          "short",
      }
    );
  };

  /* ============================================================
     ACTION FORMAT
  ============================================================ */

  const formatAction = (
    action: string
  ) => {
    if (!action) {
      return "Unknown";
    }

    return (
      action
        .charAt(0)
        .toUpperCase() +
      action.slice(1)
    );
  };

  /* ============================================================
     HYDRATION-SAFE INITIAL UI
  ============================================================ */

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />

          <p className="mt-3 text-sm font-semibold text-slate-700">
            Loading executive portal...
          </p>
        </div>
      </div>
    );
  }

  /* ============================================================
     MAIN PAGE
  ============================================================ */

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans -mt-28 text-slate-900">

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="flex h-16 items-center justify-between">

            {/* Logo */}

            <div className="flex items-center gap-3">

              <Link
                href="/admin_staff/md/dashboard"
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
                Executive Portal
              </span>

            </div>

            {/* Right */}

            <div className="flex items-center gap-3">

              {requests.length > 0 && (
                <div className="hidden md:flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-700">

                  <Bell className="h-3.5 w-3.5 text-amber-600 animate-pulse" />

                  {requests.length} Pending

                </div>
              )}

              <button
                type="button"
                onClick={
                  handleLogout
                }
                disabled={
                  isLoggingOut
                }
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >

                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}

                <span>
                  {isLoggingOut
                    ? "Logging out..."
                    : "Logout"}
                </span>

              </button>

            </div>

          </div>

        </div>
      </nav>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 mt-2 sm:px-6 lg:px-8 mt-2 space-y-6">

        {/* ===================================================
            HERO
        ==================================================== */}

        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-md">

          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10">

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              <div className="space-y-3">

                <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">

                  <Landmark className="h-3.5 w-3.5" />

                  Fixed Deposit Management

                </span>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Fixed Deposit Withdrawals & Rollover
                </h1>

                <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-300">
                  Review and process fixed deposit withdrawal and rollover requests awaiting Managing Director confirmation.
                </p>

              </div>

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 border border-white/10">

                <Landmark className="h-8 w-8 text-emerald-300" />

              </div>

            </div>

          </div>

        </section>

        {/* ===================================================
            MESSAGE
        ==================================================== */}

        {message && (
          <div
            className={`flex items-start gap-3 rounded-2xl border p-4 text-sm font-medium ${
              messageType ===
              "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >

            {messageType ===
            "success" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            )}

            <p>
              {message}
            </p>

          </div>
        )}

        {/* ===================================================
            SUMMARY
        ==================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold text-slate-500">
                  Pending Requests
                </p>

                <p className="mt-2 text-2xl font-extrabold text-slate-900">
                  {requests.length}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock3 className="h-5 w-5" />
              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold text-slate-500">
                  Withdrawals
                </p>

                <p className="mt-2 text-2xl font-extrabold text-slate-900">
                  {
                    requests.filter(
                      (item) =>
                        item.action_type ===
                        "withdraw"
                    ).length
                  }
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <ArrowLeft className="h-5 w-5" />
              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold text-slate-500">
                  Rollovers
                </p>

                <p className="mt-2 text-2xl font-extrabold text-slate-900">
                  {
                    requests.filter(
                      (item) =>
                        item.action_type ===
                        "rollover"
                    ).length
                  }
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <RefreshCw className="h-5 w-5" />
              </div>

            </div>

          </div>

        </div>

        {/* ===================================================
            REQUESTS
        ==================================================== */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-sm font-bold text-slate-900">
                Pending FD Requests
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Requests requiring Managing Director action.
              </p>

            </div>

            <button
              type="button"
              onClick={
                fetchRequests
              }
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <RefreshCw
                className={`h-4 w-4 ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />

              {loading
                ? "Refreshing..."
                : "Refresh"}

            </button>

          </div>

          {loading ? (

            <div className="flex flex-col items-center justify-center py-16">

              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />

              <p className="mt-4 text-xs font-medium text-slate-500">
                Loading requests...
              </p>

            </div>

          ) : requests.length === 0 ? (

            <div className="px-6 py-16 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">

                <CheckCircle2 className="h-7 w-7" />

              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-900">
                No pending requests
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                There are currently no fixed deposit withdrawal or rollover requests waiting for confirmation.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px] text-left">

                <thead>

                  <tr className="border-b border-slate-200 bg-slate-50">

                    <th className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      ID
                    </th>

                    <th className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      Member
                    </th>

                    <th className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      Action
                    </th>

                    <th className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      Date
                    </th>

                    <th className="px-5 py-3 text-right text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      Decision
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {requests.map(
                    (request) => {

                      const isProcessing =
                        processingId ===
                        request.id;

                      const isWithdrawal =
                        request.action_type ===
                        "withdraw";

                      return (

                        <tr
                          key={
                            request.id
                          }
                          className="transition-colors hover:bg-slate-50/80"
                        >

                          <td className="px-5 py-4">

                            <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                              #{request.id}
                            </span>

                          </td>

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">

                                <User className="h-4 w-4" />

                              </div>

                              <div>

                                <p className="text-sm font-bold text-slate-900">
                                  {
                                    request.full_name
                                  }
                                </p>

                                <p className="text-[11px] text-slate-500">
                                  Member ID:{" "}
                                  {
                                    request.member_id
                                  }
                                </p>

                              </div>

                            </div>

                          </td>

                          <td className="px-5 py-4">

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                isWithdrawal
                                  ? "bg-rose-50 text-rose-700 border border-rose-100"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              }`}
                            >

                              {isWithdrawal ? (
                                <ArrowLeft className="h-3 w-3" />
                              ) : (
                                <RefreshCw className="h-3 w-3" />
                              )}

                              {formatAction(
                                request.action_type
                              )}

                            </span>

                          </td>

                          <td className="px-5 py-4">

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700">

                              <Clock3 className="h-3 w-3" />

                              {formatAction(
                                request.status
                              )}

                            </span>

                          </td>

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2 text-xs text-slate-600">

                              <CalendarDays className="h-3.5 w-3.5 text-slate-400" />

                              {formatDate(
                                request.created_at
                              )}

                            </div>

                          </td>

                          <td className="px-5 py-4">

                            <div className="flex justify-end gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  handleDecision(
                                    request.id,
                                    "confirm"
                                  )
                                }
                                disabled={
                                  processingId !==
                                  null
                                }
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >

                                {isProcessing ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                )}

                                {isProcessing
                                  ? "Processing..."
                                  : "Confirm"}

                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDecision(
                                    request.id,
                                    "reject"
                                  )
                                }
                                disabled={
                                  processingId !==
                                  null
                                }
                                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2 text-[11px] font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >

                                <XCircle className="h-3.5 w-3.5" />

                                Reject

                              </button>

                            </div>

                          </td>

                        </tr>

                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

        {/* ===================================================
            BACK
        ==================================================== */}

        <div className="flex justify-center pt-2">

          <Link
            href="/admin_staff/md/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >

            <ArrowLeft className="h-4 w-4" />

            Back to MD Dashboard

          </Link>

        </div>

      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="mt-auto border-t border-slate-200 bg-white py-6">

        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">

          <p className="text-xs text-slate-500">
            &copy;{" "}
            {new Date().getFullYear()}{" "}
            DCG Multipurpose Cooperative Society Ltd.
            All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  );
}


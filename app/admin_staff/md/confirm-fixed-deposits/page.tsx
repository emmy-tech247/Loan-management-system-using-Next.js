"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  DollarSign,
  FileCheck2,
  Loader2,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
  XCircle,
} from "lucide-react";

type FixedDeposit = {
  approval_id: number;
  fd_id: number;
  amount_deposited: number;
  tenure_months: number;
  interest_rate: number;
  maturity_date: string;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  fixedDeposits?: FixedDeposit[];
  error?: string;
};

type MessageType = "success" | "error" | null;

export default function ConfirmFixedDepositsPage() {
  const router = useRouter();

  const [fixedDeposits, setFixedDeposits] = useState<FixedDeposit[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] =
    useState<MessageType>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /*
   * IMPORTANT:
   * Prevent the interactive page from being rendered during
   * server hydration. This avoids the React hydration warning:
   *
   * disabled={true}
   * disabled={null}
   */
  const [isMounted, setIsMounted] = useState(false);

  // ------------------------------------------------------------
  // Safe JSON response reader
  // ------------------------------------------------------------
  const readJsonResponse = async (
    response: Response
  ): Promise<ApiResponse> => {
    const responseText = await response.text();

    const contentType =
      response.headers.get("content-type") || "";

    console.log("FIXED DEPOSIT API RESPONSE:", {
      status: response.status,
      statusText: response.statusText,
      contentType,
      responseText,
    });

    if (!responseText.trim()) {
      return {
        success: false,
        message: `Server returned an empty response (${response.status}).`,
      };
    }

    if (contentType.includes("application/json")) {
      try {
        return JSON.parse(responseText) as ApiResponse;
      } catch (error) {
        console.error(
          "Invalid JSON returned by fixed deposit API:",
          error
        );

        return {
          success: false,
          message:
            "The server returned invalid JSON. Please check the API route.",
        };
      }
    }

    /*
     * Sometimes Next.js/server errors return HTML instead of JSON.
     * Never call response.json() blindly.
     */
    if (
      responseText.includes("<!DOCTYPE html") ||
      responseText.includes("<html")
    ) {
      console.error(
        "HTML response received instead of JSON:",
        responseText
      );

      return {
        success: false,
        message:
          response.status === 404
            ? "The fixed deposit API route was not found."
            : "The server returned an HTML error page instead of JSON.",
      };
    }

    try {
      return JSON.parse(responseText) as ApiResponse;
    } catch {
      return {
        success: false,
        message:
          responseText ||
          `Unexpected server response (${response.status}).`,
      };
    }
  };

  // ------------------------------------------------------------
  // Load fixed deposits
  // ------------------------------------------------------------
  const fetchFixedDeposits = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    setMessageType(null);

    try {
      const response = await fetch(
        "/api/admin_staff/md/confirm-fixed-deposits",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await readJsonResponse(response);

      console.log(
        "FIXED DEPOSIT LIST RESPONSE:",
        data
      );

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ||
            data.error ||
            `Unable to load fixed deposits (${response.status}).`
        );
      }

      const deposits = Array.isArray(data.fixedDeposits)
        ? data.fixedDeposits
        : [];

      setFixedDeposits(deposits);
    } catch (error) {
      console.error(
        "fetchFixedDeposits error:",
        error
      );

      setFixedDeposits([]);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load fixed deposits."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }, []);

  // ------------------------------------------------------------
  // Initial client mount
  // ------------------------------------------------------------
  useEffect(() => {
    setIsMounted(true);
    fetchFixedDeposits();
  }, [fetchFixedDeposits]);

  // ------------------------------------------------------------
  // Confirm fixed deposit
  // ------------------------------------------------------------
  const handleConfirm = async (fdId: number) => {
    if (!Number.isInteger(fdId) || fdId <= 0) {
      setMessage("Invalid fixed deposit ID.");
      setMessageType("error");
      return;
    }

    if (confirmingId !== null) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to confirm this fixed deposit?"
    );

    if (!confirmed) {
      return;
    }

    setConfirmingId(fdId);
    setMessage(null);
    setMessageType(null);

    try {
      const response = await fetch(
        "/api/admin_staff/md/confirm-fixed-deposit",
        {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            fd_id: fdId,
          }),
        }
      );

      const data = await readJsonResponse(response);

      console.log(
        "CONFIRM FIXED DEPOSIT RESPONSE:",
        data
      );

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ||
            data.error ||
            `Unable to confirm fixed deposit (${response.status}).`
        );
      }

      setMessage(
        data.message ||
          "Fixed deposit confirmed successfully."
      );

      setMessageType("success");

      /*
       * Remove the confirmed deposit immediately from
       * the current list so the UI updates without requiring
       * a full page refresh.
       */
      setFixedDeposits((current) =>
        current.filter(
          (deposit) => deposit.fd_id !== fdId
        )
      );

      /*
       * Refresh the list from the database after confirmation.
       * This ensures the frontend reflects the actual database state.
       */
      await fetchFixedDeposits();
    } catch (error) {
      console.error(
        "handleConfirm fixed deposit error:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to confirm fixed deposit."
      );

      setMessageType("error");
    } finally {
      setConfirmingId(null);
    }
  };

  // ------------------------------------------------------------
  // Logout
  // ------------------------------------------------------------
  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      const response = await fetch(
        "/api/admin_staff/logout",
        {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        }
      );

      /*
       * We do not require the logout API to return JSON
       * because the important action is redirecting the user.
       */
      if (!response.ok) {
        console.error(
          "Logout request failed:",
          response.status
        );
      }
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

  // ------------------------------------------------------------
  // Filter deposits
  // ------------------------------------------------------------
  const filteredDeposits = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return fixedDeposits;
    }

    return fixedDeposits.filter((deposit) => {
      const fdId =
        String(deposit.fd_id).toLowerCase();

      const approvalId =
        String(deposit.approval_id).toLowerCase();

      const amount =
        String(deposit.amount_deposited).toLowerCase();

      const tenure =
        String(deposit.tenure_months).toLowerCase();

      const interest =
        String(deposit.interest_rate).toLowerCase();

      const maturity =
        String(deposit.maturity_date || "").toLowerCase();

      return (
        fdId.includes(query) ||
        approvalId.includes(query) ||
        amount.includes(query) ||
        tenure.includes(query) ||
        interest.includes(query) ||
        maturity.includes(query)
      );
    });
  }, [fixedDeposits, searchQuery]);

  // ------------------------------------------------------------
  // Summary calculations
  // ------------------------------------------------------------
  const totalAmount = useMemo(() => {
    return fixedDeposits.reduce(
      (total, deposit) =>
        total + Number(deposit.amount_deposited || 0),
      0
    );
  }, [fixedDeposits]);

  const averageInterestRate = useMemo(() => {
    if (fixedDeposits.length === 0) {
      return 0;
    }

    const totalRate = fixedDeposits.reduce(
      (total, deposit) =>
        total + Number(deposit.interest_rate || 0),
      0
    );

    return totalRate / fixedDeposits.length;
  }, [fixedDeposits]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  };

  const formatDate = (date: string) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-NG",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ------------------------------------------------------------
  // Hydration-safe initial render
  // ------------------------------------------------------------
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-700">
              Loading fixed deposits...
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Please wait while the portal is initialized.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // Main page
  // ------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 font-sans -mt-28 text-slate-900">
      {/* ======================================================
          NAVBAR
      ====================================================== */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/admin_staff/md/dashboard"
            className="flex items-center gap-3"
          >
            <div className="relative h-11 w-11 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <Image
                src="/images/logo2.png"
                alt="DCG Cooperative Society"
                fill
                sizes="44px"
                className="object-contain p-1"
                priority
              />
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-bold tracking-tight text-slate-900">
                DCG MULTIPURPOSE
              </p>
              <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-600">
                Cooperative Society Ltd
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/admin_staff/md/dashboard"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">
                Dashboard
              </span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}

              <span className="hidden sm:inline">
                {isLoggingOut
                  ? "Logging out..."
                  : "Logout"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================
          MAIN
      ====================================================== */}
      <main className="mx-auto max-w-7xl px-4 py-6 mt-2  sm:px-6 lg:px-8 lg:py-8">
        {/* ====================================================
            HERO
        ==================================================== */}
        <section className="overflow-hidden rounded-2xl bg-slate-900 shadow-lg">
          <div className="relative px-5 py-7 sm:px-8 sm:py-9">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-emerald-400/5 blur-3xl" />

            <div className="relative">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
                Managing Director Portal
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Confirm Fixed Deposits
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Review and confirm fixed deposit requests that
                have been forwarded for final management
                confirmation.
              </p>
            </div>
          </div>
        </section>

        {/* ====================================================
            MESSAGE
        ==================================================== */}
        {message && (
          <div
            className={`mt-5 flex items-start gap-3 rounded-xl border px-4 py-3 ${
              messageType === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {messageType === "success" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
            )}

            <p className="text-sm font-medium">
              {message}
            </p>

            <button
              type="button"
              onClick={() => {
                setMessage(null);
                setMessageType(null);
              }}
              className="ml-auto text-xs font-semibold opacity-70 transition hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ====================================================
            SUMMARY CARDS
        ==================================================== */}
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Pending Deposits
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {fixedDeposits.length}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-3">
                <Clock3 className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Amount
                </p>

                <p className="mt-2 text-xl font-bold text-slate-900">
                  {formatCurrency(totalAmount)}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Average Rate
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {averageInterestRate.toFixed(2)}%
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Showing
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {filteredDeposits.length}
                </p>
              </div>

              <div className="rounded-xl bg-violet-50 p-3">
                <FileCheck2 className="h-5 w-5 text-violet-600" />
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            SEARCH + REFRESH
        ==================================================== */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder="Search by deposit ID, amount, tenure..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
              />
            </div>

            <button
              type="button"
              onClick={fetchFixedDeposits}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              title="Refresh"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading ? "animate-spin" : ""
                }`}
              />

              {loading
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>
        </section>

        {/* ====================================================
            CONTENT
        ==================================================== */}
        <section className="mt-6">
          {loading && fixedDeposits.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />

              <p className="mt-4 text-sm font-semibold text-slate-700">
                Loading fixed deposits...
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Fetching the latest requests from the
                database.
              </p>
            </div>
          ) : filteredDeposits.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-900">
                {searchQuery
                  ? "No matching fixed deposits"
                  : "No pending fixed deposits"}
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {searchQuery
                  ? "Try a different search term or clear the search field."
                  : "There are currently no fixed deposit requests awaiting confirmation."}
              </p>

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              {/* ================================================
                  DESKTOP TABLE
              ================================================= */}
              <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead className="bg-slate-50">
                      <tr className="border-b border-slate-200">
                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                          Deposit ID
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                          Amount
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                          Tenure
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                          Interest
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                          Maturity Date
                        </th>

                        <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredDeposits.map(
                        (deposit) => {
                          const isConfirming =
                            confirmingId ===
                            deposit.fd_id;

                          return (
                            <tr
                              key={deposit.fd_id}
                              className="transition hover:bg-slate-50/80"
                            >
                              <td className="px-5 py-4">
                                <div>
                                  <p className="font-bold text-slate-900">
                                    FD-
                                    {deposit.fd_id}
                                  </p>

                                  <p className="mt-0.5 text-xs text-slate-400">
                                    Approval Ref:{" "}
                                    {deposit.approval_id}
                                  </p>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <span className="font-semibold text-slate-900">
                                  {formatCurrency(
                                    deposit.amount_deposited
                                  )}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <span className="text-sm font-medium text-slate-700">
                                  {
                                    deposit.tenure_months
                                  }{" "}
                                  months
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                  {Number(
                                    deposit.interest_rate ||
                                      0
                                  ).toFixed(2)}
                                  %
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <span className="text-sm font-medium text-slate-700">
                                  {formatDate(
                                    deposit.maturity_date
                                  )}
                                </span>
                              </td>

                              <td className="px-5 py-4 text-right">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleConfirm(
                                      deposit.fd_id
                                    )
                                  }
                                  disabled={
                                    confirmingId !==
                                      null ||
                                    loading
                                  }
                                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isConfirming ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Confirming...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="h-4 w-4" />
                                      Confirm
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
              </div>

              {/* ================================================
                  MOBILE CARDS
              ================================================= */}
              <div className="space-y-4 lg:hidden">
                {filteredDeposits.map(
                  (deposit) => {
                    const isConfirming =
                      confirmingId ===
                      deposit.fd_id;

                    return (
                      <div
                        key={deposit.fd_id}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Fixed Deposit
                            </p>

                            <h3 className="mt-1 text-lg font-bold text-slate-900">
                              FD-{deposit.fd_id}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                              Approval Ref:{" "}
                              {deposit.approval_id}
                            </p>
                          </div>

                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                            <Clock3 className="h-3.5 w-3.5" />
                            Pending
                          </span>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                              Amount
                            </p>

                            <p className="mt-1 text-sm font-bold text-slate-900">
                              {formatCurrency(
                                deposit.amount_deposited
                              )}
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                              Tenure
                            </p>

                            <p className="mt-1 text-sm font-bold text-slate-900">
                              {
                                deposit.tenure_months
                              }{" "}
                              months
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                              Interest Rate
                            </p>

                            <p className="mt-1 text-sm font-bold text-emerald-700">
                              {Number(
                                deposit.interest_rate ||
                                  0
                              ).toFixed(2)}
                              %
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                              Maturity
                            </p>

                            <p className="mt-1 text-sm font-bold text-slate-900">
                              {formatDate(
                                deposit.maturity_date
                              )}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleConfirm(
                              deposit.fd_id
                            )
                          }
                          disabled={
                            confirmingId !== null ||
                            loading
                          }
                          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isConfirming ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Confirming Deposit...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              Confirm Fixed Deposit
                            </>
                          )}
                        </button>
                      </div>
                    );
                  }
                )}
              </div>
            </>
          )}
        </section>
      </main>

      {/* ======================================================
          FOOTER
      ====================================================== */}
      <footer className="mt-10 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-center sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:text-left">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              DCG Multipurpose Cooperative Society Ltd
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Prosperity Built on Integrity
            </p>
          </div>

          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} DCG Cooperative
            Society. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}


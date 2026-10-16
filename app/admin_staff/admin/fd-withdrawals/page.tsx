"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Shield,
  Wallet,
  RefreshCw,
  Search,
  FileText,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Clock3,
  RotateCcw,
  ArrowDownCircle,
} from "lucide-react";

/* ============================================================
   TYPES
============================================================ */

type FDWithdrawal = {
  id: number;
  member_id: number;
  full_name: string | null;
  action_type: "rollover" | "withdraw" | string;
  status: string;
  created_at: string;
};

type ApiResponse = {
  success: boolean;
  withdrawals?: FDWithdrawal[];
  message?: string;
};

/* ============================================================
   FILTERS
============================================================ */

const filters = [
  {
    id: "all",
    label: "All Requests",
  },
  {
    id: "pending",
    label: "Pending",
  },
  {
    id: "acknowledged",
    label: "Acknowledged",
  },
];

/* ============================================================
   STATUS FORMATTER
============================================================ */

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/* ============================================================
   STATUS STYLE
============================================================ */

function getStatusStyle(status: string) {
  switch (status.toLowerCase()) {
    case "acknowledged":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        icon: CheckCircle2,
      };

    case "pending":
      return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: Clock3,
      };

    default:
      return {
        bg: "bg-slate-50",
        text: "text-slate-700",
        border: "border-slate-200",
        icon: Clock3,
      };
  }
}

/* ============================================================
   ACTION STYLE
============================================================ */

function getActionStyle(actionType: string) {
  switch (actionType.toLowerCase()) {
    case "rollover":
      return {
        bg: "bg-violet-50",
        text: "text-violet-700",
        border: "border-violet-200",
        icon: RotateCcw,
      };

    case "withdraw":
    default:
      return {
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
        icon: ArrowDownCircle,
      };
  }
}

/* ============================================================
   DATE FORMATTER
============================================================ */

function formatDate(date: string) {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ============================================================
   PAGE
============================================================ */

export default function FDWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<
    FDWithdrawal[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [currentFilter, setCurrentFilter] =
    useState("all");

  /* ============================================================
     FETCH FD WITHDRAWALS
  ============================================================ */

  const fetchWithdrawals = useCallback(async () => {
    try {
      setErrorMessage(null);

      /* --------------------------------------------------------
         SEND REQUEST WITH STAFF COOKIES
      -------------------------------------------------------- */

      const response = await fetch(
        "/api/admin_staff/admin/fd-withdrawals",
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      /* --------------------------------------------------------
         READ RESPONSE AS TEXT FIRST
      -------------------------------------------------------- */

      const contentType =
        response.headers.get("content-type") || "";

      const responseText = await response.text();

      /* --------------------------------------------------------
         DEBUG INFORMATION
      -------------------------------------------------------- */

      console.log(
        "FD withdrawals API status:",
        response.status
      );

      console.log(
        "FD withdrawals API content-type:",
        contentType
      );

      console.log(
        "FD withdrawals API response:",
        responseText
      );

      /* --------------------------------------------------------
         CHECK CONTENT TYPE
      -------------------------------------------------------- */

      if (
        !contentType
          .toLowerCase()
          .includes("application/json")
      ) {
        console.error(
          "FD withdrawals API returned non-JSON:",
          response.status,
          contentType,
          responseText
        );

        throw new Error(
          `Server returned an unexpected response (${response.status}). ` +
            `Expected JSON but received ${
              contentType || "unknown content type"
            }.`
        );
      }

      /* --------------------------------------------------------
         PARSE JSON
      -------------------------------------------------------- */

      let data: ApiResponse;

      try {
        data = JSON.parse(
          responseText
        ) as ApiResponse;
      } catch (parseError) {
        console.error(
          "Invalid JSON from FD withdrawals API:",
          parseError
        );

        console.error(
          "Response:",
          responseText
        );

        throw new Error(
          "The server returned invalid JSON."
        );
      }

      /* --------------------------------------------------------
         HTTP ERROR
      -------------------------------------------------------- */

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to load FD withdrawal requests (${response.status}).`
        );
      }

      /* --------------------------------------------------------
         APPLICATION ERROR
      -------------------------------------------------------- */

      if (!data.success) {
        throw new Error(
          data.message ||
            "Failed to load FD withdrawal requests."
        );
      }

      /* --------------------------------------------------------
         SAVE DATA
      -------------------------------------------------------- */

      setWithdrawals(
        Array.isArray(data.withdrawals)
          ? data.withdrawals
          : []
      );
    } catch (error: unknown) {
      console.error(
        "Failed to load FD withdrawal requests:",
        error
      );

      setWithdrawals([]);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load FD withdrawal requests."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    setIsLoading(true);

    fetchWithdrawals();
  }, [fetchWithdrawals]);

  /* ============================================================
     REFRESH
  ============================================================ */

  const handleRefresh = () => {
    setIsRefreshing(true);

    fetchWithdrawals();
  };

  /* ============================================================
     FILTER + SEARCH
  ============================================================ */

  const filteredWithdrawals =
    withdrawals.filter((withdrawal) => {
      /* --------------------------------------------------------
         STATUS FILTER
      -------------------------------------------------------- */

      if (
        currentFilter !== "all" &&
        withdrawal.status.toLowerCase() !==
          currentFilter.toLowerCase()
      ) {
        return false;
      }

      /* --------------------------------------------------------
         SEARCH
      -------------------------------------------------------- */

      const query =
        searchQuery.toLowerCase().trim();

      if (!query) {
        return true;
      }

      return (
        String(withdrawal.id).includes(
          query
        ) ||
        String(withdrawal.member_id).includes(
          query
        ) ||
        (withdrawal.full_name || "")
          .toLowerCase()
          .includes(query) ||
        withdrawal.action_type
          .toLowerCase()
          .includes(query) ||
        withdrawal.status
          .toLowerCase()
          .includes(query)
      );
    });

  /* ============================================================
     COUNTS
  ============================================================ */

  const pendingCount =
    withdrawals.filter(
      (withdrawal) =>
        withdrawal.status.toLowerCase() ===
        "pending"
    ).length;

  const acknowledgedCount =
    withdrawals.filter(
      (withdrawal) =>
        withdrawal.status.toLowerCase() ===
        "acknowledged"
    ).length;

  const rolloverCount =
    withdrawals.filter(
      (withdrawal) =>
        withdrawal.action_type.toLowerCase() ===
        "rollover"
    ).length;

  /* ============================================================
     PAGE
  ============================================================ */

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans -mt-28 text-slate-900">

      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="flex h-16 items-center justify-between gap-4">

            {/* LOGO + PORTAL */}

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

            {/* NAV ACTIONS */}

            <div className="flex items-center gap-2">

              <button
                type="button"
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

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 mt-2 sm:px-6 lg:px-8 space-y-6">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <section className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">

          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div className="space-y-3 max-w-2xl">

              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">

                <Wallet className="h-3.5 w-3.5" />

                Fixed Deposit Operations

              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                FD Withdrawal Requests
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Review pending and acknowledged fixed
                deposit withdrawal or rollover requests
                submitted by cooperative members.
              </p>

            </div>

            <div className="shrink-0 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-5 py-4">

              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                Records Found
              </p>

              <p className="text-2xl font-extrabold text-white">
                {filteredWithdrawals.length}
              </p>

            </div>

          </div>

        </section>

        {/* ====================================================
            FILTER + SEARCH
        ==================================================== */}

        <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/60 rounded-2xl text-xs font-semibold text-slate-600">

            {filters.map((filter) => (

              <button
                key={filter.id}
                type="button"
                onClick={() =>
                  setCurrentFilter(filter.id)
                }
                className={`px-3 py-2 rounded-xl transition-all ${
                  currentFilter === filter.id
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                {filter.label}
              </button>

            ))}

          </div>

          <div className="relative w-full sm:w-72">

            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

            <input
              type="text"
              placeholder="Search withdrawal requests..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-xs"
            />

          </div>

        </section>

        {/* ====================================================
            SUMMARY CARDS
        ==================================================== */}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* TOTAL */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Total Requests
                </p>

                <p className="mt-1 text-xl font-extrabold text-slate-900">
                  {withdrawals.length}
                </p>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">

                <FileText className="h-5 w-5" />

              </div>

            </div>

          </div>

          {/* PENDING */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Pending
                </p>

                <p className="mt-1 text-xl font-extrabold text-amber-700">
                  {pendingCount}
                </p>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">

                <Clock3 className="h-5 w-5" />

              </div>

            </div>

          </div>

          {/* ACKNOWLEDGED */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Acknowledged
                </p>

                <p className="mt-1 text-xl font-extrabold text-emerald-700">
                  {acknowledgedCount}
                </p>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">

                <CheckCircle2 className="h-5 w-5" />

              </div>

            </div>

          </div>

        </section>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {errorMessage && (

          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 flex items-center gap-2">

            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />

            <span>{errorMessage}</span>

          </div>

        )}

        {/* ====================================================
            TABLE
        ==================================================== */}

        <section className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">

          {/* TABLE HEADER */}

          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">

            <div>

              <h2 className="text-sm font-extrabold text-slate-900">
                FD Withdrawal Records
              </h2>

              <p className="text-[11px] text-slate-400 mt-0.5">
                Latest fixed deposit withdrawal activity
              </p>

            </div>

            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">

              <Wallet className="h-4 w-4 text-emerald-600" />

              {filteredWithdrawals.length} records

            </div>

          </div>

          {/* ==================================================
              LOADING
          ================================================== */}

          {isLoading ? (

            <div className="p-20 text-center">

              <Loader2 className="h-7 w-7 animate-spin mx-auto mb-3 text-emerald-600" />

              <p className="text-xs font-medium text-slate-400">
                Loading FD withdrawal requests...
              </p>

            </div>

          ) : filteredWithdrawals.length > 0 ? (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead>

                  <tr className="bg-slate-50 border-b border-slate-200">

                    <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                      Request ID
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                      Member ID
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                      Member
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                      Action
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                      Requested At
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredWithdrawals.map(
                    (withdrawal) => {

                      const actionStyle =
                        getActionStyle(
                          withdrawal.action_type
                        );

                      const ActionIcon =
                        actionStyle.icon;

                      const statusStyle =
                        getStatusStyle(
                          withdrawal.status
                        );

                      const StatusIcon =
                        statusStyle.icon;

                      return (

                        <tr
                          key={withdrawal.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >

                          {/* REQUEST ID */}

                          <td className="px-5 py-4 text-xs font-bold text-slate-700">
                            #{withdrawal.id}
                          </td>

                          {/* MEMBER ID */}

                          <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                            {withdrawal.member_id}
                          </td>

                          {/* MEMBER */}

                          <td className="px-5 py-4">

                            <div className="font-bold text-xs text-slate-900">

                              {withdrawal.full_name ||
                                `Member #${withdrawal.member_id}`}

                            </div>

                          </td>

                          {/* ACTION */}

                          <td className="px-5 py-4">

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${actionStyle.bg} ${actionStyle.text} ${actionStyle.border}`}
                            >

                              <ActionIcon className="h-3 w-3" />

                              {withdrawal.action_type
                                .charAt(0)
                                .toUpperCase() +
                                withdrawal.action_type.slice(
                                  1
                                )}

                            </span>

                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-4">

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                            >

                              <StatusIcon className="h-3 w-3" />

                              {formatStatus(
                                withdrawal.status
                              )}

                            </span>

                          </td>

                          {/* REQUESTED AT */}

                          <td className="px-5 py-4">

                            <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">

                              {formatDate(
                                withdrawal.created_at
                              )}

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

            /* ==================================================
               EMPTY STATE
            ================================================== */

            <div className="p-16 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                <FileText className="h-6 w-6" />

              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-900">
                No FD withdrawal requests found
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                No fixed deposit withdrawal or rollover
                requests match the selected filter or
                search criteria.
              </p>

            </div>

          )}

        </section>

        {/* ====================================================
            BACK BUTTON
        ==================================================== */}

        <div className="flex justify-center">

          <Link
            href="/admin_staff/admin/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-xs"
          >

            <ArrowLeft className="h-4 w-4" />

            Back to Admin Dashboard

          </Link>

        </div>

      </main>

      {/* ======================================================
          FOOTER
      ====================================================== */}

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
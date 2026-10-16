"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

import {
  ArrowLeft,
  Shield,
  Loader2,
  Database,
  CreditCard,
  PiggyBank,
  History,
  Users,
  Calendar,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import {
  LoanSummary,
  SavingsSummary,
  SystemLog,
  RoleActivity,
} from "@/types/backupRecovery";

type ApiResponse = {
  success?: boolean;
  message?: string;
  error?: string;

  loanSummary?: LoanSummary;
  savingsSummary?: SavingsSummary;
  logs?: SystemLog[];
  roleActivities?: RoleActivity[];

  tables?: {
    loans?: boolean;
    monthly_savings?: boolean;
    system_logs?: boolean;
  };

  warnings?: string[];
};

export default function BackupRecoveryPage() {
  // ============================================================
  // STATE
  // ============================================================

  const [loanSummary, setLoanSummary] =
    useState<LoanSummary | null>(null);

  const [savingsSummary, setSavingsSummary] =
    useState<SavingsSummary | null>(null);

  const [logs, setLogs] = useState<SystemLog[]>([]);

  const [roleActivities, setRoleActivities] =
    useState<RoleActivity[]>([]);

  const [isLoading, setIsLoading] =
    useState<boolean>(true);

  const [isRefreshing, setIsRefreshing] =
    useState<boolean>(false);

  /*
   * Used to prevent server/client hydration differences.
   */
  const [isMounted, setIsMounted] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string | null>(null);

  const [warnings, setWarnings] =
    useState<string[]>([]);

  // ============================================================
  // FETCH BACKUP DATA
  // ============================================================

  const fetchBackupData = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const response = await fetch(
          "/api/admin_staff/admin/backup-recovery",
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }
        );

        // --------------------------------------------------------
        // Read response as text first.
        // This prevents JSON.parse errors when Next.js returns
        // an HTML 404/500 page.
        // --------------------------------------------------------

        const contentType =
          response.headers.get("content-type") || "";

        const rawText = await response.text();

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
              "Failed to parse API JSON:",
              parseError
            );

            throw new Error(
              "The server returned invalid JSON."
            );
          }
        } else {
          console.error(
            "Non-JSON server response:",
            rawText.substring(0, 500)
          );

          throw new Error(
            `Server returned an unexpected response (${response.status}).`
          );
        }

        // --------------------------------------------------------
        // SUCCESS
        // --------------------------------------------------------

        if (response.ok && json.success) {
          setLoanSummary(
            json.loanSummary ?? {
              total_loans: 0,
              total_loan_amount: 0,
            }
          );

          setSavingsSummary(
            json.savingsSummary ?? {
              total_savings: 0,
              total_savings_amount: 0,
            }
          );

          setLogs(
            Array.isArray(json.logs)
              ? json.logs
              : []
          );

          setRoleActivities(
            Array.isArray(json.roleActivities)
              ? json.roleActivities
              : []
          );

          setWarnings(
            Array.isArray(json.warnings)
              ? json.warnings
              : []
          );

          setError(null);

          return;
        }

        // --------------------------------------------------------
        // API ERROR
        // --------------------------------------------------------

        const serverMessage =
          json.error ||
          json.message ||
          `Request failed with status ${response.status}.`;

        throw new Error(serverMessage);
      } catch (err: unknown) {
        console.error(
          "Backup recovery fetch error:",
          err
        );

        if (err instanceof Error) {
          setError(
            err.message ||
              "Network connection error. Could not load backup and recovery data."
          );
        } else {
          setError(
            "Network connection error. Could not load backup and recovery data."
          );
        }
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

    fetchBackupData();
  }, [fetchBackupData]);

  // ============================================================
  // FORMAT CURRENCY
  // ============================================================

  const formatCurrency = (
    value: number | string | null | undefined
  ): string => {
    if (
      value === null ||
      value === undefined
    ) {
      return "0.00";
    }

    const numericValue =
      typeof value === "string"
        ? parseFloat(value)
        : value;

    if (Number.isNaN(numericValue)) {
      return "0.00";
    }

    /*
     * Explicitly specify the locale and currency formatting
     * so that server/client rendering stays consistent.
     */
    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (
    dateValue: string | Date | null | undefined
  ): string => {
    if (!dateValue) {
      return "N/A";
    }

    try {
      const date = new Date(dateValue);

      if (Number.isNaN(date.getTime())) {
        return String(dateValue);
      }

      /*
       * Manual formatting avoids differences between the
       * server timezone and browser timezone/locale.
       */

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

      const hours = String(
        date.getHours()
      ).padStart(2, "0");

      const minutes = String(
        date.getMinutes()
      ).padStart(2, "0");

      return `${day} ${month} ${year}, ${hours}:${minutes}`;
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

              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold text-white">

                <Shield className="h-3 w-3 text-emerald-400" />

                Staff Portal

              </span>

            </div>

            {/* BACK BUTTON */}

            <Link
              href="/admin_staff/admin/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
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

      {/* =======================================================
          MAIN
      ======================================================= */}

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 mt-2 sm:px-6 lg:px-8 space-y-6">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">

          <div className="absolute top-0 right-0 -mt-12 -mr-12 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="absolute bottom-0 left-1/3 -mb-20 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div className="space-y-3 max-w-3xl">

              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">

                <Database className="h-3.5 w-3.5" />

                System Administration

              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Backup & Recovery
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Monitor financial records, review administrator
                activity, inspect system logs, and maintain
                visibility over critical cooperative operations.
              </p>

            </div>

            {/* =================================================
                REFRESH BUTTON
            ================================================= */}

            <button
              type="button"
              onClick={() =>
                fetchBackupData(true)
              }

              /*
               * IMPORTANT:
               *
               * Before hydration:
               * isMounted = false
               * therefore disabled = false
               *
               * After hydration:
               * button is disabled whenever loading/refreshing.
               *
               * This prevents the server/client attribute
               * mismatch shown in the error.
               */
              disabled={
                isMounted &&
                (isRefreshing || isLoading)
              }

              className="self-start lg:self-center inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                : "Refresh Data"}

            </button>

          </div>

        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (

          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">

            <div className="flex items-start gap-3">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">

                <AlertTriangle className="h-4 w-4" />

              </div>

              <div>

                <h3 className="text-xs font-bold text-rose-900">
                  Unable to load system data
                </h3>

                <p className="mt-1 text-xs font-medium text-rose-700">
                  {error}
                </p>

              </div>

            </div>

          </div>

        )}

        {/* =====================================================
            WARNINGS
        ===================================================== */}

        {warnings.length > 0 && !error && (

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">

            <div className="flex items-start gap-3">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">

                <AlertTriangle className="h-4 w-4" />

              </div>

              <div>

                <h3 className="text-xs font-bold text-amber-900">
                  System warnings
                </h3>

                <ul className="mt-1 space-y-1 text-xs font-medium text-amber-700">

                  {warnings.map(
                    (warning, index) => (
                      <li key={index}>
                        • {warning}
                      </li>
                    )
                  )}

                </ul>

              </div>

            </div>

          </div>

        )}

        {/* =====================================================
            LOADING
        ===================================================== */}

        {isLoading ? (

          <div className="rounded-3xl border border-slate-200 bg-white p-20 text-center shadow-sm">

            <Loader2 className="h-7 w-7 animate-spin mx-auto mb-3 text-emerald-600" />

            <p className="text-xs font-semibold text-slate-500">
              Loading system backup and recovery data...
            </p>

          </div>

        ) : (

          <div className="space-y-6">

            {/* =================================================
                FINANCIAL SUMMARY
            ================================================= */}

            <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between mb-5">

                <div>

                  <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">

                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

                      <CreditCard className="h-4 w-4" />

                    </div>

                    Financial Summary

                  </h2>

                  <p className="text-xs text-slate-500 mt-1 ml-10">
                    Current financial ledger overview.
                  </p>

                </div>

                <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-[10px] font-bold text-emerald-700">

                  <Activity className="h-3 w-3" />

                  Live Data

                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* =================================================
                    LOANS
                ================================================= */}

                <div className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-5 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all">

                  <div className="flex items-start justify-between">

                    <div>

                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Total Loans
                      </span>

                      <div className="mt-2 text-2xl font-extrabold font-mono text-slate-900">
                        {loanSummary?.total_loans ?? 0}
                      </div>

                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">

                      <CreditCard className="h-5 w-5" />

                    </div>

                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200">

                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Loan Portfolio Value
                    </span>

                    <p className="mt-1 text-sm font-extrabold font-mono text-emerald-700">

                      ₦
                      {formatCurrency(
                        loanSummary?.total_loan_amount ?? 0
                      )}

                    </p>

                  </div>

                </div>

                {/* =================================================
                    SAVINGS
                ================================================= */}

                <div className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-5 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all">

                  <div className="flex items-start justify-between">

                    <div>

                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Total Savings
                      </span>

                      <div className="mt-2 text-2xl font-extrabold font-mono text-slate-900">
                        {savingsSummary?.total_savings ?? 0}
                      </div>

                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">

                      <PiggyBank className="h-5 w-5" />

                    </div>

                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200">

                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Savings Portfolio Value
                    </span>

                    <p className="mt-1 text-sm font-extrabold font-mono text-emerald-700">

                      ₦
                      {formatCurrency(
                        savingsSummary?.total_savings_amount ?? 0
                      )}

                    </p>

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                SYSTEM STATUS
            ================================================= */}

            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* SYSTEM LOGS */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                    <History className="h-5 w-5" />

                  </div>

                  <div>

                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      System Logs
                    </p>

                    <p className="text-xl font-extrabold font-mono text-slate-900">
                      {logs.length}
                    </p>

                  </div>

                </div>

              </div>

              {/* ACTIVE ROLES */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">

                    <Users className="h-5 w-5" />

                  </div>

                  <div>

                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Active Roles
                    </p>

                    <p className="text-xl font-extrabold font-mono text-slate-900">
                      {roleActivities.length}
                    </p>

                  </div>

                </div>

              </div>

              {/* SYSTEM STATUS */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

                    <CheckCircle2 className="h-5 w-5" />

                  </div>

                  <div>

                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      System Status
                    </p>

                    <p className="text-sm font-extrabold text-emerald-700">
                      Operational
                    </p>

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                SYSTEM LOGS
            ================================================= */}

            <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between mb-5">

                <div>

                  <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">

                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">

                      <History className="h-4 w-4" />

                    </div>

                    Recent System Logs

                  </h2>

                  <p className="text-xs text-slate-500 mt-1 ml-10">
                    Recent administrator and system activity.
                  </p>

                </div>

                <span className="hidden sm:inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                  {logs.length} Records
                </span>

              </div>

              {logs.length > 0 ? (

                <div className="overflow-x-auto rounded-2xl border border-slate-100">

                  <table className="w-full text-xs text-left">

                    <thead>

                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px]">

                        <th className="px-4 py-3 font-bold">
                          User
                        </th>

                        <th className="px-4 py-3 font-bold">
                          Role
                        </th>

                        <th className="px-4 py-3 font-bold">
                          Action
                        </th>

                        <th className="px-4 py-3 font-bold text-right">
                          Date
                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-slate-100">

                      {logs.map(
                        (log, index) => (

                          <tr
                            key={`${log.username}-${log.created_at}-${index}`}
                            className="hover:bg-slate-50/70 transition-colors"
                          >

                            <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                              {log.username}
                            </td>

                            <td className="px-4 py-3">

                              <span className="inline-flex rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                                {log.role}
                              </span>

                            </td>

                            <td className="px-4 py-3 text-slate-700 font-medium">
                              {log.action}
                            </td>

                            <td className="px-4 py-3 text-slate-500 text-right font-medium whitespace-nowrap">

                              <span className="inline-flex items-center gap-1">

                                <Calendar className="h-3 w-3 text-slate-400" />

                                {formatDate(
                                  log.created_at
                                )}

                              </span>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              ) : (

                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400">

                    <History className="h-6 w-6" />

                  </div>

                  <h3 className="mt-3 text-sm font-bold text-slate-900">
                    No system logs
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    No administrator activity records were found.
                  </p>

                </div>

              )}

            </section>

            {/* =================================================
                ACTIONS PER ROLE
            ================================================= */}

            <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between mb-5">

                <div>

                  <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">

                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

                      <Users className="h-4 w-4" />

                    </div>

                    Actions Per Role

                  </h2>

                  <p className="text-xs text-slate-500 mt-1 ml-10">
                    Activity distribution across administrator roles.
                  </p>

                </div>

              </div>

              {roleActivities.length > 0 ? (

                <div className="overflow-x-auto rounded-2xl border border-slate-100">

                  <table className="w-full text-xs text-left">

                    <thead>

                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px]">

                        <th className="px-4 py-3 font-bold">
                          Role
                        </th>

                        <th className="px-4 py-3 font-bold text-right">
                          Actions
                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-slate-100">

                      {roleActivities.map(
                        (activity, index) => (

                          <tr
                            key={`${activity.role}-${index}`}
                            className="hover:bg-slate-50/70 transition-colors"
                          >

                            <td className="px-4 py-3">

                              <span className="font-bold text-slate-900">
                                {activity.role}
                              </span>

                            </td>

                            <td className="px-4 py-3 text-right">

                              <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 font-mono font-extrabold text-emerald-700">
                                {activity.actions}
                              </span>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              ) : (

                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400">

                    <Users className="h-6 w-6" />

                  </div>

                  <h3 className="mt-3 text-sm font-bold text-slate-900">
                    No activity records
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    There are currently no role activity records.
                  </p>

                </div>

              )}

            </section>

          </div>

        )}

      </main>

      {/* =======================================================
          FOOTER
      ======================================================= */}

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

            &copy; 2026 DCG
            Multipurpose Cooperative Society Ltd. All
            rights reserved.

          </p>

        </div>

      </footer>

    </div>
  );
}
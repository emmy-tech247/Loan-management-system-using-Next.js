"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Shield,
  LogOut,
  KeyRound,
  FileCheck,
  ClipboardCheck,
  User,
  Calendar,
  Wallet,
  Clock,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

interface Loan {
  loan_id: number;
  full_name: string;
  loan_amount: number;
  tenure_month: number;
  loan_status: string;
  created_at: string;
}

interface AuditorSession {
  auditorId: number;
  full_name: string;
}

interface DashboardResponse {
  auditor?: AuditorSession | null;
  loans?: unknown;
  message?: string;
  error?: string;
}

/* ============================================================
   CONSTANTS
============================================================ */

const CURRENT_YEAR = 2026;

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-NG", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const DATE_FORMATTER = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "medium",
  timeStyle: "short",
});

/* ============================================================
   HELPERS
============================================================ */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNumber(value: unknown, fallback = 0): number {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function normalizeLoan(value: unknown): Loan | null {
  if (!isRecord(value)) {
    return null;
  }

  const loanId = toNumber(value.loan_id, NaN);

  if (!Number.isFinite(loanId)) {
    return null;
  }

  return {
    loan_id: loanId,

    full_name:
      typeof value.full_name === "string" && value.full_name.trim()
        ? value.full_name.trim()
        : "Unknown Member",

    loan_amount: toNumber(value.loan_amount),

    tenure_month: toNumber(value.tenure_month),

    loan_status:
      typeof value.loan_status === "string" && value.loan_status.trim()
        ? value.loan_status.trim()
        : "Pending Review",

    created_at:
      typeof value.created_at === "string"
        ? value.created_at
        : "",
  };
}

function normalizeLoans(value: unknown): Loan[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(normalizeLoan)
    .filter((loan): loan is Loan => loan !== null);
}

function formatCurrency(amount: number): string {
  return CURRENCY_FORMATTER.format(toNumber(amount));
}

function formatDate(dateValue: string): string {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return DATE_FORMATTER.format(date);
}

/* ============================================================
   PAGE
============================================================ */

export default function AuditorDashboard() {
  const router = useRouter();

  const [auditor, setAuditor] =
    useState<AuditorSession | null>(null);

  const [loans, setLoans] = useState<Loan[]>([]);

  const [loading, setLoading] = useState(true);

  const [loggingOut, setLoggingOut] = useState(false);

  const [error, setError] = useState("");

  /* ==========================================================
     FETCH DASHBOARD
  ========================================================== */

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin_staff/auditor/dashboard",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      let data: DashboardResponse = {};

      /* ======================================================
         JSON RESPONSE
      ====================================================== */

      if (contentType.includes("application/json")) {
        try {
          data =
            (await response.json()) as DashboardResponse;
        } catch (jsonError) {
          console.error(
            "Failed to parse auditor dashboard JSON:",
            jsonError
          );

          setError(
            "The server returned an invalid JSON response."
          );

          return;
        }
      } else {
        /* ====================================================
           NON-JSON RESPONSE
        ==================================================== */

        const responseText = await response.text();

        console.error(
          "Auditor dashboard returned non-JSON response:",
          responseText
        );

        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }

      /* ======================================================
         SESSION EXPIRED
      ====================================================== */

      if (response.status === 401) {
        setAuditor(null);
        setLoans([]);

        setError(
          data.message ||
            "Auditor session expired. Please log in again."
        );

        return;
      }

      /* ======================================================
         ACCESS DENIED
      ====================================================== */

      if (response.status === 403) {
        setAuditor(null);
        setLoans([]);

        setError(
          data.message ||
            "You are not authorized to access the auditor dashboard."
        );

        return;
      }

      /* ======================================================
         OTHER SERVER ERRORS
      ====================================================== */

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to load auditor dashboard."
        );
      }

      /* ======================================================
         SUCCESS
      ====================================================== */

      setAuditor(
        data.auditor &&
          typeof data.auditor === "object"
          ? {
              auditorId: toNumber(
                data.auditor.auditorId
              ),

              full_name:
                typeof data.auditor.full_name ===
                  "string" &&
                data.auditor.full_name.trim()
                  ? data.auditor.full_name.trim()
                  : "Auditor",
            }
          : null
      );

      setLoans(normalizeLoans(data.loans));
    } catch (error) {
      console.error(
        "FETCH AUDITOR DASHBOARD ERROR:",
        error
      );

      setAuditor(null);
      setLoans([]);

      setError(
        error instanceof Error && error.message
          ? error.message
          : "Unable to load auditor dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  /* ==========================================================
     LOGOUT
  ========================================================== */

  const handleLogout = useCallback(async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        console.warn(
          "Logout request returned:",
          response.status
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      router.push("/admin_staff/staff/login");
    }
  }, [loggingOut, router]);

  /* ==========================================================
     SUMMARY
  ========================================================== */

  const totalLoanValue = useMemo(() => {
    return loans.reduce(
      (total, loan) =>
        total + toNumber(loan.loan_amount),
      0
    );
  }, [loans]);

  const auditorName = auditor?.full_name || "Auditor";

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans -mt-28 text-slate-900">
      {/* =========================================================
          NAVBAR
      ========================================================== */}

      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}

          <div className="flex items-center gap-3">
            <Link
              href="/admin_staff/auditor/dashboard"
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

            <span className="hidden items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white sm:inline-flex">
              <Shield className="h-3 w-3 text-emerald-400" />
              Auditor Portal
            </span>
          </div>

          {/* User / Logout */}

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <User className="h-4 w-4" />
              </div>

              <div className="hidden md:block">
                <p className="text-[10px] font-medium text-slate-400">
                  Signed in as
                </p>

                <p className="text-xs font-bold text-slate-800">
                  {auditorName}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut === true}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" />

              <span>
                {loggingOut
                  ? "Logging out..."
                  : "Logout"}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* =========================================================
          MAIN
      ========================================================== */}

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-8 mt-2 sm:px-6 lg:px-8">
        {/* Welcome Banner */}

        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">
          <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Shield className="h-3.5 w-3.5" />
              Auditor Review Suite
            </span>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Welcome back, {auditorName}
            </h1>

            <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
              Review loan applications forwarded by the Relationship Officer
              and perform the necessary audit checks before approval.
            </p>
          </div>
        </section>

        {/* =========================================================
            SUMMARY CARDS
        ========================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Pending Loans */}

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Loans Awaiting Review
                </p>

                <p className="mt-2 text-2xl font-extrabold text-slate-900">
                  {loans.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ClipboardCheck className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Total Amount */}

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Total Loan Value
                </p>

                <p className="mt-2 text-xl font-extrabold text-slate-900">
                  ₦{formatCurrency(totalLoanValue)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Status */}

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Review Status
                </p>

                <p className="mt-2 text-sm font-extrabold text-emerald-600">
                  Awaiting Audit
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            SECTION HEADER
        ========================================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-emerald-600" />

              <h2 className="text-lg font-extrabold text-slate-900">
                Loans Awaiting Approval
              </h2>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Loan applications forwarded by the Relationship Officer for
              auditor review.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchDashboard}
            disabled={loading === true}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />

            Refresh
          </button>
        </div>

        {/* =========================================================
            ERROR
        ========================================================== */}

        {error ? (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertTriangle className="h-5 w-5 shrink-0" />

            <span>{error}</span>
          </div>
        ) : null}

        {/* =========================================================
            LOADING
        ========================================================== */}

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <RefreshCw className="mx-auto h-7 w-7 animate-spin text-emerald-600" />

            <p className="mt-4 text-sm font-semibold text-slate-600">
              Loading loan applications...
            </p>
          </div>
        ) : (
          <>
            {/* =====================================================
                DESKTOP TABLE
            ====================================================== */}

            <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs md:block">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                        Loan ID
                      </th>

                      <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                        Borrower
                      </th>

                      <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                        Amount
                      </th>

                      <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                        Tenure
                      </th>

                      <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                        Forwarded On
                      </th>

                      <th className="px-5 py-4 text-right text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {loans.length > 0 ? (
                      loans.map((loan) => (
                        <tr
                          key={loan.loan_id}
                          className="group transition-colors hover:bg-slate-50"
                        >
                          {/* Loan ID */}

                          <td className="whitespace-nowrap px-5 py-4">
                            <span className="font-bold text-slate-800">
                              #{loan.loan_id}
                            </span>
                          </td>

                          {/* Borrower */}

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                <User className="h-4 w-4" />
                              </div>

                              <span className="text-sm font-bold text-slate-800">
                                {loan.full_name}
                              </span>
                            </div>
                          </td>

                          {/* Amount */}

                          <td className="whitespace-nowrap px-5 py-4">
                            <span className="text-sm font-extrabold text-slate-900">
                              ₦{formatCurrency(loan.loan_amount)}
                            </span>
                          </td>

                          {/* Tenure */}

                          <td className="whitespace-nowrap px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />

                              {loan.tenure_month} months
                            </span>
                          </td>

                          {/* Status */}

                          <td className="whitespace-nowrap px-5 py-4">
                            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-inset ring-amber-200">
                              {loan.loan_status}
                            </span>
                          </td>

                          {/* Date */}

                          <td className="whitespace-nowrap px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />

                              {formatDate(loan.created_at)}
                            </span>
                          </td>

                          {/* Review */}

                          <td className="px-5 py-4 text-right">
                            <Link
                              href={`/admin_staff/auditor/review-loan?id=${encodeURIComponent(
                                String(loan.loan_id)
                              )}`}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700"
                            >
                              Review

                              <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-16 text-center"
                        >
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                            <FileCheck className="h-6 w-6" />
                          </div>

                          <h3 className="mt-4 text-sm font-bold text-slate-900">
                            No loans awaiting auditor review
                          </h3>

                          <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                            There are currently no loan applications
                            forwarded to you for audit review.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* =====================================================
                MOBILE CARDS
            ====================================================== */}

            <div className="space-y-4 md:hidden">
              {loans.length > 0 ? (
                loans.map((loan) => (
                  <div
                    key={loan.loan_id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
                  >
                    {/* Card Header */}

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                          <User className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            Loan #{loan.loan_id}
                          </p>

                          <h3 className="text-sm font-extrabold text-slate-900">
                            {loan.full_name}
                          </h3>
                        </div>
                      </div>

                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 ring-1 ring-inset ring-amber-200">
                        {loan.loan_status}
                      </span>
                    </div>

                    {/* Details */}

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[10px] font-semibold text-slate-400">
                          Loan Amount
                        </p>

                        <p className="mt-1 text-sm font-extrabold text-slate-900">
                          ₦{formatCurrency(loan.loan_amount)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[10px] font-semibold text-slate-400">
                          Tenure
                        </p>

                        <p className="mt-1 text-sm font-extrabold text-slate-900">
                          {loan.tenure_month} months
                        </p>
                      </div>
                    </div>

                    {/* Date */}

                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />

                      <span>
                        Forwarded: {formatDate(loan.created_at)}
                      </span>
                    </div>

                    {/* Review */}

                    <Link
                      href={`/admin_staff/auditor/review-loan?id=${encodeURIComponent(
                        String(loan.loan_id)
                      )}`}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-emerald-700"
                    >
                      <FileCheck className="h-4 w-4" />

                      Review Loan

                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xs">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <FileCheck className="h-6 w-6" />
                  </div>

                  <h3 className="mt-4 text-sm font-bold text-slate-900">
                    No loans awaiting auditor review
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    New forwarded loan applications will appear here.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* =========================================================
            ACTIONS
        ========================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Change Password */}

          <Link
            href="/admin_staff/staff/change-password"
            className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-emerald-300 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-emerald-600 group-hover:text-white">
                <KeyRound className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Change Password
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Update your auditor account password.
                </p>
              </div>
            </div>

            <ChevronRight className="h-5 w-5 text-slate-400 transition group-hover:text-emerald-600" />
          </Link>

          {/* Logout */}

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut === true}
            className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-xs transition hover:border-rose-200 hover:bg-rose-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-rose-600 group-hover:text-white">
                <LogOut className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {loggingOut
                    ? "Logging out..."
                    : "Logout"}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Sign out of the auditor portal.
                </p>
              </div>
            </div>

            <ChevronRight className="h-5 w-5 text-slate-400 transition group-hover:text-rose-600" />
          </button>
        </div>
      </main>

      {/* =========================================================
          FOOTER
      ========================================================== */}

      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500">
            &copy; {CURRENT_YEAR} DCG Multipurpose Cooperative Society Ltd.
            All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
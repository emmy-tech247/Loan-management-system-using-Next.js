"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Shield,
  LogOut,
  Bell,
  FileText,
  CreditCard,
  KeyRound,
  ArrowLeft,
  Eye,
  RefreshCw,
  UserRound,
  WalletCards,
  CalendarDays,
  CheckCircle2,
  Clock3,
} from "lucide-react";

type Loan = {
  loan_id: number;
  member_id: number;
  full_name: string;
  loan_amount: number;
  tenure_month: number;
  loan_status: string;
  created_at: string;
};

type DashboardResponse = {
  success?: boolean;
  fullName?: string;
  loans?: Loan[];
  data?: Loan[];
  message?: string;
  error?: string;
  count?: number;
};

export default function RelationshipOfficer1Dashboard() {
  const router = useRouter();

  const [fullName, setFullName] = useState(
    "Relationship Officer1"
  );

  const [loans, setLoans] = useState<Loan[]>([]);

  const [loading, setLoading] = useState(true);

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  const [error, setError] = useState("");

  // ============================================================
  // FETCH DASHBOARD
  // ============================================================

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin_staff/relationship_officer1",
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

      const rawText = await response.text();

      console.log(
        "Relationship Officer1 API status:",
        response.status
      );

      console.log(
        "Relationship Officer1 API response:",
        rawText
      );

      if (!rawText.trim()) {
        throw new Error(
          `Server returned an empty response (${response.status}).`
        );
      }

      if (
        !contentType
          .toLowerCase()
          .includes("application/json")
      ) {
        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }

      let data: DashboardResponse;

      try {
        data = JSON.parse(rawText);
      } catch (parseError) {
        console.error(
          "JSON parsing error:",
          parseError
        );

        throw new Error(
          "The server returned invalid JSON."
        );
      }

      // ============================================================
      // 401 - LOGIN REQUIRED
      // ============================================================

      if (response.status === 401) {
        router.push("/admin_staff/staff");
        return;
      }

      // ============================================================
      // 403 - WRONG ROLE
      // ============================================================

      if (response.status === 403) {
        throw new Error(
          data?.message ||
            "Access denied. Relationship Officer1 access required."
        );
      }

      // ============================================================
      // OTHER ERRORS
      // ============================================================

      if (
        !response.ok ||
        data?.success === false
      ) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Failed to load loan applications (${response.status}).`
        );
      }

      // ============================================================
      // SUCCESS
      // ============================================================

      setFullName(
        data?.fullName ||
          "Relationship Officer1"
      );

      setLoans(
        Array.isArray(data?.loans)
          ? data.loans
          : Array.isArray(data?.data)
          ? data.data
          : []
      );
    } catch (error) {
      console.error(
        "Relationship Officer1 dashboard error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load loan applications."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL DASHBOARD LOAD
  // ============================================================

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    } finally {
      router.push("/staff");
    }
  };

  // ============================================================
  // DASHBOARD SUMMARY
  // ============================================================

  const totalApplications = loans.length;

  const totalLoanAmount = loans.reduce(
    (total, loan) =>
      total +
      Number(loan.loan_amount || 0),
    0
  );

  // ============================================================
  // FORMAT CURRENCY
  // ============================================================

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date: string) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "-";
    }

    return parsedDate.toLocaleString(
      "en-NG",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 -mt-28 font-sans">
      {/* =========================================================
          NAVBAR
      ========================================================= */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

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

            <span className="hidden items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white sm:inline-flex">
              <Shield className="h-3 w-3 text-emerald-400" />
              Relationship Officer Portal
            </span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">

            <div className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 md:flex">
              <Bell className="h-3.5 w-3.5 text-emerald-600" />

              {totalApplications} Pending
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" />

              <span>
                {isLoggingOut
                  ? "Logging out..."
                  : "Logout"}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* =========================================================
          MAIN
      ========================================================= */}
      <main className="mx-auto mt-2 w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">

        {/* =========================================================
            WELCOME BANNER
        ========================================================= */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">

          <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl space-y-3">

            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              Relationship Officer1 Workspace
            </span>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Welcome back, {fullName}
            </h1>

            <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
              Review submitted loan applications, process member repayments,
              manage monthly contributions, and supervise your assigned loan
              portfolio.
            </p>
          </div>
        </section>

        {/* =========================================================
            QUICK ACTIONS
        ========================================================= */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* Loan Application */}
          <Link
            href="/admin_staff/relationship_officer1/loan-apply"
            className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <FileText className="h-5 w-5" />
              </div>

              <ArrowLeft className="h-4 w-4 rotate-180 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-600" />
            </div>

            <div className="mt-4">

              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">
                Loan Application Form
              </h3>

              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Create and submit a new member loan application.
              </p>
            </div>
          </Link>

          {/* Payment */}
          <Link
            href="/admin_staff/relationship_officer1/payment"
            className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <CreditCard className="h-5 w-5" />
              </div>

              <ArrowLeft className="h-4 w-4 rotate-180 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-600" />
            </div>

            <div className="mt-4">

              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">
                Repayment & Contributions
              </h3>

              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Manage loan repayments and monthly member contributions.
              </p>
            </div>
          </Link>

          {/* Change Password */}
          <Link
            href="/staff_login/reset-password"
            className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <KeyRound className="h-5 w-5" />
              </div>

              <ArrowLeft className="h-4 w-4 rotate-180 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-600" />
            </div>

            <div className="mt-4">

              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">
                Change Password
              </h3>

              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Update your staff portal password securely.
              </p>
            </div>
          </Link>
        </section>

        {/* =========================================================
            SUMMARY
        ========================================================= */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Clock3 className="h-5 w-5" />
              </div>

              <div>

                <p className="text-xs font-semibold text-slate-500">
                  Submitted Applications
                </p>

                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {totalApplications}
                </p>

              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <WalletCards className="h-5 w-5" />
              </div>

              <div>

                <p className="text-xs font-semibold text-slate-500">
                  Submitted Loan Value
                </p>

                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {formatCurrency(totalLoanAmount)}
                </p>

              </div>
            </div>
          </div>

        </section>

        {/* =========================================================
            ERROR
        ========================================================= */}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {/* =========================================================
            LOAN APPLICATIONS
        ========================================================= */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          {/* Header */}
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

            <div>

              <div className="flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <FileText className="h-4 w-4" />
                </div>

                <h2 className="text-lg font-extrabold text-slate-900">
                  Submitted Loan Applications
                </h2>

              </div>

              <p className="mt-1 text-xs text-slate-500">
                Applications assigned to Relationship Officer1 awaiting review.
              </p>

            </div>

            <button
              onClick={fetchDashboard}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
            >

              <RefreshCw
                className={`h-4 w-4 ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>

          </div>

          {/* =======================================================
              LOADING
          ======================================================= */}
          {loading ? (

            <div className="flex min-h-60 items-center justify-center">

              <div className="flex flex-col items-center gap-3 text-slate-500">

                <RefreshCw className="h-7 w-7 animate-spin text-emerald-600" />

                <p className="text-sm font-semibold">
                  Loading applications...
                </p>

              </div>

            </div>

          ) : loans.length === 0 ? (

            /* =====================================================
               EMPTY STATE
            ===================================================== */

            <div className="flex min-h-60 flex-col items-center justify-center px-6 text-center">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-900">
                No submitted applications
              </h3>

              <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                There are currently no loan applications assigned to you that
                require review.
              </p>

            </div>

          ) : (

            <>
              {/* =================================================
                  DESKTOP TABLE
              ================================================= */}
              <div className="hidden overflow-x-auto md:block">

                <table className="w-full text-left">

                  <thead className="bg-slate-50">

                    <tr className="border-b border-slate-200">

                      <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        Loan ID
                      </th>

                      <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        Borrower
                      </th>

                      <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        Amount
                      </th>

                      <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        Tenure
                      </th>

                      <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        Submitted
                      </th>

                      <th className="px-5 py-4 text-right text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {loans.map((loan) => (

                      <tr
                        key={loan.loan_id}
                        className="transition-colors hover:bg-slate-50/80"
                      >

                        <td className="px-5 py-4">

                          <span className="font-bold text-slate-900">
                            #{loan.loan_id}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2.5">

                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                              <UserRound className="h-4 w-4" />
                            </div>

                            <div>

                              <p className="text-xs font-bold text-slate-900">
                                {loan.full_name || "-"}
                              </p>

                              <p className="text-[10px] text-slate-400">
                                Member #{loan.member_id}
                              </p>

                            </div>

                          </div>

                        </td>

                        <td className="px-5 py-4">

                          <span className="text-xs font-extrabold text-slate-900">
                            {formatCurrency(
                              Number(
                                loan.loan_amount || 0
                              )
                            )}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">

                            <CalendarDays className="h-3.5 w-3.5" />

                            {loan.tenure_month} months

                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold capitalize text-amber-700 ring-1 ring-inset ring-amber-200">
                            {loan.loan_status || "-"}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <span className="text-xs text-slate-500">
                            {formatDate(
                              loan.created_at
                            )}
                          </span>

                        </td>

                        <td className="px-5 py-4 text-right">

                          <Link
                            href={`/admin_staff/relationship_officer1/review-loan?id=${loan.loan_id}`}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
                          >

                            <Eye className="h-3.5 w-3.5" />

                            Review

                          </Link>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

              {/* =================================================
                  MOBILE CARDS
              ================================================= */}
              <div className="space-y-3 p-4 md:hidden">

                {loans.map((loan) => (

                  <div
                    key={loan.loan_id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
                          <UserRound className="h-4 w-4" />
                        </div>

                        <div>

                          <h3 className="text-sm font-bold text-slate-900">
                            {loan.full_name || "-"}
                          </h3>

                          <p className="text-[10px] text-slate-400">
                            Member #{loan.member_id}
                          </p>

                        </div>

                      </div>

                      <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold capitalize text-amber-700 ring-1 ring-inset ring-amber-200">
                        {loan.loan_status || "-"}
                      </span>

                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">

                      <div className="rounded-xl bg-white p-3">

                        <p className="text-[10px] font-semibold text-slate-400">
                          Loan ID
                        </p>

                        <p className="mt-1 text-xs font-bold text-slate-900">
                          #{loan.loan_id}
                        </p>

                      </div>

                      <div className="rounded-xl bg-white p-3">

                        <p className="text-[10px] font-semibold text-slate-400">
                          Amount
                        </p>

                        <p className="mt-1 text-xs font-bold text-slate-900">
                          {formatCurrency(
                            Number(
                              loan.loan_amount || 0
                            )
                          )}
                        </p>

                      </div>

                      <div className="rounded-xl bg-white p-3">

                        <p className="text-[10px] font-semibold text-slate-400">
                          Tenure
                        </p>

                        <p className="mt-1 text-xs font-bold text-slate-900">
                          {loan.tenure_month} months
                        </p>

                      </div>

                      <div className="rounded-xl bg-white p-3">

                        <p className="text-[10px] font-semibold text-slate-400">
                          Submitted
                        </p>

                        <p className="mt-1 text-xs font-bold text-slate-900">
                          {formatDate(
                            loan.created_at
                          )}
                        </p>

                      </div>

                    </div>

                    <Link
                      href={`/admin_staff/relationship_officer1/review-loan?id=${loan.loan_id}`}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
                    >

                      <Eye className="h-4 w-4" />

                      Review Loan

                    </Link>

                  </div>

                ))}

              </div>
            </>

          )}

        </section>

        {/* =========================================================
            BACK
        ========================================================= */}
        <div className="flex justify-center pb-4">

          <Link
            href="/admin_staff/relationship_officer1/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >

            <ArrowLeft className="h-4 w-4" />

            Back to Staff Portal

          </Link>

        </div>

      </main>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="border-t border-slate-200 bg-white py-6">

        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} DCG Multipurpose Cooperative Society
            Ltd. All rights reserved.
          </p>

        </div>

      </footer>
    </div>
  );
}
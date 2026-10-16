"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Building2,
  Wallet,
  Landmark,
  FileCheck,
  CreditCard,
  KeyRound,
  LogOut,
  Shield,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Clock3,
  AlertCircle,
} from "lucide-react";

type Loan = {
  loan_id: number;
  loan_amount: number;
  tenure_month: number;
  loan_status: string;
  created_at?: string;
  disbursed_at?: string | null;
  full_name: string;
};

type AccountantDashboardData = {
  accountantName: string;
  forwardedLoans: Loan[];
  disbursedLoans: Loan[];
};

export default function AccountantDashboard() {
  const router = useRouter();

  const [data, setData] = useState<AccountantDashboardData>({
    accountantName: "Accountant",
    forwardedLoans: [],
    disbursedLoans: [],
  });

  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");

  /**
   * Fetch dashboard data
   */
  const fetchDashboard = async () => {
    try {
      setError("");

      const response = await fetch("/api/admin_staff/accountant/dashboard", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 401) {
        router.push("/admin_staff/accountant/dashboard");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load accountant dashboard");
      }

      const result = await response.json();

      setData({
        accountantName: result.accountantName || "Accountant",
        forwardedLoans: result.forwardedLoans || [],
        disbursedLoans: result.disbursedLoans || [],
      });
    } catch (err) {
      console.error(err);
      setError("Unable to load dashboard information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  /**
   * Logout
   */
  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      router.push("/admin_staff/accountant/dashboard");
    }
  };

  /**
   * Currency formatter
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(Number(amount) || 0);
  };

  /**
   * Date formatter
   */
  const formatDate = (date?: string | null) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  /**
   * Status badge
   */
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "forwarded_to_accountant":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "disbursed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const pendingCount = data.forwardedLoans.length;
  const disbursedCount = data.disbursedLoans.length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex -mt-28 flex-col font-sans">

      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="flex h-16 items-center justify-between">

            {/* Logo */}
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

            {/* Navbar Right */}
            <div className="flex items-center gap-3">

              {pendingCount > 0 && (
                <div className="hidden md:flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                  <Clock3 className="h-3.5 w-3.5 text-amber-600" />
                  {pendingCount} Pending Loan
                  {pendingCount !== 1 ? "s" : ""}
                </div>
              )}

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" />

                <span>
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </span>
              </button>

            </div>

          </div>

        </div>
      </nav>


      {/* =========================================================
          MAIN
      ========================================================= */}

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 mt-2 sm:px-6 lg:px-8 space-y-6">

        {/* =====================================================
            WELCOME BANNER
        ===================================================== */}

        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">

          {/* Decorative glow */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 max-w-2xl space-y-3">

            <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Wallet className="h-3.5 w-3.5" />
              Accountant Loan Management
            </span>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Welcome back, {data.accountantName}
            </h1>

            <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
              Manage forwarded loan applications, monitor disbursements,
              review member financial information, and manage loan repayment
              operations from your accounting control center.
            </p>

          </div>
        </section>


        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">

            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="flex-1">
              <p className="font-bold">
                Dashboard Error
              </p>

              <p className="mt-1 text-xs">
                {error}
              </p>
            </div>

            <button
              onClick={fetchDashboard}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>

          </div>
        )}


        {/* =====================================================
            SUMMARY CARDS
        ===================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* Pending */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Loans Awaiting Review
                </p>

                <p className="mt-2 text-2xl font-extrabold text-slate-900">
                  {loading ? "—" : pendingCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock3 className="h-5 w-5" />
              </div>

            </div>

            <p className="mt-3 text-xs text-slate-400">
              Loans forwarded by the Manager
            </p>

          </div>


          {/* Disbursed */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Disbursed Loans
                </p>

                <p className="mt-2 text-2xl font-extrabold text-slate-900">
                  {loading ? "—" : disbursedCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>

            </div>

            <p className="mt-3 text-xs text-slate-400">
              Successfully disbursed loans
            </p>

          </div>


          {/* Accountant */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Current Role
                </p>

                <p className="mt-2 text-lg font-extrabold text-slate-900">
                  Accountant
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Landmark className="h-5 w-5" />
              </div>

            </div>

            <p className="mt-3 text-xs text-slate-400">
              Loan and financial operations
            </p>

          </div>

        </div>


        {/* =====================================================
            QUICK ACTIONS
        ===================================================== */}

        <section className="space-y-4">

          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Access frequently used accountant functions.
            </p>
          </div>


          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <ActionCard
              href="/admin_staff/accountant/bank-details"
              icon={Landmark}
              title="Members Bank Details"
              description="View and manage members' bank account information."
            />

            <ActionCard
              href="/admin_staff/accountant/manual-update"
              icon={FileCheck}
              title="Accountant Manual Update"
              description="Perform authorized manual accounting updates."
            />

            <ActionCard
              href="/admin_staff/accountant/loan-acknowledge"
              icon={CheckCircle2}
              title="Acknowledge Loan Application"
              description="Acknowledge and process approved loan applications."
            />

            <ActionCard
              href="/admin_staff/accountant/payment"
              icon={CreditCard}
              title="Loan Repayment & Contributions"
              description="Manage loan repayments and monthly member contributions."
            />

            <ActionCard
              href="/staff_login/login/change-password"
              icon={KeyRound}
              title="Change Password"
              description="Update your accountant account password."
            />

          </div>

        </section>


        {/* =====================================================
            FORWARDED LOANS
        ===================================================== */}

        <section className="rounded-3xl border border-slate-200/90 bg-white shadow-sm">

          <div className="border-b border-slate-100 p-5 sm:p-6">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Clock3 className="h-4.5 w-4.5" />
                  </div>

                  <h2 className="text-base font-extrabold text-slate-900">
                    Loans Forwarded by Manager
                  </h2>

                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Loans awaiting accountant review and processing.
                </p>

              </div>

              <span className="inline-flex w-fit items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                {pendingCount} Pending
              </span>

            </div>

          </div>


          <LoanTable
            loans={data.forwardedLoans}
            loading={loading}
            showAction
            emptyMessage="No loans awaiting accountant review."
          />

        </section>


        {/* =====================================================
            DISBURSED LOANS
        ===================================================== */}

        <section className="rounded-3xl border border-slate-200/90 bg-white shadow-sm">

          <div className="border-b border-slate-100 p-5 sm:p-6">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-4.5 w-4.5" />
                  </div>

                  <h2 className="text-base font-extrabold text-slate-900">
                    Disbursed Loans
                  </h2>

                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Loans that have already been successfully disbursed.
                </p>

              </div>

              <span className="inline-flex w-fit items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                {disbursedCount} Disbursed
              </span>

            </div>

          </div>


          <DisbursedLoanTable
            loans={data.disbursedLoans}
            loading={loading}
            emptyMessage="No disbursed loans found."
          />

        </section>

      </main>


      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="mt-auto border-t border-slate-200 bg-white py-6">

        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">

          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} DCG Multipurpose Cooperative
            Society Ltd. All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  );
}


/* =============================================================
   ACTION CARD
============================================================= */

function ActionCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex min-h-[150px] flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
    >

      <div className="space-y-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
          <Icon className="h-5 w-5" />
        </div>

        <div>

          <h3 className="text-sm font-bold text-slate-900 transition-colors group-hover:text-emerald-700">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            {description}
          </p>

        </div>

      </div>

      <div className="mt-4 flex items-center justify-end border-t border-slate-100 pt-3 text-xs font-semibold text-slate-400 transition-colors group-hover:text-emerald-600">

        <span className="inline-flex items-center gap-1">
          Open Action
          <ArrowRight className="h-3.5 w-3.5" />
        </span>

      </div>

    </Link>
  );
}


/* =============================================================
   FORWARDED LOANS TABLE
============================================================= */

function LoanTable({
  loans,
  loading,
  showAction,
  emptyMessage,
}: {
  loans: Loan[];
  loading: boolean;
  showAction?: boolean;
  emptyMessage: string;
}) {
  return (
    <div className="overflow-x-auto">

      <table className="w-full min-w-[900px] text-left">

        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/70">

            <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Loan ID
            </th>

            <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Borrower
            </th>

            <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Amount
            </th>

            <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Tenure
            </th>

            <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Status
            </th>

            <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Forwarded On
            </th>

            {showAction && (
              <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Action
              </th>
            )}

          </tr>
        </thead>


        <tbody className="divide-y divide-slate-100">

          {loading ? (

            <LoadingRows columns={showAction ? 7 : 6} />

          ) : loans.length > 0 ? (

            loans.map((loan) => (

              <tr
                key={loan.loan_id}
                className="transition-colors hover:bg-slate-50/70"
              >

                <td className="px-5 py-4 text-xs font-bold text-slate-900">
                  #{loan.loan_id}
                </td>

                <td className="px-5 py-4 text-xs font-semibold text-slate-700">
                  {loan.full_name}
                </td>

                <td className="px-5 py-4 text-xs font-bold text-slate-900">
                  {formatNaira(loan.loan_amount)}
                </td>

                <td className="px-5 py-4 text-xs text-slate-600">
                  {loan.tenure_month} Months
                </td>

                <td className="px-5 py-4">

                  <StatusBadge status={loan.loan_status} />

                </td>

                <td className="px-5 py-4 text-xs text-slate-500">
                  {formatDateValue(loan.created_at)}
                </td>

                {showAction && (
                  <td className="px-5 py-4 text-right">

                    <Link
                      href={`/accountant/review-loan?id=${loan.loan_id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
                    >
                      Review
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>

                  </td>
                )}

              </tr>

            ))

          ) : (

            <tr>

              <td
                colSpan={showAction ? 7 : 6}
                className="px-5 py-12 text-center"
              >

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <FileCheck className="h-6 w-6" />
                </div>

                <p className="mt-3 text-sm font-bold text-slate-700">
                  {emptyMessage}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  There are currently no records to display.
                </p>

              </td>

            </tr>

          )}

        </tbody>

      </table>

    </div>
  );
}


/* =============================================================
   DISBURSED TABLE
============================================================= */

function DisbursedLoanTable({
  loans,
  loading,
  emptyMessage,
}: {
  loans: Loan[];
  loading: boolean;
  emptyMessage: string;
}) {
  return (
    <div className="overflow-x-auto">

      <table className="w-full min-w-[800px] text-left">

        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/70">

            <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Loan ID
            </th>

            <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Borrower
            </th>

            <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Amount
            </th>

            <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Tenure
            </th>

            <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Status
            </th>

            <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Disbursed On
            </th>

          </tr>
        </thead>


        <tbody className="divide-y divide-slate-100">

          {loading ? (

            <LoadingRows columns={6} />

          ) : loans.length > 0 ? (

            loans.map((loan) => (

              <tr
                key={loan.loan_id}
                className="transition-colors hover:bg-slate-50/70"
              >

                <td className="px-5 py-4 text-xs font-bold text-slate-900">
                  #{loan.loan_id}
                </td>

                <td className="px-5 py-4 text-xs font-semibold text-slate-700">
                  {loan.full_name}
                </td>

                <td className="px-5 py-4 text-xs font-bold text-slate-900">
                  {formatNaira(loan.loan_amount)}
                </td>

                <td className="px-5 py-4 text-xs text-slate-600">
                  {loan.tenure_month} Months
                </td>

                <td className="px-5 py-4">
                  <StatusBadge status={loan.loan_status} />
                </td>

                <td className="px-5 py-4 text-xs text-slate-500">
                  {formatDateValue(loan.disbursed_at)}
                </td>

              </tr>

            ))

          ) : (

            <tr>

              <td
                colSpan={6}
                className="px-5 py-12 text-center"
              >

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>

                <p className="mt-3 text-sm font-bold text-slate-700">
                  {emptyMessage}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Disbursed loan records will appear here.
                </p>

              </td>

            </tr>

          )}

        </tbody>

      </table>

    </div>
  );
}


/* =============================================================
   STATUS BADGE
============================================================= */

function StatusBadge({ status }: { status: string }) {
  let classes =
    "border-slate-200 bg-slate-100 text-slate-700";

  if (status === "forwarded_to_accountant") {
    classes =
      "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (status === "disbursed") {
    classes =
      "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold ${classes}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}


/* =============================================================
   LOADING ROWS
============================================================= */

function LoadingRows({ columns }: { columns: number }) {
  return (
    <>
      {[1, 2, 3].map((row) => (
        <tr key={row}>

          {Array.from({ length: columns }).map((_, index) => (
            <td key={index} className="px-5 py-5">

              <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />

            </td>
          ))}

        </tr>
      ))}
    </>
  );
}


/* =============================================================
   HELPERS
============================================================= */

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(Number(amount) || 0);
}


function formatDateValue(date?: string | null) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
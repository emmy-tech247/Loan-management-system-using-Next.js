"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Shield,
  LogOut,
  KeyRound,
  FileCheck,
  Clock3,
  User,
  Calendar,
  ChevronRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface Loan {
  loan_id: number;
  loan_amount: number;
  tenure_month: number;
  loan_status: string;
  created_at: string;
  full_name: string;
}

interface ManagerSession {
  managerId: number;
  full_name: string;
}

export default function ManagerDashboard() {
  const router = useRouter();

  const [managerName, setManagerName] = useState("Manager");
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");

  /**
   * Fetch manager session + loans
   */
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/admin_staff/manager/dashboard", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

  

      if (!res.ok) {
        throw new Error("Failed to load manager dashboard");
      }

      const data = await res.json();

      setManagerName(data.manager?.full_name || "Manager");
      setLoans(data.loans || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load the manager dashboard.");
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
      router.push("/staff_login/login");
    }
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  /**
   * Format date
   */
  const formatDate = (date: string) => {
    if (!date) return "-";

    return new Intl.DateTimeFormat("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans -mt-28 text-slate-900">
      {/* =========================================================
          NAVBAR
      ========================================================= */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Logo / Portal */}
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

              <span className="hidden items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white sm:inline-flex">
                <Shield className="h-3 w-3 text-emerald-400" />
                Manager Portal
              </span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* Manager name */}
              <div className="hidden items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 md:flex">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <User className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-[10px] font-medium text-slate-400">
                    Signed in as
                  </p>
                  <p className="text-xs font-bold text-slate-800">
                    {managerName}
                  </p>
                </div>
              </div>

              {/* Logout */}
              <button
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
      <main className="mx-auto w-full max-w-7xl px-4 py-8 mt-2 sm:px-6 lg:px-8">

        {/* =====================================================
            WELCOME BANNER
        ===================================================== */}
        <section className="relative mb-6 overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">

          {/* Decorative glow */}
          <div className="pointer-events-none absolute right-0 top-0 -mr-10 -mt-10 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl space-y-3">

            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Shield className="h-3.5 w-3.5" />
              Manager Executive Portal
            </span>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Welcome back, {managerName}
            </h1>

            <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
              Review loans approved by the Auditor and complete the final
              approval process for cooperative members.
            </p>
          </div>
        </section>

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <FileCheck className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Loans Awaiting Final Approval
                </h2>

                <p className="text-xs text-slate-500">
                  Review loans forwarded by the Auditor.
                </p>
              </div>
            </div>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />

            Refresh
          </button>
        </div>

        {/* =====================================================
            SUMMARY CARDS
        ===================================================== */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* Pending loans */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Pending Reviews
                </p>

                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {loading ? "..." : loans.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock3 className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Current Queue
                </p>

                <p className="mt-1 text-sm font-extrabold text-emerald-700">
                  Forwarded to Manager
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FileCheck className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Manager */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Officer
                </p>

                <p className="mt-1 truncate text-sm font-extrabold text-slate-900">
                  {managerName}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <User className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}
        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertCircle className="h-5 w-5 shrink-0" />

            <span>{error}</span>
          </div>
        )}

        {/* =====================================================
            LOAN TABLE
        ===================================================== */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          {/* Table header */}
          <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4 sm:px-6">
            <div className="flex items-center justify-between">

              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Loan Applications
                </h3>

                <p className="mt-0.5 text-xs text-slate-500">
                  Applications requiring manager review and final approval.
                </p>
              </div>

              {!loading && loans.length > 0 && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700">
                  {loans.length} Pending
                </span>
              )}
            </div>
          </div>

          {/* Mobile horizontal scroll */}
          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px] text-left">

              <thead className="border-b border-slate-200 bg-white">
                <tr>
                  <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Loan ID
                  </th>

                  <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Borrower
                  </th>

                  <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Amount
                  </th>

                  <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Tenure
                  </th>

                  <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Forwarded On
                  </th>

                  <th className="px-5 py-4 text-right text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {/* Loading */}
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={index}>
                      <td colSpan={7} className="px-5 py-5">
                        <div className="h-5 animate-pulse rounded-lg bg-slate-100" />
                      </td>
                    </tr>
                  ))
                ) : loans.length > 0 ? (
                  loans.map((loan) => (
                    <tr
                      key={loan.loan_id}
                      className="group transition-colors hover:bg-slate-50"
                    >
                      {/* Loan ID */}
                      <td className="px-5 py-5">
                        <span className="font-bold text-slate-900">
                          #{loan.loan_id}
                        </span>
                      </td>

                      {/* Borrower */}
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            <User className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {loan.full_name}
                            </p>

                            <p className="text-[10px] text-slate-400">
                              Loan Applicant
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-5">
                        <span className="text-sm font-extrabold text-slate-900">
                          {formatCurrency(Number(loan.loan_amount))}
                        </span>
                      </td>

                      {/* Tenure */}
                      <td className="px-5 py-5">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          {loan.tenure_month}
                          <span className="font-medium text-slate-400">
                            months
                          </span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-5">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold capitalize text-amber-700 ring-1 ring-inset ring-amber-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          {loan.loan_status.replaceAll("_", " ")}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {formatDate(loan.created_at)}
                        </div>
                      </td>

                      {/* Review */}
                      <td className="px-5 py-5 text-right">
                        <Link
                          href={`/manager/view-loan?id=${loan.loan_id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md"
                        >
                          Review
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  /* Empty state */
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">

                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <FileCheck className="h-7 w-7" />
                      </div>

                      <h3 className="mt-4 text-sm font-extrabold text-slate-900">
                        No loans awaiting manager approval
                      </h3>

                      <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                        There are currently no loan applications forwarded to
                        the Manager for final approval.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* =====================================================
            ACTION BUTTONS
        ===================================================== */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">

          {/* Change Password */}
          <Link
            href="/admin_staff/staff/change-password"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 shadow-sm transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <KeyRound className="h-4 w-4" />
            Change Password
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-5 py-3 text-xs font-bold text-rose-600 transition-all hover:bg-rose-50 disabled:opacity-60 sm:ml-auto"
          >
            <LogOut className="h-4 w-4" />

            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
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
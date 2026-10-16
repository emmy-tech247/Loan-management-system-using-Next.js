"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  Shield,
  LogOut,
  Database,
  Activity,
  Users,
  Wallet,
  Landmark,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock3,
} from "lucide-react";

type Log = {
  member_id?: string | number;
  username?: string;
  role?: string;
  action?: string;
  created_at?: string;
};

type RoleActivity = {
  role: string;
  actions: number;
};

type FinancialData = {
  loans: {
    total: number;
    amount: number;
  };

  savings: {
    total: number;
    amount: number;
  };

  logs: Log[];

  roleActivities: RoleActivity[];
};

export default function BackupRecoveryPage() {
  const router = useRouter();

  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ===========================
  // FETCH DATA
  // ===========================
  const fetchData = async () => {
    try {
      setError("");

      const response = await fetch("/api/admin_staff/md/backup-recovery", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load backup and recovery data."
        );
      }

      setData({
        loans: {
          total: Number(result.loans?.total ?? 0),
          amount: Number(result.loans?.amount ?? 0),
        },

        savings: {
          total: Number(result.savings?.total ?? 0),
          amount: Number(result.savings?.amount ?? 0),
        },

        logs: Array.isArray(result.logs) ? result.logs : [],

        roleActivities: Array.isArray(result.roleActivities)
          ? result.roleActivities
          : [],
      });
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load backup and recovery data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ===========================
  // REFRESH
  // ===========================
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  // ===========================
  // LOGOUT
  // ===========================
  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.push("/admin_staff/staff");
    } catch {
      router.push("/admin_staff/staff");
    }
  };

  // ===========================
  // FORMAT MONEY
  // ===========================
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // ===========================
  // FORMAT DATE
  // ===========================
  const formatDate = (date?: string) => {
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans -mt-28 text-slate-900">
      {/* =========================================================
          NAVBAR
      ========================================================= */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
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
                Executive Portal
              </span>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />

                <span className="hidden sm:inline">
                  {refreshing ? "Refreshing..." : "Refresh"}
                </span>
              </button>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
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
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 mt-2 lg:px-8 space-y-6">
        {/* =======================================================
            HEADER / HERO
        ======================================================= */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">
          <div className="pointer-events-none absolute right-0 top-0 -mr-8 -mt-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Database className="h-3.5 w-3.5" />
              System Backup & Recovery
            </span>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Backup & Recovery
            </h1>

            <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
              Monitor financial activity, review recent system logs, and
              inspect administrative actions across the cooperative platform.
            </p>
          </div>
        </div>

        {/* =======================================================
            ERROR
        ======================================================= */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="text-sm font-bold">
                Unable to load system information
              </p>

              <p className="mt-1 text-xs text-rose-600">
                {error}
              </p>

              <button
                onClick={fetchData}
                className="mt-3 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* =======================================================
            LOADING
        ======================================================= */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : (
          <>
            {/* ===================================================
                FINANCIAL SUMMARY
            =================================================== */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">
                    Financial Summary
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Current financial records in the system.
                  </p>
                </div>

                <div className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700 sm:flex">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Live Data
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* LOANS */}
                <div className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Wallet className="h-5 w-5" />
                    </div>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                      Loans
                    </span>
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-semibold text-slate-500">
                      Total Loans
                    </p>

                    <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                      {data?.loans.total.toLocaleString("en-NG") ?? "0"}
                    </p>
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <p className="text-[11px] font-semibold text-slate-400">
                      Total Amount
                    </p>

                    <p className="mt-1 text-lg font-extrabold text-emerald-700">
                      ₦
                      {formatCurrency(
                        data?.loans.amount ?? 0
                      )}
                    </p>
                  </div>
                </div>

                {/* SAVINGS */}
                <div className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Landmark className="h-5 w-5" />
                    </div>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                      Savings
                    </span>
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-semibold text-slate-500">
                      Total Savings Records
                    </p>

                    <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                      {data?.savings.total.toLocaleString("en-NG") ?? "0"}
                    </p>
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <p className="text-[11px] font-semibold text-slate-400">
                      Total Amount
                    </p>

                    <p className="mt-1 text-lg font-extrabold text-blue-700">
                      ₦
                      {formatCurrency(
                        data?.savings.amount ?? 0
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ===================================================
                RECENT LOGS
            =================================================== */}
            <section className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <Activity className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-sm font-extrabold text-slate-900">
                        Recent System Logs
                      </h2>

                      <p className="mt-1 text-xs text-slate-500">
                        Latest 20 administrative activities.
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                    {data?.logs.length ?? 0} Records
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 sm:px-6">
                        User
                      </th>

                      <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                        Role
                      </th>

                      <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                        Action
                      </th>

                      <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 sm:px-6">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {data?.logs && data.logs.length > 0 ? (
                      data.logs.map((log, index) => (
                        <tr
                          key={`${log.member_id ?? "log"}-${index}`}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80"
                        >
                          <td className="px-5 py-4 sm:px-6">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                <Users className="h-4 w-4" />
                              </div>

                              <span className="text-xs font-bold text-slate-800">
                                {log.username || "Unknown User"}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold capitalize text-emerald-700">
                              {log.role || "Unknown"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span className="text-xs font-medium text-slate-600">
                              {log.action || "—"}
                            </span>
                          </td>

                          <td className="px-5 py-4 sm:px-6">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Clock3 className="h-3.5 w-3.5 text-slate-400" />

                              {formatDate(log.created_at)}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-12 text-center"
                        >
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                            <Activity className="h-6 w-6" />
                          </div>

                          <h3 className="mt-3 text-sm font-bold text-slate-900">
                            No logs found
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            There are currently no system activity records.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ===================================================
                ROLE ACTIVITIES
            =================================================== */}
            <section className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <Users className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900">
                      Actions Per Role
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Administrative activity grouped by staff role.
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[450px] text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 sm:px-6">
                        Role
                      </th>

                      <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {data?.roleActivities &&
                    data.roleActivities.length > 0 ? (
                      data.roleActivities.map((activity, index) => (
                        <tr
                          key={`${activity.role}-${index}`}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80"
                        >
                          <td className="px-5 py-4 sm:px-6">
                            <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold capitalize text-white">
                              {activity.role}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span className="text-sm font-extrabold text-emerald-700">
                              {Number(activity.actions).toLocaleString(
                                "en-NG"
                              )}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={2}
                          className="px-6 py-12 text-center"
                        >
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                            <Users className="h-6 w-6" />
                          </div>

                          <h3 className="mt-3 text-sm font-bold text-slate-900">
                            No activity records found
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            No role-based activity is available.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* =======================================================
            BACK BUTTON
        ======================================================= */}
        <div className="flex justify-center pt-2">
          <Link
            href="/admin_staff/md/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-md"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to MD Dashboard
          </Link>
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
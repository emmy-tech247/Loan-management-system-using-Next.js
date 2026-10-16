"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  Clock,
  Database,
  LogOut,
  RefreshCw,
  Search,
  Shield,
  User,
} from "lucide-react";

type FilterType = "daily" | "monthly" | "quarterly";

interface ActivityLog {
  id: number;
  user_id: number | string;
  role: string;
  activity: string;
  ip_address: string;
  created_at: string;
}

const filterOptions: {
  id: FilterType;
  label: string;
}[] = [
  {
    id: "daily",
    label: "Daily",
  },
  {
    id: "monthly",
    label: "Monthly",
  },
  {
    id: "quarterly",
    label: "Last 3 Months",
  },
];

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filter, setFilter] = useState<FilterType>("daily");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchLogs = async (selectedFilter = filter) => {
    try {
      setError("");

      const res = await fetch(
        `/api/admin_staff/md/activity-logs?filter=${selectedFilter}`,
        {
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load activity logs");
      }

      setLogs(data.logs || []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load activity logs."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs(filter);
  }, [filter]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLogs(filter);
  };

  const filteredLogs = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) {
      return logs;
    }

    return logs.filter((log) => {
      return (
        String(log.id).toLowerCase().includes(query) ||
        String(log.user_id).toLowerCase().includes(query) ||
        log.role.toLowerCase().includes(query) ||
        log.activity.toLowerCase().includes(query) ||
        log.ip_address.toLowerCase().includes(query) ||
        log.created_at.toLowerCase().includes(query)
      );
    });
  }, [logs, searchQuery]);

  const formatRole = (role: string) => {
    return role
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getRoleStyles = (role: string) => {
    switch (role.toLowerCase()) {
      case "md":
        return "bg-purple-50 text-purple-700 border-purple-200";

      case "admin":
        return "bg-rose-50 text-rose-700 border-rose-200";

      case "manager":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "accountant":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "auditor":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "relationship_officer":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";

      case "member":
        return "bg-slate-100 text-slate-700 border-slate-200";

      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const formatDate = (date: string) => {
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
      {/* ========================================================= */}
      {/* NAVBAR */}
      {/* ========================================================= */}

      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
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

              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold text-white">
                <Shield className="h-3 w-3 text-emerald-400" />
                Executive Portal
              </span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
                <Activity className="h-3.5 w-3.5 text-emerald-600" />
                Activity Monitoring
              </div>

              <Link
                href="/admin_staff/md/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-900 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">
                  Back to Dashboard
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ========================================================= */}
      {/* MAIN */}
      {/* ========================================================= */}

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 mt-2 lg:px-8 space-y-6">
        {/* ===================================================== */}
        {/* HERO */}
        {/* ===================================================== */}

        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-md">
          <div className="absolute right-0 top-0 -mr-12 -mt-12 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Activity className="h-3.5 w-3.5" />
              System Audit Trail
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Activity Logs
            </h1>

            <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
              Monitor activities performed across the Loan Management
              System by members, staff, administrators, auditors, and
              management.
            </p>
          </div>
        </section>

        {/* ===================================================== */}
        {/* SUMMARY CARDS */}
        {/* ===================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Records Found
                </p>

                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {filteredLogs.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Database className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Current Period
                </p>

                <p className="mt-1 text-lg font-extrabold text-slate-900">
                  {filter === "daily"
                    ? "Today"
                    : filter === "monthly"
                    ? "This Month"
                    : "Last 3 Months"}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Retention */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Log Retention
                </p>

                <p className="mt-1 text-lg font-extrabold text-slate-900">
                  3 Months
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================== */}
        {/* FILTERS */}
        {/* ===================================================== */}

        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          {/* Filter tabs */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-slate-200/60 p-1 text-xs font-semibold text-slate-600">
            {filterOptions.map((option) => {
              const active = filter === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFilter(option.id)}
                  className={`rounded-xl px-4 py-2.5 transition-all ${
                    active
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "hover:bg-white/60 hover:text-slate-900"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {/* Search + refresh */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="Search activity logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 shadow-xs outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />

              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* ===================================================== */}
        {/* ERROR */}
        {/* ===================================================== */}

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <div className="font-bold">
              Unable to load activity logs
            </div>

            <p className="mt-1 text-xs">{error}</p>
          </div>
        )}

        {/* ===================================================== */}
        {/* TABLE */}
        {/* ===================================================== */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
          {/* Table heading */}
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                Loan Management System Activity
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Showing {filteredLogs.length} activity record
                {filteredLogs.length === 1 ? "" : "s"}.
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-bold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Audit Data
            </div>
          </div>

          {/* Loading */}
          {isLoading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <RefreshCw className="h-5 w-5 animate-spin" />
              </div>

              <p className="text-sm font-semibold text-slate-600">
                Loading activity logs...
              </p>
            </div>
          ) : filteredLogs.length === 0 ? (
            /* Empty */
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Activity className="h-6 w-6" />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-900">
                No activity records found
              </h3>

              <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-500">
                There are no activity records matching the selected
                period or search criteria.
              </p>
            </div>
          ) : (
            /* Responsive table */
            <div className="overflow-x-auto">
              <table className="min-w-[1050px] w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      ID
                    </th>

                    <th className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      User ID
                    </th>

                    <th className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      Role
                    </th>

                    <th className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      Activity
                    </th>

                    <th className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      IP Address
                    </th>

                    <th className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      Date & Time
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="group transition-colors hover:bg-slate-50/80"
                    >
                      {/* ID */}
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-bold text-slate-700">
                          #{log.id}
                        </span>
                      </td>

                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="inline-flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                            <User className="h-4 w-4" />
                          </div>

                          <span className="text-xs font-semibold text-slate-700">
                            {log.user_id}
                          </span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${getRoleStyles(
                            log.role
                          )}`}
                        >
                          {formatRole(log.role)}
                        </span>
                      </td>

                      {/* Activity */}
                      <td className="max-w-md px-5 py-4">
                        <p className="text-xs font-medium leading-relaxed text-slate-700">
                          {log.activity}
                        </p>
                      </td>

                      {/* IP */}
                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-[11px] font-semibold text-slate-600">
                          {log.ip_address || "—"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4">
                        <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />

                          {formatDate(log.created_at)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ===================================================== */}
        {/* BACK BUTTON */}
        {/* ===================================================== */}

        <div className="flex justify-center pt-2">
          <Link
            href="/admin_staff/md/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to MD Dashboard
          </Link>
        </div>
      </main>

      {/* ========================================================= */}
      {/* FOOTER */}
      {/* ========================================================= */}

      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} DCG Multipurpose
            Cooperative Society Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
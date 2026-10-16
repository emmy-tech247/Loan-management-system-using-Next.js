"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Database,
  Filter,
  RefreshCw,
  Search,
  Shield,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Clock3,
} from "lucide-react";

interface ActivityLog {
  log_id: number;
  user_id: number | string;
  role: string;
  action: string;
  ip_address: string;
  created_at: string;
}

export default function Admin1ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const itemsPerPage = 10;

  /*
   * Load logs from API
   */
  const fetchLogs = async (
    showRefreshLoader = false,
    customStartDate = startDate,
    customEndDate = endDate
  ) => {
    try {
      setError("");

      if (showRefreshLoader) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const params = new URLSearchParams();

      if (customStartDate && customEndDate) {
        params.set("start_date", customStartDate);
        params.set("end_date", customEndDate);
      }

      const queryString = params.toString();

      const response = await fetch(
        `/api/admin_staff/md/admin1-activity-logs${
          queryString ? `?${queryString}` : ""
        }`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (response.status === 401) {
        window.location.href = "/admin_staff/staff";
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load activity logs.");
      }

      const data = await response.json();

      setLogs(data.logs || []);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      setError("Unable to load Admin1 activity logs.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  /*
   * Initial load
   */
  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * Apply date filter
   */
  const handleFilter = async (e: React.FormEvent) => {
    e.preventDefault();

    if ((startDate && !endDate) || (!startDate && endDate)) {
      setError("Please select both a start date and an end date.");
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      setError("Start date cannot be after end date.");
      return;
    }

    await fetchLogs(false, startDate, endDate);
  };

  /*
   * Reset filters
   */
  const handleReset = async () => {
    setStartDate("");
    setEndDate("");
    setSearchQuery("");

    await fetchLogs(false, "", "");
  };

  /*
   * Logout
   */
  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      window.location.href = "/admin_staff/staff";
    } catch (err) {
      console.error(err);
      window.location.href = "admin_staff/staff";
    }
  };

  /*
   * Search filtering
   */
  const filteredLogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return logs;
    }

    return logs.filter((log) => {
      return (
        String(log.log_id).toLowerCase().includes(query) ||
        String(log.user_id).toLowerCase().includes(query) ||
        log.role?.toLowerCase().includes(query) ||
        log.action?.toLowerCase().includes(query) ||
        log.ip_address?.toLowerCase().includes(query) ||
        log.created_at?.toLowerCase().includes(query)
      );
    });
  }, [logs, searchQuery]);

  /*
   * Pagination
   */
  const totalPages = Math.max(
    1,
    Math.ceil(filteredLogs.length / itemsPerPage)
  );

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;

    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage]);

  /*
   * Keep page valid when search changes
   */
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  /*
   * Date formatting
   */
  const formatDate = (date: string) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans -mt-28 text-slate-900">
      {/* =========================================================
          NAVBAR
      ========================================================== */}
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

            {/* Right actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                <Activity className="h-3.5 w-3.5 text-emerald-600" />
                Security & Logs
              </div>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors disabled:opacity-50"
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
      ========================================================== */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 mt-2 lg:px-8 space-y-6">
        {/* =====================================================
            HEADER
        ====================================================== */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-md">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-xs">
              <Shield className="h-3.5 w-3.5" />
              Managing Director Security
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Admin1 Activity Logs
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Monitor administrative activity performed by Admin1, including
              actions, IP addresses, user IDs, and timestamps.
            </p>
          </div>
        </section>

        {/* =====================================================
            SUMMARY CARDS
        ====================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Total Logs
                </p>

                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {logs.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Database className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Admin1 Logs
                </p>

                <p className="mt-1 text-2xl font-extrabold text-emerald-700">
                  {filteredLogs.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Activity className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Current Page
                </p>

                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {currentPage}
                  <span className="text-sm text-slate-400">
                    {" "}
                    / {totalPages}
                  </span>
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Clock3 className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            FILTER BAR
        ====================================================== */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Filter className="h-4 w-4" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Filter Activity Logs
              </h2>

              <p className="text-xs text-slate-500">
                Select a date range to narrow the activity records.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleFilter}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
          >
            {/* Start date */}
            <div>
              <label
                htmlFor="start_date"
                className="mb-1.5 block text-xs font-semibold text-slate-600"
              >
                Start Date
              </label>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />

                <input
                  id="start_date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            {/* End date */}
            <div>
              <label
                htmlFor="end_date"
                className="mb-1.5 block text-xs font-semibold text-slate-600"
              >
                End Date
              </label>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />

                <input
                  id="end_date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
              >
                <Search className="h-4 w-4" />
                Filter Logs
              </button>
            </div>

            {/* Reset */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleReset}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* =====================================================
            SEARCH
        ====================================================== */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Activity Records
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Showing {filteredLogs.length} matching record
              {filteredLogs.length === 1 ? "" : "s"}.
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-xs"
            />
          </div>
        </div>

        {/* =====================================================
            TABLE
        ====================================================== */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
          {isLoading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />

              <p className="text-xs font-semibold text-slate-500">
                Loading activity logs...
              </p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Database className="h-6 w-6" />
              </div>

              <h3 className="mt-3 text-sm font-bold text-slate-900">
                No activity logs found
              </h3>

              <p className="mt-1 max-w-sm text-xs text-slate-500">
                No Admin1 activity records match the selected filters or
                search query.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop/tablet */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                        Log ID
                      </th>

                      <th className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                        User ID
                      </th>

                      <th className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                        Role
                      </th>

                      <th className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                        Action
                      </th>

                      <th className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                        IP Address
                      </th>

                      <th className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {paginatedLogs.map((log) => (
                      <tr
                        key={log.log_id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-5 py-4 text-xs font-bold text-slate-900">
                          #{log.log_id}
                        </td>

                        <td className="px-5 py-4 text-xs font-semibold text-slate-700">
                          {log.user_id}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-700">
                            {log.role}
                          </span>
                        </td>

                        <td className="max-w-md px-5 py-4">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />

                            <span className="text-xs leading-relaxed text-slate-700 break-words">
                              {log.action}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <code className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                            {log.ip_address}
                          </code>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                          {formatDate(log.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="md:hidden divide-y divide-slate-100">
                {paginatedLogs.map((log) => (
                  <div
                    key={log.log_id}
                    className="p-5 space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Log ID
                        </p>

                        <p className="mt-1 text-sm font-extrabold text-slate-900">
                          #{log.log_id}
                        </p>
                      </div>

                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-700">
                        {log.role}
                      </span>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        User ID
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-700">
                        {log.user_id}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Action
                      </p>

                      <div className="mt-1 flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />

                        <p className="text-xs leading-relaxed text-slate-700">
                          {log.action}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        IP Address
                      </p>

                      <code className="mt-1 inline-block rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                        {log.ip_address}
                      </code>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Date
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(log.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* =====================================================
            PAGINATION
        ====================================================== */}
        {!isLoading && filteredLogs.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xs">
            <p className="text-xs font-medium text-slate-500">
              Showing{" "}
              <span className="font-bold text-slate-700">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-slate-700">
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredLogs.length
                )}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-700">
                {filteredLogs.length}
              </span>{" "}
              logs
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() =>
                  setCurrentPage((page) => Math.max(1, page - 1))
                }
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <span className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white">
                {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(totalPages, page + 1)
                  )
                }
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Refresh */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => fetchLogs(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />

            {isRefreshing ? "Refreshing..." : "Refresh Logs"}
          </button>
        </div>

        {/* Back */}
        <div className="flex justify-center pt-2">
          <Link
            href="/admin_staff/md/dashboard"
            className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            ← Back to MD Dashboard
          </Link>
        </div>
      </main>

      {/* =========================================================
          FOOTER
      ========================================================== */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
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
"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Shield,
  Loader2,
  Calendar,
  Search,
  RefreshCw,
  Terminal,
  Activity,
  Globe,
  User,
  Clock,
} from "lucide-react";
import { ActivityLog } from "@/types/adminLogs";

export default function AdminActivityLogsPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(
    async (start = startDate, end = endDate) => {
      setIsLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams();
        if (start) queryParams.append("start_date", start);
        if (end) queryParams.append("end_date", end);

        const res = await fetch(`/api/admin_staff/md/logs?${queryParams.toString()}`);
        const json = await res.json();

        if (res.ok && json.success) {
          setLogs(json.data);
        } else {
          setError(json.message || "Failed to retrieve activity logs.");
        }
      } catch {
        setError("Network error. Could not establish server connection.");
      } finally {
        setIsLoading(false);
      }
    },
    [startDate, endDate]
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchLogs(startDate, endDate);
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    fetchLogs("", "");
  };

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip_address.includes(searchTerm) ||
      log.user_id.toString().includes(searchTerm) ||
      log.log_id.toString().includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin_staff/staff/login" className="flex items-center gap-2">
                <Image
                  src="/images/logo2.png"
                  alt="Cooperative Logo"
                  width={140}
                  height={40}
                  className="h-9 w-auto object-contain"
                  priority
                />
              </Link>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold text-white">
                <Shield className="h-3 w-3 text-emerald-400" /> Security Audit Monitor
              </span>
            </div>

            <Link
              href="/admin_staff/md/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to MD Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Terminal className="h-6 w-6 text-emerald-600" /> Admin1 Activity Logs
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Audit trail tracking operational actions performed by system administrators.
            </p>
          </div>

          <button
            onClick={() => fetchLogs()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-xs self-start sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Logs
          </button>
        </div>

        {/* Filter and Search Control Box */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Date Range Form */}
          <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <label className="text-xs font-bold text-slate-700">Start:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700">End:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
              >
                Filter
              </button>
              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </form>

          {/* Table Quick Search */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search actions or IP addresses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800">
            {error}
          </div>
        )}

        {/* Logs Table Container */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-600" /> Activity Registry
            </h2>
            <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
              {filteredLogs.length} Records Found
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Log ID</th>
                  <th className="py-3 px-3">User ID</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Action Description</th>
                  <th className="py-3 px-3">IP Address</th>
                  <th className="py-3 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-600" />
                      Loading activity logs...
                    </td>
                  </tr>
                ) : filteredLogs.length > 0 ? (
                  filteredLogs.map((row) => (
                    <tr key={row.log_id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-slate-900 font-mono">
                        #{row.log_id}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800 flex items-center gap-1.5 pt-4">
                        <User className="h-3 w-3 text-slate-400" /> #{row.user_id}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                          {row.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-900 font-normal max-w-md">
                        {row.action}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-500 text-[11px]">
                        <span className="inline-flex items-center gap-1">
                          <Globe className="h-3 w-3 text-slate-400" /> {row.ip_address}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-500 text-[11px]">
                        <span className="inline-flex items-center gap-1 justify-end">
                          <Clock className="h-3 w-3 text-slate-400" /> {row.created_at}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No matching activity logs found for the selected date range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 space-y-2">
          <Link
            href="/admin_staff/md/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to MD Dashboard
          </Link>
          <p className="text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} DCG Multipurpose Cooperative Society Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

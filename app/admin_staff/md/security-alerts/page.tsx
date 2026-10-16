"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Shield,
  Loader2,
  Lock,
  Mail,
  AlertTriangle,
  Globe,
  Clock,
  RefreshCw,
  User,
  KeyRound,
} from "lucide-react";
import { LoginAttemptRecord, PasswordResetRecord } from "@/types/securityAlerts";

export default function SecurityAlertsPage() {
  const [failedLogins, setFailedLogins] = useState<LoginAttemptRecord[]>([]);
  const [passwordResets, setPasswordResets] = useState<PasswordResetRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSecurityData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin_staff/md/security-alerts");
      const json = await res.json();

      if (res.ok && json.success) {
        setFailedLogins(json.failedLogins);
        setPasswordResets(json.passwordResets);
      } else {
        setError(json.message || "Failed to retrieve security monitoring data.");
      }
    } catch {
      setError("Network connection error. Unable to load logs.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSecurityData();
  }, [fetchSecurityData]);

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
                <Shield className="h-3 w-3 text-emerald-400" /> MD Security Monitor
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
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Header & Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Lock className="h-6 w-6 text-emerald-600" /> Security Monitoring (Managing Director)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time security analytics tracking brute-force login anomalies and password reset requests.
            </p>
          </div>

          <button
            onClick={fetchSecurityData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-xs self-start sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Alerts
          </button>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800">
            {error}
          </div>
        )}

        {/* SECTION 1: Failed Login Attempts */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600" /> Failed Login Attempts (Accounts with ≥ 5 Failures)
            </h2>
            <span className="text-[11px] font-semibold bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full border border-rose-200">
              {failedLogins.length} Flagged Events
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">ID</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">IP Address</th>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-600" />
                      Analyzing security logs...
                    </td>
                  </tr>
                ) : failedLogins.length > 0 ? (
                  failedLogins.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-slate-900 font-mono">
                        #{row.id}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-900">
                        <span className="inline-flex items-center gap-1.5 break-all">
                          <User className="h-3.5 w-3.5 text-slate-400 shrink-0" /> {row.email}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-600 text-[11px]">
                        <span className="inline-flex items-center gap-1">
                          <Globe className="h-3 w-3 text-slate-400" /> {row.ip_address}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-500 text-[11px]">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" /> {row.attempt_time}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            row.success === 1
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {row.success === 1 ? "Successful" : "Failed"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No login attempts exceeding 5 failures found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 2: Forgot Password Requests */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-amber-600" /> Forgot Password Requests
            </h2>
            <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200">
              {passwordResets.length} Requests Logged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">ID</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3 text-right">Request Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-400">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-600" />
                      Loading password reset records...
                    </td>
                  </tr>
                ) : passwordResets.length > 0 ? (
                  passwordResets.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-slate-900 font-mono">
                        #{row.id}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-900">
                        <span className="inline-flex items-center gap-1.5 break-all">
                          <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" /> {row.email}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-500 text-[11px]">
                        <span className="inline-flex items-center gap-1 justify-end">
                          <Clock className="h-3 w-3 text-slate-400" /> {row.request_time}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-400">
                      No password reset requests found.
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

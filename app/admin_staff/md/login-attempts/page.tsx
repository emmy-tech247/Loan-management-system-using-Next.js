import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  Shield,
  ShieldAlert,
  KeyRound,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Mail,
  Globe,
  Activity,
  LogOut,
  ChevronRight,
} from "lucide-react";

import { getSecurityAlerts } from "@/lib/login-attempts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function LoginAttemptsPage() {
  const data = await getSecurityAlerts();

  /*
   * Authentication is handled by getSecurityAlerts().
   * If the current staff member is not authorized,
   * redirect to the current staff login page.
   */


  const failedLogins = Array.isArray(data.failedLogins)
    ? data.failedLogins
    : [];

  const passwordResets = Array.isArray(data.passwordResets)
    ? data.passwordResets
    : [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans -mt-28 text-slate-900">
      {/* ============================================================
          NAVBAR
      ============================================================ */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo / Portal Identity */}
            <div className="flex items-center gap-3">
              <Link
                href="/admin_staff/md/dashboard"
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

            {/* Navigation */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/admin_staff/md/dashboard"
                className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:border-slate-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Link>

              <Link
                href="/admin_staff/staff/login"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ============================================================
          MAIN
      ============================================================ */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 mt-2 lg:px-8 space-y-6">
        {/* ============================================================
            DARK EXECUTIVE BANNER
        ============================================================ */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">
          {/* Decorative glow */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-xs">
              <ShieldCheckIcon />
              Security &amp; Audit Center
            </span>

            <div className="flex items-start gap-4">
              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-emerald-300 sm:flex">
                <Shield className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Security Monitoring
                </h1>

                <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
                  Monitor failed staff login attempts and password reset
                  activities from the Managing Director security control
                  center.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            SUMMARY CARDS
        ============================================================ */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Failed Logins */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Failed Logins
                </p>

                <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                  {failedLogins.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Unsuccessful authentication attempts
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <ShieldAlert className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Password Resets */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Password Resets
                </p>

                <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                  {passwordResets.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Recent password recovery requests
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <KeyRound className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Monitoring Status */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Security Status
                </p>

                <p className="mt-2 text-xl font-extrabold tracking-tight text-emerald-600">
                  Monitoring Active
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Security activity monitoring is enabled
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Activity className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            FAILED LOGIN ATTEMPTS
        ============================================================ */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          {/* Section Header */}
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Failed Login Attempts
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Unsuccessful authentication attempts recorded by the
                  system.
                </p>
              </div>
            </div>

            <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
              {failedLogins.length} Record
              {failedLogins.length === 1 ? "" : "s"}
            </span>
          </div>

          {failedLogins.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <h3 className="text-sm font-bold text-slate-900">
                No Failed Login Attempts
              </h3>

              <p className="mt-1 max-w-sm text-xs text-slate-500">
                No unsuccessful login attempts were found in the security
                records.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-bold">
                        Email
                      </th>

                      <th className="px-5 py-4 font-bold">
                        IP Address
                      </th>

                      <th className="px-5 py-4 font-bold">
                        Time
                      </th>

                      <th className="px-5 py-4 font-bold">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {failedLogins.map(
                      (item: any, index: number) => (
                        <tr
                          key={item.id ?? index}
                          className="transition-colors hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 shrink-0 text-slate-400" />

                              <span className="font-medium text-slate-700">
                                {item.email || "Unknown"}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Globe className="h-4 w-4 shrink-0 text-slate-400" />

                              <span>
                                {item.ip_address || "Unknown"}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            <div className="flex items-center gap-2">
                              <Clock3 className="h-4 w-4 shrink-0 text-slate-400" />

                              <span>
                                {item.attempt_time
                                  ? new Date(
                                      item.attempt_time
                                    ).toLocaleString()
                                  : "Unknown"}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-extrabold text-rose-700">
                              Failed
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="divide-y divide-slate-100 md:hidden">
                {failedLogins.map(
                  (item: any, index: number) => (
                    <div
                      key={item.id ?? index}
                      className="p-5"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-extrabold text-rose-700">
                          Failed
                        </span>

                        <span className="text-[10px] font-medium text-slate-400">
                          #{item.id ?? index + 1}
                        </span>
                      </div>

                      <div className="space-y-4">
                        {/* Email */}
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                            <Mail className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                              Email
                            </p>

                            <p className="mt-0.5 break-all text-xs font-bold text-slate-700">
                              {item.email || "Unknown"}
                            </p>
                          </div>
                        </div>

                        {/* IP */}
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                            <Globe className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                              IP Address
                            </p>

                            <p className="mt-0.5 text-xs font-bold text-slate-700">
                              {item.ip_address || "Unknown"}
                            </p>
                          </div>
                        </div>

                        {/* Time */}
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                            <Clock3 className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                              Time
                            </p>

                            <p className="mt-0.5 text-xs font-bold text-slate-700">
                              {item.attempt_time
                                ? new Date(
                                    item.attempt_time
                                  ).toLocaleString()
                                : "Unknown"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </section>

        {/* ============================================================
            PASSWORD RESET REQUESTS
        ============================================================ */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          {/* Section Header */}
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <KeyRound className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Password Reset Requests
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Recent password recovery activity.
                </p>
              </div>
            </div>

            <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
              {passwordResets.length} Record
              {passwordResets.length === 1 ? "" : "s"}
            </span>
          </div>

          {passwordResets.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <h3 className="text-sm font-bold text-slate-900">
                No Password Reset Requests
              </h3>

              <p className="mt-1 max-w-sm text-xs text-slate-500">
                No password reset requests were found in the security
                records.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-bold">
                        Email
                      </th>

                      <th className="px-5 py-4 font-bold">
                        Request Time
                      </th>

                      <th className="px-5 py-4 font-bold">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {passwordResets.map(
                      (item: any, index: number) => (
                        <tr
                          key={item.id ?? index}
                          className="transition-colors hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 shrink-0 text-slate-400" />

                              <span className="font-medium text-slate-700">
                                {item.email || "Unknown"}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            <div className="flex items-center gap-2">
                              <Clock3 className="h-4 w-4 shrink-0 text-slate-400" />

                              <span>
                                {item.request_time
                                  ? new Date(
                                      item.request_time
                                    ).toLocaleString()
                                  : "Unknown"}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold text-amber-700">
                              Reset Requested
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="divide-y divide-slate-100 md:hidden">
                {passwordResets.map(
                  (item: any, index: number) => (
                    <div
                      key={item.id ?? index}
                      className="p-5"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold text-amber-700">
                          Reset Requested
                        </span>

                        <span className="text-[10px] font-medium text-slate-400">
                          #{item.id ?? index + 1}
                        </span>
                      </div>

                      <div className="space-y-4">
                        {/* Email */}
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                            <Mail className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                              Email
                            </p>

                            <p className="mt-0.5 break-all text-xs font-bold text-slate-700">
                              {item.email || "Unknown"}
                            </p>
                          </div>
                        </div>

                        {/* Request Time */}
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                            <Clock3 className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                              Request Time
                            </p>

                            <p className="mt-0.5 text-xs font-bold text-slate-700">
                              {item.request_time
                                ? new Date(
                                    item.request_time
                                  ).toLocaleString()
                                : "Unknown"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </section>

        {/* ============================================================
            BACK TO DASHBOARD
        ============================================================ */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/admin_staff/md/dashboard"
            className="group inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to MD Dashboard
          </Link>

          <Link
            href="/admin_staff/md/dashboard"
            className="group inline-flex w-fit items-center gap-1 text-xs font-bold text-slate-500 transition-colors hover:text-emerald-600"
          >
            Executive Dashboard
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </main>

      {/* ============================================================
          FOOTER
      ============================================================ */}
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

/* ================================================================
   SMALL INLINE ICON
================================================================ */

function ShieldCheckIcon() {
  return <Shield className="h-3.5 w-3.5 text-emerald-300" />;
}
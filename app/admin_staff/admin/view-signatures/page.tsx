"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  LogOut,
  Bell,
  PenTool,
  User,
  FileText,
  Calendar,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Search,
  ChevronRight,
} from "lucide-react";

interface SignedMandate {
  signature_id: number;
  member_id: number | string;
  full_name: string;
  purpose: string;
  signed_at: string;
  signature_path: string;
}

interface NotificationCounts {
  [key: string]: number;
}

export default function ViewSignaturesPage() {
  const router = useRouter();

  const [mandates, setMandates] = useState<SignedMandate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [badges, setBadges] = useState<NotificationCounts>({});
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  /**
   * Fetch signed mandates
   */
  const fetchMandates = useCallback(async () => {
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin_staff/admin/view-signatures", {
        method: "GET",
        cache: "no-store",
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setMandates(json.mandates || []);
      } else {
        setStatusMessage({
          text: json.message || "Failed to load signed mandates.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Failed to fetch signed mandates:", error);

      setStatusMessage({
        text: "Network error. Could not retrieve signed mandates.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch notification badges
   */
  const fetchBadges = useCallback(async () => {
    try {
      const res = await fetch("/api/admin_staff/admin/badges", {
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        setBadges(data);
      }
    } catch (error) {
      console.error("Failed to load notification counts:", error);
    }
  }, []);

  useEffect(() => {
    fetchMandates();
    fetchBadges();

    const interval = setInterval(fetchBadges, 15000);

    return () => clearInterval(interval);
  }, [fetchMandates, fetchBadges]);

  /**
   * Logout
   */
  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.push("/staff_login/login");
    } catch {
      router.push("/staff_login/login");
    }
  };

  /**
   * Format date
   */
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);

      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  /**
   * Search/filter mandates
   */
  const filteredMandates = mandates.filter((mandate) => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) return true;

    return (
      mandate.full_name?.toLowerCase().includes(query) ||
      mandate.purpose?.toLowerCase().includes(query) ||
      String(mandate.member_id).toLowerCase().includes(query) ||
      mandate.signed_at?.toLowerCase().includes(query)
    );
  });

  /**
   * Notification total
   */
  const totalPendingNotifications = Object.values(badges).reduce(
    (acc, curr) => acc + (curr || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans -mt-28 text-slate-900">
      {/* =========================================================
          NAVIGATION
      ========================================================== */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo + Portal */}
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

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {totalPendingNotifications > 0 && (
                <div className="hidden md:flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">
                  <Bell className="h-3.5 w-3.5 text-amber-600 animate-pulse" />

                  {totalPendingNotifications} Actionable Items
                </div>
              )}

              <Link
                href="/admin_staff/admin/dashboard"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />

                <span className="hidden sm:inline">
                  Back to Dashboard
                </span>

                <span className="sm:hidden">Back</span>
              </Link>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />

                <span className="hidden sm:inline">
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
        {/* Header / Welcome Banner */}
        <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-xs">
                <PenTool className="h-3.5 w-3.5" />
                Signed Mandates
              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Member Signed Mandates
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Review digitally signed member mandates and inspect the
                associated signature records securely.
              </p>
            </div>

            {/* Count */}
            <div className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                Total Signed
              </p>

              <p className="mt-1 text-2xl font-extrabold text-white">
                {mandates.length}
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            STATUS MESSAGE
        ====================================================== */}
        {statusMessage && (
          <div
            className={`rounded-2xl border p-4 text-xs font-medium flex items-center gap-2 ${
              statusMessage.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            )}

            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* =====================================================
            SEARCH
        ====================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Signed Mandate Records
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              Browse and search member signature records.
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

            <input
              type="text"
              placeholder="Search member, purpose or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-xs"
            />
          </div>
        </div>

        {/* =====================================================
            LOADING
        ====================================================== */}
        {isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-20 text-center shadow-xs">
            <Loader2 className="h-7 w-7 animate-spin mx-auto mb-3 text-emerald-600" />

            <p className="text-xs font-medium text-slate-500">
              Loading signed mandates...
            </p>
          </div>
        ) : filteredMandates.length > 0 ? (
          /* ===================================================
             MANDATE GRID
          ==================================================== */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredMandates.map((mandate) => (
              <div
                key={mandate.signature_id}
                className="group rounded-3xl border border-slate-200/90 bg-white shadow-xs hover:shadow-md hover:border-slate-300 transition-all overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <User className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {mandate.full_name}
                        </h3>

                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Member ID:{" "}
                          <span className="font-mono font-semibold text-slate-600">
                            {mandate.member_id}
                          </span>
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" />
                      Signed
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4">
                  {/* Purpose */}
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      Purpose
                    </div>

                    <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                      {mandate.purpose}
                    </p>
                  </div>

                  {/* Date */}
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Signed Date
                    </div>

                    <p className="text-xs font-medium text-slate-600">
                      {formatDate(mandate.signed_at)}
                    </p>
                  </div>

                  {/* Signature */}
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">
                      <PenTool className="h-3.5 w-3.5" />
                      Signature
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-center min-h-32">
                      <img
                        src={mandate.signature_path}
                        alt={`Signature of ${mandate.full_name}`}
                        className="max-h-24 max-w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3">
                  <a
                    href={mandate.signature_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      Open Signature
                      <ExternalLink className="h-3.5 w-3.5" />
                    </span>

                    <ChevronRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ===================================================
             EMPTY STATE
          ==================================================== */
          <div className="rounded-3xl border border-slate-200 bg-white p-12 sm:p-16 text-center shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <PenTool className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900">
              No signed mandates found
            </h3>

            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1.5">
              {searchQuery
                ? `No signed mandates matching "${searchQuery}" were found. Try another search term.`
                : "There are currently no signed member mandates available."}
            </p>
          </div>
        )}
      </main>

      {/* =========================================================
          FOOTER
      ========================================================== */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 space-y-2">
          <Link
            href="/admin_staff/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />

            Back to Staff Dashboard
          </Link>

          <p className="text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} DCG Multipurpose Cooperative
            Society Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
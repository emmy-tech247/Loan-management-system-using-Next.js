"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Shield,
  Bell,
  LogOut,
  ArrowLeft,
  Phone,
  Landmark,
  CreditCard,
  UserRound,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

type Member = {
  full_name: string;
  member_id: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  phone_number: string;
  passport: string;
};

export default function AllMembersPage() {
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");

  // Fetch members
  const fetchMembers = async (search = "") => {
    setLoading(true);
    setError("");

    try {
      const query = search
        ? `?search=${encodeURIComponent(search)}`
        : "";

      const response = await fetch(`/api/admin_staff/md/members${query}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load members");
      }

      setMembers(data.members || []);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load members."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchMembers(searchQuery.trim());
  };

  // Reset search
  const handleReset = async () => {
    setSearchQuery("");
    await fetchMembers();
  };

  // Logout
  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      router.push("/admin_staff/staff");
    } catch {
      router.push("/admin_staff/staff");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans -mt-28 text-slate-900">

      {/* =========================================================
          NAVBAR
      ========================================================= */}
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
            <div className="flex items-center gap-3">

              <div className="hidden md:flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                <Bell className="h-3.5 w-3.5 text-emerald-600" />
                Member Directory
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
      ========================================================= */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 mt-2 lg:px-8 space-y-6">

        {/* =======================================================
            HEADER / HERO
        ======================================================= */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-md">

          <div className="absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-3">

            <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-xs">
              <Users className="h-3.5 w-3.5" />
              Member Management
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              All Registered Members
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              View registered members, their banking information,
              contact details, and profile information from the
              Managing Director executive portal.
            </p>
          </div>
        </div>

        {/* =======================================================
            SEARCH / CONTROLS
        ======================================================= */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">

          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3"
          >

            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by full name or registration ID..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
              Search
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </button>

          </form>
        </div>

        {/* =======================================================
            ERROR
        ======================================================= */}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />

            <div>
              <p className="font-bold">
                Unable to load members
              </p>
              <p className="text-xs mt-0.5">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =======================================================
            MEMBER COUNT
        ======================================================= */}
        {!loading && !error && (
          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Member Directory
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                {members.length} member
                {members.length !== 1 ? "s" : ""} found
                {searchQuery && (
                  <>
                    {" "}
                    for &quot;{searchQuery}&quot;
                  </>
                )}
              </p>
            </div>

          </div>
        )}

        {/* =======================================================
            LOADING
        ======================================================= */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-slate-200" />

                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-slate-200" />
                    <div className="h-3 w-24 rounded bg-slate-200" />
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="h-3 w-full rounded bg-slate-200" />
                  <div className="h-3 w-5/6 rounded bg-slate-200" />
                  <div className="h-3 w-4/6 rounded bg-slate-200" />
                </div>
              </div>
            ))}

          </div>
        )}

        {/* =======================================================
            MEMBERS
        ======================================================= */}
        {!loading && members.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

            {members.map((member) => (

              <div
                key={member.member_id}
                className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all"
              >

                {/* Profile Header */}
                <div className="flex items-center gap-4">

                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">

                    {member.passport ? (
                      <img
                        src={`/uploads/${member.passport}`}
                        alt={`${member.full_name} profile`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <UserRound className="h-7 w-7" />
                      </div>
                    )}

                  </div>

                  <div className="min-w-0">

                    <h2 className="truncate text-sm font-extrabold text-slate-900">
                      {member.full_name}
                    </h2>

                    <div className="mt-1 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                      ID: {member.member_id}
                    </div>

                  </div>

                </div>

                {/* Member Information */}
                <div className="mt-5 space-y-3">

                  {/* Account Name */}
                  <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                    <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Account Name
                      </p>

                      <p className="mt-0.5 break-words text-xs font-bold text-slate-800">
                        {member.account_name || "Not provided"}
                      </p>
                    </div>
                  </div>

                  {/* Account Number */}
                  <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                    <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Account Number
                      </p>

                      <p className="mt-0.5 break-words text-xs font-bold text-slate-800">
                        {member.account_number || "Not provided"}
                      </p>
                    </div>
                  </div>

                  {/* Bank */}
                  <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                    <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Bank Name
                      </p>

                      <p className="mt-0.5 break-words text-xs font-bold text-slate-800">
                        {member.bank_name || "Not provided"}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Phone Number
                      </p>

                      <p className="mt-0.5 break-words text-xs font-bold text-slate-800">
                        {member.phone_number || "Not provided"}
                      </p>
                    </div>
                  </div>

                </div>

              </div>

            ))}

          </div>
        )}

        {/* =======================================================
            EMPTY STATE
        ======================================================= */}
        {!loading && members.length === 0 && !error && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Users className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900">
              No members found
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
              {searchQuery
                ? `No members matching "${searchQuery}" were found. Try another name or registration ID.`
                : "There are currently no registered members to display."}
            </p>

            {searchQuery && (
              <button
                onClick={handleReset}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Clear Search
              </button>
            )}

          </div>
        )}

        {/* =======================================================
            BACK BUTTON
        ======================================================= */}
        <div className="flex justify-center pt-2">

          <Link
            href="/admin_staff/md/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to MD Dashboard
          </Link>

        </div>

      </main>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">

        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">

          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} DCG Multipurpose Cooperative Society Ltd. All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  );
}
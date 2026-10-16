"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  Loader2,
  AlertTriangle,
  Search,
  ArrowLeft,
  User,
  CreditCard,
  Building2,
  Phone,
  Hash,
  Landmark,
  Users,
  RefreshCw,
} from "lucide-react";

import { MemberProfileItem } from "@/types/membersDirectory";

export default function MembersBankDetailsPage() {
  const [members, setMembers] = useState<MemberProfileItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMembers = useCallback(async (query: string = "") => {
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const endpoint = query
        ? `/api/admin_staff/accountant/members?search=${encodeURIComponent(query)}`
        : "/api/admin_staff/accountant/members";

      const res = await fetch(endpoint, {
        method: "GET",
        cache: "no-store",
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setMembers(json.members || []);
      } else {
        setMembers([]);
        setStatusMessage(
          json.message || "Failed to load members directory."
        );
      }
    } catch (error) {
      console.error("Failed to fetch members:", error);
      setMembers([]);
      setStatusMessage(
        "Network error. Could not retrieve member records."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const query = searchInput.trim();

    setSearchQuery(query);
    fetchMembers(query);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      await fetchMembers(searchQuery);
    } finally {
      setIsRefreshing(false);
    }
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    fetchMembers("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col -mt-28 font-sans text-slate-900">

      {/* =====================================================
          NAVIGATION
      ====================================================== */}
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
                Accountant Portal
              </span>
            </div>

            {/* Back Button */}
            <Link
              href="/admin_staff/accountant/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">
                Accountant Dashboard
              </span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 mt-2 sm:px-6 lg:px-8 space-y-6">

        {/* =================================================
            PAGE HEADER
        ================================================== */}
        <section className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">

          {/* Decorative Background */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div className="space-y-3 max-w-2xl">

              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-xs">
                <Landmark className="h-3.5 w-3.5" />
                Accountant Financial Services
              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Members Bank Details
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Search and review registered member profiles, bank account
                information, registration details, and contact information.
              </p>
            </div>

            {/* Member Count */}
            <div className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                  <Users className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Registered Members
                  </p>

                  <p className="text-xl font-extrabold text-white">
                    {members.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            SEARCH / CONTROLS
        ================================================== */}
        <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">

          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col lg:flex-row gap-3"
          >

            {/* Search Input */}
            <div className="relative flex-1">

              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />

              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by Full Name or Registration ID..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
              />
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Search className="h-4 w-4" />
              Search
            </button>

            {/* Refresh */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 transition-colors"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>

            {/* Clear Search */}
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                Clear
              </button>
            )}
          </form>
        </section>

        {/* =================================================
            ERROR MESSAGE
        ================================================== */}
        {statusMessage && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 flex items-center gap-3">

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-100">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            </div>

            <div>
              <p className="font-bold text-rose-900">
                Unable to load member records
              </p>

              <p className="mt-0.5 text-rose-700">
                {statusMessage}
              </p>
            </div>
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================== */}
        {isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-20 text-center shadow-xs">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900">
              Loading member records
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Retrieving registered members and bank details...
            </p>
          </div>
        ) : (
          <section className="space-y-4">

            {/* =================================================
                SECTION HEADER
            ================================================== */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

              <div>
                <h2 className="text-sm font-extrabold text-slate-900">
                  Registered Member Profiles
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  {searchQuery
                    ? `Showing results matching "${searchQuery}"`
                    : "All registered member bank profiles"}
                </p>
              </div>

              <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-600">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                {members.length}{" "}
                {members.length === 1 ? "Member" : "Members"}
              </div>
            </div>

            {/* =================================================
                MEMBER CARDS
            ================================================== */}
            {members.length > 0 ? (

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

                {members.map((member) => (

                  <article
                    key={member.member_id}
                    className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
                  >

                    {/* Member Identity */}
                    <div className="space-y-4">

                      <div className="flex items-center gap-3">

                        {/* Passport */}
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-2xs">

                          <Image
                            src={`/uploads/${
                              member.passport ||
                              "default_passport.jpg"
                            }`}
                            alt={member.full_name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />

                        </div>

                        <div className="min-w-0">

                          <h3 className="truncate text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {member.full_name}
                          </h3>

                          <span className="mt-1 inline-flex max-w-full items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[9px] font-bold text-slate-500">

                            <Hash className="h-3 w-3 shrink-0" />

                            <span className="truncate">
                              {member.member_id}
                            </span>

                          </span>

                        </div>
                      </div>

                      {/* Bank Information */}
                      <div className="space-y-2 border-t border-slate-100 pt-4">

                        {/* Account Name */}
                        <div className="rounded-xl bg-slate-50 p-2.5">

                          <div className="flex items-center gap-2">

                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-2xs">
                              <User className="h-3.5 w-3.5" />
                            </div>

                            <div className="min-w-0 flex-1">

                              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                                Account Name
                              </p>

                              <p className="truncate text-xs font-bold text-slate-800">
                                {member.account_name || "Not provided"}
                              </p>

                            </div>
                          </div>
                        </div>

                        {/* Account Number */}
                        <div className="rounded-xl bg-emerald-50/70 p-2.5">

                          <div className="flex items-center gap-2">

                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                              <CreditCard className="h-3.5 w-3.5" />
                            </div>

                            <div className="min-w-0 flex-1">

                              <p className="text-[9px] font-semibold uppercase tracking-wide text-emerald-600">
                                Account Number
                              </p>

                              <p className="truncate font-mono text-xs font-bold text-emerald-800">
                                {member.account_number || "Not provided"}
                              </p>

                            </div>
                          </div>
                        </div>

                        {/* Bank */}
                        <div className="flex items-center gap-2 px-1 py-1">

                          <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                          <div className="min-w-0 flex-1">

                            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                              Bank
                            </p>

                            <p className="truncate text-xs font-semibold text-slate-700">
                              {member.bank_name || "Not provided"}
                            </p>

                          </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-center gap-2 px-1 py-1">

                          <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                          <div className="min-w-0 flex-1">

                            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                              Phone
                            </p>

                            <p className="truncate font-mono text-xs font-semibold text-slate-700">
                              {member.phone_number || "Not provided"}
                            </p>

                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">

                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                        <Shield className="h-3 w-3" />
                        Member Record
                      </span>

                      <span className="text-[10px] font-bold text-emerald-600">
                        Verified Profile
                      </span>

                    </div>

                  </article>

                ))}

              </div>

            ) : (

              /* =================================================
                 EMPTY STATE
              ================================================== */
              <div className="rounded-3xl border border-slate-200 bg-white p-12 sm:p-16 text-center shadow-xs">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Search className="h-6 w-6" />
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-900">
                  No members found
                </h3>

                <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                  {searchQuery
                    ? `No registered member matches "${searchQuery}". Try searching with a different name or registration ID.`
                    : "There are currently no registered member records available."}
                </p>

                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="mt-5 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                  >
                    View All Members
                  </button>
                )}

              </div>
            )}
          </section>
        )}
      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">

        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

            <Link
              href="/admin_staff/accountant/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Accountant Dashboard
            </Link>

            <p className="text-[11px] text-slate-500">
              &copy; {new Date().getFullYear()} DCG Multipurpose
              Cooperative Society Ltd. All rights reserved.
            </p>

          </div>

        </div>
      </footer>
    </div>
  );
}
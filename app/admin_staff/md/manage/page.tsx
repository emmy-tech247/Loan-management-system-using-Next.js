"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Shield,
  Loader2,
  Search,
  User,
  CreditCard,
  Building2,
  Phone,
  BadgeAlert,
} from "lucide-react";
import { MemberProfile } from "@/types/members";

export default function ViewAllMembersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async (query = "") => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin_staff/md/members?search=${encodeURIComponent(query)}`);
      const json = await res.json();

      if (res.ok && json.success) {
        setMembers(json.members);
        setSearchQuery(json.search);
      } else {
        setError(json.message || "Failed to retrieve members.");
      }
    } catch {
      setError("Network connection error. Unable to load member directory.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialSearch = params.get("search") || "";
    setSearchInput(initialSearch);
    fetchMembers(initialSearch);
  }, [fetchMembers]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput) params.append("search", searchInput);
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
    fetchMembers(searchInput);
  };

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
                <Shield className="h-3 w-3 text-emerald-400" /> Member Directory
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
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <User className="h-6 w-6 text-emerald-600" /> All Registered Members
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Complete directory of cooperative profiles, bank account details, and identification records.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Full Name or ID..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden shadow-xs"
              />
            </div>
            <button
              type="submit"
              className="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs shrink-0"
            >
              Search
            </button>
          </form>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800">
            {error}
          </div>
        )}

        {/* Profile Cards Grid */}
        {isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-20 text-center text-xs text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-600" />
            Loading registered member profiles...
          </div>
        ) : members.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <div
                key={member.member_id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col items-center text-center space-y-4 hover:border-slate-300 transition-colors"
              >
                <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-slate-100 shadow-xs bg-slate-100">
                  <Image
                    src={`/uploads/${member.passport || "default.jpg"}`}
                    alt={member.full_name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>

                <div className="space-y-1 w-full">
                  <h2 className="text-sm font-extrabold text-slate-900 truncate">
                    {member.full_name}
                  </h2>
                  <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 font-mono">
                    ID: #{member.member_id}
                  </span>
                </div>

                <div className="w-full space-y-2 text-left bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs font-medium text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <CreditCard className="h-3.5 w-3.5" /> Acct Name:
                    </span>
                    <span className="font-bold text-slate-800 truncate max-w-[140px]">
                      {member.account_name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <CreditCard className="h-3.5 w-3.5" /> Acct Number:
                    </span>
                    <span className="font-bold text-slate-800 font-mono">
                      {member.account_number}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" /> Bank:
                    </span>
                    <span className="font-bold text-slate-800 truncate max-w-[140px]">
                      {member.bank_name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" /> Phone:
                    </span>
                    <span className="font-bold text-slate-800 font-mono">
                      {member.phone_number}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center text-xs text-slate-400 space-y-2">
            <BadgeAlert className="h-8 w-8 mx-auto text-slate-300" />
            <p>No members found {searchQuery ? `matching "${searchQuery}"` : ""}.</p>
          </div>
        )}
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

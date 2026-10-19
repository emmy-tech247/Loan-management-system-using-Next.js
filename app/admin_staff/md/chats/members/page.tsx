"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  Loader2,
  RefreshCw,
  MessageSquare,
  User,
  Search,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { MemberChatListItem } from "@/types/chat";

export default function AdminChatListPage() {
  const router = useRouter();
  const [members, setMembers] = useState<MemberChatListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchChatMembers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin_staff/md/chats/members");
      const json = await res.json();
      if (res.ok && json.success) {
        setMembers(json.data);
      } else {
        setError(json.message || "Failed to load chat conversations.");
      }
    } catch {
      setError("Network error. Failed to reach server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChatMembers();
  }, []);

  const filteredMembers = members.filter((member) => {
    const term = searchTerm.toLowerCase();
    return (
      member.full_name.toLowerCase().includes(term) ||
      member.member_id.toString().includes(term) ||
      (member.email && member.email.toLowerCase().includes(term))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Navbar Header */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin_staff/staff" className="flex items-center gap-2">
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
                <Shield className="h-3 w-3 text-emerald-400" /> Executive Portal
              </span>
            </div>

            <Link
              href="/admin_staff/md/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-emerald-600" /> Member Conversations
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Select a member from the directory below to open their chat thread.
            </p>
          </div>

          <button
            onClick={fetchChatMembers}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-xs self-start sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search member by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-colors shadow-xs"
          />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 flex items-center gap-3 text-xs font-medium text-rose-800">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Member Conversation List Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Member Chats
            </h2>
            <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
              {filteredMembers.length} Members
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-600" />
              <p className="text-xs font-medium">Loading conversation list...</p>
            </div>
          ) : filteredMembers.length > 0 ? (
            <div className="space-y-2">
              {filteredMembers.map((member) => (
                <button
                  key={member.member_id}
                  onClick={() =>
                    router.push(`/admin/chats/dashboard?member_id=${member.member_id}`)
                  }
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-transparent hover:border-slate-200 hover:bg-emerald-50/50 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 group-hover:border-emerald-300 transition-colors">
                      <User className="h-5 w-5 text-slate-500 group-hover:text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {member.full_name}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Member ID: #{member.member_id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {member.unread_count ? (
                      <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        {member.unread_count}
                      </span>
                    ) : null}
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-medium text-slate-500">
                No active member conversations found.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 space-y-2">
          <Link
            href="/admin_staff/md/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <p className="text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} DCG Multipurpose Cooperative Society Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

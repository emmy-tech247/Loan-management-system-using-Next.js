"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  MessageSquare,
  Shield,
  User,
  Loader2,
} from "lucide-react";

import ChatWindow from "@/components/chat/ChatWindow";

interface Member {
  member_id: number;
  full_name: string;
}

interface MemberApiResponse {
  success?: boolean;
  data?: {
    member_id?: number | string;
    full_name?: string;
    email?: string | null;
    phone?: string | null;
  };
  message?: string;
}

export default function AdminChatPage() {
  const [member, setMember] = useState<Member | null>(null);
  const [memberId, setMemberId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function findMember() {
    const id = Number(memberId.trim());

    if (!Number.isInteger(id) || id <= 0) {
      setError("Enter a valid Member ID.");
      setMember(null);
      return;
    }

    setLoading(true);
    setError(null);
    setMember(null);

    try {
      const response = await fetch(
        `/api/members/${encodeURIComponent(String(id))}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      const rawText = await response.text();

      console.log("Member API status:", response.status);
      console.log("Member API content-type:", contentType);
      console.log("Member API response:", rawText);

      if (!rawText.trim()) {
        throw new Error(
          `The server returned an empty response (${response.status}).`
        );
      }

      if (
        !contentType
          .toLowerCase()
          .includes("application/json")
      ) {
        if (response.status === 401) {
          throw new Error(
            "Your admin session has expired. Please login again."
          );
        }

        if (response.status === 403) {
          throw new Error(
            "Unauthorized. Admin access is required."
          );
        }

        if (response.status === 404) {
          throw new Error(
            "Member API route was not found. Check that /api/members/[memberId]/route.ts exists."
          );
        }

        if (response.status >= 500) {
          throw new Error(
            `The server returned an unexpected response (${response.status}). Check the API route for a server error.`
          );
        }

        throw new Error(
          `Server returned an unexpected response (${response.status}).`
        );
      }

      let data: MemberApiResponse;

      try {
        data = JSON.parse(rawText) as MemberApiResponse;
      } catch (jsonError) {
        console.error(
          "Invalid JSON returned by member API:",
          jsonError
        );

        throw new Error(
          "The member API returned invalid JSON."
        );
      }

      if (response.status === 401) {
        throw new Error(
          data.message ||
            "Your admin session has expired. Please login again."
        );
      }

      if (response.status === 403) {
        throw new Error(
          data.message ||
            "Unauthorized. Admin access is required."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Unable to find member (${response.status}).`
        );
      }

      if (!data.success || !data.data) {
        throw new Error(
          data.message || "Member not found."
        );
      }

      const returnedMemberId = Number(
        data.data.member_id
      );

      const returnedFullName =
        String(data.data.full_name || "").trim();

      if (
        !Number.isInteger(returnedMemberId) ||
        returnedMemberId <= 0
      ) {
        throw new Error(
          "The API returned an invalid member ID."
        );
      }

      if (!returnedFullName) {
        throw new Error(
          "The API returned a member without a name."
        );
      }

      setMember({
        member_id: returnedMemberId,
        full_name: returnedFullName,
      });
    } catch (err) {
      console.error("Find member error:", err);

      setMember(null);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to find member."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      event.preventDefault();

      if (!loading) {
        findMember();
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans -mt-28 text-slate-900">
      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            <div className="flex items-center gap-3">
              <Link
                href="/admin_staff/admin/dashboard"
                className="flex items-center gap-2"
              >
                <img
                  src="/images/logo2.png"
                  alt="DCG Cooperative Logo"
                  width={140}
                  height={40}
                  className="h-9 w-auto object-contain"
                />
              </Link>

              <span className="hidden items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white sm:inline-flex">
                <Shield className="h-3 w-3 text-emerald-400" />
                Admin Portal
              </span>
            </div>

            <Link
              href="/admin_staff/admin/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <ArrowLeft className="h-4 w-4" />

              <span className="hidden sm:inline">
                Dashboard
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* =========================================================
          MAIN
      ========================================================= */}

      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 mt-2 sm:px-6 lg:px-8">

        {/* =======================================================
            HEADER
        ======================================================= */}

        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">

          <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

            <div className="max-w-2xl">

              <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                <MessageSquare className="h-3.5 w-3.5" />
                Administrator Communication
              </span>

              <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Member Chat
              </h1>

              <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
                Search for a member and communicate directly
                through the administrator messaging channel.
              </p>
            </div>

            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 sm:flex">
              <MessageSquare className="h-7 w-7 text-emerald-400" />
            </div>

          </div>
        </div>

        {/* =======================================================
            MEMBER SEARCH
        ======================================================= */}

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="mb-5 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Search className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                Find Member
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Enter the member ID to open the conversation.
              </p>
            </div>

          </div>

          <div className="flex flex-col gap-3 sm:flex-row">

            <div className="relative flex-1">

              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="number"
                min="1"
                value={memberId}
                onChange={(event) =>
                  setMemberId(event.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Enter Member ID"
                disabled={loading}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              />

            </div>

            <button
              type="button"
              onClick={findMember}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Open Chat
                </>
              )}
            </button>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
              <p className="text-xs font-semibold text-rose-700">
                {error}
              </p>
            </div>
          )}

          {/* MEMBER FOUND */}

          {member && (
            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <User className="h-5 w-5" />
                </div>

                <div>

                  <p className="text-xs font-bold text-emerald-700">
                    Member Found
                  </p>

                  <p className="text-sm font-extrabold text-slate-900">
                    {member.full_name}
                  </p>

                  <p className="text-[11px] font-medium text-slate-500">
                    Member ID: {member.member_id}
                  </p>

                </div>

              </div>

              <span className="inline-flex items-center self-start rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-emerald-700 shadow-sm sm:self-auto">
                Ready to Chat
              </span>

            </div>
          )}

        </div>

        {/* =======================================================
            CHAT
        ======================================================= */}

        {member ? (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md">

            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">

              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <MessageSquare className="h-4 w-4" />
                </div>

                <div className="min-w-0">

                  <p className="truncate text-xs font-extrabold text-slate-900">
                    Conversation with {member.full_name}
                  </p>

                  <p className="text-[10px] text-slate-500">
                    Member ID: {member.member_id}
                  </p>

                </div>

              </div>

              <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700 sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active Conversation
              </span>

            </div>

            <div className="h-[calc(100vh-22rem)] min-h-[500px]">

              <ChatWindow
                currentUserId={0}
                currentUserType="admin1"
                currentUserName="Administrator"
                receiverId={member.member_id}
                receiverType="member"
                receiverName={member.full_name}
              />

            </div>

          </div>
        ) : (

          <div className="flex min-h-[500px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="max-w-sm px-6 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <MessageSquare className="h-7 w-7" />
              </div>

              <h3 className="mt-5 text-sm font-extrabold text-slate-900">
                Select a Member to Start Chatting
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Enter the member ID above to open a conversation
                with the Administrator.
              </p>

            </div>

          </div>
        )}

      </main>

      {/* =========================================================
          FOOTER
      ========================================================= */}

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
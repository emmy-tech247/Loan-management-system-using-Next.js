"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Shield,
  MessageSquare,
} from "lucide-react";

import ChatWindow from "@/components/chat/ChatWindow";

export default function MemberAdminChatPage() {
  /*
   * IMPORTANT:
   *
   * Replace 5 with the actual admin1 staff_id.
   *
   * Even if this value is visible in the browser,
   * the API still authenticates the MEMBER from
   * the member_id cookie.
   */

  const adminId = 5;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="flex h-16 items-center justify-between">

            <Link
              href="/member/dashboard"
              className="flex items-center gap-2"
            >
              <img
                src="/images/logo2.png"
                alt="DCG Cooperative Logo"
                width={140}
                height={40}
                className="h-9 w-auto object-contain"
              />

              <span className="hidden rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold text-white sm:inline-flex">
                Member Portal
              </span>
            </Link>

            <Link
              href="/member/dashboard"
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

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* HEADER */}

        <div className="mb-6 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">

          <div className="relative z-10">

            <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">

              <MessageSquare className="h-3.5 w-3.5" />

              Administration Support

            </span>

            <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">
              Chat with Admin
            </h1>

            <p className="mt-2 text-sm text-slate-300">
              Send a direct message to the
              cooperative administrator.
            </p>

          </div>

        </div>

        {/* CHAT */}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md">

          <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Shield className="h-5 w-5" />
            </div>

            <div>

              <p className="text-sm font-extrabold text-slate-900">
                Administrator
              </p>

              <p className="text-xs text-slate-500">
                Direct support channel
              </p>

            </div>

          </div>

          <div className="h-[calc(100vh-22rem)] min-h-[500px]">

            <ChatWindow
              currentUserId={0}
              currentUserType="member"
              currentUserName="Member"
              receiverId={adminId}
              receiverType="admin1"
              receiverName="Administrator"
            />

          </div>

        </div>

      </main>

    </div>
  );
}
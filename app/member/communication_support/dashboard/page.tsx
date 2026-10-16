"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SupportNavbar from "@/components/navigation/SupportNavbar";
import {
  HelpCircle,
  Megaphone,
  MessageSquare,
  ShieldCheck,
  Headphones,
  Info,
} from "lucide-react";

interface Member {
  member_id: number;
  full_name: string;
}

export default function CommunicationPage() {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const response = await fetch("/api/member/communication");

        if (!response.ok) {
          setMember(null);
          return;
        }

        const data = await response.json();

        if (data.success) {
          setMember(data.member);
        }
      } catch (error) {
        console.error("Failed to fetch member details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">

      {/* =========================================================
          NAVIGATION BAR
      ========================================================= */}
        <SupportNavbar />

      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 -mt-24 sm:px-6 lg:px-8">

        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-md">

          {/* Decorative circle */}
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10">

            <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              Member Communication Portal
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome
              {member?.full_name
                ? `, ${member.full_name}`
                : ""}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Connect with DCG Cooperative administrators, access important
              information, ask questions, and receive support concerning your
              loans, savings, and fixed deposits.
            </p>

          </div>
        </div>

        {/* =========================================================
            INFORMATION CARD
        ========================================================= */}
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">

          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Headphones className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Communication and Support
              </h2>

              <p className="text-sm text-slate-500">
                We are here to assist you.
              </p>
            </div>
          </div>

          <div className="space-y-5 text-sm leading-7 text-slate-600">

            <p>
              The communication page of the Loan Management System serves as
              a central hub for interaction between members and administrators.
              It allows you to send inquiries, report issues, and receive
              updates regarding your loans, savings, or fixed deposits.
            </p>

            <p>
              The portal provides access to secure live chat, announcements,
              FAQs, and other support resources designed to ensure quick and
              reliable communication between members and the cooperative
              administration.
            </p>

            <p>
              This communication channel enhances transparency, builds trust,
              and improves service efficiency by providing timely feedback,
              status updates, and personalized support.
            </p>

          </div>
        </section>

        {/* =========================================================
            QUICK ACCESS
        ========================================================= */}
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* FAQ */}
          <Link
            href="/member/communication_support/faq"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
              <HelpCircle className="h-5 w-5" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900 group-hover:text-emerald-700">
              Frequently Asked Questions
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Find answers to common questions about your cooperative account
              and financial services.
            </p>
          </Link>

          {/* Announcements */}
          <Link
            href="/member/communication_support/announcement"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
              <Megaphone className="h-5 w-5" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900 group-hover:text-emerald-700">
              Announcements
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              View important announcements, notices, and updates from the
              cooperative.
            </p>
          </Link>

          {/* Chat */}
          <Link
            href="/member/communication_support/chat_admin"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
              <MessageSquare className="h-5 w-5" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900 group-hover:text-emerald-700">
              Chat with Admin
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Send a message directly to the cooperative administration for
              personalized support.
            </p>
          </Link>

        </section>

        {/* =========================================================
            SUPPORT NOTICE
        ========================================================= */}
        <div className="mt-6 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

          <Info className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

          <div>
            <h3 className="text-sm font-bold text-emerald-900">
              Need assistance?
            </h3>

            <p className="mt-1 text-xs leading-5 text-emerald-800">
              If you have an issue concerning your loan, savings, fixed
              deposit, payment, or account, use the{" "}
              <Link
                href="/member/communication_support/chat"
                className="font-bold underline hover:text-emerald-950"
              >
                Chat with Admin
              </Link>{" "}
              option to contact the cooperative administration.
            </p>
          </div>

        </div>

      </main>

      {/* =========================================================
          FOOTER
      ========================================================= */}
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
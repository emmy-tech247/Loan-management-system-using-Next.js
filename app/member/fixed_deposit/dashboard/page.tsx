"use client";

import Link from "next/link";
import Image from "next/image";
import FixedDepositNavbar from "@/components/navigation/FixedDepositNavbar";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  History,
  Landmark,
  LogOut,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  WalletCards,
} from "lucide-react";

export default function FixedDepositPage() {
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.href = "/login";
    }
  };

  const features = [
    {
      icon: CalendarDays,
      title: "Flexible Tenures",
      description: "Choose a fixed deposit period from 6 months up to 5 years.",
    },
    {
      icon: TrendingUp,
      title: "Attractive Returns",
      description: "Interest rates can range from 20% to 24% per annum.",
    },
    {
      icon: ShieldCheck,
      title: "Secure Investment",
      description: "Your principal and agreed returns are protected.",
    },
    {
      icon: RefreshCw,
      title: "Rollover Options",
      description: "Easily rollover or request withdrawal when eligible.",
    },
    {
      icon: WalletCards,
      title: "Dashboard Tracking",
      description: "Monitor your fixed deposit and earned interest online.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* =========================
          NAVIGATION BAR
      ========================== */}
        <FixedDepositNavbar />

      {/* =========================
          MAIN CONTENT
      ========================== */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 pt-8 -mt-24 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8 lg:p-10">
            
            {/* Decorative Background */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />

            <div className="relative z-10 max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                <Landmark className="h-4 w-4" />
                Fixed Deposit Services
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
                Secure Your Future with Fixed Deposits
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Grow your savings with attractive returns, flexible tenures,
                and the peace of mind that comes with a secure investment.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/member/fixed_deposit/apply_fd"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-500 hover:shadow-md"
                >
                  Open Fixed Deposit
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/member/fixed_deposit/interest_earned"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
                >
                  View My Deposit
                  <FileText className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Main Information */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            
            {/* Image Card */}
            <div className="relative min-h-[320px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <Image
                src="/images/piggy.JPG"
                alt="Fixed Deposit Savings"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              {/* Image Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600">
                  <Banknote className="h-5 w-5" />
                </div>

                <h2 className="text-xl font-bold">
                  Build Your Financial Future
                </h2>

                <p className="mt-1 text-sm text-slate-200">
                  Put your money to work with a structured fixed deposit plan.
                </p>
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  <BadgeCheck className="h-4 w-4" />
                  Why Choose Our Fixed Deposit?
                </span>

                <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
                  Grow Your Savings with Confidence
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Choose a savings period that works for you and enjoy
                  competitive returns on your investment.
                </p>
              </div>

              <div className="space-y-4">
                {features.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <div
                      key={feature.title}
                      className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:border-emerald-100 hover:bg-emerald-50/40"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                        <Icon className="h-5 w-5" />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {feature.title}
                        </h3>

                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link
                href="/member/fixed_deposit/apply_fd"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
              >
                Open Fixed Deposit Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Fixed Deposit Management
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage and monitor your fixed deposit account.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/member/fixed_deposit/apply_fd"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <Landmark className="h-5 w-5" />
              </div>

              <h3 className="text-sm font-bold text-slate-900">
                Apply for Fixed Deposit
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Start a new fixed deposit investment.
              </p>
            </Link>

            <Link
              href="/member/fixed_deposit/fd_record"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <FileText className="h-5 w-5" />
              </div>

              <h3 className="text-sm font-bold text-slate-900">
                View Fixed Deposit
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Check your current fixed deposit records.
              </p>
            </Link>

            <Link
              href="/member/fixed_deposit/interest_earned"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <TrendingUp className="h-5 w-5" />
              </div>

              <h3 className="text-sm font-bold text-slate-900">
                Interest Earned
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Review interest earned over time.
              </p>
            </Link>

            <Link
              href="/member/fixed_deposit/rollover_option"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <RefreshCw className="h-5 w-5" />
              </div>

              <h3 className="text-sm font-bold text-slate-900">
                Withdrawal / Rollover
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Manage withdrawal or rollover requests.
              </p>
            </Link>
          </div>
        </section>
      </main>

      {/* =========================
          FOOTER
      ========================== */}
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
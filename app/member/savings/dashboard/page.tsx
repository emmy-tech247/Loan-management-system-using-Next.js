"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import SavingsNavbar from "@/components/navigation/SavingsNavbar";
import {
  ArrowLeft,
  PiggyBank,
  Wallet,
  History,
  Bell,
  Upload,
  Banknote,
  ChevronRight,
  Menu,
  X,
  ShieldCheck,
  TrendingUp,
  Megaphone,
} from "lucide-react";

export default function MonthlySavingsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">

      {/* =========================================================
          NAVBAR
      ========================================================= */}
      <SavingsNavbar />
      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 -mt-24 sm:px-6 lg:px-8">

        <div className="space-y-6">

          {/* =====================================================
              HERO HEADER
          ===================================================== */}
          <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">

            {/* Decorative background */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              <div className="max-w-3xl">

                {/* Badge */}
                <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-300">

                  <PiggyBank className="h-4 w-4" />

                  Monthly Savings Plan

                </div>

                {/* Heading */}
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
                  Monthly Savings
                </h1>

                {/* Description */}
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                  Secure your future with consistent savings. Build financial
                  discipline, grow your savings steadily, and work toward your
                  personal and financial goals.
                </p>

              </div>

              {/* Hero Icon */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-300">

                <PiggyBank className="h-10 w-10" />

              </div>

            </div>

          </section>

          {/* =====================================================
              SAVINGS CONTENT
          ===================================================== */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* Image Card */}
            <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm">

              <div className="relative h-full min-h-[320px]">

                <Image
                  src="/images/savings.jpg"
                  alt="Monthly Savings Illustration"
                  fill
                  className="object-cover"
                  priority
                />

                {/* Image overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />

                {/* Image caption */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">

                  <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/90 px-3 py-1.5 text-xs font-bold">

                    <ShieldCheck className="h-4 w-4" />

                    Save With Confidence

                  </div>

                  <h2 className="mt-3 text-xl font-extrabold">
                    Build Your Financial Future
                  </h2>

                  <p className="mt-1 text-sm text-slate-200">
                    Consistent contributions today can help you achieve your
                    financial goals tomorrow.
                  </p>

                </div>

              </div>

            </div>

            {/* Content Card */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">

              <div className="mb-6 flex items-start gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

                  <TrendingUp className="h-5 w-5" />

                </div>

                <div>

                  <h2 className="text-xl font-extrabold text-slate-900">
                    Why Choose Monthly Savings?
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Develop a consistent saving habit and strengthen your
                    financial stability.
                  </p>

                </div>

              </div>

              <div className="space-y-5">

                {/* Paragraph 1 */}
                <div>

                  <p className="text-sm leading-7 text-slate-600">
                    Our Monthly Savings Plan helps you build discipline and
                    financial stability by allowing you to save a fixed amount
                    automatically every month. This approach supports
                    long-term goals like education, business, emergencies, or
                    personal projects.
                  </p>

                </div>

                {/* Paragraph 2 */}
                <div>

                  <p className="text-sm leading-7 text-slate-600">
                    With each contribution, you're one step closer to achieving
                    financial independence. Enjoy peace of mind knowing that
                    your savings grow steadily with full transparency and easy
                    access.
                  </p>

                </div>

                {/* Paragraph 3 */}
                <div>

                  <p className="text-sm leading-7 text-slate-600">
                    Whether you're employed, self-employed, or a student, this
                    plan adjusts to your income level. Take advantage of
                    flexible amounts, scheduled deductions, and optional
                    top-ups when you have extra funds.
                  </p>

                </div>

                {/* Highlight */}
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">

                  <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">

                      <Banknote className="h-4 w-4" />

                    </div>

                    <p className="text-sm font-bold leading-6 text-emerald-800">
                      Start today and develop the habit of saving that pays
                      off tomorrow.
                    </p>

                  </div>

                </div>

                {/* Start Saving Button */}
                <Link
                  href="/member/set-saving"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md sm:w-auto"
                >

                  <PiggyBank className="h-5 w-5" />

                  Start Saving Now

                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />

                </Link>

              </div>

            </div>

          </section>

          {/* =====================================================
              SAVINGS BENEFITS
          ===================================================== */}
          <section>

            <div className="mb-4">

              <h2 className="text-xl font-extrabold text-slate-900">
                Benefits of Monthly Savings
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Simple and practical ways consistent savings can help you.
              </p>

            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

              <BenefitCard
                icon={PiggyBank}
                title="Financial Discipline"
                description="Develop a consistent habit of setting money aside every month."
              />

              <BenefitCard
                icon={TrendingUp}
                title="Steady Growth"
                description="Build your savings gradually through regular contributions."
              />

              <BenefitCard
                icon={Wallet}
                title="Easy Access"
                description="Keep track of your contributions and manage your funds conveniently."
              />

            </div>

          </section>

          {/* =====================================================
              CALL TO ACTION
          ===================================================== */}
          <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">

            <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">

              <div>

                <div className="flex items-center gap-2">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

                    <PiggyBank className="h-5 w-5" />

                  </div>

                  <h2 className="text-lg font-extrabold text-slate-900">
                    Ready to Start Saving?
                  </h2>

                </div>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Set your expected monthly contribution and begin building
                  your savings plan today.
                </p>

              </div>

              <Link
                href="/member/set-saving"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-600"
              >

                Set Monthly Amount

                <ChevronRight className="h-4 w-4" />

              </Link>

            </div>

          </section>

        </div>

      </main>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">

        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">

          <p className="text-xs font-medium text-slate-500">
            © {currentYear} DCG Multipurpose Cooperative Society Ltd.
            All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  );
}


/* =========================================================
   DESKTOP NAVIGATION LINK
========================================================= */

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-100 hover:text-emerald-700"
    >
      {children}
    </Link>
  );
}


/* =========================================================
   MOBILE NAVIGATION LINK
========================================================= */

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-bold text-slate-700 transition-all hover:bg-slate-100 hover:text-emerald-700"
    >
      {children}
    </Link>
  );
}


/* =========================================================
   BENEFIT CARD
========================================================= */

function BenefitCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">

      <div className="flex items-start gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">

          <Icon className="h-5 w-5" />

        </div>

        <div>

          <h3 className="text-sm font-extrabold text-slate-900">
            {title}
          </h3>

          <p className="mt-1.5 text-xs leading-5 text-slate-500">
            {description}
          </p>

        </div>

      </div>

    </div>
  );
}
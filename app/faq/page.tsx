"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Menu,
  X,
  Home as HomeIcon,
  Info,
  Phone,
  HelpCircle,
  LayoutDashboard,
} from "lucide-react";

import FaqList from "@/components/faq/FaqList";

export default function FaqPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* =========================================================
          NAVBAR
      ========================================================= */}
      <header className="fixed left-0 top-0 z-50 w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-3"
          >
            <Image
              src="/images/logo2.png"
              alt="DCG Cooperative Logo"
              width={140}
              height={40}
              className="h-10 w-auto object-contain sm:h-11"
              priority
            />

            <div className="hidden sm:block">
              <h2 className="text-base font-extrabold tracking-tight text-slate-900">
                DCG Cooperative
              </h2>

              <p className="text-[10px] text-slate-500">
                Multipurpose Cooperative Society Ltd.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 lg:flex">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-emerald-600"
            >
              <HomeIcon className="h-4 w-4" />
              Home
            </Link>

            <Link
              href="/about"
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-emerald-600"
            >
              <Info className="h-4 w-4" />
              About
            </Link>

            <Link
              href="/contact"
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-emerald-600"
            >
              <Phone className="h-4 w-4" />
              Contact
            </Link>

            {/* Active FAQ */}
            <Link
              href="/faq"
              className="flex items-center gap-2 text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
            >
              <HelpCircle className="h-4 w-4" />
              FAQ
            </Link>
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href="/login"
              className="rounded-xl border border-emerald-600 px-4 py-2 text-xs font-bold text-emerald-600 transition-colors hover:bg-emerald-50"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              Register
            </Link>

            <Link
              href="/staff/login"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-slate-800"
            >
              <LayoutDashboard className="h-4 w-4 text-emerald-400" />
              Staff
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 lg:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`overflow-hidden border-t border-slate-100 bg-white transition-all duration-300 lg:hidden ${
            mobileOpen
              ? "max-h-[600px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-emerald-600"
              >
                <HomeIcon className="h-4 w-4" />
                Home
              </Link>

              <Link
                href="/about"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-emerald-600"
              >
                <Info className="h-4 w-4" />
                About Us
              </Link>

              <Link
                href="/contact"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-emerald-600"
              >
                <Phone className="h-4 w-4" />
                Contact Us
              </Link>

              {/* Active FAQ */}
              <Link
                href="/faq"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700"
              >
                <HelpCircle className="h-4 w-4" />
                FAQ
              </Link>

              <div className="my-2 h-px bg-slate-100" />

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="rounded-xl border border-emerald-600 px-4 py-3 text-center text-sm font-bold text-emerald-600 transition-colors hover:bg-emerald-50"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  onClick={closeMobileMenu}
                  className="rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-emerald-700"
                >
                  Register
                </Link>

                <Link
                  href="/staff/login"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
                >
                  <LayoutDashboard className="h-4 w-4 text-emerald-400" />
                  Staff Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 pt-5 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Hero Banner */}
          <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">
            {/* Decorative Glow */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative z-10 max-w-3xl space-y-3">
              <span className="inline-flex rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                DCG Cooperative Help Center
              </span>

              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Frequently Asked Questions
              </h1>

              <p className="max-w-2xl text-xs leading-relaxed text-slate-300 sm:text-sm">
                Find answers to common questions about loan applications,
                repayments, savings, investments, membership, and cooperative
                policies.
              </p>
            </div>
          </section>

          {/* FAQ Content */}
          <section className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
            {/* Section Header */}
            <div className="mb-8 flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Help & Support
                </span>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Common Questions
                </h2>

                <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
                  Browse the questions below or use the search functionality
                  to quickly find the information you need.
                </p>
              </div>

              {/* FAQ Badge */}
              <div className="flex shrink-0 items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  ?
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Support
                  </p>
                  <p className="text-xs font-bold text-slate-700">
                    FAQ Center
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive FAQ */}
            <div className="faq-dashboard-theme">
              <FaqList />
            </div>
          </section>

          {/* Support CTA */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Still Need Help?
                </span>

                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  Can't find the answer you're looking for?
                </h2>

                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Contact our support team or chat directly with an
                  administrator for assistance with your account, loan,
                  savings, or other cooperative services.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/admin_staff/admin/chat"
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md"
                >
                  Chat with Admin
                </Link>

                <Link
                  href="/contact"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
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
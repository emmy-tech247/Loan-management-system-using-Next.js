"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  Clock3,
  FileBarChart3,
  FileText,
  Headphones,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const features = [
  {
    title: "Easy Application",
    description:
      "Complete your loan application in minutes with our simple online form.",
    icon: FileText,
  },
  {
    title: "Real-time Tracking",
    description:
      "Monitor your loan status and repayment progress from your dashboard.",
    icon: Clock3,
  },
  {
    title: "24/7 Support",
    description:
      "Our team is always available to help you with your loan-related needs.",
    icon: Headphones,
  },
];

const navigation = [
  {
    label: "Back",
    href: "/member",
    icon: ArrowLeft,
  },
  {
    label: "Loan Application Form",
    href: "/loan-saver-borrower",
    icon: FileText,
  },
  {
    label: "Status Tracking",
    href: "/loan-status",
    icon: CheckCircle2,
  },
  {
    label: "Loan Repayment",
    href: "/upload-loan-repayment",
    icon: FileText,
  },
  {
    label: "Repayment Status",
    href: "/view-loan-repayment",
    icon: CheckCircle2,
  },
  {
    label: "Loan Report",
    href: "/loan-report",
    icon: FileBarChart3,
  },
  {
    label: "Loan Calculator",
    href: "/loan-calculator",
    icon: Calculator,
  },
];

export default function LoanManagementPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="flex shrink-0 items-center"
              aria-label="DCG Cooperative Home"
            >
              <Image
                src="/images/logo2.png"
                alt="DCG Multipurpose Cooperative Society Logo"
                width={140}
                height={60}
                priority
                className="h-12 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <Icon className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((value) => !value)}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-50 lg:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="border-t border-slate-100 py-3 lg:hidden">
              <div className="grid gap-1">
                {navigation.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <Icon className="h-4 w-4 text-slate-400" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-md">
              {/* Decorative background */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-emerald-400/5 blur-3xl" />

              <div className="relative z-10 grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-2 lg:p-12">
                {/* Hero Text */}
                <div className="max-w-2xl">
                  <span className="mb-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur-sm">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Secure Loan Management
                  </span>

                  <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                    Smart, Fast &{" "}
                    <span className="text-emerald-400">Reliable Loans</span>
                  </h1>

                  <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                    Apply, track, and manage your loans online with ease. Our
                    platform provides secure, flexible, and convenient loan
                    management for individuals and businesses.
                  </p>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/loan-saver-borrower"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-500 hover:shadow-md"
                    >
                      Get Started
                      <CheckCircle2 className="h-4 w-4" />
                    </Link>

                    <Link
                      href="/loan-calculator"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                    >
                      <Calculator className="h-4 w-4" />
                      Calculate Loan
                    </Link>
                  </div>
                </div>

                {/* Hero Image */}
                <div className="relative">
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-2 shadow-2xl">
                    <Image
                      src="/images/loan_management.jpg"
                      alt="Loan Management"
                      width={800}
                      height={550}
                      priority
                      className="h-auto w-full rounded-xl object-cover"
                    />
                  </div>

                  {/* Floating Status Card */}
                  <div className="absolute -bottom-4 -left-3 rounded-2xl border border-slate-200/20 bg-white p-3 shadow-xl sm:-left-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Loan Platform
                        </p>
                        <p className="text-xs font-bold text-slate-900">
                          Secure & Reliable
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 pb-10 sm:px-6 lg:px-8 lg:pb-14">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Why Choose Us
                </span>

                <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                  Our Features
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Everything you need to apply for, monitor, and manage your
                  cooperative loan in one place.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="mt-5 text-sm font-bold text-slate-900 group-hover:text-emerald-700">
                      {feature.title}
                    </h3>

                    <p className="mt-2 text-xs leading-6 text-slate-500">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
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
(b) Loan Application Form
import Image from "next/image";
import Link from "next/link";
import {
  FileText,
  Activity,
  CreditCard,
  PieChart,
  Calculator,
  ArrowLeft,
  FileCheck,
  TrendingUp,
  Headphones,
} from "lucide-react";

export const metadata = {
  title: "Loan Management - DCG Cooperative",
  description: "Apply, track, and manage your loans online with ease.",
};

export default function LoanManagementPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo2.png"
              alt="DCG Cooperative Logo"
              width={60}
              height={60}
              priority
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-700 md:gap-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-slate-600 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>

            <Link
              href="/dashboard/loans/apply"
              className="hover:text-emerald-600 transition-colors"
            >
              Loan Application Form
            </Link>

            <Link
              href="/dashboard/loans/status"
              className="hover:text-emerald-600 transition-colors"
            >
              Status Tracking
            </Link>

            <Link
              href="/dashboard/loans/repayment"
              className="hover:text-emerald-600 transition-colors"
            >
              Loan Repayment
            </Link>

            <Link
              href="/dashboard/loans/repayment-status"
              className="hover:text-emerald-600 transition-colors"
            >
              Repayment Status
            </Link>

            <Link
              href="/dashboard/loans/report"
              className="hover:text-emerald-600 transition-colors"
            >
              Loan Report
            </Link>

            <Link
              href="/dashboard/loans/calculator"
              className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <Calculator className="h-4 w-4" />
              <span>Calculator</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-slate-900 to-slate-800 py-16 text-white md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 gap-12 items-center lg:grid-cols-2">
              {/* Hero Text */}
              <div className="space-y-6">
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                  Smart, Fast &amp; Reliable Loans
                </h1>
                <p className="text-lg text-slate-300 leading-relaxed">
                  Apply, track, and manage your loans online with ease. Our
                  platform provides secure, flexible, and instant loan management
                  for individuals and businesses.
                </p>
                <div>
                  <Link
                    href="/dashboard/loans/apply"
                    className="inline-block rounded-lg bg-emerald-600 px-6 py-3.5 text-base font-semibold text-white shadow-md transition-colors hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                  >
                    Get Started
                  </Link>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative h-64 overflow-hidden rounded-2xl border border-slate-700/50 shadow-2xl sm:h-80 md:h-96">
                <Image
                  src="/images/loan_management.jpg"
                  alt="Loan Management Illustration"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Our Features
              </h2>
              <p className="mt-2 text-slate-600">
                Everything you need to apply for and manage your loan portfolio.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <FileCheck className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">
                  Easy Application
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Complete your loan application in minutes with our simple
                  online form.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <TrendingUp className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">
                  Real-time Tracking
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Monitor your loan status and repayment progress directly from
                  your dashboard.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Headphones className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">
                  24/7 Support
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Our dedicated support team is always available to assist with your
                  loan-related queries.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-600">
        <p>&copy; {currentYear} DCG Multipurpose Cooperative Society Ltd. All rights reserved.</p>
      </footer>
    </div>
  );
}

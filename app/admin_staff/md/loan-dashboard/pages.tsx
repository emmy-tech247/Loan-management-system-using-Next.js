"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Shield,
  Loader2,
  AlertTriangle,
  User,
  Calendar,
  Clock,
  TrendingUp,
  CreditCard,
  Scale,
  CheckCircle2,
} from "lucide-react";
import { CalculatedLoanItem, LoanTotals } from "@/types/adminLoanDashboard";

export default function AdminLoanDashboardPage() {
  const [loans, setLoans] = useState<CalculatedLoanItem[]>([]);
  const [totals, setTotals] = useState<LoanTotals>({
    loanCollected: 0,
    outstanding: 0,
    defaultCharges: 0,
    dueWithCharges: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchLoanDashboard = useCallback(async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin_staff/md/loans/dashboard");
      const json = await res.json();

      if (res.ok && json.success) {
        setLoans(json.loans || []);
        if (json.totals) {
          setTotals(json.totals);
        }
      } else {
        setStatusMessage(json.message || "Failed to load loan dashboard.");
      }
    } catch {
      setStatusMessage("Network error. Could not retrieve loan dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoanDashboard();
  }, [fetchLoanDashboard]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
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
                <Shield className="h-3 w-3 text-emerald-400" /> Executive Portal
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
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Scale className="h-6 w-6 text-emerald-600" /> Admin Loan Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor active member loans, default penalties, daily growth accruals, and overall portfolio balances.
          </p>
        </div>

        {statusMessage && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            {statusMessage}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-20 text-center text-xs text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-600" />
            Calculating loan default metrics and summary...
          </div>
        ) : (
          <>
            {/* Loan Cards Grid */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Active Member Loan Portfolios ({loans.length})
              </h2>

              {loans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {loans.map((loan) => {
                    const isOverdue = loan.daysOverdue > 0;

                    return (
                      <div
                        key={loan.loan_id}
                        className={`rounded-3xl border bg-white p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all ${
                          isOverdue ? "border-rose-200" : "border-slate-200"
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                            <div>
                              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                {loan.full_name}
                              </h3>
                              <span className="inline-block mt-1 text-[10px] font-semibold text-slate-500 capitalize bg-slate-100 px-2 py-0.5 rounded-md">
                                {loan.loan_category.replace("_", " ")}
                              </span>
                            </div>
                            <span className="font-mono text-[10px] font-bold text-slate-400">
                              #{loan.loan_id}
                            </span>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center text-slate-600">
                              <span className="text-slate-400 font-medium">Loan Amount:</span>
                              <span className="font-mono font-bold text-slate-800">
                                ₦{formatCurrency(loan.loan_amount)}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-slate-600">
                              <span className="text-slate-400 font-medium">Amount Paid:</span>
                              <span className="font-mono font-bold text-emerald-700">
                                ₦{formatCurrency(loan.amount_paid)}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-slate-600">
                              <span className="text-slate-400 font-medium">Outstanding:</span>
                              <span className="font-mono font-bold text-slate-900">
                                ₦{formatCurrency(loan.outstanding)}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-slate-600">
                              <span className="text-slate-400 font-medium flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-slate-400" /> Due Date:
                              </span>
                              <span className="font-mono font-medium text-slate-700">
                                {formatDate(loan.due_date)}
                              </span>
                            </div>

                            <div className="pt-2 border-t border-slate-100 space-y-1.5">
                              <div className="flex justify-between items-center text-slate-600">
                                <span className="text-slate-400 font-medium">Default Charge:</span>
                                <span className="font-mono font-bold text-amber-700">
                                  ₦{formatCurrency(loan.defaultCharge)}
                                </span>
                              </div>

                              <div className="flex justify-between items-center text-slate-600">
                                <span className="text-slate-400 font-medium flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-slate-400" /> Daily Growth ({loan.daysOverdue}d):
                                </span>
                                <span className="font-mono font-bold text-amber-700">
                                  ₦{formatCurrency(loan.dailyGrowth)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Total Due
                          </span>
                          <span
                            className={`font-mono font-extrabold text-sm ${
                              isOverdue ? "text-rose-600" : "text-slate-900"
                            }`}
                          >
                            ₦{formatCurrency(loan.totalDue)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-8 text-center bg-white rounded-3xl border border-slate-200">
                  No active loans found.
                </p>
              )}
            </div>

            {/* Overall Summary Section */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Overall Loan Portfolio Summary
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-emerald-600" /> Total Loan Collected
                  </span>
                  <p className="font-mono text-lg font-extrabold text-slate-900">
                    ₦{formatCurrency(totals.loanCollected)}
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" /> Total Outstanding
                  </span>
                  <p className="font-mono text-lg font-extrabold text-slate-900">
                    ₦{formatCurrency(totals.outstanding)}
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-amber-600" /> Total Default Charges
                  </span>
                  <p className="font-mono text-lg font-extrabold text-amber-700">
                    ₦{formatCurrency(totals.defaultCharges)}
                  </p>
                </div>

                <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-5 shadow-xs space-y-2">
                  <span className="text-rose-700 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-rose-600" /> Total Due (with Charges)
                  </span>
                  <p className="font-mono text-lg font-extrabold text-rose-700">
                    ₦{formatCurrency(totals.dueWithCharges)}
                  </p>
                </div>
              </div>
            </div>
          </>
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

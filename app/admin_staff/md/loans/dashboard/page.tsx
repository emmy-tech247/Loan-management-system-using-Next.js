"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Shield,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";
import { LoanRecord, LoanDashboardTotals } from "@/types/loanDashboard";

export default function AdminLoanDashboardPage() {
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [totals, setTotals] = useState<LoanDashboardTotals>({
    loanCollected: 0,
    outstanding: 0,
    defaultCharges: 0,
    dueWithCharges: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoanData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admn_staff/md/loans/dashboard");
      const json = await res.json();

      if (res.ok && json.success) {
        setLoans(json.loans);
        setTotals(json.totals);
      } else {
        setError(json.message || "Failed to load loan data.");
      }
    } catch {
      setError("Network error. Could not load loan records.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoanData();
  }, [fetchLoanData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
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
                <Shield className="h-3 w-3 text-emerald-400" /> Loan Portfolio Audit
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
        {/* Header & Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-emerald-600" /> Admin Loan Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Active loan portfolios, penalty tracking, category rules, and balance summaries.
            </p>
          </div>

          <button
            onClick={fetchLoanData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-xs self-start sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Portfolio
          </button>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800">
            {error}
          </div>
        )}

        {/* Overall Summary Cards */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Overall Portfolio Summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total Loan Collected</span>
              <p className="text-lg font-extrabold text-slate-900 font-mono">
                ₦{formatCurrency(totals.loanCollected)}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total Outstanding</span>
              <p className="text-lg font-extrabold text-amber-600 font-mono">
                ₦{formatCurrency(totals.outstanding)}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total Default Charges</span>
              <p className="text-lg font-extrabold text-rose-600 font-mono">
                ₦{formatCurrency(totals.defaultCharges)}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total Due (with Charges)</span>
              <p className="text-lg font-extrabold text-rose-700 font-mono">
                ₦{formatCurrency(totals.dueWithCharges)}
              </p>
            </div>
          </div>
        </div>

        {/* Individual Loan Cards Grid */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Active Member Loans ({loans.length})
          </h2>

          {isLoading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center text-xs text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-600" />
              Loading loan accounts...
            </div>
          ) : loans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {loans.map((loan) => (
                <div
                  key={loan.loan_id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-1.5 border-b border-slate-100 pb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                        #{loan.loan_id}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          loan.loan_category === "monthly_saver"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        }`}
                      >
                        {loan.loan_category.replace("_", " ")}
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 pt-1">
                      {loan.full_name}
                    </h3>
                  </div>

                  <div className="space-y-2 text-xs font-medium text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Loan Amount:</span>
                      <span className="font-bold text-slate-900 font-mono">
                        ₦{formatCurrency(loan.loan_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Amount Paid:</span>
                      <span className="font-bold text-emerald-600 font-mono">
                        ₦{formatCurrency(loan.amount_paid)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Outstanding:</span>
                      <span className="font-bold text-slate-900 font-mono">
                        ₦{formatCurrency(loan.outstanding)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Due Date:</span>
                      <span className="font-bold text-slate-700">
                        {new Date(loan.due_date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Default Charge:</span>
                      <span className="font-bold text-rose-600 font-mono">
                        ₦{formatCurrency(loan.default_charge)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        Daily Growth ({loan.days_overdue} days):
                      </span>
                      <span className="font-bold text-rose-600 font-mono">
                        ₦{formatCurrency(loan.daily_growth)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Total Due:</span>
                    <span className="text-sm font-extrabold text-rose-700 font-mono">
                      ₦{formatCurrency(loan.total_due)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
              <AlertCircle className="h-6 w-6 mx-auto mb-2 text-slate-300" />
              No loan accounts found in the system.
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

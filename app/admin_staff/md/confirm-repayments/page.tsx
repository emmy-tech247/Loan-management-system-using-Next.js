"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  LogOut,
  RefreshCw,
  Shield,
  Wallet,
  AlertCircle,
  Landmark,
} from "lucide-react";

type LoanRepayment = {
  loan_repayments_id: number;
  member_id: number | string;
  loan_id: number | string;
  amount_paid: number;
  receipt_file: string | null;
  status: string;
};

export default function ConfirmRepaymentsPage() {
  const router = useRouter();

  const [repayments, setRepayments] = useState<LoanRepayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchRepayments = async () => {
    try {
      setError("");

      const response = await fetch(
        "/api/admin_staff/md/confirm-repayments/acknowledged",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to load acknowledged loan repayments."
        );
      }

      setRepayments(data.repayments || []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load loan repayments."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRepayments();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setMessage("");
    setError("");

    await fetchRepayments();
  };

  const handleApprove = async (repaymentId: number) => {
    const confirmed = window.confirm(
      "Approve this loan repayment? The repayment amount will be deducted from the loan balance."
    );

    if (!confirmed) {
      return;
    }

    setApprovingId(repaymentId);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/admin_staff/md/confirm-repayments/approve",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            repaymentId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to approve the loan repayment."
        );
      }

      setMessage(
        data?.message ||
          "Loan repayment approved and balance updated."
      );

      // Remove the approved repayment from the pending list.
      setRepayments((current) =>
        current.filter(
          (repayment) =>
            repayment.loan_repayments_id !== repaymentId
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to approve repayment."
      );
    } finally {
      setApprovingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      router.push("/admin_staff/staff");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans -mt-28 text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link
                href="/admin_staff/md/dashboard"
                className="flex items-center gap-2"
              >
                <Image
                  src="/images/logo2.png"
                  alt="DCG Cooperative Logo"
                  width={140}
                  height={40}
                  className="h-9 w-auto object-contain"
                  priority
                />
              </Link>

              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold text-white">
                <Shield className="h-3 w-3 text-emerald-400" />
                Executive Portal
              </span>
            </div>

            {/* Navbar actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />

                <span className="hidden sm:inline">
                  {refreshing ? "Refreshing..." : "Refresh"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              >
                <LogOut className="h-4 w-4" />

                <span className="hidden sm:inline">
                  Logout
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 mt-2 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Hero */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">
            <div className="pointer-events-none absolute right-0 top-0 -mr-8 -mt-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-2xl space-y-3">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                  <Landmark className="h-3.5 w-3.5" />
                  Loan Approval
                </span>

                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Loan Repayments Awaiting Final Approval
                </h1>

                <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
                  Review acknowledged member repayments, inspect payment
                  receipts, and approve repayments to update the
                  corresponding loan balances.
                </p>
              </div>

              {/* Pending count */}
              <div className="shrink-0 rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Pending Approval
                </p>

                <p className="mt-1 text-2xl font-extrabold text-white">
                  {repayments.length}
                </p>
              </div>
            </div>
          </div>

          {/* Success message */}
          {message && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />

              <span>{message}</span>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />

              <span>{error}</span>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-900">
                Loading repayments...
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Retrieving acknowledged loan repayments.
              </p>
            </div>
          ) : repayments.length === 0 ? (
            /* Empty state */
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-900">
                No repayments awaiting approval
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                There are currently no acknowledged loan repayments
                waiting for final approval.
              </p>

              <button
                type="button"
                onClick={handleRefresh}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
              >
                <RefreshCw className="h-4 w-4" />
                Check Again
              </button>
            </div>
          ) : (
            /* Repayment cards */
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {repayments.map((repayment) => (
                <div
                  key={repayment.loan_repayments_id}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md"
                >
                  <div className="space-y-5">
                    {/* Card header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                        <Wallet className="h-5 w-5" />
                      </div>

                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold text-amber-700 ring-1 ring-inset ring-amber-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        Acknowledged
                      </span>
                    </div>

                    {/* Member */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Member ID
                      </p>

                      <p className="mt-1 text-sm font-extrabold text-slate-900">
                        {repayment.member_id}
                      </p>
                    </div>

                    {/* Loan */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Loan ID
                      </p>

                      <p className="mt-1 text-sm font-extrabold text-slate-900">
                        {repayment.loan_id}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Amount Paid
                      </p>

                      <p className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">
                        {formatCurrency(
                          Number(repayment.amount_paid)
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                    {/* Receipt */}
                    {repayment.receipt_file ? (
                      <a
                        href={repayment.receipt_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                      >
                        <FileText className="h-4 w-4 text-slate-500" />
                        View Receipt
                      </a>
                    ) : (
                      <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-400">
                        <FileText className="h-4 w-4" />
                        No Receipt
                      </div>
                    )}

                    {/* Approve */}
                    <button
                      type="button"
                      onClick={() =>
                        handleApprove(
                          repayment.loan_repayments_id
                        )
                      }
                      disabled={
                        approvingId ===
                        repayment.loan_repayments_id
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {approvingId ===
                      repayment.loan_repayments_id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Approve Repayment
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Back */}
          <div className="flex justify-center pt-2">
            <Link
              href="/admin_staff/md/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to MD Dashboard
            </Link>
          </div>
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
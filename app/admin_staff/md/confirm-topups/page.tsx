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
  Receipt,
  RefreshCw,
  Shield,
  Wallet,
  AlertCircle,
} from "lucide-react";

type SavingsTransaction = {
  id: number;
  member_id: string | number;
  amount_saved: number;
  receipt_file: string;
  status: string;
};

export default function ConfirmTopupsPage() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<SavingsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchTransactions = async () => {
    try {
      setError("");

      const response = await fetch(
        "/api/admin_staff/md/confirm-topups/acknowledged",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to load acknowledged transactions."
        );
      }

      setTransactions(data.transactions || []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load transactions."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setSuccess("");
    await fetchTransactions();
  };

  const handleApprove = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to approve this savings top-up?"
    );

    if (!confirmed) return;

    setApprovingId(id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "/api/admin_staff/md/confirm-topups/approve",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to approve transaction."
        );
      }

      setSuccess(
        data?.message || "Savings transaction approved successfully."
      );

      // Remove approved transaction from current list
      setTransactions((current) =>
        current.filter((transaction) => transaction.id !== id)
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to approve transaction."
      );
    } finally {
      setApprovingId(null);
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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      router.push("/staff");
    }
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
                href="/admin_staff/staff/login"
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

            {/* Right Actions */}
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
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 mt-2 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">
            <div className="pointer-events-none absolute right-0 top-0 -mr-8 -mt-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                  <Wallet className="h-3.5 w-3.5" />
                  Savings Approval
                </span>

                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Confirm Top-up Savings
                </h1>

                <p className="max-w-2xl text-xs leading-relaxed text-slate-300 sm:text-sm">
                  Review acknowledged savings transactions, inspect their
                  receipts, and approve valid member top-ups.
                </p>
              </div>

              {/* Pending Count */}
              <div className="shrink-0 rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Pending Approval
                </p>

                <p className="mt-1 text-2xl font-extrabold text-white">
                  {transactions.length}
                </p>
              </div>
            </div>
          </div>

          {/* Success */}
          {success && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {/* Error */}
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
                Loading transactions...
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Please wait while we retrieve acknowledged savings.
              </p>
            </div>
          ) : transactions.length === 0 ? (
            /* Empty State */
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-900">
                No acknowledged transactions
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                There are currently no savings top-ups waiting for Managing
                Director approval.
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
            /* Transaction Grid */
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md"
                >
                  <div className="space-y-5">
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                        <Wallet className="h-5 w-5" />
                      </div>

                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold text-amber-700 ring-1 ring-inset ring-amber-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        Pending
                      </span>
                    </div>

                    {/* Member */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Member ID
                      </p>

                      <p className="mt-1 text-sm font-extrabold text-slate-900">
                        {transaction.member_id}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Amount Saved
                      </p>

                      <p className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">
                        {formatCurrency(
                          Number(transaction.amount_saved)
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                    {/* Receipt */}
                    <a
                      href={transaction.receipt_file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                    >
                      <FileText className="h-4 w-4 text-slate-500" />
                      View Receipt
                    </a>

                    {/* Approve */}
                    <button
                      type="button"
                      onClick={() =>
                        handleApprove(transaction.id)
                      }
                      disabled={approvingId === transaction.id}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {approvingId === transaction.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Approve Savings
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
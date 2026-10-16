"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle2,
  Shield,
  Loader2,
  RefreshCw,
  PiggyBank,
  FileText,
  AlertCircle,
  ExternalLink,
  User,
} from "lucide-react";
import { SavingsTransaction } from "@/types/savings";

export default function ConfirmSavingsTopupsPage() {
  const [transactions, setTransactions] = useState<SavingsTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchAcknowledgedTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin_staff/md/savings/confirm");
      const json = await res.json();
      if (res.ok && json.success) {
        setTransactions(json.data);
      } else {
        setMessage({
          type: "error",
          text: json.message || "Failed to load transactions.",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Network error. Failed to reach server.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAcknowledgedTransactions();
  }, []);

  const handleApprove = async (approve_id: number) => {
    setApprovingId(approve_id);
    setMessage(null);

    try {
      const res = await fetch("/api/admin_staff/md/savings/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approve_id }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setMessage({ type: "success", text: json.message });
        setTransactions((prev) => prev.filter((item) => item.id !== approve_id));
      } else {
        setMessage({
          type: "error",
          text: json.message || "Approval failed. Please try again.",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Network error while submitting approval.",
      });
    } finally {
      setApprovingId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Header Navigation */}
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
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <PiggyBank className="h-6 w-6 text-emerald-600" /> Confirm Top-up Savings
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Verify member deposit receipts and approve acknowledged savings top-ups.
            </p>
          </div>

          <button
            onClick={fetchAcknowledgedTransactions}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-xs self-start sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Action Status Feedback */}
        {message && (
          <div
            className={`rounded-2xl border p-4 flex items-center gap-3 text-xs font-medium transition-all ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Content Section */}
        {isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400">
            <Loader2 className="h-7 w-7 animate-spin mx-auto mb-3 text-emerald-600" />
            <p className="text-xs font-medium">Fetching acknowledged savings top-ups...</p>
          </div>
        ) : transactions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-slate-800">
                      <User className="h-3.5 w-3.5 text-slate-400" /> Member #{tx.member_id}
                    </span>
                    <span className="text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200/60 px-2 py-0.5 rounded-md">
                      Acknowledged
                    </span>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Top-up Amount
                    </p>
                    <p className="text-2xl font-extrabold text-emerald-700 mt-0.5">
                      {formatCurrency(tx.amount_saved)}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
                  <a
                    href={tx.receipt_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-slate-400" />
                    View Receipt
                    <ExternalLink className="h-3 w-3 text-slate-400" />
                  </a>

                  <button
                    onClick={() => handleApprove(tx.id)}
                    disabled={approvingId === tx.id}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors shadow-xs"
                  >
                    {approvingId === tx.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400">
            <PiggyBank className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-medium">No acknowledged transactions found.</p>
          </div>
        )}
      </main>

      {/* Navigation Footer */}
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Shield,
  Loader2,
  RefreshCw,
  FileCheck2,
  Calendar,
  AlertCircle,
  CreditCard,
  User,
} from "lucide-react";
import { PendingTransaction, TransactionType } from "@/types/transaction";

export default function ConfirmTransactionsPage() {
  const [transactions, setTransactions] = useState<PendingTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchPendingTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin_staff/md/transactions/confirm");
      const json = await res.json();
      if (res.ok && json.success) {
        setTransactions(json.data);
      } else {
        setMessage({
          type: "error",
          text: json.message || "Failed to load pending transactions.",
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
    fetchPendingTransactions();
  }, []);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    setProcessingId(id);
    setMessage(null);

    try {
      const res = await fetch("/api/admin_staff/md/transactions/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setMessage({ type: "success", text: json.message });
        setTransactions((prev) => prev.filter((item) => item.id !== id));
      } else {
        setMessage({
          type: "error",
          text: json.message || "Action failed. Please try again.",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Network connection error while submitting decision.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getTypeBadge = (type: TransactionType) => {
    switch (type) {
      case "deposit":
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase">Deposit</span>;
      case "repayment":
        return <span className="bg-blue-50 text-blue-700 border border-blue-200/60 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase">Repayment</span>;
      case "fixed_deposit":
        return <span className="bg-purple-50 text-purple-700 border border-purple-200/60 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase">Fixed Deposit</span>;
      case "monthly_contribution":
        return <span className="bg-amber-50 text-amber-700 border border-amber-200/60 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase">Monthly Savings</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase">{type}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Navigation Header */}
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
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <FileCheck2 className="h-6 w-6 text-emerald-600" /> Confirm Accountant Transactions
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Review and confirm manual updates and pending transactions submitted by accounting staff.
            </p>
          </div>

          <button
            onClick={fetchPendingTransactions}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-xs self-start sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Feedback Alert Banner */}
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

        {/* Pending Table Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pending Transactions Queue
            </h2>
            <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
              {transactions.length} Pending
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">ID</th>
                  <th className="py-3 px-3">Member ID</th>
                  <th className="py-3 px-3">Full Name</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Loading pending transactions...
                    </td>
                  </tr>
                ) : transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-slate-900">#{tx.id}</td>
                      <td className="py-3.5 px-3 text-slate-700">
                        <span className="inline-flex items-center gap-1 font-mono text-xs">
                          <User className="h-3 w-3 text-slate-400" /> #{tx.member_id}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-900">{tx.full_name}</td>
                      <td className="py-3.5 px-3 font-bold text-emerald-700">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="py-3.5 px-3">{getTypeBadge(tx.type)}</td>
                      <td className="py-3.5 px-3 text-slate-500 text-[11px]">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" /> {tx.created_at}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAction(tx.id, "approve")}
                            disabled={processingId === tx.id}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors shadow-xs"
                          >
                            {processingId === tx.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                            Approve
                          </button>

                          <button
                            onClick={() => handleAction(tx.id, "reject")}
                            disabled={processingId === tx.id}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50 transition-colors"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No pending transactions for approval at the moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer Navigation Link */}
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

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
  FileText,
  AlertCircle,
  Banknote,
  ExternalLink,
  User,
  Hash,
} from "lucide-react";
import { PendingRepayment } from "@/types/repayment";

export default function ConfirmRepaymentsPage() {
  const [repayments, setRepayments] = useState<PendingRepayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchPendingRepayments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin_staff/md/repayments/confirm");
      const json = await res.json();
      if (res.ok && json.success) {
        setRepayments(json.data);
      } else {
        setMessage({
          type: "error",
          text: json.message || "Failed to load pending repayments.",
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
    fetchPendingRepayments();
  }, []);

  const handleApprove = async (approve_id: number) => {
    const confirmed = window.confirm("Approve this repayment?");
    if (!confirmed) return;

    setApprovingId(approve_id);
    setMessage(null);

    try {
      const res = await fetch("/api/admin_staff/md/repayments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approve_id }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setMessage({ type: "success", text: json.message });
        setRepayments((prev) =>
          prev.filter((item) => item.loan_repayments_id !== approve_id)
        );
      } else {
        setMessage({
          type: "error",
          text: json.message || "Approval failed. Please try again.",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Network error while submitting decision.",
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
      {/* Navbar Header */}
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
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Banknote className="h-6 w-6 text-emerald-600" /> Loan Repayments Awaiting Final Approval
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Review, verify receipts, and confirm loan repayments to update member loan balances.
            </p>
          </div>

          <button
            onClick={fetchPendingRepayments}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-xs self-start sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Feedback Alert */}
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

        {/* Repayments Table */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pending Repayment Queue
            </h2>
            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
              {repayments.length} Pending
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Member ID</th>
                  <th className="py-3 px-3">Loan ID</th>
                  <th className="py-3 px-3">Amount (₦)</th>
                  <th className="py-3 px-3">Receipt</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-600" />
                      Loading loan repayments...
                    </td>
                  </tr>
                ) : repayments.length > 0 ? (
                  repayments.map((row) => (
                    <tr key={row.loan_repayments_id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-slate-900 font-mono">
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-slate-400" /> #{row.member_id}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-700 font-mono">
                        <span className="inline-flex items-center gap-1">
                          <Hash className="h-3.5 w-3.5 text-slate-400" /> #{row.loan_id}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-emerald-700">
                        {formatCurrency(row.amount_paid)}
                      </td>
                      <td className="py-3.5 px-3">
                        {row.receipt_file ? (
                          <a
                            href={row.receipt_file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                          >
                            <FileText className="h-3 w-3 text-slate-400" /> View Receipt
                            <ExternalLink className="h-2.5 w-2.5 text-slate-400" />
                          </a>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">No Receipt</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => handleApprove(row.loan_repayments_id)}
                          disabled={approvingId === row.loan_repayments_id}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors shadow-xs"
                        >
                          {approvingId === row.loan_repayments_id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No loan repayments awaiting final approval.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 space-y-2">
          <Link
            href="/admin_staff/md/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <p className="text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} DCG Multipurpose Cooperative Society Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

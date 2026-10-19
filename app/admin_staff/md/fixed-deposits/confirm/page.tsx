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
  Landmark,
  Calendar,
  Percent,
  AlertCircle,
} from "lucide-react";
import { PendingFD } from "@/types/fixed-deposit";

export default function ConfirmFDPage() {
  const [deposits, setDeposits] = useState<PendingFD[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchPendingFDs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin_staff/md/fixed-deposits/confirm");
      const json = await res.json();
      if (res.ok && json.success) {
        setDeposits(json.data);
      } else {
        setMessage({
          type: "error",
          text: json.message || "Failed to load pending fixed deposits.",
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
    fetchPendingFDs();
  }, []);

  const handleAction = async (
    approval_id: number,
    fd_id: number,
    action: "confirm" | "reject"
  ) => {
    setProcessingId(approval_id);
    setMessage(null);

    try {
      const res = await fetch("/api/admin_staff/md/fixed-deposits/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approval_id, fd_id, action }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setMessage({ type: "success", text: json.message });
        // Remove item from pending list on success
        setDeposits((prev) => prev.filter((item) => item.approval_id !== approval_id));
      } else {
        setMessage({
          type: "error",
          text: json.message || "Action failed. Please try again.",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Network connection error while submitting response.",
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header Navigation Bar */}
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
        {/* Title & Refresh Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Landmark className="h-6 w-6 text-emerald-600" /> Confirm Fixed Deposit Applications
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Step 2 Verification — Review and confirm pending member fixed deposit applications.
            </p>
          </div>

          <button
            onClick={fetchPendingFDs}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-xs self-start sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Action Status Feedback Message */}
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

        {/* Data Table Container */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pending Approvals List
            </h2>
            <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
              {deposits.length} Pending
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">FD ID</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Tenure</th>
                  <th className="py-3 px-3">Interest Rate</th>
                  <th className="py-3 px-3">Maturity Date</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Loading pending applications...
                    </td>
                  </tr>
                ) : deposits.length > 0 ? (
                  deposits.map((fd) => (
                    <tr key={fd.approval_id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-slate-900">#{fd.fd_id}</td>
                      <td className="py-3.5 px-3 font-semibold text-emerald-700">
                        {formatCurrency(fd.amount_deposited)}
                      </td>
                      <td className="py-3.5 px-3 text-slate-700">{fd.tenure_months} months</td>
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                          <Percent className="h-3 w-3" /> {fd.interest_rate}%
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 text-[11px]">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" /> {fd.maturity_date}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAction(fd.approval_id, fd.fd_id, "confirm")}
                            disabled={processingId === fd.approval_id}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors shadow-xs"
                          >
                            {processingId === fd.approval_id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                            Confirm
                          </button>

                          <button
                            onClick={() => handleAction(fd.approval_id, fd.fd_id, "reject")}
                            disabled={processingId === fd.approval_id}
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
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No pending fixed deposits to confirm.
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

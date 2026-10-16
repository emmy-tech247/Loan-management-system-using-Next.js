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
  CreditCard,
  Calendar,
  AlertCircle,
  User,
  Hash,
  BadgeCheck,
} from "lucide-react";
import { PendingDeposit } from "@/types/deposit";

export default function ConfirmDepositsPage() {
  const [payments, setPayments] = useState<PendingDeposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchPendingDeposits = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin_staff/md/deposits/confirm");
      const json = await res.json();
      if (res.ok && json.success) {
        setPayments(json.data);
      } else {
        setMessage({
          type: "error",
          text: json.message || "Failed to load pending deposits.",
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
    fetchPendingDeposits();
  }, []);

  const handleConfirm = async (saved_id: number) => {
    setConfirmingId(saved_id);
    setMessage(null);

    try {
      const res = await fetch("/api/admin_staff/md/deposits/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saved_id, action: "confirm" }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setMessage({ type: "success", text: json.message });
        setPayments((prev) => prev.filter((item) => item.saved_id !== saved_id));
      } else {
        setMessage({
          type: "error",
          text: json.message || "Confirmation failed. Please try again.",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Network error while submitting confirmation.",
      });
    } finally {
      setConfirmingId(null);
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
              <ArrowLeft className="h-4 w-4" /> Back to MD Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <BadgeCheck className="h-6 w-6 text-emerald-600" /> Payments Awaiting Final Confirmation
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Confirm member deposit transactions acknowledged by Admin 1.
            </p>
          </div>

          <button
            onClick={fetchPendingDeposits}
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

        {/* Payment Cards Stack */}
        {isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400 shadow-xs">
            <Loader2 className="h-7 w-7 animate-spin mx-auto mb-3 text-emerald-600" />
            <p className="text-xs font-medium">Loading payments for confirmation...</p>
          </div>
        ) : payments.length > 0 ? (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.saved_id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-900 text-sm">
                      <User className="h-4 w-4 text-slate-400" /> {payment.full_name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      (ID: #{payment.member_id})
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                      Amount:{" "}
                      <strong className="text-emerald-700 font-bold">
                        {formatCurrency(payment.amount_saved)}
                      </strong>
                    </span>

                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-500">
                      <Hash className="h-3 w-3 text-slate-400" /> Ref: {payment.reference}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" /> Acknowledged At:{" "}
                    {payment.acknowledged_at}
                  </p>
                </div>

                <div className="pt-3 sm:pt-0 sm:border-l sm:border-slate-100 sm:pl-6 flex items-center justify-end">
                  <button
                    onClick={() => handleConfirm(payment.saved_id)}
                    disabled={confirmingId === payment.saved_id}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors shadow-xs"
                  >
                    {confirmingId === payment.saved_id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Confirm
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400 shadow-xs">
            <BadgeCheck className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-medium text-slate-500">
              No deposits waiting for confirmation.
            </p>
          </div>
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

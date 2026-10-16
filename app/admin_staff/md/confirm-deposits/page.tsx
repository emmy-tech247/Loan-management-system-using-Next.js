"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  WalletCards,
  User,
  Hash,
  CalendarCheck,
  Send,
  Clock,
} from "lucide-react";

type Payment = {
  saved_id: number;
  member_id: number;
  amount_saved: number;
  reference: string;
  acknowledged_at: string;
  full_name: string;
};

export default function ConfirmDepositsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const response = await fetch("/api/admin_staff/md/confirm-deposits", {
        cache: "no-store",
      });

      const data = await response.json();

      if (data.success) {
        setPayments(data.payments);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Unable to load deposits.",
        });
      }
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",
        text: "Something went wrong while loading deposits.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleConfirm = async (savedId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to confirm this deposit?"
    );

    if (!confirmed) return;

    setConfirmingId(savedId);
    setMessage(null);

    try {
      const response = await fetch("/api/admin_staff/md/confirm-deposits/verify-savings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          saved_id: savedId,
          action: "confirm",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "Deposit confirmed successfully.",
        });

        // Remove confirmed payment from the list
        setPayments((currentPayments) =>
          currentPayments.filter(
            (payment) => payment.saved_id !== savedId
          )
        );
      } else {
        setMessage({
          type: "error",
          text: data.message || "Unable to confirm deposit.",
        });
      }
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setConfirmingId(null);
    }
  };

  const formatMoney = (amount: number) => {
    return Number(amount || 0).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date: string) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans -mt-28 text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo / Portal */}
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

            {/* Back Button */}
            <Link
              href="/admin_staff/md/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to MD Dashboard</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 mt-2 space-y-6">
        {/* Page Header */}
        <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              <WalletCards className="h-3.5 w-3.5" />
              Deposit Verification
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Payments Awaiting Final Confirmation
            </h1>

            <p className="max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
              Review member deposits that are awaiting final confirmation
              before they are added to the member&apos;s account.
            </p>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`rounded-2xl border p-4 flex items-center gap-3 text-xs font-medium transition-all ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
            )}

            <span>{message.text}</span>
          </div>
        )}

        {/* Summary Card */}
        {!loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Clock className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Pending Deposits
                  </p>

                  <p className="text-lg font-extrabold text-slate-900">
                    {payments.length}
                  </p>
                </div>
              </div>

              <div className="hidden sm:block text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Status
                </p>

                <p className="text-xs font-bold text-emerald-600">
                  Awaiting Review
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-emerald-600">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900">
              Loading deposits...
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Please wait while pending payments are retrieved.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && payments.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900">
              No Pending Deposits
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
              There are currently no deposits waiting for final confirmation.
            </p>
          </div>
        )}

        {/* Payment List */}
        {!loading && payments.length > 0 && (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.saved_id}
                className="group rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-slate-300 transition-all"
              >
                {/* Card Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <User className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        {payment.full_name}
                      </h2>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Member ID:{" "}
                        <span className="font-semibold text-slate-700">
                          {payment.member_id}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Pending Badge */}
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-[10px] font-bold text-amber-700">
                    <Clock className="h-3 w-3" />
                    Pending Confirmation
                  </span>
                </div>

                {/* Details */}
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* Amount */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <WalletCards className="h-4.5 w-4.5" />
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Amount
                        </p>

                        <p className="mt-0.5 text-sm font-extrabold text-emerald-700">
                          ₦{formatMoney(payment.amount_saved)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reference */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                        <Hash className="h-4.5 w-4.5" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Reference
                        </p>

                        <p className="mt-0.5 truncate text-xs font-bold text-slate-800">
                          {payment.reference || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Acknowledged At */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:col-span-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                        <CalendarCheck className="h-4.5 w-4.5" />
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Acknowledged At
                        </p>

                        <p className="mt-0.5 text-xs font-semibold text-slate-800">
                          {formatDate(payment.acknowledged_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[10px] leading-relaxed text-slate-400">
                    Verify that this payment has been received before
                    confirming the deposit.
                  </p>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleConfirm(payment.saved_id);
                    }}
                  >
                    <button
                      type="submit"
                      disabled={confirmingId === payment.saved_id}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-emerald-500 hover:shadow-md active:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      {confirmingId === payment.saved_id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Confirming...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Confirm Deposit
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Back Button */}
        <div className="flex justify-center pt-2">
          <Link
            href="/admin_staff/md/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to MD Dashboard
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
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
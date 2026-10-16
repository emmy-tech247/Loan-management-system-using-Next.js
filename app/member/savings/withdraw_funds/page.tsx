"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SavingsNavbarbar from "@/components/navigation/SavingsNavbar";
import {
  ArrowLeft,
  ArrowUpCircle,
  Wallet,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function WithdrawFundsPage() {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessage("");
    setSuccess(false);

    const withdrawalAmount = Number(amount);

    if (!withdrawalAmount || withdrawalAmount <= 0) {
      setMessage("Please enter a valid withdrawal amount.");
      return;
    }

    if (!reason.trim()) {
      setMessage("Please provide a reason for the withdrawal.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/savings/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: withdrawalAmount,
          reason: reason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Error submitting withdrawal request.");
        setSuccess(false);
        return;
      }

      setMessage(
        data.message || "Withdrawal request submitted successfully."
      );
      setSuccess(true);

      setAmount("");
      setReason("");
    } catch (error) {
      console.error("Withdrawal error:", error);
      setMessage("Unable to submit withdrawal request. Please try again.");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">

      {/* Navbar */}
        <SavingsNavbarbar />

      {/* Main */}
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8 -mt-24 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6 rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">

          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10">

            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
              <ArrowUpCircle className="h-6 w-6" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Withdraw Funds
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Submit a request to withdraw funds from your available savings
              balance.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">

          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Wallet className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Withdrawal Request
              </h2>
              <p className="text-xs text-slate-500">
                Enter the amount and reason for your withdrawal.
              </p>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm ${
                success
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {success ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              )}

              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Amount */}
            <div>
              <label
                htmlFor="amount"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Amount to Withdraw
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                  ₦
                </span>

                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="1"
                  step="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label
                htmlFor="reason"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
              >
                <FileText className="h-4 w-4 text-slate-500" />
                Reason for Withdrawal
              </label>

              <textarea
                id="reason"
                name="reason"
                rows={5}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter the reason for your withdrawal..."
                required
                disabled={loading}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <ArrowUpCircle className="h-4 w-4" />
                  Submit Withdrawal
                </>
              )}
            </button>

          </form>

          {/* Information */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs leading-relaxed text-slate-500">
              Your withdrawal request will be reviewed by the cooperative
              administrators. The requested amount must not exceed your
              available savings balance.
            </p>
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
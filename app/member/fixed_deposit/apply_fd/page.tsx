"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import FixedDepositNavbar from "@/components/navigation/FixedDepositNavbar";

import {
  ArrowLeft,
  Landmark,
  FileText,
  Percent,
  CalendarDays,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function ApplyFixedDepositPage() {
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [tenure, setTenure] = useState("");
  const [rate, setRate] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/member/fixed-deposit/apply_fd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount_deposited: amount,
          tenure,
          rate,
        }),
      });

      let data: { message?: string } = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setError(
          data.message || "Error submitting fixed deposit application."
        );
        return;
      }

      setSuccess(
        "Fixed Deposit Application Submitted. Awaiting Admin Approval."
      );

      setAmount("");
      setTenure("");
      setRate("");

      setTimeout(() => {
        router.push("/member");
      }, 1800);
    } catch (err) {
      console.error("Fixed deposit submission error:", err);

      setError("Unable to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Navbar */}
       <FixedDepositNavbar />

      {/* Main */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 -mt-24 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300">
              <Landmark className="h-4 w-4" />
              Fixed Deposit
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Apply for Fixed Deposit
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
              Submit your fixed deposit application by entering the deposit
              amount, tenure and applicable interest rate.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {/* Error */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />

              <div>
                <p className="font-bold">Application Error</p>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

              <div>
                <p className="font-bold">Application Submitted</p>
                <p className="mt-1">{success}</p>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="space-y-6"
          >
            {/* Amount */}
            <div>
              <label
                htmlFor="amount"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Amount (₦)
              </label>

              <div className="relative">
                <Wallet className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  type="number"
                  name="amount_deposited"
                  id="amount"
                  required
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter deposit amount"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            </div>

            {/* Tenure */}
            <div>
              <label
                htmlFor="tenure"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Tenure (Months)
              </label>

              <div className="relative">
                <CalendarDays className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  type="number"
                  name="tenure"
                  id="tenure"
                  required
                  min="1"
                  max="60"
                  value={tenure}
                  onChange={(e) => setTenure(e.target.value)}
                  placeholder="Enter tenure in months"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Maximum tenure: 60 months.
              </p>
            </div>

            {/* Interest Rate */}
            <div>
              <label
                htmlFor="rate"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Interest Rate (%)
              </label>

              <div className="relative">
                <Percent className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  type="number"
                  name="rate"
                  id="rate"
                  required
                  min="0.01"
                  max="100"
                  step="0.01"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="Enter interest rate"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  Submit Application
                </>
              )}
            </button>
          </form>
        </div>

        {/* Information */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-100 p-5">
          <h3 className="text-sm font-bold text-slate-900">
            Application Information
          </h3>

          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            After submission, your fixed deposit application will remain
            pending until it is reviewed and approved by the appropriate
            administrator.
          </p>
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
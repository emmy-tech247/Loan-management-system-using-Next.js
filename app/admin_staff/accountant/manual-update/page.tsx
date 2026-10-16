"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  Loader2,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  User,
  Hash,
  DollarSign,
  FileSpreadsheet,
  ChevronRight,
} from "lucide-react";

export default function AccountantManualUpdatePage() {
  const [memberId, setMemberId] = useState("");
  const [fullName, setFullName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);

  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const handleMemberIdChange = async (val: string) => {
    setMemberId(val);

    const trimmedId = val.trim();

    if (trimmedId !== "") {
      setIsLookingUp(true);

      try {
        const res = await fetch(
          `/api/admin_staff/accountant/member-lookup?member_id=${encodeURIComponent(
            trimmedId
          )}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const data = await res.json();

        if (res.ok && data.success && data.full_name) {
          setFullName(data.full_name);
        } else {
          setFullName("");
        }
      } catch {
        setFullName("");
      } finally {
        setIsLookingUp(false);
      }
    } else {
      setFullName("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin_staff/accountant/manual-update", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          memberId: Number(memberId),
          amount: Number(amount),
          type,
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setMessage({
          text: json.message,
          type: "success",
        });

        setMemberId("");
        setFullName("");
        setAmount("");
        setType("");
      } else {
        setMessage({
          text: json.message || "Error saving record.",
          type: "error",
        });
      }
    } catch {
      setMessage({
        text: "Network error. Failed to submit transaction.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans -mt-28 text-slate-900">
      {/* =========================================================
          NAVBAR
      ========================================================= */}
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
                Accountant Portal
              </span>
            </div>

            {/* Back Button */}
            <Link
              href="/admin_staff/accountant/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">
                Back to Accountant Dashboard
              </span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 mt-2 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* =====================================================
              LEFT INFORMATION PANEL
          ===================================================== */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
              {/* Decorative glow */}
              <div className="absolute top-0 right-0 -mt-16 -mr-16 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                {/* Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-400/20 text-emerald-300">
                  <Briefcase className="h-6 w-6" />
                </div>

                <div className="space-y-3">
                  <span className="inline-flex items-center rounded-lg bg-emerald-500/20 px-3 py-1 text-[10px] font-bold text-emerald-300">
                    ACCOUNTANT FINANCIAL OPERATIONS
                  </span>

                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Manual Transaction Update
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Record a manual member transaction and submit it for
                    administrative authorization and verification.
                  </p>
                </div>

                {/* Information Cards */}
                <div className="space-y-3 pt-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                        <User className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-xs font-bold text-white">
                          Member Verification
                        </p>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                          Enter the member ID to automatically retrieve the
                          registered member&apos;s name.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                        <DollarSign className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-xs font-bold text-white">
                          Financial Record
                        </p>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                          Specify the transaction amount and the appropriate
                          transaction category.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                        <Shield className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-xs font-bold text-white">
                          Administrative Approval
                        </p>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                          Submitted transactions remain subject to Admin2
                          authorization before final processing.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 border-t border-white/10 pt-5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
                  <span className="text-[11px] font-semibold text-slate-400">
                    Secure Accountant Transaction Environment
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              RIGHT FORM PANEL
          ===================================================== */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
              {/* Form Header */}
              <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5 sm:px-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                      Transaction Entry
                    </p>

                    <h2 className="mt-1 text-lg font-extrabold text-slate-900">
                      Create Manual Record
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Complete all required fields before submitting.
                    </p>
                  </div>

                  <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {/* =================================================
                    MESSAGE
                ================================================= */}
                {message && (
                  <div
                    className={`mb-6 rounded-2xl border p-4 text-xs font-semibold flex items-start gap-3 ${
                      message.type === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-rose-200 bg-rose-50 text-rose-800"
                    }`}
                  >
                    {message.type === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    )}

                    <span>{message.text}</span>
                  </div>
                )}

                {/* =================================================
                    FORM
                ================================================= */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Member ID */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="memberId"
                      className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
                    >
                      <Hash className="h-3.5 w-3.5 text-emerald-600" />
                      Member ID
                      <span className="text-rose-500">*</span>
                    </label>

                    <input
                      id="memberId"
                      type="number"
                      required
                      value={memberId}
                      onChange={(e) =>
                        handleMemberIdChange(e.target.value)
                      }
                      placeholder="Enter registered member ID"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                    />

                    <p className="text-[10px] text-slate-400">
                      The member&apos;s registered name will be retrieved
                      automatically.
                    </p>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="fullName"
                      className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
                    >
                      <User className="h-3.5 w-3.5 text-emerald-600" />
                      Member Full Name
                    </label>

                    <div className="relative">
                      <input
                        id="fullName"
                        type="text"
                        readOnly
                        value={fullName}
                        placeholder="Auto-filled after member ID lookup"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 pr-11 text-xs font-semibold text-slate-700 placeholder:text-slate-400 outline-none"
                      />

                      {isLookingUp && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                        </span>
                      )}

                      {!isLookingUp && fullName && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="amount"
                      className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
                    >
                      <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                      Transaction Amount
                      <span className="text-rose-500">*</span>
                    </label>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        ₦
                      </span>

                      <input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-9 pr-4 py-3 text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                      />
                    </div>
                  </div>

                  {/* Transaction Type */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="type"
                      className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                      Transaction Type
                      <span className="text-rose-500">*</span>
                    </label>

                    <select
                      id="type"
                      required
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-xs font-semibold text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                    >
                      <option value="">Select transaction type</option>
                      <option value="deposit">Savings Deposit</option>
                      <option value="repayment">Loan Repayment</option>
                      <option value="fixed_deposit">Fixed Deposit</option>
                      <option value="monthly_contribution">
                        Monthly Contribution
                      </option>
                    </select>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-100 pt-5">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 text-xs font-extrabold text-white shadow-xs hover:bg-slate-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing Transaction...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 text-emerald-400" />
                          Submit for MD Approval
                          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-emerald-400 transition-all" />
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-center text-[10px] leading-relaxed text-slate-400">
                    By submitting this record, the transaction will be sent for
                    administrative review and authorization.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 space-y-2">
          <Link
            href="/admin_staff/accountant/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Accountant Dashboard
          </Link>

          <p className="text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} DCG Multipurpose Cooperative
            Society Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
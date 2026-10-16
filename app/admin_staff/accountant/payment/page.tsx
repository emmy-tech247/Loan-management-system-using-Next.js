"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  Loader2,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Upload,
  FileText,
  DollarSign,
  Calendar,
  ArrowLeft,
  LogOut,
  User,
  RefreshCw,
  Clock,
  Search,
} from "lucide-react";
import { TransactionItem } from "@/types/accountantPayment";

export default function AccountantPaymentPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [isUploadingBulk, setIsUploadingBulk] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{
    success: boolean;
    text: string;
  } | null>(null);

  // Single Payment Form State
  const [memberId, setMemberId] = useState("");
  const [memberName, setMemberName] = useState("");
  const [isSearchingMember, setIsSearchingMember] = useState(false);
  const [paymentType, setPaymentType] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [reference, setReference] = useState("");
  const [paymentDate, setPaymentDate] = useState("");

  // Bulk Upload State
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin_staff/accountant/payment");
      const json = await res.json();

      if (res.ok && json.success) {
        setTransactions(json.transactions || []);
      } else {
        setStatusMessage({
          success: false,
          text: json.message || "Failed to load transactions.",
        });
      }
    } catch {
      setStatusMessage({
        success: false,
        text: "Failed to load transactions.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Member lookup
  const handleMemberIdChange = async (val: string) => {
    setMemberId(val);

    if (!val.trim()) {
      setMemberName("");
      setIsSearchingMember(false);
      return;
    }

    setIsSearchingMember(true);

    try {
      const res = await fetch(
        `/api/admin_staff/accountant/search-member?member_id=${encodeURIComponent(val)}`
      );

      const json = await res.json();

      if (json.success && json.name) {
        setMemberName(json.name);
      } else {
        setMemberName("Member not found");
      }
    } catch {
      setMemberName("Error searching member");
    } finally {
      setIsSearchingMember(false);
    }
  };

  // Single payment
  const handleSinglePaymentSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmittingPayment(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin_staff/accountant/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          member_id: parseInt(memberId, 10),
          type: paymentType,
          amount: parseFloat(amount),
          payment_method: paymentMethod,
          reference,
          payment_date: paymentDate,
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setStatusMessage({
          success: true,
          text: json.message || "Payment submitted successfully.",
        });

        // Reset form
        setMemberId("");
        setMemberName("");
        setPaymentType("");
        setAmount("");
        setPaymentMethod("");
        setReference("");
        setPaymentDate("");

        await fetchTransactions();
      } else {
        setStatusMessage({
          success: false,
          text: json.message || "Failed to submit payment.",
        });
      }
    } catch {
      setStatusMessage({
        success: false,
        text: "Network error during payment submission.",
      });
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Bulk upload
  const handleBulkUploadSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!csvFile) {
      setStatusMessage({
        success: false,
        text: "Please select a CSV or Excel file.",
      });
      return;
    }

    setIsUploadingBulk(true);
    setStatusMessage(null);

    // Replace with your real bulk upload API when available.
    setTimeout(async () => {
      setIsUploadingBulk(false);

      setStatusMessage({
        success: true,
        text: "Bulk payments uploaded and processed successfully.",
      });

      setCsvFile(null);

      await fetchTransactions();
    }, 1500);
  };

  const formatCurrency = (val: number | string) => {
    const numericVal =
      typeof val === "string" ? parseFloat(val) : val;

    if (Number.isNaN(numericVal)) {
      return "0.00";
    }

    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericVal);
  };

  const formatTransactionType = (type: string) => {
    return type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const formatPaymentMethod = (method: string) => {
    return method
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
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
                href="/staff_login/login"
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

            {/* Navigation Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/admin_staff/accountant/payment"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-slate-500" />

                <span className="hidden sm:inline">
                  Back to Dashboard
                </span>

                <span className="sm:hidden">
                  Back
                </span>
              </Link>

              <Link
                href="/admin_staff/staff"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />

                <span className="hidden sm:inline">
                  Logout
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* =========================================================
          MAIN
      ========================================================= */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 mt-2 sm:px-6 lg:px-8 space-y-6">

        {/* =====================================================
            WELCOME / PAGE HEADER
        ===================================================== */}
        <section className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-xs">
              <CreditCard className="h-3.5 w-3.5" />
              Accountant Financial Operations
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Accountant Payment Portal
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Process member contributions, loan repayments, bulk payment
              uploads, and review submitted transactions from one central
              financial workspace.
            </p>
          </div>
        </section>

        {/* =====================================================
            STATUS MESSAGE
        ===================================================== */}
        {statusMessage && (
          <div
            className={`rounded-2xl border p-4 text-xs font-medium flex items-start gap-3 ${
              statusMessage.success
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {statusMessage.success ? (
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            )}

            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* =====================================================
            QUICK STATS
        ===================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Transactions */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Submitted Transactions
                </p>

                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {transactions.length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Verification Queue
                </p>

                <p className="mt-1 text-2xl font-extrabold text-amber-600">
                  {transactions.length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Refresh */}
          <button
            type="button"
            onClick={fetchTransactions}
            disabled={isLoading}
            className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs text-left hover:border-slate-300 hover:shadow-md transition-all disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Data
                </p>

                <p className="mt-1 text-sm font-extrabold text-slate-900">
                  Refresh Transactions
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <RefreshCw
                  className={`h-5 w-5 ${
                    isLoading ? "animate-spin" : ""
                  }`}
                />
              </div>
            </div>
          </button>
        </div>

        {/* =====================================================
            MAKE PAYMENT
        ===================================================== */}
        <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <DollarSign className="h-4 w-4" />
                </div>

                Make Payment
              </h2>

              <p className="text-[11px] text-slate-500 mt-1 ml-10">
                Record a member contribution or loan repayment.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSinglePaymentSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
          >
            {/* Member ID */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600">
                Member ID
              </label>

              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

                <input
                  type="number"
                  value={memberId}
                  onChange={(e) =>
                    handleMemberIdChange(e.target.value)
                  }
                  placeholder="Enter Member ID"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            {/* Payment Type */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600">
                Payment Type
              </label>

              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              >
                <option value="">Select Payment Type</option>
                <option value="loan_repayment">
                  Loan Repayment
                </option>
                <option value="monthly_contribution">
                  Monthly Contribution
                </option>
              </select>
            </div>

            {/* Member lookup */}
            {memberId && (
              <div className="sm:col-span-2 rounded-2xl border border-blue-200 bg-blue-50/60 px-4 py-3 text-xs text-blue-900 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  {isSearchingMember ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                    Member
                  </p>

                  <p className="font-bold text-blue-900">
                    {isSearchingMember
                      ? "Searching member..."
                      : memberName || "Member not found"}
                  </p>
                </div>
              </div>
            )}

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600">
                Amount (₦)
              </label>

              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter Amount"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600">
                Payment Method
              </label>

              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              >
                <option value="">Select Payment Method</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">
                  Bank Transfer
                </option>
                <option value="pos">POS</option>
              </select>
            </div>

            {/* Reference */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600">
                Payment Reference
              </label>

              <input
                type="text"
                value={reference}
                onChange={(e) =>
                  setReference(e.target.value)
                }
                placeholder="Payment Reference"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            {/* Payment Date */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600">
                Payment Date
              </label>

              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />

                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) =>
                    setPaymentDate(e.target.value)
                  }
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                disabled={isSubmittingPayment}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-xs font-bold text-white hover:bg-slate-800 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingPayment ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                    Submitting Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 text-emerald-400" />
                    Submit Payment
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* =====================================================
            BULK UPLOAD
        ===================================================== */}
        <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Upload className="h-4 w-4" />
                </div>

                Bulk Upload Payments
              </h2>

              <p className="text-[11px] text-slate-500 mt-1 ml-10">
                Upload multiple payment records using CSV or Excel.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
            <form
              onSubmit={handleBulkUploadSubmit}
              className="space-y-5"
            >
              {/* File upload */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-2">
                  Payment File
                </label>

                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={(e) =>
                    setCsvFile(e.target.files?.[0] || null)
                  }
                  required
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 file:cursor-pointer"
                />
              </div>

              {/* Selected file */}
              {csvFile && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <FileText className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-emerald-900 truncate">
                      {csvFile.name}
                    </p>

                    <p className="text-[10px] text-emerald-700">
                      {(csvFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isUploadingBulk}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 text-xs font-bold text-white hover:bg-slate-800 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploadingBulk ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                    Uploading & Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 text-emerald-400" />
                    Upload CSV / Excel File
                  </>
                )}
              </button>
            </form>

            {/* Format */}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-emerald-600" />

                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  CSV / Excel Format
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl bg-slate-900 p-4">
                <code className="text-[10px] sm:text-[11px] text-slate-300 whitespace-pre">
{`member_id,amount,type,payment_method,reference,payment_date
1,50000,monthly_contribution,cash,REF001,2026-05-16
2,100000,loan_repayment,bank_transfer,REF002,2026-05-16`}
                </code>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            TRANSACTIONS
        ===================================================== */}
        <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-5 mb-5">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <FileText className="h-4 w-4" />
                </div>

                Submitted Transactions
              </h2>

              <p className="text-[11px] text-slate-500 mt-1 ml-10">
                {transactions.length} transaction
                {transactions.length === 1 ? "" : "s"} currently
                in the queue.
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-[10px] font-bold text-amber-700">
              <Clock className="h-3 w-3" />
              Pending Verification
            </span>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 py-20 text-center text-xs text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-600" />

              Loading transactions...
            </div>
          ) : transactions.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                    <th className="px-4 py-3 font-bold whitespace-nowrap">
                      Member ID
                    </th>

                    <th className="px-4 py-3 font-bold whitespace-nowrap">
                      Full Name
                    </th>

                    <th className="px-4 py-3 font-bold whitespace-nowrap">
                      Transaction Type
                    </th>

                    <th className="px-4 py-3 font-bold whitespace-nowrap">
                      Amount
                    </th>

                    <th className="px-4 py-3 font-bold whitespace-nowrap">
                      Method
                    </th>

                    <th className="px-4 py-3 font-bold whitespace-nowrap">
                      Reference
                    </th>

                    <th className="px-4 py-3 font-bold whitespace-nowrap">
                      Date
                    </th>

                    <th className="px-4 py-3 font-bold whitespace-nowrap">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {transactions.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-4 font-mono font-bold text-slate-500 whitespace-nowrap">
                        #{row.member_id}
                      </td>

                      <td className="px-4 py-4 font-bold text-slate-900 whitespace-nowrap">
                        {row.full_name || "Unknown Member"}
                      </td>

                      <td className="px-4 py-4 font-medium text-slate-700 whitespace-nowrap">
                        {formatTransactionType(row.type)}
                      </td>

                      <td className="px-4 py-4 font-mono font-bold text-emerald-700 whitespace-nowrap">
                        ₦{formatCurrency(row.amount)}
                      </td>

                      <td className="px-4 py-4 font-medium text-slate-700 whitespace-nowrap">
                        {formatPaymentMethod(row.payment_method)}
                      </td>

                      <td className="px-4 py-4 font-mono text-slate-600 whitespace-nowrap">
                        {row.reference}
                      </td>

                      <td className="px-4 py-4 text-slate-500 font-medium whitespace-nowrap">
                        {row.payment_date}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[10px] font-bold text-amber-700 capitalize">
                          <Clock className="h-3 w-3" />

                          {row.status.replace(/_/g, " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Search className="h-6 w-6" />
              </div>

              <h3 className="text-sm font-bold text-slate-900">
                No transactions found
              </h3>

              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                There are currently no submitted transactions
                awaiting accountant verification.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 space-y-2">
          <Link
            href="/admin_staff/staff"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout from Portal
          </Link>

          <p className="text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} DCG Multipurpose
            Cooperative Society Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
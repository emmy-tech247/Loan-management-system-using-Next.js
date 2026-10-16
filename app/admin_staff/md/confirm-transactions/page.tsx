"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock3,
  Receipt,
  Shield,
  LogOut,
  Bell,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Search,
  Wallet,
  Landmark,
  PiggyBank,
  CalendarDays,
  User,
  Hash,
  CircleDollarSign,
} from "lucide-react";

type TransactionType =
  | "deposit"
  | "repayment"
  | "fixed_deposit"
  | "monthly_contribution";

type PendingTransaction = {
  id: number;
  member_id: number;
  full_name: string;
  amount: number;
  type: TransactionType | string;
  status: "pending" | "approved" | "rejected" | string;
  created_at: string;
};

type MessageState = {
  type: "success" | "error";
  text: string;
} | null;

export default function ConfirmTransactionsPage() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<PendingTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    PendingTransaction[]
  >([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [message, setMessage] = useState<MessageState>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /**
   * Fetch pending transactions
   */
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/admin_staff/md/confirm-transactions/pending-transactions", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/staff");
          return;
        }

        throw new Error(data.error || "Failed to load transactions.");
      }

      setTransactions(data.transactions || []);
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to load pending transactions.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  /**
   * Search
   */
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      setFilteredTransactions(transactions);
      return;
    }

    const filtered = transactions.filter((transaction) => {
      return (
        String(transaction.id).includes(query) ||
        String(transaction.member_id).includes(query) ||
        transaction.full_name.toLowerCase().includes(query) ||
        transaction.type.toLowerCase().includes(query)
      );
    });

    setFilteredTransactions(filtered);
  }, [searchQuery, transactions]);

  /**
   * Approve / Reject transaction
   */
  const handleAction = async (
    id: number,
    action: "approve" | "reject"
  ) => {
    const transaction = transactions.find((item) => item.id === id);

    if (!transaction) return;

    const actionText = action === "approve" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} transaction #${id} for ${transaction.full_name}?`
    );

    if (!confirmed) return;

    try {
      setProcessingId(id);
      setMessage(null);

      const response = await fetch("/api/admin_staff/md/ confirm-transactions/pending-transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          action,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/staff");
          return;
        }

        throw new Error(data.error || "Transaction operation failed.");
      }

      setMessage({
        type: "success",
        text: data.message,
      });

      // Remove processed transaction from the pending list
      setTransactions((current) =>
        current.filter((transaction) => transaction.id !== id)
      );
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Transaction operation failed.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * Logout
   */
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.push("/admin_staff/staff");
    } catch {
      router.push("/admin_staff/staff");
    }
  };

  /**
   * Format transaction type
   */
  const formatTransactionType = (type: string) => {
    return type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  /**
   * Transaction icon
   */
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return Wallet;

      case "repayment":
        return Receipt;

      case "fixed_deposit":
        return Landmark;

      case "monthly_contribution":
        return PiggyBank;

      default:
        return CircleDollarSign;
    }
  };

  /**
   * Transaction badge
   */
  const getTransactionBadge = (type: string) => {
    switch (type) {
      case "deposit":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "repayment":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "fixed_deposit":
        return "bg-violet-50 text-violet-700 border-violet-200";

      case "monthly_contribution":
        return "bg-amber-50 text-amber-700 border-amber-200";

      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans -mt-28 text-slate-900">
      {/* =========================================================
          NAVBAR
      ========================================================== */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
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

            {/* Right actions */}
            <div className="flex items-center gap-3">
              {transactions.length > 0 && (
                <div className="hidden md:flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">
                  <Bell className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
                  {transactions.length} Pending
                </div>
              )}

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" />

                <span>
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* =========================================================
          MAIN
      ========================================================== */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6  mt-2 lg:px-8 space-y-6">
        {/* =======================================================
            HEADER / WELCOME BANNER
        ======================================================== */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-md">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Shield className="h-3.5 w-3.5" />
              Managing Director Executive Suite
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Confirm Accountant Transactions
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Review and approve pending financial transactions submitted by
              the accounting team. Approved transactions are moved into their
              appropriate financial records.
            </p>
          </div>
        </section>

        {/* =======================================================
            PAGE CONTROLS
        ======================================================== */}
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-sm font-extrabold text-slate-900">
                  Pending Transactions
                </h2>

                <p className="text-xs text-slate-500">
                  {transactions.length} transaction
                  {transactions.length === 1 ? "" : "s"} awaiting review
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-xs"
              />
            </div>

            {/* Refresh */}
            <button
              onClick={fetchTransactions}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />

              Refresh
            </button>
          </div>
        </section>

        {/* =======================================================
            ALERT
        ======================================================== */}
        {message && (
          <div
            className={`rounded-2xl border p-4 flex items-start gap-3 ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
            )}

            <div>
              <p className="text-xs font-bold">
                {message.type === "success" ? "Success" : "Error"}
              </p>

              <p className="text-xs mt-0.5">
                {message.text}
              </p>
            </div>
          </div>
        )}

        {/* =======================================================
            LOADING
        ======================================================== */}
        {isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900">
              Loading transactions
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Please wait while we retrieve pending transactions.
            </p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          /* =====================================================
             EMPTY STATE
          ====================================================== */
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-sm font-extrabold text-slate-900">
              {searchQuery
                ? "No matching transactions"
                : "No pending transactions"}
            </h3>

            <p className="mt-1 max-w-md mx-auto text-xs leading-relaxed text-slate-500">
              {searchQuery
                ? `No transactions matching "${searchQuery}" were found. Try another search term.`
                : "There are currently no accountant transactions waiting for Managing Director approval."}
            </p>
          </div>
        ) : (
          /* =====================================================
             TRANSACTION TABLE
          ====================================================== */
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
            {/* Table header */}
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-amber-600" />

                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Awaiting MD Confirmation
                </h2>
              </div>
            </div>

            {/* Responsive table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-white">
                    <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                      ID
                    </th>

                    <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                      Member
                    </th>

                    <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                      Amount
                    </th>

                    <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                      Type
                    </th>

                    <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                      Date
                    </th>

                    <th className="px-5 py-4 text-right text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                      Decision
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((transaction) => {
                    const IconComponent = getTransactionIcon(
                      transaction.type
                    );

                    const isProcessing =
                      processingId === transaction.id;

                    return (
                      <tr
                        key={transaction.id}
                        className="group hover:bg-slate-50/80 transition-colors"
                      >
                        {/* ID */}
                        <td className="px-5 py-5">
                          <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                            <Hash className="h-3 w-3 text-slate-400" />
                            {transaction.id}
                          </div>
                        </td>

                        {/* Member */}
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                              <User className="h-4 w-4" />
                            </div>

                            <div>
                              <p className="text-xs font-extrabold text-slate-900">
                                {transaction.full_name}
                              </p>

                              <p className="mt-0.5 text-[11px] text-slate-500">
                                Member ID:{" "}
                                <span className="font-semibold text-slate-600">
                                  {transaction.member_id}
                                </span>
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-1.5">
                            <CircleDollarSign className="h-4 w-4 text-emerald-600" />

                            <span className="text-sm font-extrabold text-slate-900">
                              ₦
                              {Number(transaction.amount).toLocaleString(
                                "en-NG",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </span>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${getTransactionBadge(
                              transaction.type
                            )}`}
                          >
                            <IconComponent className="h-3 w-3" />

                            {formatTransactionType(transaction.type)}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <CalendarDays className="h-4 w-4 text-slate-400" />

                            <span>
                              {new Date(
                                transaction.created_at
                              ).toLocaleString("en-NG", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-5">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() =>
                                handleAction(
                                  transaction.id,
                                  "approve"
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isProcessing ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              )}

                              Approve
                            </button>

                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() =>
                                handleAction(
                                  transaction.id,
                                  "reject"
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 hover:border-rose-300 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <XCircle className="h-3.5 w-3.5" />

                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom information */}
            <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-[11px] text-slate-500">
                  Showing{" "}
                  <span className="font-bold text-slate-700">
                    {filteredTransactions.length}
                  </span>{" "}
                  pending transaction
                  {filteredTransactions.length === 1 ? "" : "s"}.
                </p>

                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                  <Shield className="h-3.5 w-3.5 text-emerald-600" />
                  MD authorization required
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =======================================================
            BACK TO DASHBOARD
        ======================================================== */}
        <div>
          <Link
            href="/admin_staff/md/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to MD Dashboard
          </Link>
        </div>
      </main>

      {/* =========================================================
          FOOTER
      ========================================================== */}
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
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SavingsNavbar from "@/components/navigation/SavingsNavbar";

import {
  ArrowLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  RefreshCw,
  Receipt,
  Landmark,
  CalendarDays,
  Hash,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

interface SavingsTransaction {
  saved_id: number;
  amount_saved: number | string;
  type: "deposit" | "withdrawal" | string;
  reference: string | null;
  status: "approved" | "pending" | "rejected" | string;
  created_at: string;
}

interface SavingsSummary {
  total_deposits: number;
  total_withdrawals: number;
  net_balance: number;
}

interface SavingsResponse {
  transactions: SavingsTransaction[];
  summary: SavingsSummary;
}

export default function SavingsTransactionsPage() {
  const [transactions, setTransactions] = useState<SavingsTransaction[]>([]);
  const [summary, setSummary] = useState<SavingsSummary>({
    total_deposits: 0,
    total_withdrawals: 0,
    net_balance: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchSavingsData = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        "/api/member/savings/transaction_alerts",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to load savings transactions."
        );
      }

      setTransactions(data.transactions || []);

      setSummary({
        total_deposits: Number(data.summary?.total_deposits || 0),
        total_withdrawals: Number(
          data.summary?.total_withdrawals || 0
        ),
        net_balance: Number(data.summary?.net_balance || 0),
      });
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your savings information."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSavingsData();
  }, []);

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  };

  const formatDate = (date: string) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleString("en-NG", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusClasses = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";

      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <CheckCircle2 className="h-3.5 w-3.5" />;

      case "pending":
        return <Clock3 className="h-3.5 w-3.5" />;

      case "rejected":
        return <XCircle className="h-3.5 w-3.5" />;

      default:
        return <Clock3 className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">

      {/* =========================================================
          NAVBAR
      ========================================================= */}
      <SavingsNavbar />

      {/* =========================================================
          MAIN
      ========================================================= */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 -mt-24 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-6 rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">

          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                <Wallet className="h-3.5 w-3.5" />
                Savings Account
              </span>

              <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
                Recent Savings Transactions
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-300 leading-relaxed">
                View your recent deposits, withdrawals, transaction
                references and current savings balance.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchSavingsData(true)}
              disabled={refreshing}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {/* =========================================================
            SUMMARY CARDS
        ========================================================= */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">

          {/* Total Deposits */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total Deposits
                </p>

                <p className="mt-2 text-2xl font-extrabold text-slate-900">
                  ₦{formatCurrency(summary.total_deposits)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ArrowDownCircle className="h-5 w-5" />
              </div>

            </div>
          </div>

          {/* Total Withdrawals */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total Withdrawals
                </p>

                <p className="mt-2 text-2xl font-extrabold text-rose-600">
                  ₦{formatCurrency(summary.total_withdrawals)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <ArrowUpCircle className="h-5 w-5" />
              </div>

            </div>
          </div>

          {/* Net Balance */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Net Balance
                </p>

                <p className="mt-2 text-2xl font-extrabold text-emerald-700">
                  ₦{formatCurrency(summary.net_balance)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Landmark className="h-5 w-5" />
              </div>

            </div>
          </div>

        </div>

        {/* =========================================================
            TRANSACTIONS CARD
        ========================================================= */}
        <section className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">

          {/* Card Header */}
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Receipt className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Savings Activity
                </h2>

                <p className="text-xs text-slate-500">
                  Your latest 10 savings transactions
                </p>
              </div>

            </div>

            <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
              <Hash className="h-3.5 w-3.5" />
              {transactions.length} Transactions
            </div>

          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex min-h-64 items-center justify-center p-8">

              <div className="flex flex-col items-center gap-3">

                <RefreshCw className="h-7 w-7 animate-spin text-emerald-600" />

                <p className="text-sm font-medium text-slate-500">
                  Loading your savings transactions...
                </p>

              </div>

            </div>
          ) : transactions.length === 0 ? (

            /* Empty State */
            <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Wallet className="h-7 w-7" />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-900">
                No transactions found
              </h3>

              <p className="mt-1 max-w-sm text-xs text-slate-500">
                You do not have any savings transactions available yet.
              </p>

            </div>
          ) : (

            /* =====================================================
               TABLE
            ===================================================== */
            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px] text-left">

                <thead className="bg-slate-50 border-b border-slate-200">

                  <tr>

                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      #
                    </th>

                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Amount
                    </th>

                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Type
                    </th>

                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Reference
                    </th>

                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Date
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {transactions.map((transaction) => {

                    const isDeposit =
                      transaction.type.toLowerCase() === "deposit";

                    return (
                      <tr
                        key={transaction.saved_id}
                        className="transition-colors hover:bg-slate-50"
                      >

                        {/* ID */}
                        <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                          {transaction.saved_id}
                        </td>

                        {/* Amount */}
                        <td className="px-5 py-4">

                          <span
                            className={`text-sm font-bold ${
                              isDeposit
                                ? "text-emerald-700"
                                : "text-rose-600"
                            }`}
                          >
                            {isDeposit ? "+" : "-"}₦
                            {formatCurrency(transaction.amount_saved)}
                          </span>

                        </td>

                        {/* Type */}
                        <td className="px-5 py-4">

                          <div className="inline-flex items-center gap-2">

                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                isDeposit
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-rose-50 text-rose-600"
                              }`}
                            >
                              {isDeposit ? (
                                <ArrowDownCircle className="h-4 w-4" />
                              ) : (
                                <ArrowUpCircle className="h-4 w-4" />
                              )}
                            </div>

                            <span className="text-sm font-semibold capitalize text-slate-700">
                              {transaction.type}
                            </span>

                          </div>

                        </td>

                        {/* Reference */}
                        <td className="px-5 py-4">

                          <span className="font-mono text-xs text-slate-500">
                            {transaction.reference || "N/A"}
                          </span>

                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${getStatusClasses(
                              transaction.status
                            )}`}
                          >
                            {getStatusIcon(transaction.status)}
                            {transaction.status}
                          </span>

                        </td>

                        {/* Date */}
                        <td className="px-5 py-4">

                          <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">

                            <CalendarDays className="h-3.5 w-3.5 text-slate-400" />

                            {formatDate(transaction.created_at)}

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </main>

      {/* =========================================================
          FOOTER
      ========================================================= */}
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
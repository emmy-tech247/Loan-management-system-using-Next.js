"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import FixedDepositNavbar from "@/components/navigation/FixedDepositNavbar";
import {
  ArrowLeft,
  Landmark,
  FileText,
  Percent,
  ArrowRightLeft,
  RefreshCw,
  CalendarDays,
  Wallet,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingUp,
} from "lucide-react";

interface FixedDepositInterest {
  fd_id: number;
  amount_deposited: number;
  tenure_months: number;
  interest_rate: number;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  interest_earned: number;
}

export default function ViewInterestFixedDepositPage() {
  const [records, setRecords] = useState<FixedDepositInterest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInterestRecords = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(
        "/api/member/fixed_deposits/interest_earned",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to load fixed deposit interest records."
        );
        return;
      }

      setRecords(data.records || []);
    } catch (err) {
      console.error(
        "Failed to fetch fixed deposit interest:",
        err
      );

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterestRecords();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: string | null) => {
    if (!date) {
      return "Not Set";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not Set";
    }

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatStatus = (status: string | null) => {
    if (!status) {
      return "Unknown";
    }

    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const totalInterest = records.reduce(
    (total, record) =>
      total + Number(record.interest_earned),
    0
  );

  const totalDeposited = records.reduce(
    (total, record) =>
      total + Number(record.amount_deposited),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">

      {/* Navbar */}
        <FixedDepositNavbar />

      {/* Main */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 -mt-24 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">

          <div className="pointer-events-none absolute right-0 top-0 -mr-8 -mt-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <span className="mb-3 inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                <TrendingUp className="h-4 w-4" />
                Fixed Deposit Earnings
              </span>

              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Fixed Deposit Interest Summary
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
                View the interest earned on your fixed deposits
                based on the deposit amount, interest rate and
                elapsed period.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchInterestRecords}
              disabled={isLoading}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isLoading ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>

          </div>
        </div>

        {/* Summary Cards */}
        {!isLoading &&
          !error &&
          records.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      Total Amount Deposited
                    </p>

                    <p className="mt-2 text-xl font-extrabold text-slate-900">
                      {formatCurrency(totalDeposited)}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Wallet className="h-5 w-5" />
                  </div>

                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs font-semibold text-emerald-700">
                      Total Interest Earned
                    </p>

                    <p className="mt-2 text-xl font-extrabold text-emerald-800">
                      {formatCurrency(totalInterest)}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <Percent className="h-5 w-5" />
                  </div>

                </div>
              </div>

            </div>
          )}

        {/* Error */}
        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">

            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />

            <div>
              <p className="font-bold">
                Unable to Load Interest Records
              </p>

              <p className="mt-1">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchInterestRecords}
                className="mt-3 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
              >
                Try Again
              </button>
            </div>

          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">

            <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />

            <p className="mt-4 text-sm font-semibold text-slate-700">
              Calculating your fixed deposit interest...
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Please wait.
            </p>

          </div>
        )}

        {/* No Records */}
        {!isLoading &&
          !error &&
          records.length === 0 && (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Percent className="h-7 w-7" />
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-900">
                No Fixed Deposit Records
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                You do not have any fixed deposit records
                from which interest can be calculated.
              </p>

              <Link
                href="/member/fixed_deposit/apply_fd"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-600"
              >
                <Landmark className="h-4 w-4" />
                Apply for Fixed Deposit
              </Link>

            </div>
          )}

        {/* Desktop Table */}
        {!isLoading &&
          !error &&
          records.length > 0 && (
            <div className="mt-6 hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:block">

              <div className="overflow-x-auto">

                <table className="w-full border-collapse">

                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">

                      <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-600">
                        FD ID
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-600">
                        Amount
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-600">
                        Tenure
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-600">
                        Rate
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-600">
                        Start Date
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-600">
                        End Date
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-600">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-extrabold uppercase tracking-wide text-slate-600">
                        Interest Earned
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {records.map((record) => (
                      <tr
                        key={record.fd_id}
                        className="transition-colors hover:bg-slate-50"
                      >

                        <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-slate-900">
                          #{record.fd_id}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-700">
                          {formatCurrency(
                            Number(record.amount_deposited)
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                          {record.tenure_months} months
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-700">
                          {Number(record.interest_rate).toFixed(2)}%
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                          {formatDate(record.start_date)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                          {formatDate(record.end_date)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">

                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                              record.status?.toLowerCase() ===
                              "approved"
                                ? "bg-emerald-50 text-emerald-700"
                                : record.status?.toLowerCase() ===
                                  "pending"
                                ? "bg-amber-50 text-amber-700"
                                : record.status?.toLowerCase() ===
                                  "rejected"
                                ? "bg-rose-50 text-rose-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {record.status?.toLowerCase() ===
                            "approved" ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <Clock3 className="h-3.5 w-3.5" />
                            )}

                            {formatStatus(record.status)}
                          </span>

                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-extrabold text-emerald-700">
                          {formatCurrency(
                            Number(record.interest_earned)
                          )}
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            </div>
          )}

        {/* Mobile Cards */}
        {!isLoading &&
          !error &&
          records.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-4 lg:hidden">

              {records.map((record) => (
                <div
                  key={record.fd_id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >

                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                        <Percent className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Fixed Deposit #{record.fd_id}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {record.tenure_months} months
                        </p>
                      </div>

                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        record.status?.toLowerCase() ===
                        "approved"
                          ? "bg-emerald-50 text-emerald-700"
                          : record.status?.toLowerCase() ===
                            "pending"
                          ? "bg-amber-50 text-amber-700"
                          : record.status?.toLowerCase() ===
                            "rejected"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {formatStatus(record.status)}
                    </span>

                  </div>

                  {/* Interest */}
                  <div className="mt-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5">

                    <p className="text-xs font-medium text-slate-400">
                      Interest Earned
                    </p>

                    <p className="mt-1 text-2xl font-extrabold text-emerald-300">
                      {formatCurrency(
                        Number(record.interest_earned)
                      )}
                    </p>

                  </div>

                  {/* Details */}
                  <div className="mt-4 space-y-3">

                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="text-xs font-medium text-slate-500">
                        Amount
                      </span>

                      <span className="text-sm font-bold text-slate-900">
                        {formatCurrency(
                          Number(record.amount_deposited)
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="text-xs font-medium text-slate-500">
                        Tenure
                      </span>

                      <span className="text-sm font-bold text-slate-900">
                        {record.tenure_months} months
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="text-xs font-medium text-slate-500">
                        Interest Rate
                      </span>

                      <span className="text-sm font-bold text-slate-900">
                        {Number(record.interest_rate).toFixed(2)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Start Date
                      </span>

                      <span className="text-sm font-bold text-slate-900">
                        {formatDate(record.start_date)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <CalendarDays className="h-3.5 w-3.5" />
                        End Date
                      </span>

                      <span className="text-sm font-bold text-slate-900">
                        {formatDate(record.end_date)}
                      </span>
                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

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
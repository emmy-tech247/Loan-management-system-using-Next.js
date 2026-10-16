"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDownCircle,
  CheckCircle2,
  Clock3,
  AlertCircle,
  ArrowLeft,
  Wallet,
} from "lucide-react";

type Withdrawal = {
  saved_id: number;
  full_name: string;
  amount: number;
  reason: string;
  created_at: string;
};

export default function ApproveWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | ""
  >("");

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      setMessage("");
      setMessageType("");

      const response = await fetch("/api/admin_staff/md/approve-withdrawals", {
        cache: "no-store",
      });

      const data = await response.json();

      if (data.success) {
        setWithdrawals(data.withdrawals || []);
      } else {
        setMessage(data.message || "Failed to load withdrawals.");
        setMessageType("error");
      }
    } catch (error) {
      console.error(error);

      setMessage("Something went wrong while loading withdrawals.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleApprove = async (savedId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to approve this withdrawal?"
    );

    if (!confirmed) return;

    setApprovingId(savedId);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(
        "/api/admin_staff/md/apprve-withdrawals/approve",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            saved_id: savedId,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("Withdrawal approved successfully.");
        setMessageType("success");

        setWithdrawals((current) =>
          current.filter(
            (withdrawal) => withdrawal.saved_id !== savedId
          )
        );
      } else {
        setMessage(
          data.message || "Unable to approve withdrawal."
        );
        setMessageType("error");
      }
    } catch (error) {
      console.error(error);

      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
    } finally {
      setApprovingId(null);
    }
  };

  const formatMoney = (amount: number) => {
    return Number(amount || 0).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date: string) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans -mt-28 text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo / Portal */}
            <div className="flex items-center gap-3">
              <Link
                href="/admin_staff/md"
                className="flex items-center gap-2"
              >
                <img
                  src="/images/logo2.png"
                  alt="DCG Cooperative Logo"
                  className="h-9 w-auto object-contain"
                />
              </Link>

              <span className="hidden items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Executive Portal
              </span>
            </div>

            {/* Page Label */}
            <div className="hidden items-center gap-2 text-xs font-semibold text-slate-500 sm:flex">
              <Wallet className="h-4 w-4 text-emerald-600" />
              Withdrawal Approvals
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="mx-auto w-full max-w-7xl px-4 py-8 mt-2 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="relative mb-6 overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              <ArrowDownCircle className="h-3.5 w-3.5" />
              Financial Operations
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Withdrawals Awaiting MD Approval
            </h1>

            <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
              Review member withdrawal requests and authorize approved
              transactions from the Managing Director Executive Portal.
            </p>
          </div>
        </div>

        {/* Summary */}
        {!loading && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Pending Withdrawals
                  </p>

                  <p className="mt-1 text-2xl font-extrabold text-slate-900">
                    {withdrawals.length}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Clock3 className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total Requested
                  </p>

                  <p className="mt-1 text-2xl font-extrabold text-slate-900">
                    ₦
                    {formatMoney(
                      withdrawals.reduce(
                        (total, item) =>
                          total + Number(item.amount || 0),
                        0
                      )
                    )}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Wallet className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-2xl border px-4 py-4 text-sm font-semibold ${
              messageType === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {messageType === "success" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            )}

            <span>{message}</span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
            </div>

            <h3 className="text-sm font-bold text-slate-900">
              Loading withdrawals
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Please wait while pending withdrawal requests are loaded.
            </p>
          </div>
        )}

        {/* Desktop Table */}
        {!loading && withdrawals.length > 0 && (
          <div className="hidden overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs md:block">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Pending Withdrawal Requests
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Review the details before authorizing each request.
                  </p>
                </div>

                <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                  {withdrawals.length} Pending
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-left text-xs font-bold text-white">
                    <th className="px-5 py-4">Member</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Reason</th>
                    <th className="px-5 py-4">Requested</th>
                    <th className="px-5 py-4 text-center">
                      Status
                    </th>
                    <th className="px-5 py-4 text-center">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {withdrawals.map((withdrawal) => (
                    <tr
                      key={withdrawal.saved_id}
                      className="group transition-colors hover:bg-slate-50"
                    >
                      <td className="px-5 py-5">
                        <div className="font-bold text-slate-900">
                          {withdrawal.full_name}
                        </div>

                        <div className="mt-1 text-[11px] text-slate-400">
                          Request #{withdrawal.saved_id}
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <span className="font-extrabold text-rose-600">
                          ₦{formatMoney(withdrawal.amount)}
                        </span>
                      </td>

                      <td className="max-w-xs px-5 py-5">
                        <p className="text-sm leading-relaxed text-slate-600">
                          {withdrawal.reason || "No reason provided"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-500">
                        {formatDate(withdrawal.created_at)}
                      </td>

                      <td className="px-5 py-5 text-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700">
                          <Clock3 className="h-3.5 w-3.5" />
                          Pending
                        </span>
                      </td>

                      <td className="px-5 py-5 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            handleApprove(withdrawal.saved_id)
                          }
                          disabled={
                            approvingId === withdrawal.saved_id
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {approvingId === withdrawal.saved_id ? (
                            <>
                              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                              Approving...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              Approve
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Mobile Cards */}
        {!loading && withdrawals.length > 0 && (
          <div className="space-y-4 md:hidden">
            {withdrawals.map((withdrawal) => (
              <div
                key={withdrawal.saved_id}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      {withdrawal.full_name}
                    </h3>

                    <p className="mt-1 text-[11px] text-slate-400">
                      Request #{withdrawal.saved_id}
                    </p>
                  </div>

                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                    <Clock3 className="h-3 w-3" />
                    Pending
                  </span>
                </div>

                {/* Details */}
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-semibold text-slate-500">
                      Amount
                    </span>

                    <span className="text-base font-extrabold text-rose-600">
                      ₦{formatMoney(withdrawal.amount)}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <span className="text-xs font-semibold text-slate-500">
                      Reason
                    </span>

                    <span className="max-w-[65%] text-right text-xs leading-relaxed text-slate-700">
                      {withdrawal.reason || "No reason provided"}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <span className="text-xs font-semibold text-slate-500">
                      Requested
                    </span>

                    <span className="max-w-[65%] text-right text-xs text-slate-700">
                      {formatDate(withdrawal.created_at)}
                    </span>
                  </div>
                </div>

                {/* Approve */}
                <button
                  type="button"
                  onClick={() =>
                    handleApprove(withdrawal.saved_id)
                  }
                  disabled={
                    approvingId === withdrawal.saved_id
                  }
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {approvingId === withdrawal.saved_id ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Approve Withdrawal
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && withdrawals.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xs sm:p-14">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <ArrowDownCircle className="h-7 w-7" />
            </div>

            <h3 className="text-base font-extrabold text-slate-900">
              No Pending Withdrawals
            </h3>

            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-slate-500">
              There are currently no member withdrawal requests awaiting
              Managing Director approval.
            </p>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/admin_staff/staff/login"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 shadow-xs transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to MD Dashboard
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-slate-200 bg-white py-6">
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
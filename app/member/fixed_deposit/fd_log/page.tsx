"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import FixedDepositNavbar from "@/components/navigation/FixedDepositNavbar";
import {
  ArrowLeft,
  Landmark,
  FileText,
  CalendarDays,
  CheckCircle2,
  Clock3,
  AlertCircle,
  LogOut,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

interface FixedDepositAction {
  fd_id: number | string;
  full_name: string;
  email: string;
  amount_deposited: number | string;
  tenure_months: number | string;
  interest_rate: number | string;
  status: string | null;
  action_type: string | null;
  action_date: string | null;
  note: string | null;
  approval_status: string | null;
  approved_at: string | null;
}

export default function FixedDepositActionsPage() {
  const router = useRouter();

  const [records, setRecords] = useState<FixedDepositAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchActions = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(
          "/api/member/fixed_deposit/fd_log",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load fixed deposit actions."
          );
        }

        setRecords(data.data || []);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load fixed deposit actions."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchActions();
  }, [router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/login");
    }
  };

  const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(Number(value) || 0);
  };

  const formatDate = (value: string | null) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (value: string | null) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatStatus = (value: string | null) => {
    if (!value) return "-";

    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getStatusClasses = (status: string | null) => {
    const value = status?.toLowerCase() || "";

    if (
      value.includes("approved") ||
      value === "active" ||
      value === "completed"
    ) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }

    if (
      value.includes("pending") ||
      value.includes("processing")
    ) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }

    if (
      value.includes("rejected") ||
      value.includes("cancelled") ||
      value.includes("failed")
    ) {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }

    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">

      {/* =========================
          NAVIGATION BAR
      ========================== */}
       <FixedDepositNavbar />
      {/* =========================
          MAIN
      ========================== */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 -mt-24 sm:px-6 lg:px-8">

        {/* Header Banner */}
        <div className="relative mb-6 overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-md">

          <div className="absolute right-0 top-0 -mr-10 -mt-10 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
              <Landmark className="h-6 w-6" />
            </div>

            <div>
              <span className="inline-flex rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                Fixed Deposit Management
              </span>

              <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
                Fixed Deposit Actions Log
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
                Review your fixed deposit withdrawal, rollover and approval
                activities in one place.
              </p>
            </div>

          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="text-sm font-bold">
                Unable to load records
              </p>

              <p className="mt-1 text-xs">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">

            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-emerald-600" />

            <p className="mt-4 text-sm font-semibold text-slate-700">
              Loading fixed deposit actions...
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Please wait while your records are retrieved.
            </p>

          </div>
        ) : records.length === 0 ? (

          /* No Records */
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FileText className="h-7 w-7" />
            </div>

            <h2 className="mt-4 text-base font-bold text-slate-900">
              No fixed deposit actions recorded
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              You currently have no fixed deposit withdrawal, rollover,
              or approval activities.
            </p>

            <Link
              href="/member/fixed_deposit/fd_record"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <Landmark className="h-4 w-4" />
              View Fixed Deposits
            </Link>

          </div>
        ) : (

          /* Records */
          <div className="space-y-4">

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">

              <div className="overflow-x-auto">

                <table className="w-full text-left">

                  <thead className="bg-slate-900 text-white">

                    <tr>
                      <th className="whitespace-nowrap px-4 py-4 text-xs font-bold uppercase tracking-wide">
                        ID
                      </th>

                      <th className="whitespace-nowrap px-4 py-4 text-xs font-bold uppercase tracking-wide">
                        Member
                      </th>

                      <th className="whitespace-nowrap px-4 py-4 text-xs font-bold uppercase tracking-wide">
                        Amount
                      </th>

                      <th className="whitespace-nowrap px-4 py-4 text-xs font-bold uppercase tracking-wide">
                        Tenure
                      </th>

                      <th className="whitespace-nowrap px-4 py-4 text-xs font-bold uppercase tracking-wide">
                        Rate
                      </th>

                      <th className="whitespace-nowrap px-4 py-4 text-xs font-bold uppercase tracking-wide">
                        Status
                      </th>

                      <th className="whitespace-nowrap px-4 py-4 text-xs font-bold uppercase tracking-wide">
                        Action
                      </th>

                      <th className="whitespace-nowrap px-4 py-4 text-xs font-bold uppercase tracking-wide">
                        Action Date
                      </th>

                      <th className="whitespace-nowrap px-4 py-4 text-xs font-bold uppercase tracking-wide">
                        Approval
                      </th>

                      <th className="whitespace-nowrap px-4 py-4 text-xs font-bold uppercase tracking-wide">
                        Approved At
                      </th>

                      <th className="whitespace-nowrap px-4 py-4 text-xs font-bold uppercase tracking-wide">
                        Note
                      </th>
                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {records.map((record, index) => (

                      <tr
                        key={`${record.fd_id}-${index}`}
                        className="hover:bg-slate-50 transition-colors"
                      >

                        <td className="px-4 py-4 text-sm font-bold text-slate-900">
                          #{record.fd_id}
                        </td>

                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {record.full_name}
                            </p>

                            <p className="text-xs text-slate-500">
                              {record.email}
                            </p>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-slate-900">
                          {formatCurrency(record.amount_deposited)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                          {record.tenure_months} months
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-700">
                          {record.interest_rate}%
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${getStatusClasses(
                              record.status
                            )}`}
                          >
                            {formatStatus(record.status)}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          {record.action_type ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                              {record.action_type === "withdraw" ? (
                                <ArrowLeft className="h-3 w-3" />
                              ) : (
                                <RefreshCw className="h-3 w-3" />
                              )}

                              {formatStatus(record.action_type)}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">
                              -
                            </span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-600">
                          {formatDateTime(record.action_date)}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${getStatusClasses(
                              record.approval_status
                            )}`}
                          >
                            {record.approval_status ? (
                              record.approval_status.toLowerCase().includes(
                                "approved"
                              ) ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : (
                                <Clock3 className="h-3 w-3" />
                              )
                            ) : null}

                            {formatStatus(record.approval_status)}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-600">
                          {formatDateTime(record.approved_at)}
                        </td>

                        <td className="max-w-xs px-4 py-4">
                          <p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-600">
                            {record.note || "-"}
                          </p>
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>
            </div>

            {/* Mobile / Tablet Cards */}
            <div className="grid grid-cols-1 gap-4 lg:hidden">

              {records.map((record, index) => (

                <div
                  key={`${record.fd_id}-card-${index}`}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
                >

                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Fixed Deposit
                      </p>

                      <h3 className="mt-1 text-base font-extrabold text-slate-900">
                        #{record.fd_id}
                      </h3>
                    </div>

                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${getStatusClasses(
                        record.status
                      )}`}
                    >
                      {formatStatus(record.status)}
                    </span>

                  </div>

                  {/* Member */}
                  <div className="mt-4">

                    <p className="text-xs font-semibold text-slate-400">
                      Member
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {record.full_name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {record.email}
                    </p>

                  </div>

                  {/* Details */}
                  <div className="mt-4 grid grid-cols-2 gap-4">

                    <div>
                      <p className="text-xs font-semibold text-slate-400">
                        Amount
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {formatCurrency(record.amount_deposited)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-400">
                        Tenure
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {record.tenure_months} months
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-400">
                        Interest Rate
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {record.interest_rate}%
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-400">
                        Action
                      </p>

                      <p className="mt-1 text-sm font-semibold text-emerald-700">
                        {formatStatus(record.action_type)}
                      </p>
                    </div>

                  </div>

                  {/* Dates */}
                  <div className="mt-4 space-y-3 rounded-xl bg-slate-50 p-4">

                    <div className="flex items-start gap-2">
                      <CalendarDays className="mt-0.5 h-4 w-4 text-slate-400" />

                      <div>
                        <p className="text-xs font-semibold text-slate-400">
                          Action Date
                        </p>

                        <p className="text-xs font-semibold text-slate-700">
                          {formatDateTime(record.action_date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-slate-400" />

                      <div>
                        <p className="text-xs font-semibold text-slate-400">
                          Approval
                        </p>

                        <p className="text-xs font-semibold text-slate-700">
                          {formatStatus(record.approval_status)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Clock3 className="mt-0.5 h-4 w-4 text-slate-400" />

                      <div>
                        <p className="text-xs font-semibold text-slate-400">
                          Approved At
                        </p>

                        <p className="text-xs font-semibold text-slate-700">
                          {formatDateTime(record.approved_at)}
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Note */}
                  <div className="mt-4">

                    <p className="text-xs font-semibold text-slate-400">
                      Note
                    </p>

                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                      {record.note || "-"}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          </div>
        )}

      </main>

      {/* =========================
          FOOTER
      ========================== */}
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
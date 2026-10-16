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
  Wallet,
  RefreshCw,
  Download,
  CalendarDays,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRightLeft,
} from "lucide-react";

interface FixedDeposit {
  id: number;
  amount_deposited: number;
  tenure_months: number;
  interest_rate: number;
  start_date: string | null;
  maturity_date: string | null;
  status: string | null;
  interest: number;
  days_left: number;
  maturity_status: "active" | "matured" | "not_set";
}

export default function ViewFixedDepositPage() {
  const [records, setRecords] = useState<FixedDeposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(
        "/api/member/fixed_deposits/fd_record",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to load fixed deposit records."
        );
        return;
      }

      setRecords(data.records || []);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Not Set";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not Set";
    }

    return parsedDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatStatus = (status: string | null) => {
    if (!status) return "Unknown";

    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const handleDownloadCertificate = async (
    fdId: number
  ) => {
    try {
      setDownloadingId(fdId);

      const response = await fetch(
        `/api/member/fixed-deposits/certificate?fd_id=${fdId}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        alert(
          data?.message ||
            "Unable to download certificate."
        );

        return;
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = `fixed-deposit-certificate-${fdId}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);

      alert(
        "An error occurred while downloading the certificate."
      );
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">

      {/* Navbar */}
       <FixedDepositNavbar />
      {/* Main */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 -mt-24 sm:px-6 lg:px-8">

        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">

          <div className="pointer-events-none absolute right-0 top-0 -mr-8 -mt-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <span className="mb-3 inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                <Landmark className="h-4 w-4" />
                Fixed Deposit Management
              </span>

              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Your Fixed Deposit Records
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
                View your fixed deposits, estimated interest,
                maturity dates and current deposit status.
              </p>
            </div>

            <button
              onClick={fetchRecords}
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

        {/* Error */}
        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />

            <div>
              <p className="font-bold">
                Unable to Load Records
              </p>

              <p className="mt-1">
                {error}
              </p>

              <button
                onClick={fetchRecords}
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
              Loading your fixed deposit records...
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
                <Landmark className="h-7 w-7" />
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-900">
                No Fixed Deposit Records
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                You have no fixed deposit records yet.
                Start a new fixed deposit application to
                begin saving.
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

        {/* Records */}
        {!isLoading &&
          !error &&
          records.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">

              {records.map((record) => (
                <div
                  key={record.id}
                  className="group rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md sm:p-6"
                >

                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                        <Landmark className="h-5 w-5" />
                      </div>

                      <div>
                        <h2 className="text-sm font-bold text-slate-900">
                          Fixed Deposit #{record.id}
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {formatStatus(record.status)}
                        </p>
                      </div>

                    </div>

                    {/* Status */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                        record.status?.toLowerCase() === "approved"
                          ? "bg-emerald-50 text-emerald-700"
                          : record.status?.toLowerCase() === "pending"
                          ? "bg-amber-50 text-amber-700"
                          : record.status?.toLowerCase() === "rejected"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {formatStatus(record.status)}
                    </span>

                  </div>

                  {/* Amount */}
                  <div className="mt-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white">

                    <p className="text-xs font-medium text-slate-400">
                      Amount Deposited
                    </p>

                    <p className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
                      {formatCurrency(
                        Number(record.amount_deposited)
                      )}
                    </p>

                  </div>

                  {/* Details */}
                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <CalendarDays className="h-4 w-4 text-slate-400" />
                        Tenure
                      </div>

                      <p className="mt-2 text-sm font-bold text-slate-900">
                        {record.tenure_months} months
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Percent className="h-4 w-4 text-slate-400" />
                        Interest Rate
                      </div>

                      <p className="mt-2 text-sm font-bold text-slate-900">
                        {Number(record.interest_rate).toFixed(2)}%
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Wallet className="h-4 w-4 text-slate-400" />
                        Estimated Interest
                      </div>

                      <p className="mt-2 text-sm font-bold text-emerald-700">
                        {formatCurrency(
                          Number(record.interest)
                        )}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <CalendarDays className="h-4 w-4 text-slate-400" />
                        Maturity Date
                      </div>

                      <p className="mt-2 text-sm font-bold text-slate-900">
                        {formatDate(record.maturity_date)}
                      </p>
                    </div>

                  </div>

                  {/* Maturity Status */}
                  <div className="mt-4">

                    {record.maturity_status === "active" && (
                      <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
                        <Clock3 className="h-4 w-4" />
                        {record.days_left} days left
                      </div>
                    )}

                    {record.maturity_status === "matured" && (
                      <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        Matured
                      </div>
                    )}

                    {record.maturity_status === "not_set" && (
                      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-500">
                        <CalendarDays className="h-4 w-4" />
                        Maturity Date Not Set
                      </div>
                    )}

                  </div>

                  {/* Start Date */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">

                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        Start Date
                      </p>

                      <p className="mt-1 text-xs font-bold text-slate-700">
                        {formatDate(record.start_date)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-400">
                        Deposit Status
                      </p>

                      <p className="mt-1 text-xs font-bold text-slate-700">
                        {formatStatus(record.status)}
                      </p>
                    </div>

                  </div>

                  {/* Certificate Button */}
                  <button
                    type="button"
                    onClick={() =>
                      handleDownloadCertificate(record.id)
                    }
                    disabled={downloadingId === record.id}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {downloadingId === record.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Preparing Certificate...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Download Certificate
                      </>
                    )}

                  </button>

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


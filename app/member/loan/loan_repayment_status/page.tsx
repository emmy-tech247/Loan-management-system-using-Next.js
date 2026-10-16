"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LoanNavbar from "@/components/navigation/LoanNavbar";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Loader2,
  LogOut,
  Menu,
  X,
  Shield,
  AlertCircle,
  CheckCircle2,
  Clock3,
  XCircle,
  Receipt,
} from "lucide-react";

type Repayment = {
  id?: number;
  member_id: number | string;
  loan_id: number | string;
  amount_paid: number | string;
  created_at?: string;
  receipt_file?: string | null;
  status: string;
};

export default function ViewLoanRepaymentPage() {
  const router = useRouter();

  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchRepayments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/member/loan/loan_repayment", {
  method: "GET",
  credentials: "include",
  cache: "no-store",
  headers: {
    Accept: "application/json",
  },
});

const contentType = response.headers.get("content-type") || "";

// Read response as text first.
// This prevents JSON.parse() from crashing when Next.js
// returns an HTML error/404 page.
const responseText = await response.text();

let data: {
  success?: boolean;
  repayments?: Repayment[];
  message?: string;
  error?: string;
};

if (contentType.includes("application/json")) {
  try {
    data = JSON.parse(responseText);
  } catch (parseError) {
    console.error("Invalid JSON returned by API:", parseError);
    console.error("Raw API response:", responseText);

    throw new Error("The repayment API returned invalid JSON.");
  }
} else {
  console.error("API did not return JSON.");
  console.error("Content-Type:", contentType);
  console.error("Raw API response:", responseText);

  throw new Error(
    `The repayment API returned ${contentType || "an unexpected response"} instead of JSON.`
  );
}

if (!response.ok) {
  throw new Error(
    data?.message ||
      data?.error ||
      `Failed to load loan repayment records. HTTP ${response.status}`
  );
}

setRepayments(data.repayments || []);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load repayment records."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRepayments();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      router.push("/staff");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      router.push("/staff");
    }
  };

  const formatAmount = (amount: number | string) => {
    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount)) {
      return "0.00";
    }

    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return new Intl.DateTimeFormat("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(parsedDate);
  };

  const getStatusStyles = (status: string) => {
    const normalizedStatus = status?.toLowerCase();

    switch (normalizedStatus) {
      case "approved":
      case "paid":
      case "completed":
      case "verified":
        return {
          wrapper:
            "bg-emerald-50 text-emerald-700 border border-emerald-200",
          icon: CheckCircle2,
        };

      case "pending":
      case "processing":
      case "under review":
        return {
          wrapper: "bg-amber-50 text-amber-700 border border-amber-200",
          icon: Clock3,
        };

      case "rejected":
      case "failed":
      case "declined":
        return {
          wrapper: "bg-rose-50 text-rose-700 border border-rose-200",
          icon: XCircle,
        };

      default:
        return {
          wrapper: "bg-slate-100 text-slate-700 border border-slate-200",
          icon: AlertCircle,
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Navbar */}
        <LoanNavbar />

      {/* Main */}
      <main className="flex-1 mx-auto w-full max-w-[1600px] px-4 py-8 -mt-24 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header Card */}
          <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">
            <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative z-10 max-w-3xl space-y-3">
              <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-300">
                <Receipt className="h-3.5 w-3.5" />
                Loan Management
              </span>

              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Loan Repayment Evidence
              </h1>

              <p className="text-sm leading-relaxed text-slate-300">
                View your loan repayment records, payment amounts, receipt
                evidence, and verification status.
              </p>
            </div>
          </section>

          {/* Summary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard
              title="Total Repayments"
              value={repayments.length.toString()}
              icon={<Receipt className="h-5 w-5" />}
            />

            <SummaryCard
              title="Total Amount Paid"
              value={`₦${formatAmount(
                repayments.reduce(
                  (total, repayment) =>
                    total + Number(repayment.amount_paid || 0),
                  0
                )
              )}`}
              icon={<FileText className="h-5 w-5" />}
            />

            <SummaryCard
              title="Verified Records"
              value={repayments
                .filter((repayment) =>
                  ["approved", "paid", "completed", "verified"].includes(
                    repayment.status?.toLowerCase()
                  )
                )
                .length.toString()}
              icon={<CheckCircle2 className="h-5 w-5" />}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                <div>
                  <p className="font-bold">Unable to load repayments</p>
                  <p className="mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Table Card */}
          <section className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Repayment Records
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Your latest loan repayment submissions and receipt evidence.
                </p>
              </div>

              <Link
                href="/upload_loan_repayment"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
              >
                <Receipt className="h-4 w-4" />
                Submit Repayment
              </Link>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="flex min-h-72 items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                  <p className="text-sm font-semibold">
                    Loading repayment records...
                  </p>
                </div>
              </div>
            ) : repayments.length === 0 ? (
              /* Empty State */
              <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <FileText className="h-7 w-7" />
                </div>

                <h3 className="mt-4 text-sm font-extrabold text-slate-900">
                  No repayment records
                </h3>

                <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-500">
                  You do not have any loan repayment records yet.
                </p>

                <Link
                  href="/upload_loan_repayment"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  Submit a Repayment
                </Link>
              </div>
            ) : (
              /* Responsive Table */
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-600">
                        Member ID
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-600">
                        Loan ID
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-600">
                        Amount
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-600">
                        Date
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-600">
                        Receipt
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-600">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {repayments.map((repayment, index) => {
                      const status = getStatusStyles(repayment.status);
                      const StatusIcon = status.icon;

                      return (
                        <tr
                          key={repayment.id ?? index}
                          className="group transition-colors hover:bg-slate-50/80"
                        >
                          <td className="px-5 py-5 text-sm font-bold text-slate-900">
                            {repayment.member_id}
                          </td>

                          <td className="px-5 py-5">
                            <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                              #{repayment.loan_id}
                            </span>
                          </td>

                          <td className="px-5 py-5 text-sm font-extrabold text-slate-900">
                            ₦{formatAmount(repayment.amount_paid)}
                          </td>

                          <td className="px-5 py-5 text-xs font-medium text-slate-600">
                            {formatDate(repayment.created_at)}
                          </td>

                          <td className="px-5 py-5">
                            {repayment.receipt_file ? (
                              <a
                                href={repayment.receipt_file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-100"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                View Receipt
                              </a>
                            ) : (
                              <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500">
                                <FileText className="h-3.5 w-3.5" />
                                Missing File
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold capitalize ${status.wrapper}`}
                            >
                              <StatusIcon className="h-3.5 w-3.5" />
                              {repayment.status || "Unknown"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-[1600px] px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} DCG Multipurpose Cooperative
            Society Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ---------------------------------------------
   Desktop Navigation Link
--------------------------------------------- */

function NavLink({
  href,
  label,
  active = false,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-xl px-3 py-3 text-[15px] font-bold transition-colors ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {label}
    </Link>
  );
}

/* ---------------------------------------------
   Mobile Navigation Link
--------------------------------------------- */

function MobileNavLink({
  href,
  label,
  active = false,
  onClick,
}: {
  href: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`rounded-xl px-4 py-3.5 text-base font-bold transition-colors ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {label}
    </Link>
  );
}

/* ---------------------------------------------
   Summary Card
--------------------------------------------- */

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-xl font-extrabold text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </div>
      </div>
    </div>
  );
}
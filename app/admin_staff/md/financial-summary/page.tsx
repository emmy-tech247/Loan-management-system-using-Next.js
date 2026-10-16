"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  ArrowDownCircle,
  ArrowLeft,
  Banknote,
  Landmark,
  LogOut,
  PiggyBank,
  Shield,
  TrendingUp,
  Wallet,
} from "lucide-react";

interface FinancialData {
  loans: {
    members: number;
    amount: number;
  };

  savings: {
    members: number;
    amount: number;
  };

  fixedDeposits: {
    members: number;
    amount: number;
  };
}

export default function FinancialSummaryPage() {
  const router = useRouter();

  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ===========================
  // LOAD FINANCIAL DATA
  // ===========================
  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/admin_staff/md/financial-summary",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const contentType =
          response.headers.get("content-type") || "";

        // -------------------------------------------------
        // Prevent JSON parsing errors when server returns
        // HTML, redirect page, error page, etc.
        // -------------------------------------------------
        if (
          !contentType
            .toLowerCase()
            .includes("application/json")
        ) {
          const rawText = await response.text();

          console.error(
            "Financial Summary returned non-JSON:",
            rawText
          );

          throw new Error(
            `Server returned an invalid response (${response.status}).`
          );
        }

        const result = await response.json();

        console.log(
          "Financial Summary HTTP status:",
          response.status
        );

        console.log(
          "Financial Summary API response:",
          result
        );

        // -------------------------------------------------
        // Handle API errors
        // -------------------------------------------------
        if (!response.ok || result?.success === false) {
          throw new Error(
            result?.message ||
              result?.error ||
              `Failed to load financial summary (${response.status}).`
          );
        }

        // -------------------------------------------------
        // Validate API response structure
        // -------------------------------------------------
        if (
          !result ||
          !result.loans ||
          !result.savings ||
          !result.fixedDeposits
        ) {
          throw new Error(
            "Invalid financial summary response from server."
          );
        }

        // -------------------------------------------------
        // Store normalized financial data
        // -------------------------------------------------
        setData({
          loans: {
            members: Number(result.loans.members ?? 0),
            amount: Number(result.loans.amount ?? 0),
          },

          savings: {
            members: Number(result.savings.members ?? 0),
            amount: Number(result.savings.amount ?? 0),
          },

          fixedDeposits: {
            members: Number(
              result.fixedDeposits.members ?? 0
            ),
            amount: Number(
              result.fixedDeposits.amount ?? 0
            ),
          },
        });
      } catch (err) {
        console.error(
          "Financial summary error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load financial summary."
        );

        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, []);

  // ===========================
  // LOGOUT
  // ===========================
  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      router.push("/staff");
    } catch {
      router.push("/staff");
    }
  };

  // ===========================
  // NUMBER FORMAT
  // ===========================
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-NG").format(value);
  };

  // ===========================
  // CURRENCY FORMAT
  // ===========================
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans -mt-28 text-slate-900">

      {/* ===================================================== */}
      {/* NAVBAR */}
      {/* ===================================================== */}

      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Logo */}
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
                Executive Portal
              </span>

            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />

              <span>
                {isLoggingOut
                  ? "Logging out..."
                  : "Logout"}
              </span>
            </button>

          </div>
        </div>
      </nav>

      {/* ===================================================== */}
      {/* MAIN */}
      {/* ===================================================== */}

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 mt-2 sm:px-6 lg:px-8">

        {/* =================================================== */}
        {/* HEADER */}
        {/* =================================================== */}

        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-md">

          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10">

            <div className="mb-3 flex items-center gap-2">

              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                <TrendingUp className="h-3.5 w-3.5" />
                Financial Operations
              </span>

            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Overall Financial Summary
            </h1>

            <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-300">
              Monitor the cooperative&apos;s loans, savings, and fixed
              deposit positions from the Managing Director executive portal.
            </p>

          </div>
        </div>

        {/* =================================================== */}
        {/* ERROR */}
        {/* =================================================== */}

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {/* =================================================== */}
        {/* LOADING */}
        {/* =================================================== */}

        {loading ? (

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="h-10 w-10 rounded-xl bg-slate-200" />

                <div className="mt-5 h-4 w-32 rounded bg-slate-200" />

                <div className="mt-3 h-8 w-48 rounded bg-slate-200" />

                <div className="mt-3 h-3 w-24 rounded bg-slate-200" />
              </div>
            ))}

          </div>

        ) : data ? (

          <>
            {/* ================================================= */}
            {/* SUMMARY CARDS */}
            {/* ================================================= */}

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

              {/* LOANS */}
              <div className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md">

                <div className="flex items-center justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                    <Wallet className="h-5 w-5" />
                  </div>

                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                    APPROVED / DISBURSED
                  </span>

                </div>

                <div className="mt-5">

                  <p className="text-xs font-semibold text-slate-500">
                    Loans Collected
                  </p>

                  <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                    ₦{formatCurrency(data.loans.amount)}
                  </h2>

                  <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500">

                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100">
                      <Banknote className="h-3.5 w-3.5 text-slate-500" />
                    </div>

                    {formatNumber(data.loans.members)} members

                  </div>

                </div>

              </div>

              {/* SAVINGS */}
              <div className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md">

                <div className="flex items-center justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                    <PiggyBank className="h-5 w-5" />
                  </div>

                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                    NET SAVINGS
                  </span>

                </div>

                <div className="mt-5">

                  <p className="text-xs font-semibold text-slate-500">
                    Savings
                  </p>

                  <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                    ₦{formatCurrency(data.savings.amount)}
                  </h2>

                  <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500">

                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100">
                      <ArrowDownCircle className="h-3.5 w-3.5 text-slate-500" />
                    </div>

                    {formatNumber(data.savings.members)} members

                  </div>

                </div>

              </div>

              {/* FIXED DEPOSIT */}
              <div className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md">

                <div className="flex items-center justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                    <Landmark className="h-5 w-5" />
                  </div>

                  <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-bold text-purple-700">
                    CONFIRMED
                  </span>

                </div>

                <div className="mt-5">

                  <p className="text-xs font-semibold text-slate-500">
                    Fixed Deposits
                  </p>

                  <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                    ₦{formatCurrency(data.fixedDeposits.amount)}
                  </h2>

                  <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500">

                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100">
                      <Banknote className="h-3.5 w-3.5 text-slate-500" />
                    </div>

                    {formatNumber(data.fixedDeposits.members)} members

                  </div>

                </div>

              </div>

            </div>

            {/* ================================================= */}
            {/* FINANCIAL TABLE */}
            {/* ================================================= */}

            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">

              <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <TrendingUp className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900">
                      Financial Position
                    </h2>

                    <p className="text-xs text-slate-500">
                      Current approved and confirmed financial figures
                    </p>
                  </div>

                </div>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[600px] text-left">

                  <thead className="bg-slate-100/80">

                    <tr>

                      <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 sm:px-6">
                        Category
                      </th>

                      <th className="px-5 py-4 text-center text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        Number of Members
                      </th>

                      <th className="px-5 py-4 text-right text-[11px] font-extrabold uppercase tracking-wider text-slate-500 sm:px-6">
                        Total Amount
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {/* Loans */}
                    <tr className="transition-colors hover:bg-slate-50">

                      <td className="px-5 py-5 sm:px-6">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                            <Wallet className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              Loans Collected
                            </p>

                            <p className="text-[11px] text-slate-500">
                              Approved / Disbursed
                            </p>
                          </div>

                        </div>

                      </td>

                      <td className="px-5 py-5 text-center text-sm font-bold text-slate-700">
                        {formatNumber(data.loans.members)}
                      </td>

                      <td className="px-5 py-5 text-right text-sm font-extrabold text-slate-900 sm:px-6">
                        ₦{formatCurrency(data.loans.amount)}
                      </td>

                    </tr>

                    {/* Savings */}
                    <tr className="transition-colors hover:bg-slate-50">

                      <td className="px-5 py-5 sm:px-6">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                            <PiggyBank className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              Savings (Net)
                            </p>

                            <p className="text-[11px] text-slate-500">
                              Approved deposits less withdrawals
                            </p>
                          </div>

                        </div>

                      </td>

                      <td className="px-5 py-5 text-center text-sm font-bold text-slate-700">
                        {formatNumber(data.savings.members)}
                      </td>

                      <td className="px-5 py-5 text-right text-sm font-extrabold text-slate-900 sm:px-6">
                        ₦{formatCurrency(data.savings.amount)}
                      </td>

                    </tr>

                    {/* Fixed deposits */}
                    <tr className="transition-colors hover:bg-slate-50">

                      <td className="px-5 py-5 sm:px-6">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                            <Landmark className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              Fixed Deposits
                            </p>

                            <p className="text-[11px] text-slate-500">
                              Confirmed deposits
                            </p>
                          </div>

                        </div>

                      </td>

                      <td className="px-5 py-5 text-center text-sm font-bold text-slate-700">
                        {formatNumber(data.fixedDeposits.members)}
                      </td>

                      <td className="px-5 py-5 text-right text-sm font-extrabold text-slate-900 sm:px-6">
                        ₦{formatCurrency(data.fixedDeposits.amount)}
                      </td>

                    </tr>

                  </tbody>

                </table>

              </div>

            </div>

            {/* ================================================= */}
            {/* BACK BUTTON */}
            {/* ================================================= */}

            <div className="mt-6 flex justify-center sm:justify-start">

              <Link
                href="/admin_staff/md/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-600 hover:shadow-md"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to MD Dashboard
              </Link>

            </div>

          </>

        ) : null}

      </main>

      {/* ===================================================== */}
      {/* FOOTER */}
      {/* ===================================================== */}

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


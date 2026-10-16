"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Shield,
  Loader2,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ExternalLink,
  Bell,
  LogOut,
} from "lucide-react";
import { LoanRepaymentItem } from "@/types/acknowledgeRepayment";

export default function AcknowledgeRepaymentPage() {
  const [repayments, setRepayments] = useState<LoanRepaymentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ============================================================
  // GET PENDING REPAYMENTS
  // ============================================================
  const fetchRepayments = useCallback(async () => {
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch(
        "/api/admin_staff/admin/acknowledge-repayment",
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        }
      );

      // Read as text first so an HTML error page does not cause
      // a misleading "Network error".
      const responseText = await res.text();

      let json: any = null;

      try {
        json = responseText ? JSON.parse(responseText) : null;
      } catch {
        console.error(
          "Non-JSON response from repayment API:",
          responseText.slice(0, 1000)
        );

        setStatusMessage({
          text: `Server returned an unexpected response (${res.status}). Please check the repayment API route.`,
          type: "error",
        });

        return;
      }

      if (res.ok && json?.success) {
        setRepayments(
          Array.isArray(json.pendingRepayments)
            ? json.pendingRepayments
            : []
        );

        return;
      }

      setStatusMessage({
        text:
          json?.message ||
          json?.error ||
          `Failed to load pending loan repayments. Server returned ${res.status}.`,
        type: "error",
      });
    } catch (error) {
      console.error(
        "Fetch pending repayments error:",
        error
      );

      setStatusMessage({
        text:
          "Unable to connect to the repayment service. Please check that the API route is available.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================================
  // INITIAL LOAD
  // ============================================================
  useEffect(() => {
    fetchRepayments();
  }, [fetchRepayments]);

  // ============================================================
  // ACKNOWLEDGE REPAYMENT
  // ============================================================
  const handleAcknowledge = async (
    repaymentId: number
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to acknowledge this loan repayment?"
    );

    if (!confirmed) {
      return;
    }

    setProcessingId(repaymentId);
    setStatusMessage(null);

    try {
      const res = await fetch(
        "/api/admin_staff/admin/acknowledge-repayment/action",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            ack_id: repaymentId,
          }),
        }
      );

      const responseText = await res.text();

      let json: any = null;

      try {
        json = responseText
          ? JSON.parse(responseText)
          : null;
      } catch {
        console.error(
          "Non-JSON response from acknowledgement API:",
          responseText.slice(0, 1000)
        );

        setStatusMessage({
          text: `Server returned an unexpected response (${res.status}). Please check the acknowledgement API route.`,
          type: "error",
        });

        return;
      }

      if (res.ok && json?.success) {
        setStatusMessage({
          text:
            json.message ||
            "Loan repayment acknowledged successfully.",
          type: "success",
        });

        // Remove the acknowledged repayment immediately
        setRepayments((prev) =>
          prev.filter(
            (item) =>
              Number(item.loan_repayments_id) !==
              repaymentId
          )
        );

        return;
      }

      setStatusMessage({
        text:
          json?.message ||
          json?.error ||
          `Failed to acknowledge repayment. Server returned ${res.status}.`,
        type: "error",
      });
    } catch (error) {
      console.error(
        "Acknowledge repayment error:",
        error
      );

      setStatusMessage({
        text:
          "Unable to connect to the repayment acknowledgement service.",
        type: "error",
      });
    } finally {
      setProcessingId(null);
    }
  };

  // ============================================================
  // LOGOUT
  // ============================================================
  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      window.location.href = "/admin_staff/staff";
    }
  };

  // ============================================================
  // FORMAT CURRENCY
  // ============================================================
  const formatCurrency = (
    val: number | string
  ) => {
    const numericVal =
      typeof val === "string"
        ? parseFloat(val)
        : val;

    if (!Number.isFinite(numericVal)) {
      return "0.00";
    }

    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericVal);
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans -mt-28 text-slate-900">

      {/* =========================================================
          NAVIGATION
      ========================================================= */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Logo + Portal */}
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
                Staff Portal
              </span>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">

              {repayments.length > 0 && (
                <div className="hidden md:flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">
                  <Bell className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
                  {repayments.length} Pending
                </div>
              )}

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="
                  inline-flex items-center gap-2
                  rounded-xl
                  border border-slate-200
                  px-3.5 py-2
                  text-xs font-bold
                  text-slate-700
                  hover:bg-rose-50
                  hover:text-rose-600
                  hover:border-rose-200
                  transition-colors
                  disabled:opacity-50
                "
              >
                <LogOut className="h-4 w-4" />

                <span>
                  {isLoggingOut
                    ? "Logging out..."
                    : "Logout"}
                </span>
              </button>

              <Link
                href="/admin_staff/admin/dashboard"
                className="
                  hidden sm:inline-flex
                  items-center gap-1.5
                  rounded-xl
                  border border-slate-200
                  px-3.5 py-2
                  text-xs font-semibold
                  text-slate-600
                  hover:bg-slate-100
                  hover:text-slate-900
                  transition-colors
                "
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* =========================================================
          MAIN
      ========================================================= */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 mt-2 sm:px-6 lg:px-8 space-y-6">

        {/* PAGE HEADER */}
        <div
          className="
            relative overflow-hidden
            rounded-3xl
            border border-slate-200/90
            bg-gradient-to-br
            from-slate-900
            via-slate-800
            to-slate-900
            p-6 sm:p-8
            text-white
            shadow-md
          "
        >
          <div
            className="
              absolute
              top-0 right-0
              -mt-8 -mr-8
              h-48 w-48
              rounded-full
              bg-emerald-500/10
              blur-3xl
              pointer-events-none
            "
          />

          <div className="relative z-10 max-w-3xl space-y-3">

            <div className="flex flex-wrap items-center gap-2">
              <span
                className="
                  inline-flex items-center gap-1.5
                  rounded-lg
                  bg-emerald-500/20
                  px-3 py-1
                  text-xs
                  font-semibold
                  text-emerald-300
                "
              >
                <Receipt className="h-3.5 w-3.5" />
                Loan Operations
              </span>

              <span
                className="
                  inline-flex items-center gap-1.5
                  rounded-lg
                  bg-white/10
                  px-3 py-1
                  text-xs
                  font-semibold
                  text-slate-300
                "
              >
                <Shield className="h-3.5 w-3.5" />
                Admin Acknowledgement
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Pending Loan Repayments
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Review manual payment receipts submitted by
              members and acknowledge verified loan
              repayment transactions.
            </p>
          </div>
        </div>

        {/* STATUS MESSAGE */}
        {statusMessage && (
          <div
            className={`
              rounded-2xl
              border
              p-4
              text-xs
              font-medium
              flex items-center gap-2
              shadow-xs
              ${
                statusMessage.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }
            `}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            )}

            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* LOADING */}
        {isLoading ? (
          <div
            className="
              rounded-3xl
              border border-slate-200
              bg-white
              p-20
              text-center
              text-xs
              text-slate-400
              shadow-xs
            "
          >
            <Loader2
              className="
                h-7 w-7
                animate-spin
                mx-auto
                mb-3
                text-emerald-600
              "
            />

            <p className="font-medium">
              Loading pending loan repayments...
            </p>
          </div>
        ) : (
          <div
            className="
              rounded-3xl
              border border-slate-200
              bg-white
              shadow-xs
              overflow-hidden
            "
          >

            {/* CARD HEADER */}
            <div
              className="
                px-6 py-5
                border-b border-slate-100
                flex flex-col
                sm:flex-row
                sm:items-center
                sm:justify-between
                gap-3
              "
            >
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Repayment Queue
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  {repayments.length > 0
                    ? `${repayments.length} repayment${
                        repayments.length === 1
                          ? ""
                          : "s"
                      } awaiting acknowledgement`
                    : "No repayments awaiting acknowledgement"}
                </p>
              </div>

              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-slate-100
                  px-3
                  py-2
                  text-xs
                  font-bold
                  text-slate-700
                "
              >
                <Receipt className="h-4 w-4 text-emerald-600" />
                {repayments.length} Pending
              </div>
            </div>

            {/* TABLE */}
            {repayments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">

                  <thead className="bg-slate-50">
                    <tr
                      className="
                        border-b border-slate-200
                        text-slate-500
                        uppercase
                        text-[10px]
                        tracking-wider
                      "
                    >
                      <th className="px-6 py-4 font-bold">
                        Member ID
                      </th>

                      <th className="px-6 py-4 font-bold">
                        Loan ID
                      </th>

                      <th className="px-6 py-4 font-bold">
                        Amount
                      </th>

                      <th className="px-6 py-4 font-bold">
                        Receipt
                      </th>

                      <th className="px-6 py-4 font-bold text-right">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {repayments.map((rep) => (
                      <tr
                        key={rep.loan_repayments_id}
                        className="
                          group
                          hover:bg-slate-50
                          transition-colors
                        "
                      >
                        <td className="px-6 py-4">
                          <span
                            className="
                              inline-flex
                              items-center
                              rounded-lg
                              bg-slate-100
                              px-2.5 py-1.5
                              font-mono
                              font-bold
                              text-slate-800
                            "
                          >
                            {rep.member_id}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className="
                              font-mono
                              font-semibold
                              text-slate-700
                            "
                          >
                            #{rep.loan_id}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-mono font-extrabold text-emerald-700 text-sm">
                            ₦{formatCurrency(rep.amount_paid)}
                          </div>

                          <span className="text-[10px] text-slate-400">
                            Payment Amount
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {rep.receipt_file ? (
                            <a
                              href={rep.receipt_file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="
                                inline-flex
                                items-center
                                gap-1.5
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                px-3
                                py-2
                                text-[11px]
                                font-bold
                                text-slate-700
                                hover:border-emerald-200
                                hover:bg-emerald-50
                                hover:text-emerald-700
                                transition-colors
                              "
                            >
                              <FileText className="h-3.5 w-3.5 text-emerald-600" />
                              View Receipt
                              <ExternalLink className="h-3 w-3 text-slate-400" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400">
                              No receipt
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              handleAcknowledge(
                                rep.loan_repayments_id
                              )
                            }
                            disabled={
                              processingId ===
                              rep.loan_repayments_id
                            }
                            className="
                              inline-flex
                              items-center
                              justify-center
                              gap-1.5
                              rounded-xl
                              bg-slate-900
                              px-3.5 py-2
                              text-[11px]
                              font-bold
                              text-white
                              shadow-xs
                              hover:bg-emerald-600
                              disabled:opacity-50
                              disabled:cursor-not-allowed
                              transition-colors
                            "
                          >
                            {processingId ===
                              rep.loan_repayments_id && (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            )}

                            {processingId ===
                            rep.loan_repayments_id
                              ? "Processing..."
                              : "Acknowledge"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 sm:p-16 text-center">

                <div
                  className="
                    mx-auto
                    flex
                    h-14 w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-emerald-50
                    text-emerald-600
                  "
                >
                  <CheckCircle2 className="h-7 w-7" />
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-900">
                  All repayments are up to date
                </h3>

                <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                  There are currently no pending loan repayment
                  receipts requiring acknowledgement.
                </p>

                <Link
                  href="/admin_staff/admin/dashboard"
                  className="
                    mt-5
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-xl
                    bg-slate-900
                    px-4 py-2.5
                    text-xs
                    font-bold
                    text-white
                    hover:bg-emerald-600
                    transition-colors
                  "
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Dashboard
                </Link>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div
          className="
            mx-auto
            max-w-7xl
            px-4
            text-center
            sm:px-6
            lg:px-8
          "
        >
          <div className="flex justify-center mb-2">
            <Link
              href="/admin_staff/admin/dashboard"
              className="
                inline-flex
                items-center
                gap-1.5
                text-xs
                font-semibold
                text-emerald-600
                hover:text-emerald-700
                transition-colors
              "
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Staff Dashboard
            </Link>
          </div>

          <p className="text-[11px] text-slate-500">
            &copy; 2026 DCG Multipurpose Cooperative Society Ltd.
            All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
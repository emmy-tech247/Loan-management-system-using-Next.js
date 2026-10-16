"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import FixedDepositNavbar from "@/components/navigation/FixedDepositNavbar";
import {
  ArrowLeft,
  Landmark,
  RefreshCw,
  Wallet,
  FileText,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
} from "lucide-react";

type FixedDeposit = {
  fd_id: number;
  amount_deposited: number;
  tenure_months: number;
  interest_rate: number;
  start_date: string;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  deposits?: FixedDeposit[];
};

export default function FixedDepositActionPage() {
  const router = useRouter();

  const [deposits, setDeposits] = useState<FixedDeposit[]>([]);
  const [fdId, setFdId] = useState("");
  const [actionType, setActionType] = useState("");
  const [note, setNote] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /*
   * Load active fixed deposits
   */
  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(
          "/api/member/fixed-deposit-actions",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const data: ApiResponse = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }

          throw new Error(data.message || "Failed to load fixed deposits.");
        }

        setDeposits(data.deposits || []);
      } catch (error) {
        console.error(error);

        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your fixed deposits."
        );

        setMessageType("error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeposits();
  }, [router]);

  /*
   * Submit withdrawal / rollover request
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (!fdId) {
      setMessage("Please select a fixed deposit.");
      setMessageType("error");
      return;
    }

    if (!actionType) {
      setMessage("Please select an action.");
      setMessageType("error");
      return;
    }

    if (!["withdraw", "rollover"].includes(actionType)) {
      setMessage("Invalid action selected.");
      setMessageType("error");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(
        "/api/member/fixed-deposit-actions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            fd_id: Number(fdId),
            action_type: actionType,
            note: note.trim(),
          }),
        }
      );

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }

        throw new Error(
          data.message || "Failed to submit your request."
        );
      }

      setMessage(
        data.message ||
          `Your request to ${actionType} has been submitted successfully.`
      );

      setMessageType("success");

      // Clear form
      setFdId("");
      setActionType("");
      setNote("");

      // Reload active deposits
      const refreshResponse = await fetch(
        "/api/member/fixed_deposit/rollover_option",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      if (refreshResponse.ok) {
        const refreshData: ApiResponse =
          await refreshResponse.json();

        setDeposits(refreshData.deposits || []);
      }
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to submit your request."
      );

      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
   * Logout
   */
  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  /*
   * Format Nigerian currency
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  /*
   * Format date
   */
  const formatDate = (date: string) => {
    if (!date) return "Not Set";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">

      {/* =========================================================
          NAVBAR
      ========================================================== */}
        <FixedDepositNavbar />

      {/* =========================================================
          MAIN
      ========================================================== */}
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 -mt-24 sm:px-6 lg:px-8">

        {/* Header Banner */}
        <div className="relative mb-6 overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">

          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Landmark className="h-3.5 w-3.5" />
              Fixed Deposit Management
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Fixed Deposit Action
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
              Submit a request to withdraw your active fixed deposit or
              roll it over when it reaches maturity.
            </p>
          </div>
        </div>

        {/* =====================================================
            MESSAGE
        ====================================================== */}
        {message && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 text-sm font-medium ${
              messageType === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {messageType === "success" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            )}

            <p>{message}</p>
          </div>
        )}

        {/* =====================================================
            FORM CARD
        ====================================================== */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">

          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <RefreshCw className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Withdrawal or Rollover Request
              </h2>

              <p className="text-xs text-slate-500">
                Select one of your active fixed deposits below.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* Fixed Deposit */}
            <div>
              <label
                htmlFor="fd_id"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Select Fixed Deposit
                <span className="ml-1 text-rose-500">*</span>
              </label>

              <select
                id="fd_id"
                name="fd_id"
                value={fdId}
                onChange={(e) => setFdId(e.target.value)}
                required
                disabled={isLoading || isSubmitting}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">
                  {isLoading
                    ? "Loading fixed deposits..."
                    : "-- Choose Fixed Deposit --"}
                </option>

                {deposits.map((deposit) => (
                  <option
                    key={deposit.fd_id}
                    value={deposit.fd_id}
                  >
                    #{deposit.fd_id} |{" "}
                    {formatCurrency(
                      Number(deposit.amount_deposited)
                    )}{" "}
                    | {deposit.tenure_months} months @{" "}
                    {deposit.interest_rate}%
                  </option>
                ))}
              </select>

              {!isLoading && deposits.length === 0 && (
                <p className="mt-2 text-xs text-amber-600">
                  You currently have no active fixed deposits
                  available for withdrawal or rollover.
                </p>
              )}
            </div>

            {/* Action Type */}
            <div>
              <label
                htmlFor="action_type"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Action Type
                <span className="ml-1 text-rose-500">*</span>
              </label>

              <select
                id="action_type"
                name="action_type"
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">
                  -- Choose Action --
                </option>

                <option value="withdraw">
                  Withdraw Fixed Deposit
                </option>

                <option value="rollover">
                  Rollover Fixed Deposit
                </option>
              </select>
            </div>

            {/* Note */}
            <div>
              <label
                htmlFor="note"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Instruction / Note
              </label>

              <textarea
                id="note"
                name="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={5}
                disabled={isSubmitting}
                placeholder="Add message or instruction (optional)"
                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={
                isSubmitting ||
                isLoading ||
                deposits.length === 0
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Request
                </>
              )}
            </button>
          </form>
        </div>

        {/* =====================================================
            INFORMATION CARDS
        ====================================================== */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Wallet className="h-5 w-5" />
            </div>

            <h3 className="text-sm font-bold text-slate-900">
              Withdrawal
            </h3>

            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Submit a withdrawal request for an active fixed
              deposit. Your request will be processed according to
              the cooperative&apos;s approval procedure.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <RefreshCw className="h-5 w-5" />
            </div>

            <h3 className="text-sm font-bold text-slate-900">
              Rollover
            </h3>

            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Request that your fixed deposit be rolled over
              according to the available cooperative terms.
            </p>
          </div>
        </div>
      </main>

      {/* =========================================================
          FOOTER
      ========================================================== */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} DCG Multipurpose
            Cooperative Society Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
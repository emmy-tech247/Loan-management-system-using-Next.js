"use client";

import { useState } from "react";
import LoanNavbar from "@/components/navigation/LoanNavbar";

import {
  ArrowRight,
  CheckCircle2,
  FileText,
  PiggyBank,
  WalletCards,
  Megaphone,
} from "lucide-react";

type AccountType = "loan_saver" | "loan_borrower" | "";

export default function LoanSaverBorrowerPage() {
  const [accountType, setAccountType] = useState<AccountType>("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = () => {
    setError("");

    if (!accountType) {
      setError("Please select an option.");
      return;
    }

    setIsSubmitting(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      {/* ======================================================
          NAVBAR
      ======================================================= */}

      <LoanNavbar />

      {/* ======================================================
          MAIN
      ======================================================= */}

      <main className="flex flex-1 items-center justify-center px-4 py-10 -mt-26 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">

          {/* Header / Welcome Banner */}

          <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">

            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative z-10">

              <span className="mb-3 inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Loan Services
              </span>

              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Select Loan Category
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                Choose the option that best describes your loan service
                requirement to continue with your application.
              </p>

            </div>
          </div>

          {/* ==================================================
              SELECTION CARD
          =================================================== */}

          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">

            <div className="mb-6">

              <h2 className="text-sm font-bold text-slate-900">
                What would you like to do?
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Select one of the options below and click Continue.
              </p>

            </div>

            {/* ==================================================
                OPTIONS
            =================================================== */}

            <div className="space-y-3">

              {/* Monthly Saver */}

              <label
                className={`group relative flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all ${
                  accountType === "loan_saver"
                    ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/10"
                    : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50"
                }`}
              >

                <input
                  type="radio"
                  name="account_type"
                  value="loan_saver"
                  checked={accountType === "loan_saver"}
                  onChange={() => {
                    setAccountType("loan_saver");
                    setError("");
                    setIsSubmitting(false);
                  }}
                  className="sr-only"
                />

                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    accountType === "loan_saver"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700"
                  }`}
                >
                  <PiggyBank className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">

                  <h3 className="text-sm font-bold text-slate-900">
                    Monthly Saver
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Apply as a monthly saver and access the available loan
                    services.
                  </p>

                </div>

                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    accountType === "loan_saver"
                      ? "border-emerald-600 bg-emerald-600"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {accountType === "loan_saver" && (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  )}
                </div>

              </label>

              {/* ==================================================
                  LOAN BORROWER
              =================================================== */}

              <label
                className={`group relative flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all ${
                  accountType === "loan_borrower"
                    ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/10"
                    : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50"
                }`}
              >

                <input
                  type="radio"
                  name="account_type"
                  value="loan_borrower"
                  checked={accountType === "loan_borrower"}
                  onChange={() => {
                    setAccountType("loan_borrower");
                    setError("");
                    setIsSubmitting(false);
                  }}
                  className="sr-only"
                />

                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    accountType === "loan_borrower"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700"
                  }`}
                >
                  <WalletCards className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">

                  <h3 className="text-sm font-bold text-slate-900">
                    Loan Borrower
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Continue to the loan borrower form to submit your loan
                    application.
                  </p>

                </div>

                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    accountType === "loan_borrower"
                      ? "border-emerald-600 bg-emerald-600"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {accountType === "loan_borrower" && (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  )}
                </div>

              </label>

            </div>

            {/* ==================================================
                ERROR
            =================================================== */}

            {error && (
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">

                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  !
                </span>

                {error}

              </div>
            )}

            {/* ==================================================
                CONTINUE BUTTON
            =================================================== */}

            {accountType === "loan_saver" ? (

              <a
                href="/member/loan/loan_saver_form"
                onClick={() => setIsSubmitting(true)}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-500 hover:shadow-md"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </a>

            ) : accountType === "loan_borrower" ? (

              <a
                href="/member/loan/loan_borrower_form"
                onClick={() => setIsSubmitting(true)}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-500 hover:shadow-md"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </a>

            ) : (

              <button
                type="button"
                onClick={handleContinue}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-500 hover:shadow-md"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>

            )}

            {/* ==================================================
                HELP TEXT
            =================================================== */}

            <div className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 p-4">

              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

              <p className="text-[11px] leading-5 text-slate-500">
                Select the appropriate loan category. You will be redirected
                to the corresponding form to continue your application.
              </p>

            </div>

          </div>
        </div>
      </main>

      {/* ======================================================
          FOOTER
      ======================================================= */}

      <footer className="border-t border-slate-200 bg-white py-6">

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
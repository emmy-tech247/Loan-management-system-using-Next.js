"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SavingsNavbar from "@/components/navigation/SavingsNavbar";
import {
  ArrowLeft,
  PiggyBank,
  History,
  Bell,
  Upload,
  Wallet,
  Menu,
  X,
  Save,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Banknote,
  TrendingUp,
  Info,
  ChevronRight,
} from "lucide-react";

export default function SetSavingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [autoAmount, setAutoAmount] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const currentYear = new Date().getFullYear();

  /* =========================================================
     HANDLE FORM SUBMISSION
  ========================================================= */

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    const amount = Number(autoAmount);

    /* Validate amount */
    if (!autoAmount || Number.isNaN(amount)) {
      setErrorMessage("Please enter a valid savings amount.");
      return;
    }

    if (amount < 0) {
      setErrorMessage("Savings amount cannot be negative.");
      return;
    }

    if (amount === 0) {
      setErrorMessage(
        "Please enter an amount greater than ₦0."
      );
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        "/api/member/savings/expected_contribution",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            auto_amount: amount,
          }),
        }
      );

      const responseText = await response.text();

      let data: {
        success?: boolean;
        message?: string;
        error?: string;
      };

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Failed to save monthly contribution. HTTP ${response.status}`
        );
      }

      setSuccessMessage(
        data.message ||
          "Your expected monthly contribution has been saved successfully."
      );

      /*
       * Keep the entered amount visible.
       * If you prefer to clear the form after success,
       * uncomment the following line:
       *
       * setAutoAmount("");
       */
    } catch (error) {
      console.error(
        "Set monthly savings error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save your monthly contribution."
      );
    } finally {
      setIsSaving(false);
    }
  };

  /* =========================================================
     FORMAT CURRENCY
  ========================================================= */

  const formatCurrency = (value: number) => {
    return `₦${value.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 -mt-24 flex flex-col font-sans">

      {/* =====================================================
          NAVBAR
      ===================================================== */}
        <SavingsNavbar />
      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="space-y-6">

          {/* =================================================
              HEADER
          ================================================= */}

          <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">

            <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              <div className="max-w-3xl">

                <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-300">

                  <PiggyBank className="h-4 w-4" />

                  Monthly Savings

                </div>

                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
                  Expected Monthly Contribution
                </h1>

                <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                  Set the amount you intend to contribute to your
                  monthly savings plan. You can update your expected
                  contribution whenever your financial circumstances
                  change.
                </p>

              </div>

              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-300">

                <PiggyBank className="h-10 w-10" />

              </div>

            </div>

          </section>

          {/* =================================================
              CONTENT GRID
          ================================================= */}

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">

            {/* =================================================
                FORM
            ================================================= */}

            <div className="lg:col-span-2">

              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">

                {/* Form Header */}

                <div className="mb-6 flex items-start gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

                    <Banknote className="h-5 w-5" />

                  </div>

                  <div>

                    <h2 className="text-xl font-extrabold text-slate-900">
                      Set Your Monthly Amount
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Enter the amount you expect to contribute each
                      month.
                    </p>

                  </div>

                </div>

                {/* Success Message */}

                {successMessage && (
                  <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

                    <div className="flex items-start gap-3">

                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                      <div>

                        <p className="text-sm font-bold text-emerald-800">
                          Savings Amount Saved
                        </p>

                        <p className="mt-1 text-sm text-emerald-700">
                          {successMessage}
                        </p>

                      </div>

                    </div>

                  </div>
                )}

                {/* Error Message */}

                {errorMessage && (
                  <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4">

                    <div className="flex items-start gap-3">

                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />

                      <div>

                        <p className="text-sm font-bold text-rose-800">
                          Unable to Save
                        </p>

                        <p className="mt-1 text-sm text-rose-700">
                          {errorMessage}
                        </p>

                      </div>

                    </div>

                  </div>
                )}

                {/* Form */}

                <form
                  onSubmit={handleSubmit}
                  autoComplete="off"
                  className="space-y-6"
                >

                  {/* Amount */}

                  <div>

                    <label
                      htmlFor="auto_amount"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Auto-Save Amount
                    </label>

                    <div className="relative">

                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                        ₦
                      </span>

                      <input
                        type="number"
                        name="auto_amount"
                        id="auto_amount"
                        min="0"
                        step="100"
                        required
                        value={autoAmount}
                        onChange={(event) => {
                          setAutoAmount(
                            event.target.value
                          );

                          setErrorMessage("");

                          setSuccessMessage("");
                        }}
                        placeholder="Enter monthly savings amount"
                        inputMode="decimal"
                        className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-10 pr-4 text-base font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                      />

                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      Enter an amount in multiples of ₦100.
                    </p>

                  </div>

                  {/* Preview */}

                  {autoAmount &&
                    Number(autoAmount) > 0 && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                        <div className="flex items-center justify-between gap-4">

                          <div>

                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                              Expected Monthly Contribution
                            </p>

                            <p className="mt-2 text-2xl font-extrabold text-emerald-700">
                              {formatCurrency(
                                Number(autoAmount)
                              )}
                            </p>

                          </div>

                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">

                            <Wallet className="h-5 w-5" />

                          </div>

                        </div>

                      </div>
                    )}

                  {/* Submit Button */}

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-extrabold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {isSaving ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />

                        Save Monthly Contribution
                      </>
                    )}

                  </button>

                </form>

              </div>

            </div>

            {/* =================================================
                INFORMATION CARD
            ================================================= */}

            <div className="space-y-6">

              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">

                    <Info className="h-5 w-5" />

                  </div>

                  <h2 className="text-base font-extrabold text-slate-900">
                    How It Works
                  </h2>

                </div>

                <div className="mt-5 space-y-4">

                  <InfoItem
                    number="1"
                    title="Choose an amount"
                    description="Decide how much you want to contribute every month."
                  />

                  <InfoItem
                    number="2"
                    title="Save your amount"
                    description="Submit the amount to update your expected monthly contribution."
                  />

                  <InfoItem
                    number="3"
                    title="Make contributions"
                    description="Continue making your monthly savings contributions according to your plan."
                  />

                  <InfoItem
                    number="4"
                    title="Track your savings"
                    description="Review your contribution history and transaction summaries."
                  />

                </div>

              </div>

              {/* Security Card */}

              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">

                <div className="flex items-start gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">

                    <ShieldCheck className="h-5 w-5" />

                  </div>

                  <div>

                    <h3 className="text-sm font-extrabold text-emerald-900">
                      Save Consistently
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-emerald-700">
                      Consistent monthly contributions can help you
                      build financial discipline and work toward your
                      long-term financial goals.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              QUICK LINKS
          ================================================= */}

          <section>

            <div className="mb-4">

              <h2 className="text-xl font-extrabold text-slate-900">
                Savings Management
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage and monitor your savings activities.
              </p>

            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

              <QuickLink
                href="/member/savings/monthly_contribution"
                icon={History}
                title="Monthly Contributions"
                description="View your monthly savings contribution history."
              />

              <QuickLink
                href="/member/savings/transaction_alerts"
                icon={Bell}
                title="Transaction Alerts"
                description="View savings transaction alerts and summaries."
              />

              <QuickLink
                href="/member/savings/topups_savings"
                icon={Upload}
                title="Top Up Savings"
                description="Submit a receipt for additional savings top-ups."
              />

            </div>

          </section>

        </div>

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="mt-auto border-t border-slate-200 bg-white py-6">

        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">

          <p className="text-xs font-medium text-slate-500">
            © {currentYear} DCG Multipurpose Cooperative Society Ltd.
            All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  );
}


/* =========================================================
   DESKTOP NAVIGATION
========================================================= */

function NavLink({
  href,
  children,
  active = false,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition-all ${
        active
          ? "bg-slate-900 text-white shadow-sm"
          : "text-slate-700 hover:bg-slate-100 hover:text-emerald-700"
      }`}
    >
      {children}
    </Link>
  );
}


/* =========================================================
   MOBILE NAVIGATION
========================================================= */

function MobileNavLink({
  href,
  children,
  active = false,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-bold transition-all ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-700 hover:bg-slate-100 hover:text-emerald-700"
      }`}
    >
      {children}
    </Link>
  );
}


/* =========================================================
   INFORMATION ITEM
========================================================= */

function InfoItem({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">

      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-extrabold text-emerald-700">
        {number}
      </div>

      <div>

        <h3 className="text-sm font-bold text-slate-800">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>

      </div>

    </div>
  );
}


/* =========================================================
   QUICK LINK
========================================================= */

function QuickLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >

      <div className="flex items-start justify-between gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">

          <Icon className="h-5 w-5" />

        </div>

        <ChevronRight className="h-5 w-5 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-emerald-600" />

      </div>

      <h3 className="mt-4 text-sm font-extrabold text-slate-900 group-hover:text-emerald-700">
        {title}
      </h3>

      <p className="mt-1.5 text-xs leading-5 text-slate-500">
        {description}
      </p>

    </Link>
  );
}
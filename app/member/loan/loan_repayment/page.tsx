"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LoanNavbar from "@/components/navigation/LoanNavbar";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  FileImage,
  FileText,
  Loader2,
  Receipt,
  ShieldCheck,
  Upload,
  XCircle,
} from "lucide-react";

export default function LoanRepaymentPage() {
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [loanId, setLoanId] = useState("1");
  const [receipt, setReceipt] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setError("");
    setSuccess("");

    const file = event.target.files?.[0];

    if (!file) {
      setReceipt(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      setReceipt(null);
      event.target.value = "";

      setError(
        "Invalid file type. Please upload a JPG, PNG, or PDF file."
      );

      return;
    }

    // Optional client-side size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setReceipt(null);
      event.target.value = "";

      setError("The receipt must not be larger than 5MB.");

      return;
    }

    setReceipt(file);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid repayment amount.");
      return;
    }

    if (!receipt) {
      setError("Please upload your repayment receipt.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("loan_id", loanId);
      formData.append("amount", amount);
      formData.append("receipt", receipt);

      const response = await fetch("/api/member/loan/loan_repayment", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to submit repayment."
        );
      }

      setSuccess(
        data?.message ||
          "Repayment submitted successfully!"
      );

      setAmount("");
      setReceipt(null);

      const fileInput = document.getElementById(
        "receipt"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      // Optional:
      // router.push("/member/repayment-status");
    } catch (err) {
      console.error("Repayment submission error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while submitting your repayment."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      {/* =====================================================
          Navbar
      ====================================================== */}
      <LoanNavbar />

      {/* =====================================================
          Main
      ====================================================== */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header Banner */}
          <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative z-10 max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-300">
                <Receipt className="h-4 w-4" />
                Loan Repayment
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Submit Loan Repayment
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Upload your repayment receipt and submit the amount
                you have paid. Your repayment will be reviewed by the
                cooperative.
              </p>
            </div>
          </section>

          {/* Alerts */}
          {success && (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800 shadow-sm">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

              <div>
                <p className="text-sm font-bold">
                  Repayment Submitted
                </p>

                <p className="mt-1 text-sm text-emerald-700">
                  {success}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-800 shadow-sm">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />

              <div>
                <p className="text-sm font-bold">
                  Submission Error
                </p>

                <p className="mt-1 text-sm text-rose-700">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Form */}
            <section className="lg:col-span-2">
              <form
                onSubmit={handleSubmit}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <div className="mb-7">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Banknote className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900">
                        Repayment Details
                      </h2>

                      <p className="mt-0.5 text-sm text-slate-500">
                        Enter your payment information below.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Loan ID */}
                  <div>
                    <label
                      htmlFor="loan_id"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Loan Application
                    </label>

                    <select
                      id="loan_id"
                      value={loanId}
                      onChange={(e) => setLoanId(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-xs outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="1">
                        Loan Application #1
                      </option>

                      {/* 
                        Replace these with the member's actual loans
                        fetched from your database.
                      */}
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <label
                      htmlFor="amount"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Amount Paid
                    </label>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-slate-500">
                        ₦
                      </span>

                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        required
                        min="0.01"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter repayment amount"
                        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 shadow-xs outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      Enter the exact amount shown on your payment
                      receipt.
                    </p>
                  </div>

                  {/* Receipt */}
                  <div>
                    <label
                      htmlFor="receipt"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Upload Payment Receipt
                    </label>

                    <label
                      htmlFor="receipt"
                      className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center transition-all hover:border-emerald-400 hover:bg-emerald-50/40"
                    >
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm transition-colors group-hover:bg-emerald-100 group-hover:text-emerald-600">
                        <Upload className="h-6 w-6" />
                      </div>

                      {receipt ? (
                        <>
                          <p className="text-sm font-extrabold text-slate-900">
                            {receipt.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {(receipt.size / 1024 / 1024).toFixed(
                              2
                            )}{" "}
                            MB
                          </p>

                          <span className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            File selected
                          </span>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-extrabold text-slate-900">
                            Click to upload your receipt
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            JPG, PNG or PDF — maximum 5MB
                          </p>
                        </>
                      )}

                      <input
                        type="file"
                        id="receipt"
                        name="receipt"
                        required
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Submitting Repayment...
                      </>
                    ) : (
                      <>
                        <Receipt className="h-5 w-5" />
                        Submit Repayment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            {/* Information Card */}
            <aside className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <h3 className="mt-5 text-base font-extrabold text-slate-900">
                  Secure Submission
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Your repayment information and receipt are submitted
                  securely for verification by the cooperative.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-extrabold text-slate-900">
                  Accepted Documents
                </h3>

                <div className="mt-4 space-y-3">
                  <DocumentType
                    icon={<FileImage className="h-4 w-4" />}
                    label="JPG / JPEG"
                  />

                  <DocumentType
                    icon={<FileImage className="h-4 w-4" />}
                    label="PNG"
                  />

                  <DocumentType
                    icon={<FileText className="h-4 w-4" />}
                    label="PDF"
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
                <h3 className="text-sm font-extrabold text-amber-800">
                  Important
                </h3>

                <p className="mt-2 text-xs leading-5 text-amber-700">
                  Make sure the receipt clearly shows the amount paid,
                  transaction date, and payment reference where
                  applicable.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ============================================================
   Navbar
============================================================ */

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-20 items-center justify-between gap-6 py-3">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-3"
          >
            <Image
              src="/images/logo2.png"
              alt="DCG Cooperative Logo"
              width={150}
              height={45}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 lg:flex">
            <NavLink href="/member/dashboard">
              Back
            </NavLink>

            <NavLink href="/member/loan/loan_application">
              Loan Application
            </NavLink>

            <NavLink href="/member/loan/loan_status">
              Status Tracking
            </NavLink>

            <NavLink
              href="/member/loan/loan_repayment"
              active
            >
              Loan Repayment
            </NavLink>

            <NavLink href="/member/loan/loan_repayment_status">
              Repayment Status
            </NavLink>

            <NavLink href="/member/loan/loan_report">
              Loan Report
            </NavLink>

            <NavLink href="/member/loan/loan_calculator">
              Loan Calculator
            </NavLink>
          </div>

          {/* Mobile Back */}
          <Link
            href="/member/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>

        {/* Mobile Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-3 lg:hidden">
          <MobileNavLink
            href="/member/loan/loan_application"
            label="Application"
          />

          <MobileNavLink
            href="/member/loan/loan_status"
            label="Status"
          />

          <MobileNavLink
            href="/member/loan/loan_repayment"
            label="Repayment"
            active
          />

          <MobileNavLink
            href="/member/loan/repayment_status"
            label="Repayment Status"
          />

          <MobileNavLink
            href="/member/loan/loan_report"
            label="Report"
          />

          <MobileNavLink
            href="/member/loan/loan_calculator"
            label="Calculator"
          />
        </div>
      </div>
    </nav>
  );
}

/* ============================================================
   Navigation Components
============================================================ */

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
      className={`whitespace-nowrap rounded-xl px-4 py-3 text-base font-bold transition-all ${
        active
          ? "bg-emerald-50 text-emerald-700 shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
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
      className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold ${
        active
          ? "bg-emerald-600 text-white"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {label}
    </Link>
  );
}

/* ============================================================
   Document Type
============================================================ */

function DocumentType({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
        {icon}
      </div>

      <span className="text-sm font-bold text-slate-700">
        {label}
      </span>
    </div>
  );
}

/* ============================================================
   Footer
============================================================ */

function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-6">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} DCG Multipurpose
          Cooperative Society Ltd. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
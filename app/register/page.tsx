"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  FileText,
  Info,
  Loader2,
  Upload,
  UserPlus,
  XCircle,
} from "lucide-react";

import { registerMember } from "@/app/actions/register";

type Message = {
  success: boolean;
  text: string;
} | null;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [passport, setPassport] = useState<File | null>(null);
  const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage(null);

    // Make sure required files exist
    if (!idDocument) {
      setMessage({
        success: false,
        text: "Please upload your NIN identification document.",
      });
      return;
    }

    if (!passport) {
      setMessage({
        success: false,
        text: "Please upload your passport photograph.",
      });
      return;
    }

    if (!paymentReceipt) {
      setMessage({
        success: false,
        text: "Please upload your ₦2,000 payment receipt.",
      });
      return;
    }

    setLoading(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      // Explicitly append the files.
      // This guarantees that the File objects are sent.
      formData.set("id_document", idDocument);
      formData.set("passport", passport);
      formData.set("payment_receipt", paymentReceipt);

      const result = await registerMember(formData);

      setMessage({
        success: result.success,
        text: result.message,
      });

      if (result.success) {
        form.reset();
        setIdDocument(null);
        setPassport(null);
        setPaymentReceipt(null);
      }
    } catch (error) {
      console.error("Registration error:", error);

      setMessage({
        success: false,
        text: "Something went wrong while submitting your registration. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* =========================================================
          NAVBAR
      ========================================================= */}
      <nav className="sticky top-0 z-50 -mt-24 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo2.png"
              alt="DCG Cooperative Logo"
              width={140}
              height={40}
              priority
              className="h-9 w-auto object-contain"
            />

            <span className="hidden rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white sm:inline-flex">
              MEMBER PORTAL
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />

              <span className="hidden sm:inline">
                Back Home
              </span>

              <span className="sm:hidden">
                Back
              </span>
            </Link>

            <Link
              href="/login"
              className="hidden rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 sm:inline-flex"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* =========================================================
          MAIN
      ========================================================= */}
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

        {/* =======================================================
            PAGE HEADER
        ======================================================= */}
        <section className="relative mb-6 overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">

          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl" />

          <div className="relative z-10 max-w-3xl">

            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300">
              <UserPlus className="h-5 w-5" />
            </div>

            <span className="mb-3 inline-flex rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              New Member Registration
            </span>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Become a DCG Cooperative Member
            </h1>

            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-300 sm:text-sm">
              Complete the registration form below and provide the required
              documents and payment receipt to create your membership account.
            </p>
          </div>
        </section>

        {/* =======================================================
            PAYMENT INFORMATION
        ======================================================= */}
        <section className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-xs sm:p-6">
          <div className="flex items-start gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <CreditCard className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">

              <h2 className="text-sm font-bold text-emerald-900">
                Registration Payment — ₦2,000
              </h2>

              <p className="mt-1 text-xs leading-relaxed text-emerald-800">
                Please make the required ₦2,000 registration payment before
                completing this form and upload your payment receipt below.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">

                <div className="rounded-xl border border-emerald-200 bg-white p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Account Name
                  </p>

                  <p className="mt-1 text-xs font-bold text-slate-900">
                    DCG Multipurpose Coop Soc Ltd
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-white p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Bank
                  </p>

                  <p className="mt-1 text-xs font-bold text-slate-900">
                    Monies Point MFB
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-white p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Account Number
                  </p>

                  <p className="mt-1 text-xs font-bold tracking-wide text-slate-900">
                    5489171666
                  </p>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* =======================================================
            FORM CARD
        ======================================================= */}
        <section className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-md">

          <div className="border-b border-slate-200 bg-slate-50 px-5 py-5 sm:px-8">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                <FileText className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                  Member Registration Form
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Fields marked with{" "}
                  <span className="text-rose-500">*</span>{" "}
                  are required.
                </p>
              </div>

            </div>
          </div>

          <div className="p-5 sm:p-8">

            {/* STATUS MESSAGE */}
            {message && (
              <div
                className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 ${
                  message.success
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-800"
                }`}
              >
                {message.success ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                )}

                <p className="text-sm font-medium">
                  {message.text}
                </p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              encType="multipart/form-data"
            >

              {/* =================================================
                  PERSONAL INFORMATION
              ================================================= */}
              <FormSection
                title="Personal Information"
                description="Provide your identification and personal details."
              >

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

                  <FormField label="Surname" required>
                    <input
                      type="text"
                      name="surname"
                      placeholder="Surname"
                      required
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="First Name" required>
                    <input
                      type="text"
                      name="firstname"
                      placeholder="First Name"
                      required
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Other Name">
                    <input
                      type="text"
                      name="othername"
                      placeholder="Other Name"
                      className={inputClass}
                    />
                  </FormField>

                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  <FormField
                    label="National Identification Number (NIN)"
                    required
                  >
                    <input
                      type="text"
                      name="nin"
                      placeholder="Enter your NIN"
                      required
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Password" required>
                    <input
                      type="password"
                      name="password"
                      placeholder="Create a secure password"
                      required
                      className={inputClass}
                    />
                  </FormField>

                </div>

                {/* FILE UPLOADS */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  <FileField
                    label="NIN Identification Document"
                    name="id_document"
                    required
                    file={idDocument}
                    onChange={setIdDocument}
                    accept="image/*,.pdf"
                    capture="environment"
                    description="JPG, PNG, WEBP or PDF"
                  />

                  <FileField
                    label="Passport Photograph"
                    name="passport"
                    required
                    file={passport}
                    onChange={setPassport}
                    accept="image/*"
                    capture="user"
                    description="JPG, PNG or WEBP"
                  />

                </div>
              </FormSection>

              {/* =================================================
                  ORIGIN & ADDRESS
              ================================================= */}
              <FormSection
                title="Origin & Address"
                description="Provide your state, LGA and current address information."
              >

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  <FormField label="State of Origin" required>
                    <input
                      type="text"
                      name="state_of_origin"
                      placeholder="State of Origin"
                      required
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="LGA of Origin" required>
                    <input
                      type="text"
                      name="lga_of_origin"
                      placeholder="LGA of Origin"
                      required
                      className={inputClass}
                    />
                  </FormField>

                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  <FormField label="Permanent Address" required>
                    <textarea
                      name="permanent_address"
                      rows={3}
                      placeholder="Enter your permanent address"
                      required
                      className={textareaClass}
                    />
                  </FormField>

                  <FormField label="Residential Address" required>
                    <textarea
                      name="residential_address"
                      rows={3}
                      placeholder="Enter your residential address"
                      required
                      className={textareaClass}
                    />
                  </FormField>

                </div>
              </FormSection>

              {/* =================================================
                  CONTACT
              ================================================= */}
              <FormSection
                title="Contact Information"
                description="Provide your active phone number and email address."
              >

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  <FormField label="Phone Number" required>
                    <input
                      type="tel"
                      name="phone_number"
                      placeholder="Phone Number"
                      required
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Email Address" required>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      required
                      className={inputClass}
                    />
                  </FormField>

                </div>
              </FormSection>

              {/* =================================================
                  BANK DETAILS
              ================================================= */}
              <FormSection
                title="Bank Details"
                description="Enter the bank account information associated with your membership."
              >

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

                  <FormField label="Bank Name" required>
                    <input
                      type="text"
                      name="bank_name"
                      placeholder="Bank Name"
                      required
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Account Number" required>
                    <input
                      type="text"
                      name="account_number"
                      placeholder="Account Number"
                      required
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Account Name" required>
                    <input
                      type="text"
                      name="account_name"
                      placeholder="Account Name"
                      required
                      className={inputClass}
                    />
                  </FormField>

                </div>

                <FormField label="Account Type" required>
                  <div className="flex flex-wrap gap-3">

                    {["Current", "Savings", "Other"].map((type) => (
                      <label
                        key={type}
                        className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                      >
                        <input
                          type="radio"
                          name="account_type"
                          value={type}
                          required={type === "Current"}
                          className="h-4 w-4 accent-emerald-600"
                        />

                        {type}
                      </label>
                    ))}

                  </div>
                </FormField>
              </FormSection>

              {/* =================================================
                  EMPLOYMENT
              ================================================= */}
              <FormSection
                title="Employment & Income"
                description="Tell us about your work and income."
              >

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  <FormField label="Place of Work" required>
                    <input
                      type="text"
                      name="place_of_work"
                      placeholder="Place of Work"
                      required
                      className={inputClass}
                    />
                  </FormField>

                  <FormField
                    label="Type of Business / Work"
                    required
                  >
                    <input
                      type="text"
                      name="type_of_business_work"
                      placeholder="Type of Business or Work"
                      required
                      className={inputClass}
                    />
                  </FormField>

                </div>

                <FormField label="Monthly Earnings" required>
                  <select
  name="monthly_earning"
  required
  className={selectClass}
>
  <option value="">-- Select Monthly Earnings --</option>
  <option value="100k_below">N100k and Below</option>
  <option value="100k_200k">Above N100k - N200k</option>
  <option value="200k_250k">Above N200k - N250k</option>
  <option value="250k_300k">Above N250k - N300k</option>
  <option value="300k_350k">Above N300k - N350k</option>
  <option value="400k_above">N400k and Above</option>
</select>
                </FormField>

                <FormField label="Annual Income" required>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">

                    {[
                      ["below_500k", "N500k and Below"],
                      ["500k_1m", "Above N500k - N1M"],
                      ["1m_2m", "Above N1M - N2M"],
                      ["2m_3m", "Above N2M - N3M"],
                      ["3m_4m", "Above N3M - N4M"],
                      ["4m_5m", "Above N4M - N5M"],
                      ["above_5m", "Above N5M"],
                    ].map(([value, label], index) => (
                      <label
                        key={value}
                        className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                      >
                        <input
                          type="radio"
                          name="annual_income"
                          value={value}
                          required={index === 0}
                          className="h-4 w-4 accent-emerald-600"
                        />

                        {label}
                      </label>
                    ))}

                  </div>
                </FormField>
              </FormSection>

              {/* =================================================
                  CONTRIBUTIONS
              ================================================= */}
              <FormSection
                title="Contribution & Fixed Deposit"
                description="Provide your expected contribution and fixed deposit details."
              >

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  <FormField
                    label="Expected Monthly Contribution Amount"
                    required
                  >
                    <input
                      type="number"
                      name="expected_monthly_contribution_amount"
                      placeholder="Enter amount"
                      required
                      min="0"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Fixed Deposit Amount (If Any)">
                    <input
                      type="number"
                      name="fixed_deposit_amount"
                      placeholder="Enter amount"
                      min="0"
                      className={inputClass}
                    />
                  </FormField>

                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  <FormField label="Number of Years of Fixed Deposit (If Any)">
                    <input
                      type="number"
                      name="fixed_deposit_years"
                      placeholder="Number of years"
                      min="0"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField
                    label="Start Date for Monthly Contribution"
                    required
                  >
                    <input
                      type="date"
                      name="contribution_start_date"
                      required
                      className={inputClass}
                    />
                  </FormField>

                </div>
              </FormSection>

              {/* =================================================
                  NEXT OF KIN
              ================================================= */}
              <FormSection
                title="Next of Kin Details"
                description="Provide the details of your next of kin."
              >

                <FormField
                  label="Full Name of Next of Kin"
                  required
                >
                  <input
                    type="text"
                    name="full_name_of_next_of_kin"
                    placeholder="Full Name"
                    required
                    className={inputClass}
                  />
                </FormField>

                <FormField
                  label="Address of Next of Kin"
                  required
                >
                  <textarea
                    name="address_of_next_of_kin"
                    rows={3}
                    placeholder="Address"
                    required
                    className={textareaClass}
                  />
                </FormField>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  <FormField
                    label="Phone Number of Next of Kin"
                    required
                  >
                    <input
                      type="tel"
                      name="phone_number_of_next_of_kin"
                      placeholder="Phone Number"
                      required
                      className={inputClass}
                    />
                  </FormField>

                  <FormField
                    label="Relationship with Next of Kin"
                    required
                  >
                    <input
                      type="text"
                      name="relationship_with_next_of_kin"
                      placeholder="e.g. Brother, Sister, Spouse"
                      required
                      className={inputClass}
                    />
                  </FormField>

                </div>
              </FormSection>

              {/* =================================================
                  PAYMENT RECEIPT
              ================================================= */}
              <section className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">

                <div className="mb-4 flex items-start gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
                    <Upload className="h-5 w-5" />
                  </div>

                  <div>

                    <h3 className="text-sm font-bold text-amber-900">
                      Payment Receipt
                    </h3>

                    <p className="mt-1 text-xs leading-relaxed text-amber-800">
                      Upload proof of the required ₦2,000 registration payment.
                    </p>

                  </div>
                </div>

                <FileUploadBox
                  file={paymentReceipt}
                  onChange={setPaymentReceipt}
                  accept="image/*,.pdf"
                  capture="environment"
                  title="Upload payment receipt"
                  description="JPG, PNG, WEBP or PDF"
                />

              </section>

              {/* =================================================
                  NOTICE
              ================================================= */}
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">

                <Info className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />

                <p className="text-xs leading-relaxed text-slate-600">
                  Please review all information carefully before submitting.
                  Your registration details and uploaded documents may be
                  reviewed by the cooperative before your membership is
                  approved.
                </p>

              </div>

              {/* =================================================
                  SUBMIT
              ================================================= */}
              <button
                type="submit"
                disabled={
                  !idDocument ||
                  !passport ||
                  !paymentReceipt ||
                  loading
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              >

                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Submitting Registration...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    Submit Registration
                  </>
                )}

              </button>

              {(!idDocument ||
                !passport ||
                !paymentReceipt) &&
                !loading && (
                  <p className="mt-3 text-center text-xs text-slate-500">
                    Upload your NIN document, passport photograph and
                    ₦2,000 payment receipt to enable registration.
                  </p>
                )}

            </form>
          </div>
        </section>
      </main>

      {/* =========================================================
          FOOTER
      ========================================================= */}
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

/* ==========================================================================
   STYLES
========================================================================== */

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

const textareaClass =
  "w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

const selectClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

/* ==========================================================================
   FORM SECTION
========================================================================== */

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8 border-b border-slate-100 pb-8 last:border-0">

      <div className="mb-5">

        <h3 className="text-sm font-bold text-slate-900 sm:text-base">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          {description}
        </p>

      </div>

      <div className="space-y-5">
        {children}
      </div>

    </section>
  );
}

/* ==========================================================================
   FORM FIELD
========================================================================== */

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>

      <label className="mb-2 block text-xs font-bold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-rose-500">
            *
          </span>
        )}
      </label>

      {children}

    </div>
  );
}

/* ==========================================================================
   FILE FIELD
========================================================================== */

function FileField({
  label,
  name,
  required = false,
  file,
  onChange,
  accept,
  capture,
  description,
}: {
  label: string;
  name: string;
  required?: boolean;
  file: File | null;
  onChange: (file: File | null) => void;
  accept: string;
  capture?: "user" | "environment";
  description: string;
}) {
  return (
    <FormField label={label} required={required}>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 transition hover:border-emerald-400 hover:bg-emerald-50">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-xs">
          <Upload className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">

          <p className="text-xs font-bold text-slate-700">
            {file ? file.name : "Choose file"}
          </p>

          <p className="truncate text-[10px] text-slate-400">
            {file
              ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
              : description}
          </p>

          {file && (
            <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
              <CheckCircle2 className="h-3 w-3" />
              File selected
            </span>
          )}

        </div>

        <input
          type="file"
          name={name}
          required={required}
          accept={accept}
          capture={capture}
          onChange={(e) => {
            const selectedFile = e.target.files?.[0] ?? null;
            onChange(selectedFile);
          }}
          className="sr-only"
        />

      </label>

    </FormField>
  );
}

/* ==========================================================================
   PAYMENT RECEIPT UPLOAD
========================================================================== */

function FileUploadBox({
  file,
  onChange,
  accept,
  capture,
  title,
  description,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
  accept: string;
  capture?: "user" | "environment";
  title: string;
  description: string;
}) {
  return (
    <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-amber-300 bg-white p-6 text-center transition hover:border-emerald-400 hover:bg-emerald-50">

      <input
        type="file"
        name="payment_receipt"
        required
        accept={accept}
        capture={capture}
        onChange={(e) => {
          const selectedFile = e.target.files?.[0] ?? null;
          onChange(selectedFile);
        }}
        className="sr-only"
      />

      <Upload className="mx-auto h-8 w-8 text-slate-400" />

      <p className="mt-2 text-sm font-bold text-slate-900">
        {file ? file.name : title}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {file
          ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
          : description}
      </p>

      {file && (
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Receipt ready
        </span>
      )}

    </label>
  );
}
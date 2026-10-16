"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  Building2,
  CheckCircle2,
  FileText,
  Loader2,
  ShieldCheck,
  UserRound,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";

type Member = {
  member_id: number;
  full_name: string;
};

type FormData = {
  member_id: string;

  loan_category: string;
  loan_type: string;
  purpose: string;

  loan_amount: string;
  interest_rate: string;
  tenure_month: string;

  repayment_source: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  bvn: string;

  guarantor1_name: string;
  guarantor1_phone: string;
  guarantor1_email: string;
  guarantor1_address: string;

  guarantor2_name: string;
  guarantor2_phone: string;
  guarantor2_email: string;
  guarantor2_address: string;
};

const initialForm: FormData = {
  member_id: "",

  loan_category: "monthly_saver",
  loan_type: "personal",
  purpose: "",

  loan_amount: "",
  interest_rate: "",
  tenure_month: "",

  repayment_source: "",
  bank_name: "",
  account_number: "",
  account_name: "",
  bvn: "",

  guarantor1_name: "",
  guarantor1_phone: "",
  guarantor1_email: "",
  guarantor1_address: "",

  guarantor2_name: "",
  guarantor2_phone: "",
  guarantor2_email: "",
  guarantor2_address: "",
};

export default function RelationshipOfficerLoanApplication() {
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const [form, setForm] = useState<FormData>(initialForm);

  const [receipt, setReceipt] = useState<File | null>(null);

  const [loadingMembers, setLoadingMembers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  /*
   * ---------------------------------------------------------
   * FETCH MEMBERS
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch("/api/admin_staff/members");

        if (!response.ok) {
          throw new Error("Unable to load members.");
        }

        const data = await response.json();

        setMembers(data.members || []);
      } catch (error) {
        console.error(error);
        setErrorMessage("Unable to load members.");
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, []);

  /*
   * ---------------------------------------------------------
   * FORM HANDLER
   * ---------------------------------------------------------
   */

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
   * ---------------------------------------------------------
   * CALCULATIONS
   * ---------------------------------------------------------
   */

  const calculations = useMemo(() => {
    const loanAmount = Number(form.loan_amount) || 0;
    const interestRate = Number(form.interest_rate) || 0;
    const tenure = Number(form.tenure_month) || 0;

    const totalLoan = loanAmount;

    const totalRepayment =
      loanAmount +
      loanAmount * (interestRate / 100) * tenure;

    const monthlyRepayment =
      tenure > 0 ? totalRepayment / tenure : 0;

    return {
      totalLoan,
      totalRepayment,
      monthlyRepayment,
    };
  }, [
    form.loan_amount,
    form.interest_rate,
    form.tenure_month,
  ]);

  /*
   * ---------------------------------------------------------
   * SUBMIT
   * ---------------------------------------------------------
   */

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (receipt) {
        formData.append("receipt", receipt);
      }

      const response = await fetch(
        "/api/admin_staff/relationship-officer1/loan-apply",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to submit loan application."
        );
      }

      setSuccessMessage(
        `Loan application submitted successfully. Loan ID: ${data.loan_id}`
      );

      setForm(initialForm);
      setReceipt(null);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * CURRENCY FORMAT
   * ---------------------------------------------------------
   */

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans -mt-28 text-slate-900">
      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/admin_staff/relationship-officer1/dashboard"
              className="flex items-center gap-2 text-sm font-bold text-slate-700 transition hover:text-emerald-600"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">
                Relationship Officer Dashboard
              </span>
              <span className="sm:hidden">Dashboard</span>
            </Link>

            <span className="hidden h-5 w-px bg-slate-200 sm:block" />

            <span className="hidden items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold text-white sm:inline-flex">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              Relationship Officer
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
            <FileText className="h-4 w-4" />
            New Loan
          </div>
        </div>
      </nav>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 mt-2 sm:px-6 lg:px-8">

        {/* ===================================================
            HEADER
        =================================================== */}

        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Wallet className="h-3.5 w-3.5" />
              Loan Processing
            </span>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Relationship Officer Loan Application
            </h1>

            <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
              Create and submit a new member loan application for
              review. Once submitted, the application will be forwarded
              to the Accountant for acknowledgement.
            </p>
          </div>
        </section>

        {/* ===================================================
            SUCCESS MESSAGE
        =================================================== */}

        {successMessage && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 shadow-sm">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

            <div>
              <p className="text-sm font-bold">
                Application Submitted
              </p>

              <p className="mt-1 text-xs">
                {successMessage}
              </p>

              <p className="mt-1 text-xs text-emerald-700">
                Forwarded to Accountant for acknowledgement.
              </p>
            </div>
          </div>
        )}

        {/* ===================================================
            ERROR MESSAGE
        =================================================== */}

        {errorMessage && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 shadow-sm">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />

            <div>
              <p className="text-sm font-bold">
                Application Error
              </p>

              <p className="mt-1 text-xs">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        {/* ===================================================
            FORM
        =================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* =================================================
              MEMBER
          ================================================= */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionHeader
              icon={<UserRound className="h-5 w-5" />}
              title="Member Information"
              description="Select the member applying for the loan."
            />

            <div className="mt-6">
              <label className="mb-2 block text-xs font-bold text-slate-700">
                Member
              </label>

              <select
                name="member_id"
                value={form.member_id}
                onChange={handleChange}
                required
                disabled={loadingMembers}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:bg-slate-100"
              >
                <option value="">
                  {loadingMembers
                    ? "Loading members..."
                    : "Select Member"}
                </option>

                {members.map((member) => (
                  <option
                    key={member.member_id}
                    value={member.member_id}
                  >
                    {member.full_name} (ID: {member.member_id})
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* =================================================
              LOAN DETAILS
          ================================================= */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionHeader
              icon={<Banknote className="h-5 w-5" />}
              title="Loan Details"
              description="Provide the requested facility information."
            />

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormSelect
                label="Loan Category"
                name="loan_category"
                value={form.loan_category}
                onChange={handleChange}
                required
                options={[
                  {
                    value: "monthly_saver",
                    label: "Monthly Saver",
                  },
                  {
                    value: "borrower",
                    label: "Borrower",
                  },
                ]}
              />

              <FormSelect
                label="Loan Type"
                name="loan_type"
                value={form.loan_type}
                onChange={handleChange}
                required
                options={[
                  {
                    value: "personal",
                    label: "Personal",
                  },
                  {
                    value: "business",
                    label: "Business",
                  },
                  {
                    value: "education",
                    label: "Education",
                  },
                ]}
              />

              <div className="md:col-span-2">
                <FormTextarea
                  label="Purpose"
                  name="purpose"
                  value={form.purpose}
                  onChange={handleChange}
                  placeholder="Explain the purpose of the loan..."
                  required
                />
              </div>

              <FormInput
                label="Loan Amount (₦)"
                name="loan_amount"
                type="number"
                min="0"
                step="0.01"
                value={form.loan_amount}
                onChange={handleChange}
                placeholder="0.00"
                required
              />

              <FormInput
                label="Interest Rate (%)"
                name="interest_rate"
                type="number"
                min="0"
                step="0.01"
                value={form.interest_rate}
                onChange={handleChange}
                placeholder="0.00"
                required
              />

              <FormInput
                label="Tenure (Months)"
                name="tenure_month"
                type="number"
                min="1"
                value={form.tenure_month}
                onChange={handleChange}
                placeholder="e.g. 12"
                required
              />
            </div>

            {/* ===============================================
                CALCULATION SUMMARY
            =============================================== */}

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <CalculationCard
                label="Total Loan"
                value={formatCurrency(calculations.totalLoan)}
              />

              <CalculationCard
                label="Total Repayment"
                value={formatCurrency(
                  calculations.totalRepayment
                )}
                highlight
              />

              <CalculationCard
                label="Estimated Monthly Repayment"
                value={formatCurrency(
                  calculations.monthlyRepayment
                )}
              />
            </div>
          </section>

          {/* =================================================
              REPAYMENT DETAILS
          ================================================= */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionHeader
              icon={<Building2 className="h-5 w-5" />}
              title="Repayment Details"
              description="Provide the applicant's repayment and banking information."
            />

            <div className="mt-6 space-y-5">
              <FormInput
                label="Repayment Source"
                name="repayment_source"
                type="text"
                value={form.repayment_source}
                onChange={handleChange}
                placeholder="e.g. Salary, Business Income"
                required
              />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormInput
                  label="Bank Name"
                  name="bank_name"
                  type="text"
                  value={form.bank_name}
                  onChange={handleChange}
                  placeholder="Bank name"
                  required
                />

                <FormInput
                  label="Account Number"
                  name="account_number"
                  type="text"
                  value={form.account_number}
                  onChange={handleChange}
                  placeholder="Account number"
                  required
                />

                <FormInput
                  label="Account Name"
                  name="account_name"
                  type="text"
                  value={form.account_name}
                  onChange={handleChange}
                  placeholder="Account name"
                  required
                />

                <FormInput
                  label="BVN"
                  name="bvn"
                  type="text"
                  value={form.bvn}
                  onChange={handleChange}
                  placeholder="11-digit BVN"
                  maxLength={11}
                  required
                />
              </div>
            </div>
          </section>

          {/* =================================================
              GUARANTOR 1
          ================================================= */}

          <GuarantorSection
            number="1"
            form={form}
            handleChange={handleChange}
          />

          {/* =================================================
              GUARANTOR 2
          ================================================= */}

          <GuarantorSection
            number="2"
            form={form}
            handleChange={handleChange}
          />

          {/* =================================================
              RECEIPT
          ================================================= */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionHeader
              icon={<FileText className="h-5 w-5" />}
              title="Supporting Document"
              description="Upload a receipt or supporting document if applicable."
            />

            <div className="mt-6">
              <label className="mb-2 block text-xs font-bold text-slate-700">
                Receipt
                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <input
                type="file"
                name="receipt"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) =>
                  setReceipt(e.target.files?.[0] || null)
                }
                className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 file:mr-4 file:border-0 file:bg-slate-900 file:px-4 file:py-3 file:text-xs file:font-bold file:text-white hover:file:bg-slate-800"
              />

              {receipt && (
                <p className="mt-2 text-xs text-slate-500">
                  Selected:{" "}
                  <span className="font-semibold text-slate-700">
                    {receipt.name}
                  </span>
                </p>
              )}
            </div>
          </section>

          {/* =================================================
              SUBMIT
          ================================================= */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Ready to Submit?
                </h3>

                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Confirm that all loan, banking and guarantor
                  information is correct before submitting.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Submit Loan Application
                  </>
                )}
              </button>
            </div>
          </section>
        </form>
      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} DCG Multipurpose
            Cooperative Society Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ===========================================================
   SECTION HEADER
=========================================================== */

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
        {icon}
      </div>

      <div>
        <h2 className="text-sm font-extrabold text-slate-900 sm:text-base">
          {title}
        </h2>

        <p className="mt-0.5 text-xs text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ===========================================================
   FORM INPUT
=========================================================== */

function FormInput({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  min,
  maxLength,
  step,
}: {
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  placeholder?: string;
  required?: boolean;
  min?: string;
  maxLength?: number;
  step?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-xs font-bold text-slate-700"
      >
        {label}

        {required && (
          <span className="ml-1 text-emerald-600">*</span>
        )}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        maxLength={maxLength}
        step={step}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
      />
    </div>
  );
}

/* ===========================================================
   FORM SELECT
=========================================================== */

function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => void;
  options: {
    value: string;
    label: string;
  }[];
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-xs font-bold text-slate-700"
      >
        {label}

        {required && (
          <span className="ml-1 text-emerald-600">*</span>
        )}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ===========================================================
   TEXTAREA
=========================================================== */

function FormTextarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-xs font-bold text-slate-700"
      >
        {label}

        {required && (
          <span className="ml-1 text-emerald-600">*</span>
        )}
      </label>

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={4}
        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
      />
    </div>
  );
}

/* ===========================================================
   GUARANTOR
=========================================================== */

function GuarantorSection({
  number,
  form,
  handleChange,
}: {
  number: "1" | "2";
  form: FormData;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
}) {
  const prefix =
    number === "1" ? "guarantor1" : "guarantor2";

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <SectionHeader
        icon={<Users className="h-5 w-5" />}
        title={`Guarantor ${number}`}
        description={`Provide the details for the ${
          number === "1" ? "first" : "second"
        } guarantor.`}
      />

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormInput
          label="Name"
          name={`${prefix}_name`}
          type="text"
          value={
            form[
              `${prefix}_name` as keyof FormData
            ] as string
          }
          onChange={handleChange}
          placeholder="Guarantor full name"
          required
        />

        <FormInput
          label="Phone"
          name={`${prefix}_phone`}
          type="text"
          value={
            form[
              `${prefix}_phone` as keyof FormData
            ] as string
          }
          onChange={handleChange}
          placeholder="Phone number"
          required
        />

        <FormInput
          label="Email"
          name={`${prefix}_email`}
          type="email"
          value={
            form[
              `${prefix}_email` as keyof FormData
            ] as string
          }
          onChange={handleChange}
          placeholder="Email address"
        />

        <FormInput
          label="Address"
          name={`${prefix}_address`}
          type="text"
          value={
            form[
              `${prefix}_address` as keyof FormData
            ] as string
          }
          onChange={handleChange}
          placeholder="Residential address"
          required
        />
      </div>
    </section>
  );
}

/* ===========================================================
   CALCULATION CARD
=========================================================== */

function CalculationCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <p
        className={`text-[10px] font-bold uppercase tracking-wide ${
          highlight
            ? "text-emerald-700"
            : "text-slate-500"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-extrabold ${
          highlight
            ? "text-emerald-800"
            : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
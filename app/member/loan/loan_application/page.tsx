"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LoanNavbar from "@/components/navigation/LoanNavbar";

import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  FileCheck,
  FileText,
  Home,
  Landmark,
  LogOut,
  Menu,
  Receipt,
  ShieldCheck,
  Upload,
  UserCheck,
  Users,
  Megaphone,

} from "lucide-react";

type ScheduleRow = {
  month: number;
  emi: string;
  principal: string;
  interest: string;
  balance: string;
};

export default function LoanApplicationPage() {
  const [mobileMenu, setMobileMenu] = useState(false);

  const [loanCategory, setLoanCategory] = useState("");
  const [loanType, setLoanType] = useState("personal");

  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [tenure, setTenure] = useState("");
  const [startDate, setStartDate] = useState("");

  const [receipt, setReceipt] = useState<File | null>(null);

  const [borrowerConfirm, setBorrowerConfirm] = useState(false);
  const [guarantor1Confirm, setGuarantor1Confirm] = useState(false);
  const [guarantor2Confirm, setGuarantor2Confirm] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    permanent_address: "",

    guarantor1_name: "",
    guarantor1_phone: "",
    guarantor1_email: "",
    guarantor1_address: "",

    guarantor2_name: "",
    guarantor2_phone: "",
    guarantor2_email: "",
    guarantor2_address: "",

    purpose: "",

    repayment_source: "",
    bank_name: "",
    account_number: "",
    account_name: "",
    bvn: "",

    repayment_date: "",
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* ---------------------------------------------
     TENURE
  --------------------------------------------- */

  const tenureOptions = useMemo(() => {
    const max = loanCategory === "borrower" ? 6 : 12;

    return Array.from({ length: max }, (_, index) => index + 1);
  }, [loanCategory]);

  /* ---------------------------------------------
     LOAN CALCULATION
  --------------------------------------------- */

  const calculation = useMemo(() => {
    const amount = Number(loanAmount);
    const rate = Number(interestRate) / 100;
    const months = Number(tenure);

    if (!amount || !months || Number.isNaN(rate)) {
      return {
        totalLoan: 0,
        totalRepayment: 0,
        monthlyRepayment: 0,
        schedule: [] as ScheduleRow[],
      };
    }

    let emi = 0;

    if (rate === 0) {
      emi = amount / months;
    } else {
      emi =
        (amount * rate * Math.pow(1 + rate, months)) /
        (Math.pow(1 + rate, months) - 1);
    }

    const totalRepayment = emi * months;

    let balance = amount;

    const schedule: ScheduleRow[] = [];

    for (let i = 1; i <= months; i++) {
      const interestPayment = balance * rate;
      const principalPayment =
        rate === 0 ? emi : emi - interestPayment;

      balance -= principalPayment;

      if (balance < 0) {
        balance = 0;
      }

      schedule.push({
        month: i,
        emi: emi.toFixed(2),
        principal: principalPayment.toFixed(2),
        interest: interestPayment.toFixed(2),
        balance: balance.toFixed(2),
      });
    }

    return {
      totalLoan: amount,
      totalRepayment,
      monthlyRepayment: emi,
      schedule,
    };
  }, [loanAmount, interestRate, tenure]);

  /* ---------------------------------------------
     END DATE
  --------------------------------------------- */

  const endDate = useMemo(() => {
    if (!startDate || !tenure) return "";

    const date = new Date(startDate);

    if (Number.isNaN(date.getTime())) return "";

    date.setMonth(date.getMonth() + Number(tenure));

    return date.toISOString().split("T")[0];
  }, [startDate, tenure]);

  /* ---------------------------------------------
     PROOF PAYMENT
  --------------------------------------------- */

  const requiredPayment = loanCategory === "monthly_saver" ? 1000 : 2000;

  /* ---------------------------------------------
     FORM VALIDATION
  --------------------------------------------- */

  const canSubmit =
    borrowerConfirm &&
    guarantor1Confirm &&
    guarantor2Confirm &&
    !!receipt &&
    !!loanCategory &&
    !!loanAmount &&
    !!interestRate &&
    !!tenure &&
    !!startDate;

  /* ---------------------------------------------
     SUBMIT
  --------------------------------------------- */

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!canSubmit) return;

    /*
      Replace this with your Next.js API endpoint.

      Example:

      const formData = new FormData(e.currentTarget);

      formData.append("total_loan", calculation.totalLoan.toString());
      formData.append(
        "total_repayment",
        calculation.totalRepayment.toString()
      );

      await fetch("/api/loans/apply", {
        method: "POST",
        body: formData,
      });
    */

    setSubmitted(true);
  };

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">

     <LoanNavbar />
      {/* =====================================================
          PAGE
      ===================================================== */}

      <main className="mx-auto w-full max-w-7xl px-4 py-8 -mt-24 sm:px-6 lg:px-8">

        {/* Back */}

        {/* Hero */}
        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-md sm:p-8">

          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl">

            <div className="mb-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500/15 px-3 py-2 text-xs font-bold uppercase tracking-wide text-emerald-300">
              <FileText className="h-4 w-4" />
              Credit Facility Application
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Loan Application Form
            </h1>

            <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
              Complete the application below with accurate borrower,
              guarantor, loan and repayment information.
            </p>
          </div>
        </section>

        {/* Account Information */}
        <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Landmark className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                Official Repayment Account
              </p>

              <p className="mt-1 text-sm font-extrabold text-slate-900 sm:text-base">
                DCG MULTIPURPOSE COOP. SOC. LTD
              </p>

              <p className="text-sm font-semibold text-slate-600">
                Account: 0259738951 &nbsp; • &nbsp; Bank: NIRSAL MFB
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">

            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />

            <div>
              <h3 className="font-extrabold">
                Loan application submitted successfully!
              </h3>

              <p className="mt-1 text-sm">
                Your application has been received and is awaiting processing.
              </p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="space-y-8"
        >

          {/* =====================================================
              BORROWER
          ===================================================== */}

          <FormSection
            number="01"
            title="Borrower Information"
            description="Provide your personal and contact information."
            icon={<UserCheck className="h-5 w-5" />}
          >

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              <InputField
                label="Full Name"
                name="full_name"
                required
                value={form.full_name}
                onChange={(v) => updateField("full_name", v)}
                className="md:col-span-2"
              />

              <InputField
                label="Phone Number"
                name="phone_number"
                type="tel"
                required
                value={form.phone_number}
                onChange={(v) => updateField("phone_number", v)}
              />

              <InputField
                label="Email Address"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={(v) => updateField("email", v)}
              />

              <InputField
                label="Contact / Office Address"
                name="permanent_address"
                required
                value={form.permanent_address}
                onChange={(v) => updateField("permanent_address", v)}
                className="md:col-span-2"
              />

            </div>

            <ConfirmBox
              checked={borrowerConfirm}
              onChange={setBorrowerConfirm}
              label="I, the borrower, confirm the details above."
            />

          </FormSection>

          {/* =====================================================
              GUARANTOR 1
          ===================================================== */}

          <FormSection
            number="02"
            title="First Guarantor"
            description="Provide the details of your first guarantor."
            icon={<Users className="h-5 w-5" />}
          >

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              <InputField
                label="Name"
                name="guarantor1_name"
                required
                value={form.guarantor1_name}
                onChange={(v) => updateField("guarantor1_name", v)}
              />

              <InputField
                label="Phone Number"
                name="guarantor1_phone"
                type="tel"
                required
                value={form.guarantor1_phone}
                onChange={(v) => updateField("guarantor1_phone", v)}
              />

              <InputField
                label="Email"
                name="guarantor1_email"
                type="email"
                value={form.guarantor1_email}
                onChange={(v) => updateField("guarantor1_email", v)}
              />

              <InputField
                label="Address"
                name="guarantor1_address"
                required
                value={form.guarantor1_address}
                onChange={(v) => updateField("guarantor1_address", v)}
              />

            </div>

            <ConfirmBox
              checked={guarantor1Confirm}
              onChange={setGuarantor1Confirm}
              label="First Guarantor agrees to guarantee this facility."
            />

          </FormSection>

          {/* =====================================================
              GUARANTOR 2
          ===================================================== */}

          <FormSection
            number="03"
            title="Second Guarantor"
            description="Provide the details of your second guarantor."
            icon={<Users className="h-5 w-5" />}
          >

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              <InputField
                label="Name"
                name="guarantor2_name"
                required
                value={form.guarantor2_name}
                onChange={(v) => updateField("guarantor2_name", v)}
              />

              <InputField
                label="Phone Number"
                name="guarantor2_phone"
                type="tel"
                required
                value={form.guarantor2_phone}
                onChange={(v) => updateField("guarantor2_phone", v)}
              />

              <InputField
                label="Email"
                name="guarantor2_email"
                type="email"
                value={form.guarantor2_email}
                onChange={(v) => updateField("guarantor2_email", v)}
              />

              <InputField
                label="Address"
                name="guarantor2_address"
                required
                value={form.guarantor2_address}
                onChange={(v) => updateField("guarantor2_address", v)}
              />

            </div>

            <ConfirmBox
              checked={guarantor2Confirm}
              onChange={setGuarantor2Confirm}
              label="Second Guarantor agrees to guarantee this facility."
            />

          </FormSection>

          {/* =====================================================
              LOAN DETAILS
          ===================================================== */}

          <FormSection
            number="04"
            title="Loan Details"
            description="Select the facility type and provide the requested loan amount."
            icon={<ClipboardList className="h-5 w-5" />}
          >

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              <SelectField
                label="Loan Category"
                value={loanCategory}
                required
                onChange={(v) => {
                  setLoanCategory(v);
                  setTenure("");
                }}
              >
                <option value="">-- Select Loan Category --</option>
                <option value="monthly_saver">Monthly Saver</option>
                <option value="borrower">Borrower</option>
              </SelectField>

              <SelectField
                label="Type of Facility"
                value={loanType}
                required
                onChange={setLoanType}
              >
                <option value="personal">Personal</option>
                <option value="business">Business</option>
                <option value="education">Education</option>
              </SelectField>

              <TextAreaField
                label="Purpose"
                name="purpose"
                required
                value={form.purpose}
                onChange={(v) => updateField("purpose", v)}
                className="md:col-span-2"
              />

              <InputField
                label="Amount (₦)"
                name="loan_amount"
                type="number"
                min="1000"
                required
                value={loanAmount}
                onChange={setLoanAmount}
              />

              <InputField
                label="Interest Rate (%)"
                name="interest_rate"
                type="number"
                step="0.01"
                min="0"
                required
                value={interestRate}
                onChange={setInterestRate}
              />

              <SelectField
                label="Loan Tenure"
                value={tenure}
                required
                onChange={setTenure}
              >
                <option value="">-- Select Tenure --</option>

                {tenureOptions.map((month) => (
                  <option key={month} value={month}>
                    {month} {month === 1 ? "Month" : "Months"}
                  </option>
                ))}
              </SelectField>

              <div />

              <InputField
                label="Loan Start Date"
                name="start_date"
                type="date"
                required
                value={startDate}
                onChange={setStartDate}
              />

              <InputField
                label="Loan End Date"
                name="end_date"
                type="text"
                value={endDate}
                readOnly
              />

            </div>

          </FormSection>

          {/* =====================================================
              RECEIPT
          ===================================================== */}

          <FormSection
            number="05"
            title="Proof of Payment"
            description={`Upload proof of the required ₦${requiredPayment.toLocaleString()} application payment.`}
            icon={<Upload className="h-5 w-5" />}
          >

            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition hover:border-emerald-400 hover:bg-emerald-50/40">

              <div className="flex flex-col items-center justify-center text-center">

                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <Upload className="h-6 w-6" />
                </div>

                <p className="text-base font-extrabold text-slate-900">
                  Upload Payment Receipt
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  PDF, JPG, JPEG or PNG
                </p>

                <label className="mt-5 cursor-pointer rounded-xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-700">

                  <span className="inline-flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Choose File
                  </span>

                  <input
                    type="file"
                    name="receipt"
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                    className="hidden"
                    onChange={(e) =>
                      setReceipt(e.target.files?.[0] || null)
                    }
                  />
                </label>

                {receipt && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
                    <FileCheck className="h-4 w-4" />
                    {receipt.name}
                  </div>
                )}

              </div>
            </div>

          </FormSection>

          {/* =====================================================
              SUMMARY
          ===================================================== */}

          <FormSection
            number="06"
            title="Loan Summary"
            description="Your repayment figures are calculated automatically."
            icon={<Calculator className="h-5 w-5" />}
          >

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

              <SummaryCard
                label="Total Loan"
                value={`₦${formatMoney(calculation.totalLoan)}`}
              />

              <SummaryCard
                label="Total Repayment"
                value={`₦${formatMoney(calculation.totalRepayment)}`}
                highlight
              />

              <SummaryCard
                label="Monthly Repayment"
                value={`₦${formatMoney(calculation.monthlyRepayment)}`}
              />

            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">

              <InputField
                label="Monthly Repayment Date"
                name="repayment_date"
                type="text"
                placeholder="e.g. 25th of every month"
                value={form.repayment_date}
                onChange={(v) => updateField("repayment_date", v)}
              />

            </div>

          </FormSection>

          {/* =====================================================
              AMORTIZATION
          ===================================================== */}

          {calculation.schedule.length > 0 && (
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 bg-slate-50 px-5 py-5 sm:px-7">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <Calculator className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      Amortization Schedule
                    </h2>

                    <p className="text-xs text-slate-500">
                      Estimated monthly principal and interest breakdown.
                    </p>
                  </div>

                </div>
              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[700px] text-left text-sm">

                  <thead className="bg-slate-900 text-xs font-bold uppercase tracking-wide text-white">

                    <tr>
                      <th className="px-5 py-4">Month</th>
                      <th className="px-5 py-4">EMI (₦)</th>
                      <th className="px-5 py-4">Principal (₦)</th>
                      <th className="px-5 py-4">Interest (₦)</th>
                      <th className="px-5 py-4">Balance (₦)</th>
                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {calculation.schedule.map((row) => (
                      <tr
                        key={row.month}
                        className="transition hover:bg-emerald-50/50"
                      >
                        <td className="px-5 py-4 font-bold text-slate-900">
                          {row.month}
                        </td>

                        <td className="px-5 py-4 font-semibold text-slate-700">
                          ₦{row.emi}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          ₦{row.principal}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          ₦{row.interest}
                        </td>

                        <td className="px-5 py-4 font-bold text-emerald-700">
                          ₦{row.balance}
                        </td>
                      </tr>
                    ))}

                  </tbody>

                </table>
              </div>
            </section>
          )}

          {/* =====================================================
              REPAYMENT DETAILS
          ===================================================== */}

          <FormSection
            number="07"
            title="Repayment Details"
            description="Provide the account and repayment information that will be used for servicing the facility."
            icon={<Landmark className="h-5 w-5" />}
          >

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              <SelectField
                label="Repayment Source"
                value={form.repayment_source}
                required
                onChange={(v) =>
                  updateField("repayment_source", v)
                }
              >
                <option value="">-- Select Source --</option>
                <option value="Salary">Salary</option>
                <option value="Business">Business</option>
                <option value="Others">Others</option>
              </SelectField>

              <InputField
                label="Bank"
                name="bank_name"
                required
                value={form.bank_name}
                onChange={(v) => updateField("bank_name", v)}
              />

              <InputField
                label="Account Number"
                name="account_number"
                required
                maxLength={10}
                value={form.account_number}
                onChange={(v) =>
                  updateField(
                    "account_number",
                    v.replace(/\D/g, "").slice(0, 10)
                  )
                }
              />

              <InputField
                label="Account Name"
                name="account_name"
                required
                value={form.account_name}
                onChange={(v) => updateField("account_name", v)}
              />

              <InputField
                label="Bank Verification Number (BVN)"
                name="bvn"
                required
                maxLength={11}
                placeholder="Enter 11-digit BVN"
                value={form.bvn}
                onChange={(v) =>
                  updateField(
                    "bvn",
                    v.replace(/\D/g, "").slice(0, 11)
                  )
                }
              />

            </div>

            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">

              <div className="flex gap-3">

                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                <p className="text-xs leading-6 text-amber-800">
                  Your BVN and banking information should only be submitted
                  through the official DCG Cooperative application portal.
                </p>

              </div>
            </div>

          </FormSection>

          {/* =====================================================
              SUBMIT
          ===================================================== */}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <FileCheck className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Ready to submit?
                  </h3>

                  <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                    Make sure all information provided is accurate and that
                    your payment receipt has been uploaded.
                  </p>
                </div>

              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-7 py-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              >
                <CheckCircle2 className="h-5 w-5" />
                Submit Loan Application
              </button>

            </div>

            {!canSubmit && (
              <p className="mt-4 text-xs font-semibold text-slate-400">
                Complete all required fields, confirmations and upload your
                payment receipt before submitting.
              </p>
            )}

          </section>

        </form>
      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="mt-10 border-t border-slate-200 bg-white py-8">

        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">

          <p className="text-sm font-semibold text-slate-500">
            © {new Date().getFullYear()} DCG Multipurpose Cooperative Society
            Ltd. All rights reserved.
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Credit and Investment Experts Team (CIET)
          </p>

        </div>

      </footer>
    </div>
  );
}

/* =============================================================
   COMPONENTS
============================================================= */

function MobileNavLink({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base font-bold ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function FormSection({
  number,
  title,
  description,
  icon,
  children,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-200 bg-slate-50 px-5 py-5 sm:px-7">

        <div className="flex items-start gap-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
            {icon}
          </div>

          <div className="flex-1">

            <div className="flex flex-wrap items-center gap-2">

              <span className="rounded-md bg-emerald-100 px-2 py-1 text-[10px] font-extrabold text-emerald-700">
                {number}
              </span>

              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                {title}
              </h2>

            </div>

            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
              {description}
            </p>

          </div>

        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-7">
        {children}
      </div>
    </section>
  );
}

function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  readOnly = false,
  placeholder,
  min,
  maxLength,
  step,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange?: (value: string) => void;
  required?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  min?: string;
  maxLength?: number;
  step?: string;
  className?: string;
}) {
  return (
    <div className={className}>

      <label
        htmlFor={name}
        className="mb-2 block text-sm font-bold text-slate-700"
      >
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        required={required}
        readOnly={readOnly}
        placeholder={placeholder}
        min={min}
        maxLength={maxLength}
        step={step}
        className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 ${
          readOnly
            ? "cursor-not-allowed bg-slate-100 text-slate-600"
            : "focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        }`}
      />

    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  required = false,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>

      <div className="relative">

        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        >
          {children}
        </select>

        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

      </div>
    </div>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
  required = false,
  className = "",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>

      <label
        htmlFor={name}
        className="mb-2 block text-sm font-bold text-slate-700"
      >
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        rows={4}
        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
      />

    </div>
  );
}

function ConfirmBox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
        checked
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-slate-50 hover:border-slate-300"
      }`}
    >

      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
      />

      <span className="text-sm font-bold text-slate-700">
        {label}
      </span>

    </label>
  );
}

function SummaryCard({
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
      className={`rounded-2xl border p-5 ${
        highlight
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >

      <p
        className={`text-xs font-bold uppercase tracking-wide ${
          highlight ? "text-emerald-700" : "text-slate-500"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-2 text-xl font-extrabold sm:text-2xl ${
          highlight ? "text-emerald-700" : "text-slate-900"
        }`}
      >
        {value}
      </p>

    </div>
  );
}
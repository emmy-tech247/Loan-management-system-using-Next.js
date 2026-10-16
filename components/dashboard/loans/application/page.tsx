"use client";

import { useState, useMemo, ChangeEvent, FormEvent } from "react";
import { 
  FileCheck, 
  Upload, 
  Calculator, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  FileSpreadsheet,
  Building2,
  User,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

interface AmortizationRow {
  month: number;
  emi: string;
  principal: string;
  interest: string;
  balance: string;
}

export default function LoanApplicationPage() {
  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    borrowerConfirm: false,
    
    // Guarantor 1
    guarantor1Name: "",
    guarantor1Phone: "",
    guarantor1Email: "",
    guarantor1Address: "",
    guarantor1Confirm: false,

    // Guarantor 2
    guarantor2Name: "",
    guarantor2Phone: "",
    guarantor2Email: "",
    guarantor2Address: "",
    guarantor2Confirm: false,

    // Loan details
    loanCategory: "",
    loanType: "personal",
    purpose: "",
    loanAmount: "",
    interestRate: "",
    tenureMonth: "",
    startDate: "",
    
    // Repayment & Bank
    repaymentSource: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
    bvn: "",
  });

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form Field Change Handler
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Dynamic Proof Title & Fee
  const proofFee = useMemo(() => {
    if (formData.loanCategory === "monthly_saver") return "₦1,000";
    if (formData.loanCategory === "borrower") return "₦2,000";
    return null;
  }, [formData.loanCategory]);

  // Max tenure options based on category
  const maxTenure = formData.loanCategory === "borrower" ? 6 : 12;

  // Real-time Amortization Calculation
  const { schedule, totalRepayment, monthlyEmi, calculatedEndDate } = useMemo(() => {
    const amount = parseFloat(formData.loanAmount);
    const monthlyRate = parseFloat(formData.interestRate) / 100;
    const months = parseInt(formData.tenureMonth, 10);
    const start = formData.startDate ? new Date(formData.startDate) : null;

    if (isNaN(amount) || isNaN(monthlyRate) || isNaN(months) || months <= 0 || amount <= 0) {
      return { schedule: [], totalRepayment: "0.00", monthlyEmi: "0.00", calculatedEndDate: "" };
    }

    const r = monthlyRate;
    const n = months;
    
    // Compound EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
    const emi = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = emi * n;

    let balance = amount;
    const rows: AmortizationRow[] = [];

    for (let i = 1; i <= n; i++) {
      const interestPayment = balance * r;
      const principalPayment = emi - interestPayment;
      balance -= principalPayment;
      if (balance < 0) balance = 0;

      rows.push({
        month: i,
        emi: emi.toFixed(2),
        principal: principalPayment.toFixed(2),
        interest: interestPayment.toFixed(2),
        balance: balance.toFixed(2),
      });
    }

    let endDateStr = "";
    if (start && !isNaN(start.getTime())) {
      const endDate = new Date(start);
      endDate.setMonth(endDate.getMonth() + months);
      endDateStr = endDate.toISOString().split("T")[0];
    }

    return {
      schedule: rows,
      totalRepayment: total.toFixed(2),
      monthlyEmi: emi.toFixed(2),
      calculatedEndDate: endDateStr,
    };
  }, [formData.loanAmount, formData.interestRate, formData.tenureMonth, formData.startDate]);

  // Handle Form Submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!receiptFile) {
      setSubmitMessage({ type: "error", text: "Please upload proof of payment." });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        submitData.append(key, val.toString());
      });
      submitData.append("receipt", receiptFile);
      submitData.append("totalRepayment", totalRepayment);

      // Example API Route Dispatch:
      const res = await fetch("/api/loans/apply", {
        method: "POST",
        body: submitData,
      });

      if (res.ok) {
        setSubmitMessage({ type: "success", text: "✅ Loan application submitted successfully!" });
      } else {
        const err = await res.json();
        setSubmitMessage({ type: "error", text: `❌ Submission failed: ${err.message || "Unknown error"}` });
      }
    } catch {
      setSubmitMessage({ type: "error", text: "❌ Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      {/* Top Banner Notice */}
      <div className="mx-auto max-w-4xl mb-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center text-sm font-medium text-emerald-900 shadow-sm">
        Repayment Account: <strong className="font-semibold">DCG MULTIPURPOSE COOP. SOC. LTD</strong> | Account No: <strong className="font-semibold">0259738951</strong> | Bank: <strong className="font-semibold">NIRSAL MFB</strong>
      </div>

      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-5 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Loan Application Form</h1>
            <p className="text-sm text-slate-500">Complete all required sections to request credit facility</p>
          </div>
          <Link
            href="/dashboard/loans/category"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>

        {submitMessage && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-semibold ${
              submitMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {submitMessage.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            )}
            <span>{submitMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* SECTION 1: BORROWER INFO */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <User className="h-5 w-5 text-emerald-600" /> 1. Borrower Details
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  pattern="[0-9+ ]{7,15}"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Contact/Office Address *</label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                name="borrowerConfirm"
                required
                checked={formData.borrowerConfirm}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-medium text-slate-700">I, the borrower, confirm that all details provided above are accurate.</span>
            </label>
          </section>

          {/* SECTION 2: GUARANTORS */}
          <section className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" /> 2. Guarantors Information
            </h2>

            {/* Guarantor 1 */}
            <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-800">First Guarantor</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Name *</label>
                  <input
                    type="text"
                    name="guarantor1Name"
                    required
                    value={formData.guarantor1Name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Phone No *</label>
                  <input
                    type="tel"
                    name="guarantor1Phone"
                    required
                    value={formData.guarantor1Phone}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    name="guarantor1Email"
                    value={formData.guarantor1Email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Address *</label>
                  <input
                    type="text"
                    name="guarantor1Address"
                    required
                    value={formData.guarantor1Address}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  name="guarantor1Confirm"
                  required
                  checked={formData.guarantor1Confirm}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-600">First Guarantor agrees to guarantee this loan facility.</span>
              </label>
            </div>

            {/* Guarantor 2 */}
            <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Second Guarantor</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Name *</label>
                  <input
                    type="text"
                    name="guarantor2Name"
                    required
                    value={formData.guarantor2Name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Phone No *</label>
                  <input
                    type="tel"
                    name="guarantor2Phone"
                    required
                    value={formData.guarantor2Phone}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    name="guarantor2Email"
                    value={formData.guarantor2Email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Address *</label>
                  <input
                    type="text"
                    name="guarantor2Address"
                    required
                    value={formData.guarantor2Address}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  name="guarantor2Confirm"
                  required
                  checked={formData.guarantor2Confirm}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-600">Second Guarantor agrees to guarantee this loan facility.</span>
              </label>
            </div>
          </section>

          {/* SECTION 3: LOAN PARAMETERS */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Calculator className="h-5 w-5 text-emerald-600" /> 3. Loan Parameters &amp; Proof
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Loan Category *</label>
                <select
                  name="loanCategory"
                  required
                  value={formData.loanCategory}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                >
                  <option value="" disabled>-- Select Category --</option>
                  <option value="monthly_saver">Monthly Saver</option>
                  <option value="borrower">Borrower</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Facility Type *</label>
                <select
                  name="loanType"
                  required
                  value={formData.loanType}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                >
                  <option value="personal">Personal</option>
                  <option value="business">Business</option>
                  <option value="education">Education</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Purpose of Loan *</label>
                <textarea
                  name="purpose"
                  required
                  rows={2}
                  value={formData.purpose}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Amount (₦) *</label>
                <input
                  type="number"
                  name="loanAmount"
                  min="1000"
                  required
                  value={formData.loanAmount}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Interest Rate (% / month) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="interestRate"
                  required
                  value={formData.interestRate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tenure (Months) *</label>
                <select
                  name="tenureMonth"
                  required
                  value={formData.tenureMonth}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                >
                  <option value="">-- Select Tenure --</option>
                  {Array.from({ length: maxTenure }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      {month} {month === 1 ? "Month" : "Months"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>
            </div>

            {/* Calculated End Date Output */}
            {calculatedEndDate && (
              <p className="text-xs font-medium text-slate-500">
                Calculated Maturity Date: <strong className="text-slate-800">{calculatedEndDate}</strong>
              </p>
            )}

            {/* Proof of Payment Upload */}
            <div className="rounded-xl border border-dashed border-slate-300 p-5 bg-slate-50 text-center space-y-2">
              <Upload className="mx-auto h-8 w-8 text-slate-400" />
              <p className="text-sm font-semibold text-slate-800">
                {proofFee ? `Proof of Payment (${proofFee} Application Fee)` : "Proof of Payment"}
              </p>
              <p className="text-xs text-slate-500">Upload receipt (PDF, JPG, JPEG, PNG)</p>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                required
                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
              />
            </div>
          </section>

          {/* SECTION 4: REPAYMENT & BANK DETAILS */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Building2 className="h-5 w-5 text-emerald-600" /> 4. Bank &amp; Repayment Details
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Repayment Source *</label>
                <select
                  name="repaymentSource"
                  required
                  value={formData.repaymentSource}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                >
                  <option value="" disabled>-- Select Source --</option>
                  <option value="Salary">Salary</option>
                  <option value="Business">Business</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Bank Name *</label>
                <input
                  type="text"
                  name="bankName"
                  required
                  value={formData.bankName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Account Number *</label>
                <input
                  type="text"
                  name="accountNumber"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  required
                  value={formData.accountNumber}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Account Name *</label>
                <input
                  type="text"
                  name="accountName"
                  required
                  value={formData.accountName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Bank Verification Number (BVN) *</label>
                <input
                  type="text"
                  name="bvn"
                  maxLength={11}
                  pattern="\d{11}"
                  required
                  placeholder="11-digit BVN"
                  value={formData.bvn}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>
            </div>
          </section>

          {/* AMORTIZATION SCHEDULE PREVIEW */}
          {schedule.length > 0 && (
            <section className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-600" /> Amortization Schedule Preview
                </h3>
                <div className="text-right text-xs text-slate-500">
                  Monthly EMI: <strong className="text-slate-900">₦{monthlyEmi}</strong> | Total: <strong className="text-slate-900">₦{totalRepayment}</strong>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase">
                    <tr>
                      <th className="px-4 py-3">Month</th>
                      <th className="px-4 py-3">EMI (₦)</th>
                      <th className="px-4 py-3">Principal (₦)</th>
                      <th className="px-4 py-3">Interest (₦)</th>
                      <th className="px-4 py-3">Balance (₦)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-slate-800">
                    {schedule.map((row) => (
                      <tr key={row.month} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-sans font-medium">{row.month}</td>
                        <td className="px-4 py-2.5">{row.emi}</td>
                        <td className="px-4 py-2.5">{row.principal}</td>
                        <td className="px-4 py-2.5">{row.interest}</td>
                        <td className="px-4 py-2.5">{row.balance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !receiptFile}
            className={`w-full py-4 rounded-xl text-base font-bold text-white shadow-md transition-all ${
              receiptFile && !isSubmitting
                ? "bg-emerald-600 hover:bg-emerald-500 focus:ring-4 focus:ring-emerald-200"
                : "bg-slate-300 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "Submitting Application..." : "Submit Loan Application"}
          </button>
        </form>
      </div>
    </div>
  );
}

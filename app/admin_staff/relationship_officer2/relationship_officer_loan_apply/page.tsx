"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  Loader2,
  FileText,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  User,
  Building2,
  Users,
  Send,
  LogOut,
} from "lucide-react";
import { MemberOption, LoanApplicationFormData } from "@/types/loanApplication";

export default function RelationshipOfficerLoanApplyPage() {
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ success: boolean; text: string; details?: string } | null>(null);

  const [formData, setFormData] = useState<LoanApplicationFormData>({
    member_id: "",
    loan_amount: "",
    tenure_month: "",
    interest_rate: "",
    loan_type: "personal",
    loan_category: "monthly_saver",
    purpose: "",
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
  });

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch("/api/relationship-officer2/loan-application");
        const json = await res.json();
        if (json.success) {
          setMembers(json.members || []);
        }
      } catch {
        console.error("Failed to load members list");
      } finally {
        setIsLoadingMembers(false);
      }
    }
    fetchMembers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/relationship-officer/loan-application/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setStatusMessage({
          success: true,
          text: json.message,
          details: `Loan ID: #${json.loan_id} | Member: ${json.member_name}`,
        });
        // Reset primary form fields
        setFormData((prev) => ({
          ...prev,
          loan_amount: "",
          tenure_month: "",
          interest_rate: "",
          purpose: "",
        }));
      } else {
        setStatusMessage({ success: false, text: json.message || "Failed to submit loan application." });
      }
    } catch {
      setStatusMessage({ success: false, text: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin_staff/staff/login" className="flex items-center gap-2">
                <Image
                  src="/images/logo2.png"
                  alt="Cooperative Logo"
                  width={140}
                  height={40}
                  className="h-9 w-auto object-contain"
                  priority
                />
              </Link>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold text-white">
                <Shield className="h-3 w-3 text-emerald-400" /> Officer Portal
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/admin_staff/relationship-officer2/dashboard"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-slate-500" /> Dashboard
              </Link>
              <Link
                href="/staff"
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" /> Logout
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8">
          <div className="border-b border-slate-100 pb-6 space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-50 text-emerald-600 mb-1">
              <FileText className="h-6 w-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Relationship Officer Loan Application
            </h1>
            <p className="text-xs text-slate-500">
              Complete the cooperative loan application details on behalf of the member.
            </p>
          </div>

          {statusMessage && (
            <div
              className={`rounded-2xl border p-4 text-xs font-medium space-y-1 ${
                statusMessage.success
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {statusMessage.success ? (
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                )}
                {statusMessage.text}
              </div>
              {statusMessage.details && (
                <div className="pl-6 text-[11px] font-mono opacity-90">{statusMessage.details}</div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Member Selection */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-600" /> Target Member
              </h2>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600">Select Member</label>
                <select
                  name="member_id"
                  value={formData.member_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                >
                  <option value="">-- Choose Member --</option>
                  {isLoadingMembers ? (
                    <option disabled>Loading members...</option>
                  ) : (
                    members.map((m) => (
                      <option key={m.member_id} value={m.member_id}>
                        {m.full_name} (ID: {m.member_id})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Loan Specifications */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600" /> Loan Specifications
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600">Loan Category</label>
                  <select
                    name="loan_category"
                    value={formData.loan_category}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  >
                    <option value="monthly_saver">Monthly Saver</option>
                    <option value="borrower">Borrower</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600">Loan Type</label>
                  <select
                    name="loan_type"
                    value={formData.loan_type}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  >
                    <option value="personal">Personal</option>
                    <option value="business">Business</option>
                    <option value="education">Education</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600">Purpose of Loan</label>
                <textarea
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Provide detailed purpose of loan facility..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600">Loan Amount (₦)</label>
                  <input
                    type="number"
                    name="loan_amount"
                    value={formData.loan_amount}
                    onChange={handleChange}
                    required
                    placeholder="500000"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="interest_rate"
                    value={formData.interest_rate}
                    onChange={handleChange}
                    required
                    placeholder="5.0"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600">Tenure (Months)</label>
                  <input
                    type="number"
                    name="tenure_month"
                    value={formData.tenure_month}
                    onChange={handleChange}
                    required
                    placeholder="12"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Repayment & Banking Details */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-emerald-600" /> Repayment & Banking Details
              </h2>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600">Repayment Source</label>
                <input
                  type="text"
                  name="repayment_source"
                  value={formData.repayment_source}
                  onChange={handleChange}
                  required
                  placeholder="Salary Deduction / Business Proceeds"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600">Bank Name</label>
                  <input
                    type="text"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleChange}
                    required
                    placeholder="Access Bank"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600">Account Number</label>
                  <input
                    type="text"
                    name="account_number"
                    value={formData.account_number}
                    onChange={handleChange}
                    required
                    placeholder="0123456789"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600">Account Name</label>
                  <input
                    type="text"
                    name="account_name"
                    value={formData.account_name}
                    onChange={handleChange}
                    required
                    placeholder="Olanrewaju Adebayo"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600">BVN (11 Digits)</label>
                  <input
                    type="text"
                    name="bvn"
                    maxLength={11}
                    value={formData.bvn}
                    onChange={handleChange}
                    required
                    placeholder="22233344455"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Guarantor 1 */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-600" /> First Guarantor Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600">Guarantor Name</label>
                  <input
                    type="text"
                    name="guarantor1_name"
                    value={formData.guarantor1_name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600">Phone Number</label>
                  <input
                    type="text"
                    name="guarantor1_phone"
                    value={formData.guarantor1_phone}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600">Email Address (Optional)</label>
                  <input
                    type="email"
                    name="guarantor1_email"
                    value={formData.guarantor1_email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600">Residential Address</label>
                  <input
                    type="text"
                    name="guarantor1_address"
                    value={formData.guarantor1_address}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Guarantor 2 */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-600" /> Second Guarantor Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600">Guarantor Name</label>
                  <input
                    type="text"
                    name="guarantor2_name"
                    value={formData.guarantor2_name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600">Phone Number</label>
                  <input
                    type="text"
                    name="guarantor2_phone"
                    value={formData.guarantor2_phone}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600">Email Address (Optional)</label>
                  <input
                    type="email"
                    name="guarantor2_email"
                    value={formData.guarantor2_email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600">Residential Address</label>
                  <input
                    type="text"
                    name="guarantor2_address"
                    value={formData.guarantor2_address}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 text-emerald-400" /> Submit Loan Application
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 space-y-2">
          <Link
            href="/admin_staff/staff/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout from Portal
          </Link>
          <p className="text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} DCG Multipurpose Cooperative Society Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

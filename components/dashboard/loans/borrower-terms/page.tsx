"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, CreditCard, ArrowRight, Clock } from "lucide-react";

export default function BorrowerRegistrationTermsPage() {
  const [isAccepted, setIsAccepted] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 text-slate-900">
      {/* Container / Document Sheet */}
      <main className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10 md:p-12">
        {/* Header */}
        <header className="border-b border-slate-200 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                DCG MULTIPURPOSE CO-OPERATIVE SOCIETY LTD
              </h1>
              <p className="text-sm font-medium text-emerald-700">
                Credit and Investment Experts Team (CIET)
              </p>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
                Borrowers’ Registration
              </span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <section className="mt-8 space-y-8 text-sm leading-relaxed text-slate-700">
          <div>
            <p className="font-semibold text-slate-900">Dear Sir/Madam,</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 uppercase">
              Borrowers’ Registration for Offer of Credit Facility
            </h2>
            <p className="mt-2 text-slate-600">
              We hereby inform that the Credit and Investment Experts Team (CIET) of DCG Multipurpose Co-operative Society Ltd will approve your registration as a borrower’s client as you fulfill the following terms and conditions:
            </p>
          </div>

          <hr className="border-slate-200" />

          {/* Section 1 */}
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">
              1. Payment of Application Fee
            </h3>
            <p className="rounded-lg bg-amber-50 p-4 text-amber-900 border border-amber-200">
              Every Borrower is expected to make payment of an application fee of{" "}
              <strong className="font-bold">₦2,000.00</strong> and upload the proof of payment made while filling the loan application form.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-900">
              2. Facility Details
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-xl bg-slate-50 p-4 border border-slate-200">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase">Lender</span>
                <p className="font-medium text-slate-900">CIET of DCG Multipurpose Co-operative Society Ltd</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase">Repayment Account</span>
                <p className="font-medium text-slate-900">DCG Multipurpose Co-op. Soc. Ltd</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase">Bank</span>
                <p className="font-medium text-slate-900 flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-emerald-600" />
                  NIRSAL MFB
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase">Account No.</span>
                <p className="font-medium text-slate-900 flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  0259738951
                </p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">Maximum Loan Tenor</span>
                <p className="font-medium text-slate-900 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  6 Months
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-6">
            <h3 className="text-base font-bold text-slate-900">
              3. Terms &amp; Conditions
            </h3>

            {/* 3.1 */}
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900">3.1 Fees &amp; Interest Rates</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li><strong className="text-slate-800">Standard Rate:</strong> 10% per month.</li>
                <li><strong className="text-slate-800">Tiered Rates:</strong> 19% @ Two months, 27% @ Three months, 34% @ Four months, 40% @ Five months, 45% @ Six months.</li>
                <li><strong className="text-slate-800">Default Rate:</strong> 12% per month on overdue installments.</li>
                <li>Includes: interest, admin charges, servicing fees, office expenses, calls, SMS, etc.</li>
              </ul>
            </div>

            {/* 3.2 */}
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-900">3.2 Credit Check &amp; Appraisal Fee</h4>
              <p className="text-slate-600">
                <strong className="text-slate-800">3% flat, non-refundable</strong>, payable upfront upon acceptance.
              </p>
            </div>

            {/* 3.3 */}
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-900">3.3 Default Clause</h4>
              <p className="text-slate-600">
                <strong className="text-slate-800">10% penalty</strong> on due installment if unpaid at due date, plus <strong className="text-slate-800">0.4% per day (12% monthly)</strong> until settled.
              </p>
            </div>

            {/* 3.4 */}
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-900">3.4 Accelerated Clause</h4>
              <p className="text-slate-600">
                If default persists beyond <strong className="text-slate-800">5 days</strong>, the entire loan becomes immediately due. Recovery may include repossession, guarantor enforcement, or legal action.
              </p>
            </div>

            {/* 3.5 */}
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-900">3.5 Repossession Clause</h4>
              <p className="text-slate-600">
                CIET may repossess collateral <strong className="text-slate-800">without notice or legal process</strong>.
              </p>
            </div>

            {/* 3.6 */}
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-900">3.6 Deficiency Clause</h4>
              <p className="text-slate-600">
                If repossessed collateral is insufficient, borrower must pay balance within <strong className="text-slate-800">30 days</strong>. Otherwise, legal remedies apply.
              </p>
            </div>

            {/* 3.7 */}
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-900">3.7 Repayment Terms</h4>
              <p className="text-slate-600">
                Equal monthly repayment of principal &amp; interest. <strong className="text-slate-800">10% default + 0.4% daily interest</strong> applies beyond maturity.
              </p>
            </div>

            {/* 3.8 */}
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-900">3.8 Repayment Channel</h4>
              <p className="text-slate-600">
                All repayments must be made <strong className="text-slate-800">only</strong> to the designated repayment account. Payments to agents are at borrower’s risk.
              </p>
            </div>

            {/* 3.9 */}
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-900">3.9 Security</h4>
              <p className="text-slate-600">
                Guarantor is jointly liable in case of borrower’s default or death. Assets may be seized and auctioned to recover debt.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-900">
              4. Other Conditions
            </h3>
            <ol className="list-decimal pl-5 space-y-2 text-slate-600">
              <li>CIET may securitize, syndicate, or assign its interest in this facility.</li>
              <li>Borrower bears legal fees, taxes, and recovery expenses.</li>
              <li>Borrower authorizes CBN, banks, employers, guarantors, courts, and authorities to recover obligations from any assets.</li>
              <li>Borrower waives all defenses to repayment, including confidentiality, usury, or lack of consideration.</li>
              <li>Borrower affirms that joint/mutual account holders consent to deductions for recovery.</li>
              <li>Borrower consents to CIET seizing funds/assets in joint ownership.</li>
              <li>This loan offer and conditions have been read, understood, and voluntarily accepted.</li>
            </ol>
          </section>

          <hr className="border-slate-200" />

          {/* Acknowledgement & Acceptance */}
          <section className="rounded-xl bg-slate-50 p-6 border border-slate-200 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Acknowledgement &amp; Acceptance
              </h3>
              <p className="mt-1 text-slate-600">
                I/We hereby confirm acceptance of this facility and the terms herein.
              </p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAccepted}
                onChange={(e) => setIsAccepted(e.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 transition cursor-pointer"
              />
              <span className="font-semibold text-slate-800">
                Click to proceed with registration
              </span>
            </label>

            <div className="pt-2 text-center sm:text-right">
              <Link
                href="/dashboard/loans/application"
                tabIndex={isAccepted ? 0 : -1}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold shadow-sm transition-all ${
                  isAccepted
                    ? "bg-emerald-600 text-white hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed pointer-events-none"
                }`}
              >
                <span>Apply for Loan</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

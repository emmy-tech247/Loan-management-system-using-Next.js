"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Building2, CreditCard, ShieldAlert, ArrowRight } from "lucide-react";

export default function CreditFacilityOfferPage() {
  const [isAccepted, setIsAccepted] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 text-slate-900">
      {/* Paper Sheet Wrapper */}
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
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                Offer of Credit Facility
              </span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <section className="mt-8 space-y-8 text-sm leading-relaxed text-slate-700">
          <div>
            <p className="font-semibold text-slate-900">Dear Sir/Madam,</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Offer of Credit Facility
            </h2>
            <p className="mt-2 text-slate-600">
              We are pleased to inform you that the Credit and Investment Experts Team (CIET) of DCG Multipurpose Co-operative Society Ltd will approve your request for a credit facility under the following terms and conditions:
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
              <strong className="font-bold">₦1,000.00</strong> and upload the proof of payment made while filling the loan application form.
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
                <p className="font-medium text-slate-900">DCG Multipurpose Co-operative Society Ltd</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase">Bank</span>
                <p className="font-medium text-slate-900 flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-emerald-600" />
                  Nirsal MFB
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
                <span className="text-xs font-semibold text-slate-500 uppercase">Disbursement</span>
                <p className="font-medium text-slate-900">
                  Facility will be disbursed upon satisfactory compliance with all preconditions.
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
              <h4 className="font-semibold text-slate-900">3.1 Loan Tenor &amp; Interest</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li><strong className="text-slate-800">Loan Tenor:</strong> Standard duration based on selection</li>
                <li><strong className="text-slate-800">Monthly Fees &amp; Interest Rates:</strong></li>
              </ul>
              <ul className="ml-6 list-circle space-y-1 rounded-lg bg-slate-50 p-3 text-slate-700 border border-slate-200">
                <li>Within Savings – <strong>2%</strong></li>
                <li>2 times Savings – <strong>3%</strong></li>
                <li>3 times Savings – <strong>4%</strong></li>
                <li>4 times Savings – <strong>5%</strong></li>
                <li>5 times &amp; Above Savings – <strong>6%</strong></li>
                <li>Capital set aside to service monthly interest until capital refund – <strong>7%</strong></li>
              </ul>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li><strong className="text-slate-800">Default Rate:</strong> 6% per month on overdue installments.</li>
                <li><strong className="text-slate-800">Fees include:</strong> interest, administrative charges, servicing fees, office expenses, calls, SMS, etc.</li>
                <li className="italic text-slate-500">Note: For one-month loans, fees &amp; interest are deducted upfront.</li>
              </ul>
            </div>

            {/* 3.2 */}
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-900">3.2 Credit Check &amp; Appraisal Fee</h4>
              <p className="text-slate-600">
                A <strong className="text-slate-800">2% flat, non-refundable fee</strong> payable upfront upon acceptance of this offer.
              </p>
            </div>

            {/* 3.3 */}
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-900">3.3 Default Clause</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Late repayment attracts a <strong className="text-slate-800">5% flat penalty</strong> on the due installment.</li>
                <li>Outstanding balances accrue <strong className="text-slate-800">0.2% per day (6% monthly)</strong> until fully settled.</li>
              </ul>
            </div>

            {/* 3.4 */}
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-900">3.4 Accelerated Clause</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>If default persists beyond <strong className="text-slate-800">5 days</strong>, the entire loan balance becomes immediately due and payable.</li>
                <li>CIET may enforce recovery through collateral repossession, guarantor enforcement, or legal proceedings.</li>
              </ul>
            </div>

            {/* 3.5 */}
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-900">3.5 Repossession Clause</h4>
              <p className="text-slate-600">
                CIET may repossess collateral in the event of default <strong className="text-slate-800">without prior notice or legal process</strong>.
              </p>
            </div>

            {/* 3.6 */}
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-900">3.6 Deficiency Clause</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>If repossessed collateral is insufficient to clear the debt, borrower must settle the deficiency within <strong className="text-slate-800">30 days</strong>.</li>
                <li>CIET reserves the right to pursue legal action for recovery.</li>
              </ul>
            </div>

            {/* 3.7 */}
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-900">3.7 Repayment Terms</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Equal, consecutive monthly repayment of principal &amp; interest until maturity.</li>
                <li><strong className="text-slate-800">Default Penalty:</strong> 10% charge + <strong className="text-slate-800">0.4% daily interest</strong> beyond maturity.</li>
              </ul>
            </div>

            {/* 3.8 */}
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-900">3.8 Repayment Channel</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>All repayments must be made <strong className="text-slate-800">only</strong> into the designated repayment account above.</li>
                <li>Borrower bears all risks associated with payments to third parties or unauthorized accounts.</li>
              </ul>
            </div>

            {/* 3.9 */}
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-900">3.9 Security</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Guarantor shall be jointly liable in case of borrower’s default or death.</li>
                <li>Borrower &amp; guarantor consent that assets may be seized and auctioned to recover outstanding obligations.</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-900">
              4. Other Conditions
            </h3>
            <ol className="list-decimal pl-5 space-y-2 text-slate-600">
              <li>CIET reserves the right to securitize, syndicate, or assign its interest in this facility.</li>
              <li>Borrower shall bear all legal fees, taxes, and recovery-related expenses.</li>
              <li>Borrower authorizes CBN, banks, employers, guarantors, courts, and relevant authorities to recover obligations from any accounts/assets.</li>
              <li>Borrower waives all defenses to repayment, including confidentiality, usury, or lack of consideration.</li>
              <li>Borrower affirms that joint/mutual account holders consent to deductions for loan recovery.</li>
              <li>Borrower consents to CIET seizing funds/assets in joint ownership to recover obligations.</li>
              <li>Borrower confirms this offer has been read, understood, and voluntarily accepted.</li>
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
                Click to confirm and proceed to loan application
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

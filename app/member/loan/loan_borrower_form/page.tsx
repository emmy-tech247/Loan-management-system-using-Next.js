"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import LoanNavbar from "@/components/navigation/LoanNavbar";
import {
  ArrowLeft,
  CheckCircle2,
  FileCheck,
  Landmark,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  ChevronRight,
  Megaphone,
} from "lucide-react";

export default function LoanBorrowerFormPage() {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar */}
      <LoanNavbar />

      {/* Main */}
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 -mt-24 lg:px-8 lg:py-10">
        {/* Header Banner */}
        <div className="relative mb-6 overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">
          {/* Decorative backgrounds */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-emerald-400/5 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                <FileCheck className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  Credit & Investment Experts Team
                </p>

                <p className="text-xs text-slate-400">
                  DCG Multipurpose Co-operative Society Ltd
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Borrowers' Registration
            </span>

            <h1 className="mt-4 max-w-3xl text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
              BORROWERS' REGISTRATION FOR OFFER OF CREDIT FACILITY
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              We hereby inform that the Credit and Investment Experts Team
              (CIET) of DCG Multipurpose Co-operative Society Ltd will approve
              your registration as a borrower's client as you fulfill the
              following terms and conditions.
            </p>
          </div>
        </div>

        {/* Document */}
        <article className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm">
          <div className="p-5 sm:p-8 lg:p-10">
            {/* Greeting */}
            <div className="mb-6">
              <p className="text-sm font-bold text-slate-900">
                Dear Sir/Madam,
              </p>
            </div>

            {/* Notice */}
            <div className="mb-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 sm:p-5">
              <div className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                <p className="text-sm leading-6 text-emerald-900">
                  Please carefully review the terms and conditions below
                  before proceeding with your borrower registration.
                </p>
              </div>
            </div>

            <div className="mb-8 h-px bg-slate-200" />

            {/* Section 1 */}
            <section className="mb-8">
              <SectionHeading
                number="1"
                title="Payment of Application Fee"
                icon={<CreditCard className="h-4 w-4" />}
              />

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <p className="text-sm leading-7 text-slate-600">
                  Every Borrower is Expected to Make Payment of Application
                  fee of{" "}
                  <strong className="font-extrabold text-slate-900">
                    N2,000.00
                  </strong>{" "}
                  and upload the proof of payment made while filling the loan
                  application form.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="mb-8">
              <SectionHeading
                number="2"
                title="Facility Details"
                icon={<Landmark className="h-4 w-4" />}
              />

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="grid grid-cols-1 divide-y divide-slate-200 md:grid-cols-[220px_1fr] md:divide-y-0">
                  <DetailRow
                    label="Lender"
                    value="CIET of DCG Multipurpose Co-operative Society Ltd"
                  />

                  <DetailRow
                    label="Repayment Account"
                    value="DCG Multipurpose Co-op. Soc. Ltd"
                  />

                  <DetailRow label="Bank" value="NIRSAL MFB" />

                  <DetailRow label="Account No." value="0259738951" />

                  <DetailRow
                    label="Maximum Loan Tenor"
                    value="6 Months"
                  />
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="mb-8">
              <SectionHeading
                number="3"
                title="Terms & Conditions"
                icon={<ShieldCheck className="h-4 w-4" />}
              />

              <div className="space-y-7">
                <TermsBlock title="3.1 Fees & Interest Rates">
                  <ul className="space-y-2.5 text-sm leading-7 text-slate-600">
                    <li className="flex gap-2">
                      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <span>
                        <strong className="text-slate-900">
                          10% per month.
                        </strong>
                      </span>
                    </li>

                    <li className="flex gap-2">
                      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <span>
                        <strong className="text-slate-900">
                          19% @ Two months, 27% @ Three months, 34% @ Four
                          months, 40% @ Five months, 45% @ Six months.
                        </strong>
                      </span>
                    </li>

                    <li className="flex gap-2">
                      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <span>
                        Default:{" "}
                        <strong className="text-slate-900">
                          12% per month
                        </strong>{" "}
                        on overdue installments.
                      </span>
                    </li>

                    <li className="flex gap-2">
                      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <span>
                        Includes: interest, admin charges, servicing fees,
                        office expenses, calls, SMS, etc.
                      </span>
                    </li>
                  </ul>
                </TermsBlock>

                <TermsBlock title="3.2 Credit Check & Appraisal Fee">
                  <p className="text-sm leading-7 text-slate-600">
                    <strong className="text-slate-900">3% flat</strong>,
                    non-refundable, payable upfront upon acceptance.
                  </p>
                </TermsBlock>

                <TermsBlock title="3.3 Default Clause">
                  <p className="text-sm leading-7 text-slate-600">
                    <strong className="text-slate-900">10% penalty</strong>{" "}
                    on due installment if unpaid at due date, plus{" "}
                    <strong className="text-slate-900">
                      0.4% per day (12% monthly)
                    </strong>{" "}
                    until settled.
                  </p>
                </TermsBlock>

                <TermsBlock title="3.4 Accelerated Clause">
                  <p className="text-sm leading-7 text-slate-600">
                    If default persists beyond{" "}
                    <strong className="text-slate-900">5 days</strong>, the
                    entire loan becomes immediately due. Recovery may include
                    repossession, guarantor enforcement, or legal action.
                  </p>
                </TermsBlock>

                <TermsBlock title="3.5 Repossession Clause">
                  <p className="text-sm leading-7 text-slate-600">
                    CIET may repossess collateral without notice or legal
                    process.
                  </p>
                </TermsBlock>

                <TermsBlock title="3.6 Deficiency Clause">
                  <p className="text-sm leading-7 text-slate-600">
                    If repossessed collateral is insufficient, borrower must
                    pay the balance within{" "}
                    <strong className="text-slate-900">30 days</strong>.
                    Otherwise, legal remedies apply.
                  </p>
                </TermsBlock>

                <TermsBlock title="3.7 Repayment Terms">
                  <p className="text-sm leading-7 text-slate-600">
                    Equal monthly repayment of principal & interest.{" "}
                    <strong className="text-slate-900">
                      10% default + 0.4% daily interest
                    </strong>{" "}
                    applies beyond maturity.
                  </p>
                </TermsBlock>

                <TermsBlock title="3.8 Repayment Channel">
                  <p className="text-sm leading-7 text-slate-600">
                    All repayments must be made{" "}
                    <strong className="text-slate-900">only</strong> to the
                    designated repayment account. Payments to agents are at
                    borrower's risk.
                  </p>
                </TermsBlock>

                <TermsBlock title="3.9 Security">
                  <p className="text-sm leading-7 text-slate-600">
                    Guarantor is jointly liable in case of borrower's default
                    or death. Assets may be seized and auctioned to recover
                    debt.
                  </p>
                </TermsBlock>
              </div>
            </section>

            {/* Section 4 */}
            <section className="mb-8">
              <SectionHeading
                number="4"
                title="Other Conditions"
                icon={<AlertTriangle className="h-4 w-4" />}
              />

              <ol className="space-y-3">
                {[
                  "CIET may securitize, syndicate, or assign its interest in this facility.",
                  "Borrower bears legal fees, taxes, and recovery expenses.",
                  "Borrower authorizes CBN, banks, employers, guarantors, courts, and authorities to recover obligations from any assets.",
                  "Borrower waives all defenses to repayment, including confidentiality, usury, or lack of consideration.",
                  "Borrower affirms that joint/mutual account holders consent to deductions for recovery.",
                  "Borrower consents to CIET seizing funds/assets in joint ownership.",
                  "This loan offer and conditions have been read, understood, and voluntarily accepted.",
                ].map((condition, index) => (
                  <li
                    key={index}
                    className="flex gap-3 text-sm leading-7 text-slate-600"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                      {index + 1}
                    </span>

                    <span>{condition}</span>
                  </li>
                ))}
              </ol>
            </section>

            <div className="my-8 h-px bg-slate-200" />

            {/* Acknowledgement */}
            <section>
              <div className="mb-5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Final Step
                </span>

                <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                  Acknowledgement & Acceptance
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  I/We hereby confirm acceptance of this facility and the
                  terms herein.
                </p>
              </div>

              {/* Acceptance checkbox */}
              <label
                className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all sm:p-5 ${
                  accepted
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-slate-200 bg-slate-50 hover:border-emerald-200 hover:bg-emerald-50/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                />

                <div>
                  <p
                    className={`text-sm font-bold ${
                      accepted ? "text-emerald-800" : "text-slate-900"
                    }`}
                  >
                    Click to proceed with registration
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    By checking this box, you confirm that you have read,
                    understood, and accepted the terms and conditions above.
                  </p>
                </div>
              </label>

              {/* Apply button */}
              <div className="mt-6 flex justify-center">
                {accepted ? (
                  <Link
                    href="/member/loan/loan_application"
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-500 hover:shadow-md sm:w-auto"
                  >
                    Apply for Loan
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 px-6 py-3.5 text-sm font-bold text-slate-400 sm:w-auto"
                  >
                    Apply for Loan
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>

              {!accepted && (
                <p className="mt-3 text-center text-xs text-slate-400">
                  Please accept the terms above to continue.
                </p>
              )}
            </section>
          </div>
        </article>
      </main>

      {/* Footer */}
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

/* -------------------------------------------------------------------------- */
/* Reusable Components                                                        */
/* -------------------------------------------------------------------------- */

function SectionHeading({
  number,
  title,
  icon,
}: {
  number: string;
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
        {icon}
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
          Section {number}
        </p>

        <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">
          {title}
        </h2>
      </div>
    </div>
  );
}

function TermsBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5">
      <h3 className="mb-2 text-sm font-extrabold text-slate-900">{title}</h3>

      {children}
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <>
      <div className="bg-slate-50 px-4 py-3 text-xs font-bold text-slate-600 md:border-r md:border-slate-200">
        {label}
      </div>

      <div className="px-4 py-3 text-sm leading-6 text-slate-700">
        {value}
      </div>
    </>
  );
}
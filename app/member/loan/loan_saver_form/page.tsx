"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LoanNavbar from "@/components/navigation/LoanNavbar";
import {
  ArrowLeft,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  Wallet,
  Megaphone,
} from "lucide-react";

export default function LoanSaverFormPage() {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar */}
      <LoanNavbar />

      {/* Main */}
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Document */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-md">
          {/* Header */}
          <header className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-8 text-white sm:px-8 lg:px-10">
            {/* Decorative elements */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-emerald-400/5 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xl font-extrabold tracking-tight sm:text-2xl">
                  DCG MULTIPURPOSE CO-OPERATIVE
                  <br className="hidden sm:block" />
                  SOCIETY LTD
                </div>

                <p className="mt-2 text-xs font-medium text-slate-300 sm:text-sm">
                  Credit and Investment Experts Team (CIET)
                </p>

                <span className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-300">
                  <FileCheck className="h-3.5 w-3.5" />
                  Offer of Credit Facility
                </span>
              </div>

              <div className="hidden shrink-0 rounded-2xl border border-white/10 bg-white/5 p-3 sm:block">
                <Image
                  src="/images/logo2.png"
                  alt="DCG Logo"
                  width={120}
                  height={50}
                  className="h-12 w-auto object-contain"
                />
              </div>
            </div>
          </header>

          {/* Content */}
          <article className="px-5 py-8 sm:px-8 lg:px-10">
            {/* Greeting */}
            <div className="mb-8">
              <p className="text-sm font-bold text-slate-900">
                Dear Sir/Madam,
              </p>

              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Offer of Credit Facility
              </h1>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                We are pleased to inform you that the Credit and Investment
                Experts Team (CIET) of DCG Multipurpose Co-operative Society
                Ltd will approve your request for a credit facility under the
                following terms and conditions:
              </p>
            </div>

            <div className="my-8 h-px bg-slate-200" />

            {/* 1. Application Fee */}
            <section className="mb-8">
              <SectionHeading number="1" title="Payment of Application Fee" />

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <Wallet className="h-4 w-4" />
                  </div>

                  <p className="text-sm leading-7 text-slate-700">
                    Every Borrower is expected to make payment of an
                    application fee of{" "}
                    <strong className="font-extrabold text-slate-900">
                      N1,000.00
                    </strong>{" "}
                    and upload the proof of payment made while filling the
                    loan application form.
                  </p>
                </div>
              </div>
            </section>

            {/* 2. Facility Details */}
            <section className="mb-8">
              <SectionHeading number="2" title="Facility Details" />

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="grid grid-cols-1 divide-y divide-slate-200 sm:grid-cols-[190px_1fr] sm:divide-x sm:divide-y-0">
                  <DetailRow
                    label="Lender"
                    value="CIET of DCG Multipurpose Co-operative Society Ltd"
                  />

                  <DetailRow
                    label="Repayment Account"
                    value="DCG Multipurpose Co-operative Society Ltd"
                  />

                  <DetailRow label="Bank" value="Nirsal MFB" />

                  <DetailRow label="Account No." value="0259738951" />

                  <DetailRow
                    label="Disbursement"
                    value="Facility will be disbursed upon satisfactory compliance with all preconditions."
                  />
                </div>
              </div>
            </section>

            {/* 3. Terms & Conditions */}
            <section className="mb-8">
              <SectionHeading number="3" title="Terms & Conditions" />

              {/* 3.1 */}
              <TermsBlock title="3.1 Loan Tenor & Interest">
                <ul className="space-y-2 text-sm leading-6 text-slate-600">
                  <li>
                    <strong className="text-slate-900">Loan Tenor:</strong>{" "}
                    [Insert Months]
                  </li>

                  <li>
                    <strong className="text-slate-900">
                      Monthly Fees & Interest Rates:
                    </strong>
                  </li>
                </ul>

                <div className="mt-3 rounded-xl bg-slate-50 p-4">
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                      <span>Within Savings</span>
                      <strong className="text-emerald-700">2%</strong>
                    </li>

                    <li className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                      <span>2 times Savings</span>
                      <strong className="text-emerald-700">3%</strong>
                    </li>

                    <li className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                      <span>3 times Savings</span>
                      <strong className="text-emerald-700">4%</strong>
                    </li>

                    <li className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                      <span>4 times Savings</span>
                      <strong className="text-emerald-700">5%</strong>
                    </li>

                    <li className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                      <span>5 times & Above Savings</span>
                      <strong className="text-emerald-700">6%</strong>
                    </li>

                    <li className="flex justify-between gap-4">
                      <span>
                        Capital set aside to service monthly interest until
                        capital refund
                      </span>
                      <strong className="shrink-0 text-emerald-700">
                        7%
                      </strong>
                    </li>
                  </ul>
                </div>

                <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
                  <li>
                    <strong className="text-slate-900">Default Rate:</strong>{" "}
                    6% per month on overdue installments.
                  </li>

                  <li>
                    <strong className="text-slate-900">Fees include:</strong>{" "}
                    interest, administrative charges, servicing fees, office
                    expenses, calls, SMS, etc.
                  </li>

                  <li>
                    <em className="font-semibold text-slate-900">Note:</em>{" "}
                    For one-month loans, fees & interest are deducted upfront.
                  </li>
                </ul>
              </TermsBlock>

              {/* 3.2 */}
              <TermsBlock title="3.2 Credit Check & Appraisal Fee">
                <p className="text-sm leading-7 text-slate-600">
                  A{" "}
                  <strong className="text-slate-900">
                    2% flat, non-refundable fee
                  </strong>{" "}
                  payable upfront upon acceptance of this offer.
                </p>
              </TermsBlock>

              {/* 3.3 */}
              <TermsBlock title="3.3 Default Clause">
                <BulletList
                  items={[
                    <>
                      Late repayment attracts a{" "}
                      <strong className="text-slate-900">
                        5% flat penalty
                      </strong>{" "}
                      on the due installment.
                    </>,
                    <>
                      Outstanding balances accrue{" "}
                      <strong className="text-slate-900">
                        0.2% per day (6% monthly)
                      </strong>{" "}
                      until fully settled.
                    </>,
                  ]}
                />
              </TermsBlock>

              {/* 3.4 */}
              <TermsBlock title="3.4 Accelerated Clause">
                <BulletList
                  items={[
                    <>
                      If default persists beyond{" "}
                      <strong className="text-slate-900">5 days</strong>, the
                      entire loan balance becomes immediately due and payable.
                    </>,
                    <>
                      CIET may enforce recovery through collateral
                      repossession, guarantor enforcement, or legal
                      proceedings.
                    </>,
                  ]}
                />
              </TermsBlock>

              {/* 3.5 */}
              <TermsBlock title="3.5 Repossession Clause">
                <p className="text-sm leading-7 text-slate-600">
                  CIET may repossess collateral in the event of default{" "}
                  <strong className="text-slate-900">
                    without prior notice or legal process
                  </strong>
                  .
                </p>
              </TermsBlock>

              {/* 3.6 */}
              <TermsBlock title="3.6 Deficiency Clause">
                <BulletList
                  items={[
                    <>
                      If repossessed collateral is insufficient to clear the
                      debt, borrower must settle the deficiency within{" "}
                      <strong className="text-slate-900">30 days</strong>.
                    </>,
                    <>
                      CIET reserves the right to pursue legal action for
                      recovery.
                    </>,
                  ]}
                />
              </TermsBlock>

              {/* 3.7 */}
              <TermsBlock title="3.7 Repayment Terms">
                <BulletList
                  items={[
                    <>
                      Equal, consecutive monthly repayment of principal &
                      interest until maturity.
                    </>,
                    <>
                      <strong className="text-slate-900">
                        Default Penalty:
                      </strong>{" "}
                      10% charge +{" "}
                      <strong className="text-slate-900">
                        0.4% daily interest
                      </strong>{" "}
                      beyond maturity.
                    </>,
                  ]}
                />
              </TermsBlock>

              {/* 3.8 */}
              <TermsBlock title="3.8 Repayment Channel">
                <BulletList
                  items={[
                    <>
                      All repayments must be made{" "}
                      <strong className="text-slate-900">only</strong> into
                      the designated repayment account above.
                    </>,
                    <>
                      Borrower bears all risks associated with payments to
                      third parties or unauthorized accounts.
                    </>,
                  ]}
                />
              </TermsBlock>

              {/* 3.9 */}
              <TermsBlock title="3.9 Security">
                <BulletList
                  items={[
                    <>
                      Guarantor shall be jointly liable in case of borrower’s
                      default or death.
                    </>,
                    <>
                      Borrower & guarantor consent that assets may be seized
                      and auctioned to recover outstanding obligations.
                    </>,
                  ]}
                />
              </TermsBlock>
            </section>

            {/* 4. Other Conditions */}
            <section className="mb-8">
              <SectionHeading number="4" title="Other Conditions" />

              <ol className="ml-5 list-decimal space-y-3 text-sm leading-7 text-slate-600">
                <li>
                  CIET reserves the right to securitize, syndicate, or assign
                  its interest in this facility.
                </li>

                <li>
                  Borrower shall bear all legal fees, taxes, and
                  recovery-related expenses.
                </li>

                <li>
                  Borrower authorizes CBN, banks, employers, guarantors,
                  courts, and relevant authorities to recover obligations from
                  any accounts/assets.
                </li>

                <li>
                  Borrower waives all defenses to repayment, including
                  confidentiality, usury, or lack of consideration.
                </li>

                <li>
                  Borrower affirms that joint/mutual account holders consent to
                  deductions for loan recovery.
                </li>

                <li>
                  Borrower consents to CIET seizing funds/assets in joint
                  ownership to recover obligations.
                </li>

                <li>
                  Borrower confirms this offer has been read, understood, and
                  voluntarily accepted.
                </li>
              </ol>
            </section>

            <div className="my-8 h-px bg-slate-200" />

            {/* Acknowledgement */}
            <section>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Acknowledgement & Acceptance
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Please confirm that you have read and understood the terms.
                  </p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-600">
                I/We hereby confirm acceptance of this facility and the terms
                herein.
              </p>

              {/* Acceptance checkbox */}
              <label
                className={`mt-6 flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition-all ${
                  accepted
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200 bg-slate-50 hover:border-emerald-200 hover:bg-emerald-50/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-1 h-5 w-5 cursor-pointer rounded border-slate-300 text-emerald-600 accent-emerald-600 focus:ring-emerald-500"
                />

                <span>
                  <span className="block text-sm font-bold text-slate-900">
                    Click to proceed to loan
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    By checking this box, you confirm that you have read,
                    understood, and voluntarily accepted the terms and
                    conditions of this credit facility.
                  </span>
                </span>
              </label>

              {/* Apply Button */}
              <div className="mt-6 flex justify-center">
                {accepted ? (
                  <Link
                    href="/member/loan/loan_application"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-7 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-500 hover:shadow-md"
                  >
                    Apply for Loan
                    <CheckCircle2 className="h-4 w-4" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 px-7 py-3 text-sm font-bold text-slate-400"
                  >
                    Apply for Loan
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {!accepted && (
                <p className="mt-3 text-center text-xs font-medium text-slate-400">
                  Please accept the terms above to continue.
                </p>
              )}
            </section>
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} DCG Multipurpose Cooperative
            Society Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* -----------------------------------------
   Reusable Components
------------------------------------------ */

function SectionHeading({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-extrabold text-white">
        {number}
      </div>

      <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
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
      <div className="bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </div>

      <div className="px-4 py-3 text-sm leading-6 text-slate-700">
        {value}
      </div>
    </>
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
    <div className="mb-7">
      <h3 className="mb-3 text-sm font-extrabold text-slate-900">{title}</h3>
      {children}
    </div>
  );
}

function BulletList({
  items,
}: {
  items: React.ReactNode[];
}) {
  return (
    <ul className="ml-5 list-disc space-y-2 text-sm leading-7 text-slate-600">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}
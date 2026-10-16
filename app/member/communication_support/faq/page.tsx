"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SupportNavbar from "@/components/navigation/SupportNavbar";
import {
  ChevronDown,
  ArrowLeft,
  HelpCircle,
  Megaphone,
  MessageSquare,
} from "lucide-react";

type FAQ = {
  question: string;
  answer?: string;
  sections?: {
    title: string;
    content: string;
  }[];
};

const faqs: FAQ[] = [
  {
    question: "What is a Loan Management System?",
    answer:
      "A platform that automates the process of applying, approving, disbursing, tracking, and repaying loans.",
  },
  {
    question: "How do I register on the platform?",
    answer:
      "Click the 'Register' button and complete your personal, financial, and contact details. ID verification may be required.",
  },
  {
    question: "What types of loans are available?",
    answer:
      "Personal loans, business loans, salary advances, and fixed deposit-backed loans.",
  },
  {
    question: "What documents are required to apply?",
    answer:
      "Valid ID, proof of income, bank statement, and passport photograph.",
  },
  {
    question: "How is loan eligibility determined?",
    answer:
      "Based on credit history, income, employment status, and existing obligations.",
  },
  {
    question: "Can I track loan application status?",
    answer:
      "Yes. Log in and go to “Loan Status” to view your application progress.",
  },
  {
    question: "How long does approval take?",
    answer:
      "Within 30 minutes to 24 hours after submission of the required documents, subject to availability of funds.",
  },
  {
    question: "What is the repayment period?",
    answer:
      "The repayment period ranges from 1 to 12 months depending on the loan type.",
  },
  {
    question: "What happens if I miss a payment?",
    answer:
      "A late fee may be applied and it may affect your credit score or eligibility for future loans.",
  },
  {
    question: "Can I repay my loan before the due date?",
    answer:
      "Yes. Early repayment is allowed and may reduce the total interest payable, depending on the terms of your loan agreement.",
  },
  {
    question: "How do I make repayments?",
    answer:
      "Repayments can be made via online payment, bank transfers, or direct debit from your bank account or salary.",
  },
  {
    question: "Is there a penalty for early loan repayment?",
    answer:
      "Most of our loans do not carry an early repayment penalty, but always check the specific terms and conditions in your loan agreement.",
  },
  {
    question: "Can I have more than one active loan?",
    answer:
      "It depends on your repayment history and credit limit. Contact support for an evaluation of your eligibility.",
  },
  {
    question: "How is the interest rate calculated?",
    answer:
      "Interest is calculated based on the loan amount, duration, and risk profile. Applicable rates are displayed before application submission.",
  },
  {
    question: "How secure is my data?",
    answer:
      "We use security measures such as SSL encryption, two-factor authentication (2FA), and role-based access control to protect your information.",
  },
  {
    question: "What is a fixed deposit-backed loan?",
    answer:
      "It is a loan secured against your fixed deposit. You can borrow a percentage of your fixed deposit while the deposit remains untouched and your dividends remain unaffected, subject to the applicable terms.",
  },
  {
    question: "Can I pause or defer repayments?",
    sections: [
      {
        title: "Deferment or Repayment Pause",
        content:
          "In special cases, such as medical emergencies, you may request a deferment or pause on repayments, subject to administrative approval.",
      },
      {
        title: "Pause Without Withdrawal",
        content:
          "If you pause your monthly contributions without requesting a withdrawal of your contributed funds, you will be eligible for dividends at the end of the 12-month period on the amount contributed, subject to the applicable terms.",
      },
      {
        title: "Pause With Withdrawal",
        content:
          "If you pause your monthly contributions and request a withdrawal of your contributed funds before completing 12 months, you will not be eligible for dividends.",
      },
      {
        title: "How to Request a Deferment",
        content:
          "To request a deferment or pause on repayments, please submit your request to our administration team for review and approval. A ₦1,000 application fee applies.",
      },
    ],
  },
  {
    question: "What is the maximum loan amount I can borrow?",
    answer:
      "The limit depends on your monthly income, deposit history, and credit score. Your available limit is shown on your dashboard.",
  },
  {
    question: "How can I contact support?",
    answer:
      "Use the 'Contact Us' form, live chat, or email support@loanportal.com for assistance.",
  },
  {
    question: "How can I download my loan certificate or statement?",
    answer:
      "Log in to your account, navigate to the 'Documents' section, and download your loan certificate or repayment statement in PDF format.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">

      {/* =========================
          NAVIGATION BAR
      ========================== */}
        <SupportNavbar />

      {/* =========================
          MAIN CONTENT
      ========================== */}
      <main className="flex-1 w-full">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 -mt-24 sm:py-10 lg:px-8">

          {/* Header */}
          <div className="mb-8 rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">

            <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300">
              <HelpCircle className="h-4 w-4" />
              Loan Management Support
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              📘 Frequently Asked Questions
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Find answers to common questions about loans, repayments,
              savings, fixed deposits, applications, and your DCG Cooperative
              account.
            </p>
          </div>

          {/* FAQ List */}
          <div className="space-y-3">

            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={faq.question}
                  className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                    isOpen
                      ? "border-emerald-200 bg-white shadow-md"
                      : "border-slate-200 bg-white shadow-sm hover:border-slate-300"
                  }`}
                >

                  {/* Question */}
                  <button
                    type="button"
                    onClick={() => toggleFAQ(index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50 sm:px-6"
                  >
                    <div className="flex items-start gap-3">

                      <span
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                          isOpen
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {index + 1}
                      </span>

                      <span
                        className={`text-sm font-bold sm:text-base ${
                          isOpen
                            ? "text-emerald-700"
                            : "text-slate-800"
                        }`}
                      >
                        {faq.question}
                      </span>
                    </div>

                    <ChevronDown
                      className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                        isOpen
                          ? "rotate-180 text-emerald-600"
                          : "text-slate-400"
                      }`}
                    />
                  </button>

                  {/* Answer */}
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-slate-100 px-5 pb-5 pt-4 sm:px-6">

                        {faq.answer && (
                          <p className="text-sm leading-7 text-slate-600 sm:text-base">
                            {faq.answer}
                          </p>
                        )}

                        {faq.sections && (
                          <div className="space-y-5">

                            {faq.sections.map((section) => (
                              <div key={section.title}>
                                <h3 className="mb-1.5 text-sm font-bold text-slate-900 sm:text-base">
                                  {section.title}
                                </h3>

                                <p className="text-sm leading-7 text-slate-600 sm:text-base">
                                  {section.content}
                                </p>
                              </div>
                            ))}

                          </div>
                        )}

                      </div>
                    </div>
                  </div>

                </div>
              );
            })}

          </div>

          {/* Support Card */}
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  <MessageSquare className="h-4 w-4" />
                  Need More Help?
                </div>

                <h2 className="text-lg font-bold text-slate-900">
                  Our support team is available to assist you.
                </h2>

                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  If you cannot find an answer here, contact the administration
                  team through the available communication channels.
                </p>
              </div>

              <Link
                href="/member-chat-dashboard"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
              >
                <MessageSquare className="h-4 w-4" />
                Chat with Admin
              </Link>

            </div>
          </div>

        </div>
      </main>

      {/* =========================
          FOOTER
      ========================== */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500 sm:text-sm">
            &copy; {new Date().getFullYear()} DCG Multipurpose Cooperative
            Society Ltd. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
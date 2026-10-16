"use client";

import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
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
    answer: "Yes. Log in and go to “Loan Status” to view progress.",
  },
  {
    question: "How long does approval take?",
    answer:
      "Within 30 minutes to 24 hours after submission of required documents subject to availability of funds.",
  },
  {
    question: "What is the repayment period?",
    answer: "Ranges from 1 to 12 months depending on loan type.",
  },
  {
    question: "What happens if I miss a payment?",
    answer:
      "A late fee will be applied and it will affect your credit score or eligibility for future loans.",
  },
  {
    question: "Can I repay my loan before the due date?",
    answer:
      "Yes. Early repayment is allowed and may reduce the total interest payable, depending on the terms.",
  },
  {
    question: "How do I make repayments?",
    answer:
      "Repayments can be made via online payment, bank transfers, or direct debit from your bank account/salary.",
  },
  {
    question: "Is there a penalty for early loan repayment?",
    answer:
      "Most of our loans do not carry an early repayment penalty, but always check your loan agreement.",
  },
  {
    question: "Can I have more than one active loan?",
    answer:
      "It depends on your repayment history and credit limit. Contact support for evaluation.",
  },
  {
    question: "How is the interest rate calculated?",
    answer:
      "Interest is calculated based on the loan amount, duration, and risk profile. Rates are displayed before application submission.",
  },
  {
    question: "How secure is my data?",
    answer:
      "We use SSL encryption, two-factor authentication (2FA), and role-based access control to protect your information.",
  },
  {
    question: "What is a fixed deposit-backed loan?",
    answer:
      "It's a loan secured against your fixed deposit. You can borrow a percentage of your FD while it remains untouched and your dividends unaffected.",
  },
  {
    question: "Can I pause or defer repayments?",
    answer: `In special cases, such as medical emergencies, you may request a deferment or pause on repayments, subject to administrative approval.<br/><br/>
    <strong>Pause Options:</strong><br/>
    • <strong>Pause without withdrawal:</strong> If you pause your monthly contributions without requesting a withdrawal of your contributed funds, you will be guaranteed dividends at the end of the 12-month period on the amount contributed.<br/><br/>
    • <strong>Pause with withdrawal:</strong> If you pause your monthly contributions and request a withdrawal of your contributed funds before completing 12 months, you will not be eligible for dividends.<br/><br/>
    <strong>How to Request a Deferment:</strong><br/>
    To request a deferment or pause on repayments, please submit your request to our administration team for review and approval. Pay ₦1,000 fee for such application.`,
  },
  {
    question: "What is the maximum loan amount I can borrow?",
    answer:
      "The limit depends on your monthly income, deposit history, and credit score. It is shown on your dashboard.",
  },
  {
    question: "How can I contact support?",
    answer:
      "Use the 'Contact Us' form, live chat, or email at support@loanportal.com for assistance.",
  },
  {
    question: "How can I download my loan certificate or statement?",
    answer:
      "Log in to your account, navigate to the 'Documents' section, and download your loan certificate or repayment statement in PDF format.",
  },
];

export default function FaqList() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFaqs = FAQS.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search questions (e.g., repayments, fixed deposit, approval)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="overflow-hidden rounded-lg border border-slate-200 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  className="flex w-full items-center justify-between bg-slate-50 px-5 py-4 text-left font-medium text-slate-800 transition-colors hover:bg-slate-100 focus:outline-none"
                >
                  <span className="text-base md:text-lg">{faq.question}</span>
                  <span
                    className={`ml-4 transform text-xl text-emerald-600 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {isOpen && (
                  <div
                    className="border-t border-slate-200 bg-white px-5 py-4 text-sm leading-relaxed text-slate-600 md:text-base"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                )}
              </div>
            );
          })
        ) : (
          <p className="py-8 text-center text-slate-500">
            No matching questions found for &quot;{searchQuery}&quot;.
          </p>
        )}
      </div>
    </div>
  );
}

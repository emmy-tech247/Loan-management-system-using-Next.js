export interface FAQItem {
  id: string;
  category: "General" | "Loans" | "Repayments" | "Policy & Dividends";
  question: string;
  answer: string | React.ReactNode;
}

export const faqList: FAQItem[] = [
  {
    id: "faq-1",
    category: "General",
    question: "What is a Loan Management System?",
    answer:
      "A platform that automates the process of applying, approving, disbursing, tracking, and repaying loans.",
  },
  {
    id: "faq-2",
    category: "General",
    question: "How do I register on the platform?",
    answer:
      "Click the 'Register' button and complete your personal, financial, and contact details. ID verification may be required.",
  },
  {
    id: "faq-3",
    category: "Loans",
    question: "What types of loans are available?",
    answer:
      "Personal loans, business loans, salary advances, and fixed deposit-backed loans.",
  },
  {
    id: "faq-4",
    category: "Loans",
    question: "What documents are required to apply?",
    answer:
      "Valid ID, proof of income, bank statement, and passport photograph.",
  },
  {
    id: "faq-5",
    category: "Loans",
    question: "How is loan eligibility determined?",
    answer:
      "Based on credit history, income, employment status, and existing obligations.",
  },
  {
    id: "faq-6",
    category: "Loans",
    question: "Can I track loan application status?",
    answer:
      "Yes. Log in and navigate to your dashboard under 'Loan Status' to view progress.",
  },
  {
    id: "faq-7",
    category: "Loans",
    question: "How long does approval take?",
    answer:
      "Within 30 minutes to 24 hours after submission of required documents, subject to availability of funds.",
  },
  {
    id: "faq-8",
    category: "Repayments",
    question: "What is the repayment period?",
    answer:
      "Ranges from 1 to 12 months depending on the specific loan type chosen.",
  },
  {
    id: "faq-9",
    category: "Repayments",
    question: "What happens if I miss a payment?",
    answer:
      "A late fee will be applied and it will affect your credit score or eligibility for future loan applications.",
  },
  {
    id: "faq-10",
    category: "Repayments",
    question: "Can I repay my loan before the due date?",
    answer:
      "Yes. Early repayment is allowed and may reduce total interest payable, depending on your loan terms.",
  },
  {
    id: "faq-11",
    category: "Repayments",
    question: "How do I make repayments?",
    answer:
      "Repayments can be made via online card payments, bank transfers, or direct debit from your bank account or salary.",
  },
  {
    id: "faq-12",
    category: "Repayments",
    question: "Is there a penalty for early loan repayment?",
    answer:
      "Most of our loans do not carry an early repayment penalty, but always verify your specific loan agreement.",
  },
  {
    id: "faq-13",
    category: "Loans",
    question: "Can I have more than one active loan?",
    answer:
      "It depends on your repayment history and available credit limit. Contact support for individual evaluation.",
  },
  {
    id: "faq-14",
    category: "Loans",
    question: "How is the interest rate calculated?",
    answer:
      "Interest is calculated based on loan amount, duration, and risk profile. Rates are displayed before submitting your application.",
  },
  {
    id: "faq-15",
    category: "General",
    question: "How secure is my data?",
    answer:
      "We use industry-standard SSL encryption, two-factor authentication (2FA), and strict role-based access control to safeguard your information.",
  },
  {
    id: "faq-16",
    category: "Policy & Dividends",
    question: "What is a fixed deposit-backed loan?",
    answer:
      "It is a loan secured against your fixed deposit balance. You can borrow a percentage of your FD while it remains untouched and your annual dividends remain unaffected.",
  },
  {
    id: "faq-17",
    category: "Policy & Dividends",
    question: "Can I pause or defer repayments?",
    answer: "structured_deferment_text", // Rendered with custom formatted JSX
  },
  {
    id: "faq-18",
    category: "Loans",
    question: "What is the maximum loan amount I can borrow?",
    answer:
      "The limit depends on your monthly income, contribution history, and credit score, which is calculated on your dashboard.",
  },
  {
    id: "faq-19",
    category: "General",
    question: "How can I contact support?",
    answer:
      "Use our live chat portal, official inquiry form, or send an email to support@loanportal.com.",
  },
  {
    id: "faq-20",
    category: "General",
    question: "How can I download my loan certificate or statement?",
    answer:
      "Log in to your account, navigate to the 'Documents' section, and download your loan certificate or repayment statement in PDF format.",
  },
];

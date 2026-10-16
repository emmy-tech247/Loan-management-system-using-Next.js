import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Clock, CheckCircle2, XCircle, AlertCircle, FileText } from "lucide-react";

// Types matching your database schema
interface LoanRecord {
  id: string;
  facility_type: string;
  loan_category: string;
  loan_amount: number;
  loan_status: "Pending" | "Approved" | "Rejected" | "Disbursed" | string;
  created_at: string;
  repayment_source: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  bvn: string;
}

// Simulated session retrieval helper
async function getSession() {
  // Replace this with your actual authentication provider (e.g., NextAuth, Clerk, or Iron Session)
  return { memberId: "12345" };
}

// Data fetching helper function (Server-side)
async function getMemberLoans(memberId: string): Promise<LoanRecord[]> {
  // Replace this with your database client call (e.g., Prisma, Drizzle, or mysql2)
  /*
  const loans = await db.query(
    'SELECT facility_type, loan_category, loan_amount, loan_status, created_at, repayment_source, bank_name, account_number, account_name, bvn FROM loans WHERE member_id = ? ORDER BY created_at DESC',
    [memberId]
  );
  return loans;
  */

  // Mock data for illustration
  return [
    {
      id: "1",
      facility_type: "Personal Loan",
      loan_category: "Monthly Saver",
      loan_amount: 250000.0,
      loan_status: "Approved",
      created_at: "2026-06-15 10:30:00",
      repayment_source: "Salary",
      bank_name: "NIRSAL MFB",
      account_number: "0259738951",
      account_name: "John Doe",
      bvn: "22334455667",
    },
    {
      id: "2",
      facility_type: "Business Loan",
      loan_category: "Borrower",
      loan_amount: 500000.0,
      loan_status: "Pending",
      created_at: "2026-07-20 14:15:00",
      repayment_source: "Business Proceeds",
      bank_name: "First Bank",
      account_number: "3098765432",
      account_name: "John Doe",
      bvn: "22334455667",
    },
  ];
}

// Utility for formatting status badges
function getStatusBadge(status: string) {
  const normalized = status.toLowerCase();
  switch (normalized) {
    case "approved":
    case "disbursed":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {status}
        </span>
      );
    case "pending":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
          <Clock className="h-3.5 w-3.5" />
          {status}
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
          <XCircle className="h-3.5 w-3.5" />
          {status}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
          <AlertCircle className="h-3.5 w-3.5" />
          {status}
        </span>
      );
  }
}

export default async function LoanStatusPage() {
  const session = await getSession();

  if (!session?.memberId) {
    redirect("/auth/login");
  }

  const loans = await getMemberLoans(session.memberId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex shrink-0 items-center">
              <Link href="/">
                <Image
                  src="/images/logo2.png"
                  alt="DCG Cooperative Logo"
                  width={140}
                  height={40}
                  className="h-9 w-auto object-contain"
                  priority
                />
              </Link>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex md:items-center md:gap-1 lg:gap-2">
              <Link
                href="/member"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                Back
              </Link>
              <Link
                href="/dashboard/loans/application"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                Loan Application
              </Link>
              <Link
                href="/dashboard/loans/status"
                className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700"
              >
                Status Tracking
              </Link>
              <Link
                href="/dashboard/loans/repayment"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                Loan Repayment
              </Link>
              <Link
                href="/dashboard/loans/repayment-status"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                Repayment Status
              </Link>
              <Link
                href="/dashboard/loans/report"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                Loan Report
              </Link>
              <Link
                href="/dashboard/loans/calculator"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                Loan Calculator
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Your Loan Applications
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Track and review all submitted loan requests and their status.
            </p>
          </div>
          <Link
            href="/dashboard/loans/application"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
          >
            New Application
          </Link>
        </div>

        {/* Data Table Container */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loans.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-700">
                  <tr>
                    <th scope="col" className="px-6 py-4">Facility Type</th>
                    <th scope="col" className="px-6 py-4">Category</th>
                    <th scope="col" className="px-6 py-4">Amount</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                    <th scope="col" className="px-6 py-4">Submitted</th>
                    <th scope="col" className="px-6 py-4">Repayment Source</th>
                    <th scope="col" className="px-6 py-4">Bank Name</th>
                    <th scope="col" className="px-6 py-4">Account Number</th>
                    <th scope="col" className="px-6 py-4">Account Name</th>
                    <th scope="col" className="px-6 py-4">BVN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {loans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-900">
                        {loan.facility_type}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {loan.loan_category}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-mono font-bold text-slate-900">
                        ₦{loan.loan_amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {getStatusBadge(loan.loan_status)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-500">
                        {new Date(loan.created_at).toLocaleDateString("en-NG", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {loan.repayment_source}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-800">
                        {loan.bank_name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-slate-700">
                        {loan.account_number}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-800">
                        {loan.account_name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-slate-500">
                        {loan.bvn}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <FileText className="h-12 w-12 text-slate-300 mb-3" />
              <h3 className="text-base font-semibold text-slate-900">No loan records found</h3>
              <p className="mt-1 text-sm text-slate-500">
                You have not submitted any loan applications yet.
              </p>
              <Link
                href="/dashboard/loans/application"
                className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-all"
              >
                Apply Now
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} DCG Multipurpose Cooperative Society Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

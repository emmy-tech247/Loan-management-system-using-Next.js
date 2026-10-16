import Link from "next/link";
import LoanNavbar from "@/components/navigation/LoanNavbar";
import {
  ArrowLeft,
  Banknote,
  Building2,
  CalendarDays,
  CreditCard,
  FileText,
  Landmark,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import db from "@/lib/db";

// ============================================================
// Types
// ============================================================

interface Loan {
  facility_type: string;
  loan_category: string;
  loan_amount: number;
  loan_status: string;
  created_at: Date | string;
  repayment_source: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  bvn: string;
}

// ============================================================
// Helpers
// ============================================================

function formatCurrency(amount: number | string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(Number(amount));
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function maskAccountNumber(accountNumber: string) {
  if (!accountNumber) {
    return "—";
  }

  const value = String(accountNumber);

  if (value.length <= 4) {
    return value;
  }

  return `${"*".repeat(value.length - 4)}${value.slice(-4)}`;
}

function maskBVN(bvn: string) {
  if (!bvn) {
    return "—";
  }

  const value = String(bvn);

  if (value.length <= 4) {
    return "****";
  }

  return `${"*".repeat(value.length - 4)}${value.slice(-4)}`;
}

function getStatusClasses(status: string) {
  const normalized = String(status || "").toLowerCase();

  if (
    normalized.includes("approved") ||
    normalized.includes("completed") ||
    normalized.includes("paid")
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    normalized.includes("pending") ||
    normalized.includes("review") ||
    normalized.includes("processing")
  ) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (
    normalized.includes("rejected") ||
    normalized.includes("declined") ||
    normalized.includes("cancelled")
  ) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-700";
}

// ============================================================
// Database
// ============================================================

async function getMemberLoans(memberId: number): Promise<Loan[]> {
  try {
    const [rows] = await db.execute(
      `
        SELECT
          facility_type,
          loan_category,
          loan_amount,
          loan_status,
          created_at,
          repayment_source,
          bank_name,
          account_number,
          account_name,
          bvn
        FROM loans
        WHERE member_id = ?
        ORDER BY created_at DESC
      `,
      [memberId]
    );

    return rows as Loan[];
  } catch (error) {
    console.error("Error fetching member loans:", error);
    throw error;
  }
}

// ============================================================
// Session
// ============================================================

async function getMemberId(): Promise<number | null> {
  const cookieStore = await cookies();

  const memberId = cookieStore.get("member_id")?.value;

  if (!memberId) {
    return null;
  }

  const parsedId = Number(memberId);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return null;
  }

  return parsedId;
}

// ============================================================
// Page
// ============================================================

export default async function LoanStatusPage() {
  const memberId = await getMemberId();

  // Redirect unauthenticated members
  if (!memberId) {
    redirect("/member/login");
  }

  let loans: Loan[] = [];

  // ============================================================
  // Load Loans
  // ============================================================

  try {
    loans = await getMemberLoans(memberId);
  } catch (error) {
    console.error("Error loading loan status:", error);

    return (
      <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
        {/* Reusable Loan Navbar */}
        <LoanNavbar />

        {/* Error Content */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-0.5 pb-8 sm:px-6 pt-2 lg:px-8">
          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="w-full max-w-lg rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <ShieldCheck className="h-7 w-7" />
              </div>

              <h2 className="text-xl font-extrabold text-slate-900">
                Unable to load loan status
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                We could not retrieve your loan applications at this time.
                Please try again later.
              </p>

              <Link
                href="/member/dashboard"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // ============================================================
  // Loan Statistics
  // ============================================================

  const pendingLoans = loans.filter((loan) =>
    String(loan.loan_status || "")
      .toLowerCase()
      .includes("pending")
  );

  const approvedLoans = loans.filter((loan) =>
    String(loan.loan_status || "")
      .toLowerCase()
      .includes("approved")
  );

  // ============================================================
  // Page UI
  // ============================================================

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      {/* ========================================================
          Reusable Loan Navbar
      ======================================================== */}

      <LoanNavbar />

      {/* ========================================================
          Main Content
      ======================================================== */}

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 pt-0.5 pb-8 sm:px-6 lg:px-8">
        {/* ======================================================
            Header Banner
        ====================================================== */}

        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">
          {/* Decorative Glow */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl" />

          <div className="relative z-10">
            {/* Badge */}
            <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-300">
              <FileText className="h-3.5 w-3.5" />
              Loan Status Tracking
            </div>

            {/* Title */}
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Your Loan Applications
            </h1>

            {/* Description */}
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              View your loan applications, current approval status, repayment
              source, and submitted banking information.
            </p>
          </div>
        </section>

        {/* ======================================================
            Summary Cards
        ====================================================== */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={<FileText className="h-5 w-5" />}
            label="Total Applications"
            value={loans.length.toString()}
            iconClass="bg-slate-100 text-slate-700"
          />

          <SummaryCard
            icon={<Banknote className="h-5 w-5" />}
            label="Pending Applications"
            value={pendingLoans.length.toString()}
            iconClass="bg-amber-50 text-amber-600"
          />

          <SummaryCard
            icon={<ShieldCheck className="h-5 w-5" />}
            label="Approved Applications"
            value={approvedLoans.length.toString()}
            iconClass="bg-emerald-50 text-emerald-600"
          />
        </section>

        {/* ======================================================
            Loan Applications
        ====================================================== */}

        {loans.length > 0 ? (
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {/* Table Header */}
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Application History
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Your most recent loan applications are shown first.
                </p>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                <ActivityDot />

                {loans.length}{" "}
                {loans.length === 1 ? "Application" : "Applications"}
              </div>
            </div>

            {/* ==================================================
                Responsive Table
            ================================================== */}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px] text-left">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <TableHeader>Facility Type</TableHeader>
                    <TableHeader>Category</TableHeader>
                    <TableHeader>Amount</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Submitted</TableHeader>
                    <TableHeader>Repayment Source</TableHeader>
                    <TableHeader>Bank Name</TableHeader>
                    <TableHeader>Account Number</TableHeader>
                    <TableHeader>Account Name</TableHeader>
                    <TableHeader>BVN</TableHeader>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loans.map((loan, index) => (
                    <tr
                      key={`${loan.created_at}-${index}`}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      {/* Facility Type */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <Building2 className="h-4 w-4" />
                          </div>

                          <span className="font-bold text-slate-900">
                            {loan.facility_type || "—"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        <span className="text-slate-600">
                          {loan.loan_category || "—"}
                        </span>
                      </TableCell>

                      {/* Amount */}
                      <TableCell>
                        <span className="font-extrabold text-slate-900">
                          {formatCurrency(loan.loan_amount)}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-extrabold capitalize ${getStatusClasses(
                            loan.loan_status
                          )}`}
                        >
                          {loan.loan_status || "Unknown"}
                        </span>
                      </TableCell>

                      {/* Submitted */}
                      <TableCell>
                        <div className="flex items-center gap-2 text-slate-600">
                          <CalendarDays className="h-4 w-4 text-slate-400" />

                          <span className="whitespace-nowrap text-xs">
                            {formatDate(loan.created_at)}
                          </span>
                        </div>
                      </TableCell>

                      {/* Repayment Source */}
                      <TableCell>
                        <span className="text-slate-600">
                          {loan.repayment_source || "—"}
                        </span>
                      </TableCell>

                      {/* Bank */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Landmark className="h-4 w-4 text-slate-400" />

                          <span className="font-semibold text-slate-700">
                            {loan.bank_name || "—"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Account Number */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-slate-400" />

                          <span className="font-mono text-xs text-slate-600">
                            {maskAccountNumber(loan.account_number)}
                          </span>
                        </div>
                      </TableCell>

                      {/* Account Name */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserRound className="h-4 w-4 text-slate-400" />

                          <span className="font-semibold text-slate-700">
                            {loan.account_name || "—"}
                          </span>
                        </div>
                      </TableCell>

                      {/* BVN */}
                      <TableCell>
                        <span className="font-mono text-xs font-semibold text-slate-500">
                          {maskBVN(loan.bvn)}
                        </span>
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          /* ====================================================
             Empty State
          ==================================================== */

          <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm sm:p-14">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FileText className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-lg font-extrabold text-slate-900">
              No loan applications found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You have not submitted any loan applications yet. Once you submit
              an application, its status will appear here.
            </p>

            <Link
              href="/member/loan/loan_saver_borrower"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              <Banknote className="h-4 w-4" />
              Apply for a Loan
            </Link>
          </section>
        )}
      </main>

      {/* ========================================================
          Footer
      ======================================================== */}

      <Footer />
    </div>
  );
}

// ============================================================
// Table Components
// ============================================================

function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap px-5 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
      {children}
    </th>
  );
}

function TableCell({ children }: { children: React.ReactNode }) {
  return <td className="px-5 py-4 text-sm">{children}</td>;
}

// ============================================================
// Summary Card
// ============================================================

function SummaryCard({
  icon,
  label,
  value,
  iconClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <span className="text-2xl font-extrabold text-slate-900">
          {value}
        </span>
      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
    </div>
  );
}

// ============================================================
// Activity Indicator
// ============================================================

function ActivityDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />

      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
    </span>
  );
}

// ============================================================
// Footer
// ============================================================

function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-6">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} DCG Multipurpose Cooperative
          Society Ltd. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
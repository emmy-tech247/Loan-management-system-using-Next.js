import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Wallet,
  PiggyBank,
  Calendar,
  CheckCircle2,
  Landmark,
  CalendarCheck,
  UserCheck,
  Megaphone,
  LockKeyhole,
  Download,
  ArrowRight,
} from "lucide-react";

import db from "@/lib/db";

type Member = {
  full_name: string;
  passport: string | null;
};

type FixedDeposit = {
  fd_id: number;
  amount: number;
  tenure_months: number;
  interest_rate: number;
  status: string;
  maturity_date: string | null;
  created_at: string;
};

type DueDate = {
  due_date: string;
  amount_due: number;
  status: string;
};

type Approval = {
  item_type: string;
  status: string;
};

type Announcement = {
  title: string;
  message: string;
  created_at: string;
};

function money(value: number | string | null | undefined) {
  return Number(value || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value: string | null) {
  if (!value) return "";

  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value: string | null) {
  if (!value) return "";

  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusColor(status: string) {
  switch (status.toLowerCase()) {
    case "approved":
    case "active":
    case "confirmed":
    case "disbursed":
    case "matured":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "rejected":
    case "declined":
      return "bg-rose-50 text-rose-700 border-rose-200";

    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

export default async function MemberDashboardPage() {
  /*
   * ============================================================
   * AUTHENTICATION
   * ============================================================
   *
   * Production:
   * Get member_id from your authenticated session/cookie.
   */

  const cookieStore = await cookies();
  const memberIdCookie = cookieStore.get("member_id");

  /*
   * TEMPORARY TEST MODE
   *
   * If you want to open the dashboard directly WITHOUT logging in,
   * temporarily use:
   *
   * const member_id = 1;
   *
   * and comment out the authentication block below.
   */

  if (!memberIdCookie) {
    redirect("/login");
  }

  const member_id = Number.parseInt(memberIdCookie.value, 10);

  if (!Number.isInteger(member_id)) {
    redirect("/login");
  }

  try {
    /*
     * ============================================================
     * MEMBER
     * ============================================================
     */

    const [memberRows] = await db.execute<any[]>(
      `
      SELECT full_name, passport
      FROM members
      WHERE member_id = ?
      LIMIT 1
      `,
      [member_id]
    );

    const member: Member = memberRows[0] || {
      full_name: "Member",
      passport: null,
    };

    /*
     * ============================================================
     * LOAN BALANCE
     * ============================================================
     */

    const [loanRows] = await db.execute<any[]>(
      `
      SELECT COALESCE(SUM(loan_amount), 0) AS value
      FROM loans
      WHERE member_id = ?
      AND loan_status IN ('checked', 'disbursed')
      `,
      [member_id]
    );

    const loanBalance = Number(loanRows[0]?.value || 0);

    /*
     * ============================================================
     * SAVINGS BALANCE
     * ============================================================
     */

    const [savingsRows] = await db.execute<any[]>(
      `
      SELECT
        COALESCE(
          SUM(
            CASE
              WHEN type = 'deposit'
              AND status = 'approved'
              THEN amount_saved
              ELSE 0
            END
          ),
          0
        )
        -
        COALESCE(
          SUM(
            CASE
              WHEN type = 'withdrawal'
              AND status = 'approved'
              THEN amount_saved
              ELSE 0
            END
          ),
          0
        ) AS value

      FROM savings_transactions
      WHERE member_id = ?
      `,
      [member_id]
    );

    const savingsBalance = Number(savingsRows[0]?.value || 0);

    /*
     * ============================================================
     * EXPECTED MONTHLY SAVINGS
     * ============================================================
     */

    const [monthlyRows] = await db.execute<any[]>(
      `
      SELECT auto_amount AS value
      FROM monthly_savings
      WHERE member_id = ?
      LIMIT 1
      `,
      [member_id]
    );

    const monthlySavings = Number(monthlyRows[0]?.value || 0);

    /*
     * ============================================================
     * TOTAL LOAN REPAID
     * ============================================================
     */

    const [repaymentRows] = await db.execute<any[]>(
      `
      SELECT COALESCE(SUM(amount_paid), 0) AS value
      FROM loan_repayments
      WHERE member_id = ?
      AND status = 'approved'
      `,
      [member_id]
    );

    const repayTotal = Number(repaymentRows[0]?.value || 0);

    /*
     * ============================================================
     * FIXED DEPOSITS
     * ============================================================
     */

    const [fdRows] = await db.execute<any[]>(
      `
      SELECT
        fd_id,
        amount_deposited AS amount,
        tenure_months,
        interest_rate,
        status,
        maturity_date,
        created_at
      FROM fixed_deposits
      WHERE member_id = ?
      ORDER BY created_at DESC
      `,
      [member_id]
    );

    const fdRecords: FixedDeposit[] = fdRows;

    /*
     * ============================================================
     * DUE DATES
     * ============================================================
     */

    const [dueRows] = await db.execute<any[]>(
      `
      SELECT
        due_dates.due_date,
        due_dates.amount_due,
        due_dates.status
      FROM due_dates
      JOIN loans
        ON due_dates.loan_id = loans.loan_id
      WHERE loans.member_id = ?
      ORDER BY due_dates.due_date ASC
      `,
      [member_id]
    );

    const dueDates: DueDate[] = dueRows;

    /*
     * ============================================================
     * LOAN APPROVALS
     * ============================================================
     */

    const [loanApprovalRows] = await db.execute<any[]>(
      `
      SELECT
        a.item_type,
        a.status
      FROM approvals a
      JOIN loans l
        ON a.item_id = l.loan_id
      WHERE a.item_type = 'loan'
      AND l.member_id = ?
      `,
      [member_id]
    );

    const loanApprovals: Approval[] = loanApprovalRows;

    /*
     * ============================================================
     * FIXED DEPOSIT APPROVALS
     * ============================================================
     */

    const [fdApprovalRows] = await db.execute<any[]>(
      `
      SELECT
        a.item_type,
        a.status
      FROM approvals a
      JOIN fixed_deposits f
        ON a.item_id = f.fd_id
      WHERE a.item_type = 'fixed_deposit'
      AND f.member_id = ?
      `,
      [member_id]
    );

    const fdApprovals: Approval[] = fdApprovalRows;

    /*
     * ============================================================
     * ANNOUNCEMENTS
     * ============================================================
     */

    const [announcementRows] = await db.execute<any[]>(
      `
      SELECT
        title,
        content AS message,
        created_at
      FROM announcements
      ORDER BY created_at DESC
      LIMIT 5
      `
    );

    const announcements: Announcement[] = announcementRows;

    /*
     * ============================================================
     * PAGE
     * ============================================================
     */

    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">

        {/* ======================================================
            NAVBAR
        ======================================================= */}

        <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex min-h-16 items-center justify-between gap-4 py-3">

              {/* Logo */}
              <Link
                href="/member/dashboard"
                className="flex shrink-0 items-center"
              >
                <Image
                  src="/images/logo2.png"
                  alt="DCG Cooperative Logo"
                  width={120}
                  height={50}
                  className="h-10 w-auto object-contain"
                  priority
                />
              </Link>

              {/* Navigation */}
              <div className="hidden items-center gap-1 lg:flex">

                <Link
                  href="/loan_management"
                  className="rounded-xl px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-emerald-700"
                >
                  Loan
                  <br />
                  Management
                </Link>

                <Link
                  href="/monthly_savings"
                  className="rounded-xl px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-emerald-700"
                >
                  Monthly Savings
                  <br />
                  System
                </Link>

                <Link
                  href="/fixed_deposit"
                  className="rounded-xl px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-emerald-700"
                >
                  Fixed Deposit
                  <br />
                  Module
                </Link>

                <Link
                  href="/payment"
                  className="rounded-xl px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-emerald-700"
                >
                  Payment
                  <br />
                  Integration
                </Link>

                <Link
                  href="/communication"
                  className="rounded-xl px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-emerald-700"
                >
                  Communication
                  <br />
                  And Support
                </Link>

                <Link
                  href="/document1"
                  className="rounded-xl px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-emerald-700"
                >
                  Document &
                  <br />
                  E-Signature
                </Link>

              </div>
            </div>
          </div>
        </nav>

        {/* ======================================================
            MAIN
        ======================================================= */}

        <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">

          {/* Welcome Banner */}

          <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">

            <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              <div className="max-w-2xl space-y-3">

                <span className="inline-flex rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                  Member Portal
                </span>

                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Welcome, {member.full_name}
                </h1>

                <p className="text-sm leading-relaxed text-slate-300">
                  View your loans, savings, fixed deposits, repayments,
                  approvals and important cooperative announcements.
                </p>

              </div>

              {/* Profile */}

              <div className="shrink-0">

                {member.passport ? (
                  <Image
                    src={`/uploads/${member.passport}`}
                    alt="User Photo"
                    width={100}
                    height={100}
                    className="h-24 w-24 rounded-2xl border-4 border-white/20 object-cover shadow-lg"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-xs text-slate-300">
                    No Photo
                  </div>
                )}

              </div>
            </div>
          </section>

          {/* ==================================================
              FINANCIAL SUMMARY
          =================================================== */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* Loan */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

              <div className="mb-4 flex items-center justify-between">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Wallet className="h-5 w-5" />
                </div>

              </div>

              <p className="text-xs font-semibold text-slate-500">
                Loan Balance
              </p>

              <p className="mt-1 text-xl font-extrabold text-slate-900">
                ₦{money(loanBalance)}
              </p>

            </div>

            {/* Savings */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <PiggyBank className="h-5 w-5" />
              </div>

              <p className="text-xs font-semibold text-slate-500">
                Monthly Contribution
              </p>

              <p className="mt-1 text-xl font-extrabold text-slate-900">
                ₦{money(savingsBalance)}
              </p>

            </div>

            {/* Expected */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Calendar className="h-5 w-5" />
              </div>

              <p className="text-xs font-semibold text-slate-500">
                Expected Monthly Contribution
              </p>

              <p className="mt-1 text-xl font-extrabold text-slate-900">
                ₦{money(monthlySavings)}
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                Per month
              </p>

            </div>

            {/* Repaid */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <p className="text-xs font-semibold text-slate-500">
                Total Loan Repaid
              </p>

              <p className="mt-1 text-xl font-extrabold text-slate-900">
                ₦{money(repayTotal)}
              </p>

            </div>

          </div>

          {/* ==================================================
              SECONDARY INFORMATION
          =================================================== */}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

            {/* =================================================
                FIXED DEPOSITS
            ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <Landmark className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Fixed Deposit Records
                  </h2>

                  <p className="text-xs text-slate-500">
                    Your fixed deposit investments
                  </p>
                </div>

              </div>

              {fdRecords.length > 0 ? (

                <div className="space-y-3">

                  {fdRecords.map((row) => {

                    const amount = Number(row.amount || 0);
                    const tenure = Number(row.tenure_months || 0);
                    const rate = Number(row.interest_rate || 0);

                    const interest =
                      (amount * rate / 100) *
                      (tenure / 12);

                    let daysLeft: number | null = null;

                    if (row.maturity_date) {
                      const maturity = new Date(
                        row.maturity_date
                      ).getTime();

                      const today = new Date().getTime();

                      daysLeft = Math.ceil(
                        (maturity - today) /
                        (1000 * 60 * 60 * 24)
                      );
                    }

                    return (

                      <div
                        key={row.fd_id}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >

                        <div className="mb-3 flex items-center justify-between">

                          <span className="text-xs font-bold text-slate-500">
                            Fixed Deposit #{row.fd_id}
                          </span>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${statusColor(
                              row.status
                            )}`}
                          >
                            {row.status || "pending"}
                          </span>

                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">

                          <div>
                            <p className="text-slate-400">
                              Amount
                            </p>
                            <p className="font-bold text-slate-900">
                              ₦{money(amount)}
                            </p>
                          </div>

                          <div>
                            <p className="text-slate-400">
                              Tenure
                            </p>
                            <p className="font-bold text-slate-900">
                              {tenure} months
                            </p>
                          </div>

                          <div>
                            <p className="text-slate-400">
                              Interest Rate
                            </p>
                            <p className="font-bold text-slate-900">
                              {rate}%
                            </p>
                          </div>

                          <div>
                            <p className="text-slate-400">
                              Estimated Interest
                            </p>
                            <p className="font-bold text-emerald-700">
                              ₦{money(interest)}
                            </p>
                          </div>

                        </div>

                        {row.maturity_date && (

                          <div className="mt-4 border-t border-slate-200 pt-3">

                            <p className="text-xs text-slate-500">
                              Maturity Date
                            </p>

                            <p className="text-sm font-bold text-slate-900">
                              {formatDate(row.maturity_date)}
                            </p>

                            <div className="mt-2">

                              {daysLeft !== null &&
                              daysLeft > 0 ? (

                                <span className="text-xs font-bold text-amber-600">
                                  {daysLeft} days left
                                </span>

                              ) : (

                                <span className="text-xs font-bold text-emerald-600">
                                  Matured
                                </span>

                              )}

                            </div>

                          </div>

                        )}

                        <form
                          action="/certificate"
                          method="POST"
                          className="mt-4"
                        >

                          <input
                            type="hidden"
                            name="fd_id"
                            value={row.fd_id}
                          />

                          <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-600"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download Certificate
                          </button>

                        </form>

                      </div>

                    );
                  })}

                </div>

              ) : (

                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">

                  <Landmark className="mx-auto h-8 w-8 text-slate-300" />

                  <p className="mt-3 text-xs text-slate-500">
                    You have no fixed deposit records yet.
                  </p>

                </div>

              )}

            </section>

            {/* =================================================
                LOAN DUE DATES
            ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <CalendarCheck className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Loan Due Dates
                  </h2>

                  <p className="text-xs text-slate-500">
                    Upcoming loan repayment dates
                  </p>
                </div>

              </div>

              {dueDates.length > 0 ? (

                <div className="space-y-3">

                  {dueDates.map((due, index) => (

                    <div
                      key={index}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >

                      <div className="flex items-center justify-between gap-4">

                        <div>

                          <p className="text-xs text-slate-400">
                            Amount Due
                          </p>

                          <p className="text-lg font-extrabold text-slate-900">
                            ₦{money(due.amount_due)}
                          </p>

                        </div>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${statusColor(
                            due.status
                          )}`}
                        >
                          {due.status}
                        </span>

                      </div>

                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">

                        <Calendar className="h-3.5 w-3.5" />

                        Due on{" "}

                        <strong className="text-slate-800">
                          {formatDate(due.due_date)}
                        </strong>

                      </div>

                    </div>

                  ))}

                </div>

              ) : (

                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">

                  <CalendarCheck className="mx-auto h-8 w-8 text-slate-300" />

                  <p className="mt-3 text-xs text-slate-500">
                    You have no upcoming loan due dates.
                  </p>

                </div>

              )}

            </section>

            {/* =================================================
                LOAN APPROVALS
            ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <UserCheck className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Loan Approval Status
                  </h2>

                  <p className="text-xs text-slate-500">
                    Current loan application approvals
                  </p>
                </div>

              </div>

              {loanApprovals.length > 0 ? (

                <div className="space-y-2">

                  {loanApprovals.map((loan, index) => (

                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >

                      <span className="text-xs font-semibold text-slate-700">
                        Loan
                      </span>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${statusColor(
                          loan.status
                        )}`}
                      >
                        {loan.status}
                      </span>

                    </div>

                  ))}

                </div>

              ) : (

                <p className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
                  No loan approvals found.
                </p>

              )}

            </section>

            {/* =================================================
                FD APPROVALS
            ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Fixed Deposit Approvals
                  </h2>

                  <p className="text-xs text-slate-500">
                    Fixed deposit approval status
                  </p>
                </div>

              </div>

              {fdApprovals.length > 0 ? (

                <div className="space-y-2">

                  {fdApprovals.map((fd, index) => (

                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >

                      <span className="text-xs font-semibold text-slate-700">
                        Fixed Deposit
                      </span>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${statusColor(
                          fd.status
                        )}`}
                      >
                        {fd.status}
                      </span>

                    </div>

                  ))}

                </div>

              ) : (

                <p className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
                  No fixed deposit approvals found.
                </p>

              )}

            </section>

            {/* =================================================
                ANNOUNCEMENTS
            ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Megaphone className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Announcements
                  </h2>

                  <p className="text-xs text-slate-500">
                    Latest cooperative announcements
                  </p>
                </div>

              </div>

              {announcements.length > 0 ? (

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

                  {announcements.map((note, index) => {

                    const words = note.message.split(/\s+/);

                    const shortMessage =
                      words.length > 10
                        ? `${words.slice(0, 10).join(" ")}...`
                        : note.message;

                    return (

                      <article
                        key={index}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >

                        <h3 className="text-sm font-bold text-slate-900">
                          {note.title}
                        </h3>

                        <p className="mt-2 text-xs leading-6 text-slate-600">
                          {shortMessage}
                        </p>

                        {note.created_at && (

                          <div className="mt-3 border-t border-slate-200 pt-3">

                            <p className="text-[10px] font-medium text-slate-400">
                              📅 Posted on{" "}
                              {formatDateTime(note.created_at)}
                            </p>

                          </div>

                        )}

                      </article>

                    );
                  })}

                </div>

              ) : (

                <p className="rounded-xl bg-slate-50 p-5 text-center text-xs text-slate-500">
                  No announcements available at this time.
                </p>

              )}

            </section>

          </div>

          {/* ==================================================
              RESET PASSWORD
          =================================================== */}

          <div className="flex justify-center pt-2">

            <Link
              href="/member_reset_password"
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700"
            >
              <LockKeyhole className="h-4 w-4" />
              Reset Password
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

          </div>

        </main>

        {/* ======================================================
            FOOTER
        ======================================================= */}

        <footer className="mt-auto border-t border-slate-200 bg-white py-6">

          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">

            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} DCG Multipurpose
              Cooperative Society Ltd. All rights reserved.
            </p>

          </div>

        </footer>

      </div>
    );

  } catch (error: any) {

    console.error("Member dashboard error:", error);

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">

        <div className="w-full max-w-lg rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">

          <h1 className="text-lg font-bold text-rose-700">
            Error loading member dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            {error?.message || "An unexpected database error occurred."}
          </p>

        </div>

      </div>
    );
  }
}
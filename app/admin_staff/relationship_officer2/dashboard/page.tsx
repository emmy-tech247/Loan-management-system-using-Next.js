"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Shield,
  LogOut,
  FileText,
  CreditCard,
  LockKeyhole,
  ChevronRight,
  Search,
  Clock3,
  User,
  Wallet,
  CalendarDays,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

type Loan = {
  loan_id: number;
  full_name: string;
  loan_amount: number;
  tenure_month: number;
  loan_status: string;
  created_at: string;
};

type DashboardData = {
  fullName: string;
  loans: Loan[];
};

export default function RelationshipOfficer2Dashboard() {
  const router = useRouter();

  const [data, setData] = useState<DashboardData>({
    fullName: "Relationship Officer 2",
    loans: [],
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  /* ============================================================
     FETCH RELATIONSHIP OFFICER 2 DASHBOARD
  ============================================================ */

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const apiUrl =
          "/api/admin_staff/relationship_officer2/dashboard";

        const response = await fetch(apiUrl, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        const contentType =
          response.headers.get("content-type") || "";

        /* ======================================================
           ROUTE NOT FOUND
        ====================================================== */

        if (response.status === 404) {
          console.error(
            `Dashboard API route not found: ${apiUrl}`
          );

          setError(
            "Dashboard API route was not found. Make sure app/api/admin_staff/relationship_officer2/dashboard/route.ts exists and restart the Next.js server."
          );

          return;
        }

        /* ======================================================
           READ RESPONSE AS TEXT FIRST
        ====================================================== */

        const responseText = await response.text();

        let result: any = null;

        if (responseText) {
          try {
            result = JSON.parse(responseText);
          } catch {
            console.error(
              "Non-JSON dashboard response:",
              responseText.slice(0, 2000)
            );

            setError(
              `The dashboard server returned an invalid response (${response.status}).`
            );

            return;
          }
        }

        /* ======================================================
           AUTHENTICATION
        ====================================================== */

        if (response.status === 401) {
          router.push("/admin_staff/relationship_officer2/dashboard");
          return;
        }

        /* ======================================================
           ACCESS DENIED
        ====================================================== */

        if (response.status === 403) {
          setError(
            result?.message ||
              "Access denied. Relationship Officer 2 access is required."
          );

          return;
        }

        /* ======================================================
           OTHER SERVER ERRORS
        ====================================================== */

        if (!response.ok) {
          console.error(
            "Relationship Officer 2 API error:",
            {
              status: response.status,
              contentType,
              result,
            }
          );

          setError(
            result?.message ||
              result?.error ||
              `Failed to load dashboard. Server returned ${response.status}.`
          );

          return;
        }

        /* ======================================================
           SUCCESS
        ====================================================== */

        if (!result?.success) {
          setError(
            result?.message ||
              "Failed to load dashboard information."
          );

          return;
        }

        /* ======================================================
           UPDATE DASHBOARD DATA
        ====================================================== */

        setData({
          fullName:
            result.fullName ||
            "Relationship Officer 2",

          loans: Array.isArray(result.loans)
            ? result.loans.map((loan: any) => ({
                loan_id: Number(loan.loan_id),

                full_name:
                  loan.full_name ||
                  "Unknown Member",

                loan_amount:
                  Number(
                    loan.loan_amount || 0
                  ),

                tenure_month:
                  Number(
                    loan.tenure_month || 0
                  ),

                loan_status:
                  loan.loan_status ||
                  "submitted",

                created_at:
                  loan.created_at ||
                  new Date().toISOString(),
              }))
            : [],
        });
      } catch (error) {
        console.error(
          "Relationship Officer 2 dashboard request error:",
          error
        );

        setError(
          "Unable to connect to the dashboard service. Please check that the Next.js server is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  /* ============================================================
     LOGOUT
  ============================================================ */

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      router.push("/staff_login/login");
    }
  };

  /* ============================================================
     SEARCH / FILTER LOANS
  ============================================================ */

  const filteredLoans = data.loans.filter((loan) => {
    const query = searchQuery.toLowerCase().trim();

    return (
      loan.full_name
        .toLowerCase()
        .includes(query) ||
      String(loan.loan_id).includes(query) ||
      loan.loan_status
        .toLowerCase()
        .includes(query)
    );
  });

  /* ============================================================
     DASHBOARD STATISTICS
  ============================================================ */

  const totalLoans = data.loans.length;

  const totalAmount = data.loans.reduce(
    (total, loan) =>
      total + Number(loan.loan_amount || 0),
    0
  );

  const pendingLoans = data.loans.filter((loan) =>
    [
      "submitted",
      "pending",
      "pending_review",
      "forwarded_to_manager",
      "forwarded_to_admin2",
      "forwarded_to_accountant",
    ].includes(
      String(
        loan.loan_status || ""
      ).toLowerCase()
    )
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans -mt-28 text-slate-900">

      {/* ========================================================
          NAVBAR
      ======================================================== */}

      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-3">

            <Link
              href="/staff_login/login"
              className="flex items-center"
            >
              <Image
                src="/images/logo2.png"
                alt="DCG Cooperative Logo"
                width={140}
                height={40}
                className="h-9 w-auto object-contain"
                priority
              />
            </Link>

            <span className="hidden items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold text-white sm:inline-flex">
              <Shield className="h-3 w-3 text-emerald-400" />
              Officer Portal
            </span>

          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />

            <span>
              {loggingOut
                ? "Logging out..."
                : "Logout"}
            </span>
          </button>

        </div>
      </nav>

      {/* ========================================================
          MAIN
      ======================================================== */}

      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 mt-2 sm:px-6 lg:px-8">

        {/* ======================================================
            WELCOME BANNER
        ====================================================== */}

        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">

          <div className="pointer-events-none absolute right-0 top-0 -mr-8 -mt-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 max-w-2xl space-y-3">

            <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              Relationship Officer 2
            </span>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Welcome back, {data.fullName}
            </h1>

            <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
              Review submitted loan applications, manage repayments,
              contributions, and monitor loan applications assigned to you.
            </p>

          </div>
        </section>

        {/* ======================================================
            QUICK ACTIONS
        ====================================================== */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <Link
            href="/admin_staff/relationship_officer2/loan-apply"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <FileText className="h-5 w-5" />
              </div>

              <ChevronRight className="h-5 w-5 text-slate-300 transition-colors group-hover:text-emerald-600" />

            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900">
              Loan Application Form
            </h3>

            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Create and submit a new loan application for a member.
            </p>

          </Link>

          <Link
            href="/admin_staff/relationship_officer2/payment"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <CreditCard className="h-5 w-5" />
              </div>

              <ChevronRight className="h-5 w-5 text-slate-300 transition-colors group-hover:text-emerald-600" />

            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900">
              Loan Repayment & Contributions
            </h3>

            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Record loan repayments and monthly member contributions.
            </p>

          </Link>

          <Link
            href="/admin_staff/staff/change-password"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <LockKeyhole className="h-5 w-5" />
              </div>

              <ChevronRight className="h-5 w-5 text-slate-300 transition-colors group-hover:text-emerald-600" />

            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900">
              Change Password
            </h3>

            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Update your staff account password securely.
            </p>

          </Link>

        </section>

        {/* ======================================================
            STATISTICS
        ====================================================== */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FileText className="h-5 w-5" />
              </div>

              <div>

                <p className="text-xs font-medium text-slate-500">
                  Submitted Loans
                </p>

                <p className="text-2xl font-extrabold text-slate-900">
                  {totalLoans}
                </p>

              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Wallet className="h-5 w-5" />
              </div>

              <div>

                <p className="text-xs font-medium text-slate-500">
                  Total Loan Value
                </p>

                <p className="text-xl font-extrabold text-slate-900">
                  ₦
                  {totalAmount.toLocaleString(
                    "en-NG",
                    {
                      minimumFractionDigits: 2,
                    }
                  )}
                </p>

              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock3 className="h-5 w-5" />
              </div>

              <div>

                <p className="text-xs font-medium text-slate-500">
                  Pending Review
                </p>

                <p className="text-2xl font-extrabold text-slate-900">
                  {pendingLoans}
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ======================================================
            LOANS CARD
        ====================================================== */}

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6 md:flex-row md:items-center md:justify-between">

            <div>

              <h2 className="text-lg font-extrabold text-slate-900">
                Submitted Loan Applications
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Loans currently assigned to Relationship Officer 2 for review.
              </p>

            </div>

            <div className="relative w-full md:w-72">

              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="Search loans..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />

            </div>

          </div>

          {/* Error */}

          {error && (
            <div className="m-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">

              <AlertCircle className="h-4 w-4" />

              {error}

            </div>
          )}

          {/* Loading */}

          {loading ? (

            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

              <RefreshCw className="h-7 w-7 animate-spin text-emerald-600" />

              <p className="mt-3 text-sm font-semibold text-slate-700">
                Loading loan applications...
              </p>

            </div>

          ) : filteredLoans.length === 0 ? (

            <div className="px-6 py-16 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <FileText className="h-6 w-6" />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-900">
                No submitted loans found
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                There are currently no submitted loan applications assigned
                to you.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px] text-left">

                <thead>

                  <tr className="border-b border-slate-100 bg-slate-50/70">

                    <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Loan ID
                    </th>

                    <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Borrower
                    </th>

                    <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Amount
                    </th>

                    <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Tenure
                    </th>

                    <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Submitted On
                    </th>

                    <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredLoans.map((loan) => (

                    <tr
                      key={loan.loan_id}
                      className="transition-colors hover:bg-slate-50"
                    >

                      <td className="px-5 py-4">

                        <span className="font-bold text-slate-900">
                          #{loan.loan_id}
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                            <User className="h-4 w-4" />
                          </div>

                          <span className="text-sm font-semibold text-slate-800">
                            {loan.full_name}
                          </span>

                        </div>

                      </td>

                      <td className="px-5 py-4">

                        <span className="text-sm font-bold text-slate-900">
                          ₦
                          {Number(
                            loan.loan_amount
                          ).toLocaleString(
                            "en-NG",
                            {
                              minimumFractionDigits: 2,
                            }
                          )}
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">

                          <CalendarDays className="h-3.5 w-3.5 text-slate-500" />

                          {loan.tenure_month} months

                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold capitalize text-amber-700 ring-1 ring-inset ring-amber-200">
                          {loan.loan_status}
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <span className="text-xs font-medium text-slate-500">

                          {new Date(
                            loan.created_at
                          ).toLocaleString(
                            "en-NG",
                            {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }
                          )}

                        </span>

                      </td>

                      <td className="px-5 py-4 text-right">

                        <Link
                          href={`/admin_staff/relationship-officer2/review-loan?id=${loan.loan_id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
                        >
                          Review

                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </main>

      {/* ========================================================
          FOOTER
      ======================================================== */}

      <footer className="border-t border-slate-200 bg-white py-6">

        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} DCG Multipurpose Cooperative Society
            Ltd. All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  );
}

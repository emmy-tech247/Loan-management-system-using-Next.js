"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Landmark,
  LogOut,
  Shield,
  TrendingUp,
  User,
  Users,
  AlertTriangle,
  RefreshCw,
  WalletCards,
} from "lucide-react";

type Loan = {
  member_id: number;
  full_name: string;
  loan_id: number;
  loan_amount: number;
  amount_paid: number;
  start_date: string;
  due_date: string;
  loan_category: string;
  outstanding: number;
  days_overdue: number;
  default_charge: number;
  daily_growth: number;
  total_due: number;
};

type Totals = {
  loanCollected: number;
  outstanding: number;
  defaultCharges: number;
  dueWithCharges: number;
};

type LoanApiResponse = {
  success?: boolean;
  loans?: Loan[];
  totals?: Totals;
  message?: string;
};

export default function AdminLoanDashboard() {
  const router = useRouter();

  /*
   * IMPORTANT:
   * mounted prevents hydration mismatches caused by attributes
   * whose values can change immediately after hydration.
   */
  const [mounted, setMounted] = useState(false);

  const [loans, setLoans] = useState<Loan[]>([]);

  const [totals, setTotals] = useState<Totals>({
    loanCollected: 0,
    outstanding: 0,
    defaultCharges: 0,
    dueWithCharges: 0,
  });

  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  /* ============================================================
     MOUNT
  ============================================================ */

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ============================================================
     FETCH LOANS
  ============================================================ */

  const fetchLoans = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin_staff/admin/loan-report",
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      let data: LoanApiResponse | null = null;

      /*
       * Never attempt response.json() if Next.js returned
       * an HTML error page.
       */
      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();

        console.error(
          "Loan report returned non-JSON response:",
          text
        );

        throw new Error(
          `Server returned an unexpected response (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to load loans. Server returned ${response.status}.`
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Failed to load loan information."
        );
      }

      if (!Array.isArray(data.loans)) {
        throw new Error(
          "The server returned an invalid loan list."
        );
      }

      setLoans(data.loans);

      setTotals({
        loanCollected: Number(
          data.totals?.loanCollected ?? 0
        ),
        outstanding: Number(
          data.totals?.outstanding ?? 0
        ),
        defaultCharges: Number(
          data.totals?.defaultCharges ?? 0
        ),
        dueWithCharges: Number(
          data.totals?.dueWithCharges ?? 0
        ),
      });
    } catch (err) {
      console.error("fetchLoans error:", err);

      setLoans([]);

      setTotals({
        loanCollected: 0,
        outstanding: 0,
        defaultCharges: 0,
        dueWithCharges: 0,
      });

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load loan information."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  /* ============================================================
     LOGOUT
  ============================================================ */

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error(
          "Logout request failed:",
          response.status
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      router.push("/admin_staff/staff");
    }
  };

  /* ============================================================
     FORMATTERS
  ============================================================ */

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(Number(amount) || 0);
  };

  const formatDate = (date: string) => {
    if (!date) return "—";

    /*
     * Handle MySQL DATE values consistently.
     * This avoids timezone-related date shifts.
     */
    const parsedDate = new Date(
      `${date.substring(0, 10)}T00:00:00`
    );

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(parsedDate);
  };

  const getCategoryLabel = (category: string) => {
    if (category === "monthly_saver") {
      return "Monthly Saver";
    }

    if (category === "borrower") {
      return "Borrower";
    }

    return category || "Borrower";
  };

  /* ============================================================
     FILTERING
  ============================================================ */

  const filteredLoans = loans.filter((loan) => {
    const search = searchQuery.toLowerCase().trim();

    const fullName = String(
      loan.full_name || ""
    ).toLowerCase();

    const matchesSearch =
      fullName.includes(search) ||
      String(loan.loan_id).includes(search) ||
      String(loan.member_id).includes(search);

    const matchesCategory =
      categoryFilter === "all" ||
      loan.loan_category === categoryFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "overdue" &&
        Number(loan.days_overdue) > 0 &&
        Number(loan.outstanding) > 0) ||
      (statusFilter === "current" &&
        Number(loan.outstanding) > 0 &&
        Number(loan.days_overdue) === 0) ||
      (statusFilter === "paid" &&
        Number(loan.outstanding) <= 0);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStatus
    );
  });

  const overdueCount = loans.filter(
    (loan) =>
      Number(loan.days_overdue) > 0 &&
      Number(loan.outstanding) > 0
  ).length;

  const paidCount = loans.filter(
    (loan) => Number(loan.outstanding) <= 0
  ).length;

  /* ============================================================
     UI
  ============================================================ */

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans -mt-28 text-slate-900">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/admin_staff/staff/login"
                className="flex items-center gap-2"
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

              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white">
                <Shield className="h-3 w-3 text-emerald-400" />
                Executive Portal
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* REFRESH */}
              <button
                type="button"
                onClick={fetchLoans}
                disabled={mounted ? loading : false}
                aria-disabled={mounted ? loading : false}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loading ? "animate-spin" : ""
                  }`}
                />

                <span className="hidden sm:inline">
                  {loading ? "Loading..." : "Refresh"}
                </span>
              </button>

              {/* LOGOUT */}
              <button
                type="button"
                onClick={handleLogout}
                disabled={mounted ? isLoggingOut : false}
                aria-disabled={
                  mounted ? isLoggingOut : false
                }
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />

                <span>
                  {isLoggingOut
                    ? "Logging out..."
                    : "Logout"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 mt-2 sm:px-6 lg:px-8 space-y-6">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">
          <div className="pointer-events-none absolute right-0 top-0 -mr-10 -mt-10 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Landmark className="h-3.5 w-3.5" />
              Administrator's Executive Suite
            </span>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Admin Loan Dashboard
            </h1>

            <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
              Monitor loans, outstanding balances, overdue
              accounts, default charges, and total amounts due
              across the cooperative.
            </p>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="flex-1">
              <p className="text-sm font-bold">
                Unable to load loan data
              </p>

              <p className="mt-1 text-xs">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchLoans}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* SUMMARY */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Overall Summary
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Current loan portfolio overview
              </p>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                {overdueCount} Overdue
              </span>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                {paidCount} Paid
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="Total Loan Collected"
              value={formatCurrency(totals.loanCollected)}
              icon={Banknote}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              valueColor="text-slate-900"
            />

            <SummaryCard
              title="Total Outstanding"
              value={formatCurrency(totals.outstanding)}
              icon={WalletCards}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
              valueColor="text-amber-700"
            />

            <SummaryCard
              title="Default Charges"
              value={formatCurrency(totals.defaultCharges)}
              icon={TrendingUp}
              iconBg="bg-orange-50"
              iconColor="text-orange-600"
              valueColor="text-orange-700"
            />

            <SummaryCard
              title="Total Due with Charges"
              value={formatCurrency(totals.dueWithCharges)}
              icon={AlertTriangle}
              iconBg="bg-rose-50"
              iconColor="text-rose-600"
              valueColor="text-rose-700"
            />
          </div>
        </section>

        {/* FILTERS */}
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                placeholder="Search member, loan ID..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(e.target.value)
                }
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500"
              >
                <option value="all">
                  All Categories
                </option>

                <option value="monthly_saver">
                  Monthly Saver
                </option>

                <option value="borrower">
                  Borrower
                </option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500"
              >
                <option value="all">
                  All Statuses
                </option>

                <option value="current">
                  Current
                </option>

                <option value="overdue">
                  Overdue
                </option>

                <option value="paid">
                  Paid
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* LOAN ACCOUNTS */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Loan Accounts
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredLoans.length} loan
                {filteredLoans.length !== 1
                  ? "s"
                  : ""}{" "}
                displayed
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(
                (item) => (
                  <div
                    key={item}
                    className="h-96 animate-pulse rounded-3xl border border-slate-200 bg-white"
                  />
                )
              )}
            </div>
          ) : filteredLoans.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Users className="h-7 w-7" />
              </div>

              <h3 className="mt-4 text-sm font-extrabold text-slate-900">
                No loan records found
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                No loans match the current search and
                filter criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredLoans.map((loan) => {
                const isOverdue =
                  Number(loan.days_overdue) > 0 &&
                  Number(loan.outstanding) > 0;

                const isPaid =
                  Number(loan.outstanding) <= 0;

                return (
                  <article
                    key={`${loan.loan_id}-${loan.member_id}`}
                    className="group overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                  >
                    {/* HEADER */}
                    <div className="border-b border-slate-100 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                            <User className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-extrabold text-slate-900">
                              {loan.full_name ||
                                "Unknown Member"}
                            </h3>

                            <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                              Member #{loan.member_id}
                            </p>
                          </div>
                        </div>

                        {isOverdue ? (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-extrabold text-rose-700">
                            <AlertTriangle className="h-3 w-3" />
                            Overdue
                          </span>
                        ) : isPaid ? (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold text-blue-700">
                            <Clock className="h-3 w-3" />
                            Current
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                          <CreditCard className="h-3 w-3" />
                          Loan #{loan.loan_id}
                        </span>

                        <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                          {getCategoryLabel(
                            loan.loan_category
                          )}
                        </span>
                      </div>
                    </div>

                    {/* BODY */}
                    <div className="space-y-3 p-5">
                      <LoanRow
                        label="Loan Amount"
                        value={formatCurrency(
                          loan.loan_amount
                        )}
                      />

                      <LoanRow
                        label="Amount Paid"
                        value={formatCurrency(
                          loan.amount_paid
                        )}
                        valueClass="text-emerald-700"
                      />

                      <LoanRow
                        label="Outstanding"
                        value={formatCurrency(
                          loan.outstanding
                        )}
                        valueClass={
                          loan.outstanding > 0
                            ? "text-amber-700"
                            : "text-emerald-700"
                        }
                      />

                      <LoanRow
                        label="Start Date"
                        value={formatDate(
                          loan.start_date
                        )}
                        icon={
                          <Calendar className="h-3.5 w-3.5" />
                        }
                      />

                      <LoanRow
                        label="Due Date"
                        value={formatDate(
                          loan.due_date
                        )}
                        icon={
                          <Calendar className="h-3.5 w-3.5" />
                        }
                      />

                      <LoanRow
                        label="Default Charge"
                        value={formatCurrency(
                          loan.default_charge
                        )}
                        valueClass={
                          loan.default_charge > 0
                            ? "text-orange-700"
                            : "text-slate-700"
                        }
                      />

                      <LoanRow
                        label={`Daily Growth (${loan.days_overdue} days)`}
                        value={formatCurrency(
                          loan.daily_growth
                        )}
                        valueClass={
                          loan.daily_growth > 0
                            ? "text-orange-700"
                            : "text-slate-700"
                        }
                      />
                    </div>

                    {/* TOTAL */}
                    <div
                      className={`mx-5 mb-5 rounded-2xl border p-4 ${
                        isOverdue
                          ? "border-rose-200 bg-rose-50"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p
                            className={`text-[10px] font-bold uppercase tracking-wider ${
                              isOverdue
                                ? "text-rose-600"
                                : "text-slate-500"
                            }`}
                          >
                            Total Due
                          </p>

                          <p
                            className={`mt-1 text-lg font-black ${
                              isOverdue
                                ? "text-rose-700"
                                : "text-slate-900"
                            }`}
                          >
                            {formatCurrency(
                              loan.total_due
                            )}
                          </p>
                        </div>

                        {isOverdue && (
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-rose-500">
                              DAYS OVERDUE
                            </p>

                            <p className="text-xl font-black text-rose-700">
                              {loan.days_overdue}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* BACK */}
        <div className="flex justify-center pb-4">
          <Link
            href="/admin_staff/admin/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </Link>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500">
            © DCG Multipurpose Cooperative Society Ltd.
            All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  valueColor,
}: {
  title: string;
  value: string;
  icon: ElementType;
  iconBg: string;
  iconColor: string;
  valueColor: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-4 text-xs font-semibold text-slate-500">
        {title}
      </p>

      <p
        className={`mt-1 text-lg font-extrabold ${valueColor}`}
      >
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   LOAN ROW
============================================================ */

function LoanRow({
  label,
  value,
  valueClass = "text-slate-900",
  icon,
}: {
  label: string;
  value: string;
  valueClass?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2 last:border-0">
      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
        {icon}
        {label}
      </span>

      <span
        className={`text-right text-xs font-bold ${valueClass}`}
      >
        {value}
      </span>
    </div>
  );
}

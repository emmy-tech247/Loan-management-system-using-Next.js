"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Search,
  Shield,
  User,
  Mail,
  Phone,
  Wallet,
  PiggyBank,
  Landmark,
  TrendingUp,
  CalendarDays,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Megaphone,
  ChevronDown,
  ChevronUp,
  FileCheck,
  BadgeCheck,
  Loader2,
} from "lucide-react";

type Member = {
  member_id: number;
  full_name: string;
  email: string;
  phone_number: string;
  passport: string | null;
};

type FixedDeposit = {
  fd_id: number;
  amount_deposited: number;
  tenure_months: number;
  interest_rate: number;
  status: string;
  maturity_date: string;
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
};

type MemberViewerData = {
  success: boolean;
  member: Member | null;
  loanBalance: number;
  savingsBalance: number;
  monthlySavings: number;
  repayTotal: number;
  fdRecords: FixedDeposit[];
  dueDates: DueDate[];
  loanApprovals: Approval[];
  fdApprovals: Approval[];
  announcements: Announcement[];
  message?: string;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  code?: string;
};

export default function MemberViewerPage() {
  const [memberId, setMemberId] = useState("");
  const [memberData, setMemberData] =
    useState<MemberViewerData | null>(null);

  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const [expandedAnnouncements, setExpandedAnnouncements] =
    useState<Record<number, boolean>>({});

  /**
   * ---------------------------------------------------------
   * UPDATE MEMBER
   * ---------------------------------------------------------
   *
   * Sends the supplied FormData to the MD edit-member API.
   *
   * IMPORTANT:
   * Do not manually set Content-Type when using FormData.
   * The browser automatically adds the multipart boundary.
   */
  const updateMember = async (
    formData: FormData
  ): Promise<ApiResponse> => {
    try {
      const response = await fetch(
        "/api/admin_staff/md/edit-member",
        {
          method: "PUT",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
          body: formData,
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      let data: ApiResponse = {};

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();

        console.error(
          "Unexpected edit-member response:",
          text
        );

        return {
          success: false,
          message:
            "The server returned an unexpected response. Please try again.",
        };
      }

      if (!response.ok || !data.success) {
        return {
          ...data,
          success: false,
          message:
            data.message ||
            data.error ||
            "Unable to update member.",
        };
      }

      return {
        ...data,
        success: true,
        message:
          data.message || "Member updated successfully.",
      };
    } catch (err) {
      console.error(
        "Update member error:",
        err
      );

      return {
        success: false,
        message:
          "Unable to update member. Please try again.",
      };
    }
  };

  /**
   * ---------------------------------------------------------
   * SEARCH MEMBER
   * ---------------------------------------------------------
   */
  const searchMember = async (e?: FormEvent) => {
    e?.preventDefault();

    const trimmedId = memberId.trim();

    if (
      !trimmedId ||
      Number.isNaN(Number(trimmedId)) ||
      Number(trimmedId) <= 0
    ) {
      setError("Please enter a valid Member ID.");
      setMemberData(null);
      setSearched(true);
      return;
    }

    setLoading(true);
    setError("");
    setMemberData(null);
    setSearched(true);

    try {
      const response = await fetch(
        `/api/admin_staff/md/member-viewer?member_id=${encodeURIComponent(
          trimmedId
        )}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await response.text();

        console.error(
          "Unexpected member-viewer response:",
          text
        );

        setError(
          "The server returned an unexpected response. Please log in again and try again."
        );

        return;
      }

      const data: MemberViewerData =
        await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "No member found."
        );
        return;
      }

      setMemberData(data);
    } catch (err) {
      console.error(
        "Member search error:",
        err
      );

      setError(
        "Unable to load member information. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * ---------------------------------------------------------
   * MONEY FORMATTER
   * ---------------------------------------------------------
   */
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  };

  /**
   * ---------------------------------------------------------
   * DATE FORMATTER
   * ---------------------------------------------------------
   */
  const formatDate = (date: string) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-NG",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  /**
   * ---------------------------------------------------------
   * STATUS FORMATTER
   * ---------------------------------------------------------
   */
  const formatStatus = (status: string) => {
    if (!status) return "Unknown";

    return status
      .replace(/_/g, " ")
      .replace(
        /\b\w/g,
        (letter) => letter.toUpperCase()
      );
  };

  /**
   * ---------------------------------------------------------
   * ANNOUNCEMENT TOGGLE
   * ---------------------------------------------------------
   */
  const toggleAnnouncement = (
    index: number
  ) => {
    setExpandedAnnouncements(
      (current) => ({
        ...current,
        [index]: !current[index],
      })
    );
  };

  /**
   * ---------------------------------------------------------
   * ANNOUNCEMENT PREVIEW
   * ---------------------------------------------------------
   */
  const getAnnouncementPreview = (
    message: string
  ) => {
    const words = message
      .trim()
      .split(/\s+/);

    return {
      preview: words
        .slice(0, 15)
        .join(" "),
      isLong: words.length > 15,
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans -mt-28 text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Logo */}
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

              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold text-white">
                <Shield className="h-3 w-3 text-emerald-400" />
                Executive Portal
              </span>
            </div>

            {/* Back Button */}
            <Link
              href="/admin_staff/md/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />

              <span className="hidden sm:inline">
                Back to MD Dashboard
              </span>

              <span className="sm:hidden">
                Back
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 mt-2 lg:px-8 space-y-6">

        {/* Header */}
        <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">

          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              <User className="h-3.5 w-3.5" />
              Member Financial Intelligence
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Member Transaction Viewer
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Search for a member and review their financial position,
              fixed deposits, loan obligations, repayments, approvals
              and society announcements.
            </p>
          </div>
        </div>

        {/* Search Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
          <form
            onSubmit={searchMember}
            className="flex flex-col md:flex-row md:items-end gap-4"
          >
            <div className="flex-1 space-y-1.5">
              <label
                htmlFor="member_id"
                className="text-xs font-bold text-slate-700"
              >
                Member ID
              </label>

              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

                <input
                  id="member_id"
                  type="number"
                  min="1"
                  required
                  value={memberId}
                  onChange={(e) =>
                    setMemberId(
                      e.target.value
                    )
                  }
                  placeholder="Enter member ID, e.g. 101"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search Member
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3 text-sm text-rose-800">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />

            <div>
              <p className="font-bold">
                Member Search Failed
              </p>

              <p className="text-xs mt-0.5">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* No Result */}
        {searched &&
          !loading &&
          !memberData &&
          !error && (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <User className="h-6 w-6" />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-900">
                No member found
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                No member was found with the supplied Member ID.
              </p>
            </div>
          )}

        {memberData?.member && (
          <>
            {/* Member Information */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex flex-col md:flex-row gap-6">

                {/* Passport */}
                <div className="shrink-0">
                  {memberData.member.passport ? (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                      <img
                        src={`/uploads/${memberData.member.passport}`}
                        alt={`${memberData.member.full_name} passport`}
                        className="h-36 w-36 object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-36 w-36 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 border border-slate-200">
                      <User className="h-12 w-12" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                        <BadgeCheck className="h-3 w-3" />
                        Member Profile
                      </span>

                      <h2 className="mt-2 text-xl font-extrabold text-slate-900">
                        {memberData.member.full_name}
                      </h2>

                      <p className="mt-1 text-xs font-medium text-slate-500">
                        Member ID:{" "}
                        <span className="font-bold text-slate-700">
                          {memberData.member.member_id}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">

                    {/* Email */}
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                        <Mail className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase text-slate-400">
                          Email
                        </p>

                        <p className="text-xs font-semibold text-slate-700 break-all">
                          {memberData.member.email ||
                            "Not provided"}
                        </p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                        <Phone className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">
                          Phone
                        </p>

                        <p className="text-xs font-semibold text-slate-700">
                          {memberData.member.phone_number ||
                            "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Financial Summary */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">
                    Financial Summary
                  </h2>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Current financial position for this member
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Loan Balance */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                      <Wallet className="h-5 w-5" />
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Loan
                    </span>
                  </div>

                  <p className="mt-4 text-[10px] font-bold uppercase text-slate-400">
                    Loan Balance
                  </p>

                  <p className="mt-1 text-lg font-extrabold text-rose-700">
                    {formatMoney(
                      memberData.loanBalance
                    )}
                  </p>
                </div>

                {/* Savings */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                      <PiggyBank className="h-5 w-5" />
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Savings
                    </span>
                  </div>

                  <p className="mt-4 text-[10px] font-bold uppercase text-slate-400">
                    Monthly Contribution
                  </p>

                  <p className="mt-1 text-lg font-extrabold text-emerald-700">
                    {formatMoney(
                      memberData.savingsBalance
                    )}
                  </p>
                </div>

                {/* Expected Monthly */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                      <CalendarDays className="h-5 w-5" />
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Expected
                    </span>
                  </div>

                  <p className="mt-4 text-[10px] font-bold uppercase text-slate-400">
                    Expected Monthly
                  </p>

                  <p className="mt-1 text-lg font-extrabold text-blue-700">
                    {formatMoney(
                      memberData.monthlySavings
                    )}
                  </p>
                </div>

                {/* Repayment */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                      <TrendingUp className="h-5 w-5" />
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Repaid
                    </span>
                  </div>

                  <p className="mt-4 text-[10px] font-bold uppercase text-slate-400">
                    Total Loan Repaid
                  </p>

                  <p className="mt-1 text-lg font-extrabold text-purple-700">
                    {formatMoney(
                      memberData.repayTotal
                    )}
                  </p>
                </div>
              </div>
            </section>

            {/* Fixed Deposits */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                  <Landmark className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">
                    Fixed Deposits
                  </h2>

                  <p className="text-xs text-slate-500">
                    Confirmed fixed deposit records
                  </p>
                </div>
              </div>

              {memberData.fdRecords.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-8 text-center">
                  <Landmark className="mx-auto h-7 w-7 text-slate-300" />

                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    No fixed deposit records
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {memberData.fdRecords.map(
                    (fd) => (
                      <div
                        key={fd.fd_id}
                        className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-bold text-purple-700">
                            <CheckCircle2 className="h-3 w-3" />
                            {formatStatus(fd.status)}
                          </span>

                          <span className="text-[10px] font-semibold text-slate-400">
                            FD #{fd.fd_id}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-[10px] font-bold uppercase text-slate-400">
                              Amount Deposited
                            </p>

                            <p className="text-lg font-extrabold text-purple-700">
                              {formatMoney(
                                fd.amount_deposited
                              )}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-[10px] font-bold uppercase text-slate-400">
                                Tenure
                              </p>

                              <p className="text-xs font-bold text-slate-700">
                                {fd.tenure_months} months
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] font-bold uppercase text-slate-400">
                                Interest
                              </p>

                              <p className="text-xs font-bold text-slate-700">
                                {fd.interest_rate}%
                              </p>
                            </div>
                          </div>

                          <div className="border-t border-slate-200 pt-3">
                            <p className="text-[10px] font-bold uppercase text-slate-400">
                              Maturity Date
                            </p>

                            <p className="text-xs font-bold text-slate-700">
                              {formatDate(
                                fd.maturity_date
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </section>

            {/* Loan Due Dates */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <CalendarDays className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">
                    Loan Due Dates
                  </h2>

                  <p className="text-xs text-slate-500">
                    Scheduled loan repayment obligations
                  </p>
                </div>
              </div>

              {memberData.dueDates.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-8 text-center">
                  <CalendarDays className="mx-auto h-7 w-7 text-slate-300" />

                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    No due dates
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {memberData.dueDates.map(
                    (due, index) => (
                      <div
                        key={`${due.due_date}-${index}`}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                            <Clock3 className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-[10px] font-bold uppercase text-slate-400">
                              Due Date
                            </p>

                            <p className="text-xs font-bold text-slate-800">
                              {formatDate(
                                due.due_date
                              )}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">
                            Amount Due
                          </p>

                          <p className="text-sm font-extrabold text-amber-700">
                            {formatMoney(
                              due.amount_due
                            )}
                          </p>
                        </div>

                        <span className="inline-flex w-fit items-center rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-700">
                          {formatStatus(
                            due.status
                          )}
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
            </section>

            {/* Approvals */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <FileCheck className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">
                    Approvals
                  </h2>

                  <p className="text-xs text-slate-500">
                    Loan and fixed deposit approval records
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Loan approvals */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                  <h3 className="text-xs font-extrabold text-slate-800">
                    Loan Approvals
                  </h3>

                  <div className="mt-4 space-y-2">
                    {memberData.loanApprovals.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        No loan approvals.
                      </p>
                    ) : (
                      memberData.loanApprovals.map(
                        (approval, index) => (
                          <div
                            key={`loan-${index}`}
                            className="flex items-center justify-between rounded-xl bg-white border border-slate-200 p-3"
                          >
                            <span className="text-xs font-semibold text-slate-600">
                              Loan
                            </span>

                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" />
                              {formatStatus(
                                approval.status
                              )}
                            </span>
                          </div>
                        )
                      )
                    )}
                  </div>
                </div>

                {/* FD approvals */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                  <h3 className="text-xs font-extrabold text-slate-800">
                    Fixed Deposit Approvals
                  </h3>

                  <div className="mt-4 space-y-2">
                    {memberData.fdApprovals.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        No fixed deposit approvals.
                      </p>
                    ) : (
                      memberData.fdApprovals.map(
                        (approval, index) => (
                          <div
                            key={`fd-${index}`}
                            className="flex items-center justify-between rounded-xl bg-white border border-slate-200 p-3"
                          >
                            <span className="text-xs font-semibold text-slate-600">
                              Fixed Deposit
                            </span>

                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-bold text-purple-700">
                              <CheckCircle2 className="h-3 w-3" />
                              {formatStatus(
                                approval.status
                              )}
                            </span>
                          </div>
                        )
                      )
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Announcements */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Megaphone className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">
                    Announcements
                  </h2>

                  <p className="text-xs text-slate-500">
                    Latest society announcements
                  </p>
                </div>
              </div>

              {memberData.announcements.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-8 text-center">
                  <Megaphone className="mx-auto h-7 w-7 text-slate-300" />

                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    No announcements available.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {memberData.announcements.map(
                    (announcement, index) => {
                      const {
                        preview,
                        isLong,
                      } =
                        getAnnouncementPreview(
                          announcement.message
                        );

                      const expanded =
                        expandedAnnouncements[
                          index
                        ] || false;

                      return (
                        <div
                          key={`${announcement.title}-${index}`}
                          className="rounded-2xl border border-slate-200 bg-slate-50/70 overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              isLong &&
                              toggleAnnouncement(
                                index
                              )
                            }
                            className={`w-full p-4 text-left ${
                              isLong
                                ? "cursor-pointer hover:bg-slate-100"
                                : "cursor-default"
                            } transition-colors`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <h3 className="text-xs font-extrabold text-slate-900">
                                  {
                                    announcement.title
                                  }
                                </h3>

                                {!expanded && (
                                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                                    {preview}

                                    {isLong && (
                                      <>
                                        {" "}

                                        <span className="font-bold text-blue-600">
                                          ... Read more
                                        </span>
                                      </>
                                    )}
                                  </p>
                                )}

                                {expanded && (
                                  <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-600">
                                    {
                                      announcement.message
                                    }
                                  </p>
                                )}
                              </div>

                              {isLong && (
                                <div className="shrink-0 text-slate-400">
                                  {expanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </div>
                              )}
                            </div>

                            {expanded && (
                              <p className="mt-3 text-[10px] font-bold text-rose-600">
                                Show less
                              </p>
                            )}
                          </button>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500">
            &copy;{" "}
            {new Date().getFullYear()} DCG Multipurpose Cooperative
            Society Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
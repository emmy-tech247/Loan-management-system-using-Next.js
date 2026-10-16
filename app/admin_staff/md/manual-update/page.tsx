"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Shield,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  PiggyBank,
  Landmark,
  Wallet,
  CalendarCheck,
  Send,
  Search,
  CircleDollarSign,
} from "lucide-react";

import {
  MemberBalanceOverview,
  TransactionType,
} from "@/types/manual-transaction";

export default function ManualTransactionUpdatePage() {
  const router = useRouter();

  const [memberIdInput, setMemberIdInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [transactionType, setTransactionType] =
    useState<TransactionType | "">("");

  const [memberData, setMemberData] =
    useState<MemberBalanceOverview | null>(null);

  const [isSearchingMember, setIsSearchingMember] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  /*
   * ============================================================
   * SAFE JSON RESPONSE HELPER
   * ============================================================
   *
   * Used mainly for GET requests.
   */
  const readJsonResponse = async (response: Response) => {
    const contentType =
      response.headers.get("content-type") || "";

    if (
      !contentType
        .toLowerCase()
        .includes("application/json")
    ) {
      const text = await response.text();

      console.error(
        "API returned non-JSON response:",
        text.slice(0, 1000)
      );

      throw new Error(
        response.status === 401
          ? "Unauthorized. Please login again."
          : response.status === 403
            ? "You are not authorized to perform this action."
            : response.status >= 500
              ? "The server encountered an error. Please try again."
              : "The server returned an invalid response."
      );
    }

    return response.json();
  };

  /*
   * ============================================================
   * SEARCH MEMBER
   * ============================================================
   */
  useEffect(() => {
    const trimmedId = memberIdInput.trim();

    if (!trimmedId) {
      setMemberData(null);
      setIsSearchingMember(false);
      return;
    }

    if (!/^\d+$/.test(trimmedId)) {
      setMemberData(null);
      setIsSearchingMember(false);

      setMessage({
        type: "error",
        text: "Member ID must contain numbers only.",
      });

      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingMember(true);
      setMessage(null);

      try {
        const response = await fetch(
          `/api/admin_staff/members/${encodeURIComponent(
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

        /*
         * ======================================================
         * 401 SESSION ERROR
         * ======================================================
         */
        if (response.status === 401) {
          setMemberData(null);

          setMessage({
            type: "error",
            text:
              "Your MD session has expired. Please login again.",
          });

          return;
        }

        /*
         * ======================================================
         * 403 AUTHORIZATION ERROR
         * ======================================================
         */
        if (response.status === 403) {
          setMemberData(null);

          setMessage({
            type: "error",
            text:
              "Only the Managing Director is authorized to access this page.",
          });

          return;
        }

        const data = await readJsonResponse(response);

        /*
         * Your member API may return either:
         *
         * {
         *   success: true,
         *   data: {...}
         * }
         *
         * or:
         *
         * {
         *   success: true,
         *   member: {...}
         * }
         *
         * Support both formats.
         */

        const loadedMember =
          data?.data ?? data?.member ?? null;

        if (
          response.ok &&
          data?.success &&
          loadedMember
        ) {
          setMemberData(loadedMember);
          setMessage(null);
        } else {
          setMemberData(null);

          setMessage({
            type: "error",
            text:
              data?.message ||
              "Member could not be found.",
          });
        }
      } catch (error) {
        console.error(
          "Failed to retrieve member:",
          error
        );

        setMemberData(null);

        setMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Unable to retrieve member information.",
        });
      } finally {
        setIsSearchingMember(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [memberIdInput]);

  /*
   * ============================================================
   * SUBMIT MANUAL TRANSACTION
   * ============================================================
   */
  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setIsSubmitting(true);
    setMessage(null);

    try {
      // ========================================================
      // 1. GET MEMBER ID
      // ========================================================

      const memberId = Number(
        memberIdInput.trim()
      );

      // ========================================================
      // 2. GET AMOUNT
      // ========================================================

      const amount = Number(
        amountInput
      );

      // ========================================================
      // 3. VALIDATE MEMBER ID
      // ========================================================

      if (
        !Number.isInteger(memberId) ||
        memberId <= 0
      ) {
        setMessage({
          type: "error",
          text: "Please enter a valid member ID.",
        });

        return;
      }

      // ========================================================
      // IMPORTANT:
      // DO NOT REQUIRE memberData HERE.
      //
      // The API will verify that the member actually exists.
      // ========================================================

      // ========================================================
      // 4. VALIDATE AMOUNT
      // ========================================================

      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        setMessage({
          type: "error",
          text: "Please enter a valid amount.",
        });

        return;
      }

      // ========================================================
      // 5. VALIDATE TRANSACTION TYPE
      // ========================================================

      if (!transactionType) {
        setMessage({
          type: "error",
          text: "Please select a transaction type.",
        });

        return;
      }

      // ========================================================
      // 6. SEND MANUAL TRANSACTION REQUEST
      // ========================================================

      const response = await fetch(
        "/api/admin_staff/md/manual-update",
        {
          method: "POST",

          credentials: "include",

          cache: "no-store",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            member_id: Number(memberIdInput),
            amount: Number(amountInput),
            type: transactionType,
          }),
        }
      );

      // ========================================================
      // IMPORTANT:
      // READ RESPONSE AS TEXT FIRST
      //
      // This prevents:
      //
      // JSON.parse:
      // unexpected character at line 1 column 1
      //
      // when Next.js returns HTML or another non-JSON response.
      // ========================================================

      const responseText =
        await response.text();

      console.log(
        "=========================================="
      );

      console.log(
        "MANUAL TRANSACTION STATUS:",
        response.status
      );

      console.log(
        "MANUAL TRANSACTION RESPONSE:",
        responseText
      );

      console.log(
        "=========================================="
      );

      // ========================================================
      // 7. PARSE RESPONSE SAFELY
      // ========================================================

      let data: {
        success?: boolean;
        message?: string;
        error?: string;

        debug?: {
          database?: string | null;

          searched_member_id?: number;

          requested_member_id?: number;

          available_members?: Array<{
            member_id: number;
            full_name: string | null;
          }>;

          sample_members?: Array<{
            member_id: number;
            full_name: string | null;
          }>;
        };

        member?: {
          member_id?: number;
          full_name?: string | null;
        };

        transaction?: {
          member_id?: number;
          amount?: number;
          type?: string;
        };
      };

      try {
        data = responseText
          ? JSON.parse(responseText)
          : {};
      } catch {
        console.error(
          "INVALID JSON RESPONSE:",
          responseText
        );

        setMessage({
          type: "error",
          text:
            `Server returned an invalid response (${response.status}). ` +
            responseText.substring(0, 300),
        });

        return;
      }

      // ========================================================
      // 8. HANDLE 401
      // ========================================================

      if (response.status === 401) {
        setMessage({
          type: "error",
          text:
            data.message ||
            "Your MD login session is missing or has expired. Please login again.",
        });

        return;
      }

      // ========================================================
      // 9. HANDLE 403
      // ========================================================

      if (response.status === 403) {
        setMessage({
          type: "error",
          text:
            data.message ||
            "You are not authorized to perform manual transaction updates.",
        });

        return;
      }

      // ========================================================
      // 10. SHOW ACTUAL API ERROR
      // ========================================================

      if (
        !response.ok ||
        !data.success
      ) {
        console.error(
          "=========================================="
        );

        console.error(
          "MANUAL TRANSACTION ERROR:",
          data
        );

        // ------------------------------------------------------
        // Show database diagnostic in console.
        // ------------------------------------------------------

        if (data.debug) {
          console.error(
            "DATABASE:",
            data.debug.database
          );

          console.error(
            "SEARCHED MEMBER ID:",
            data.debug.searched_member_id ??
              data.debug.requested_member_id
          );

          console.error(
            "AVAILABLE MEMBERS:",
            data.debug.available_members ??
              data.debug.sample_members
          );
        }

        console.error(
          "=========================================="
        );

        // ------------------------------------------------------
        // Create a useful user-facing message.
        // ------------------------------------------------------

        let errorMessage =
          data.message ||
          data.error ||
          "Unable to update transaction.";

        // ------------------------------------------------------
        // If API returned database diagnostics,
        // include useful information in development.
        // ------------------------------------------------------

        if (
          data.debug &&
          data.debug.database
        ) {
          const availableMembers =
            data.debug.available_members ??
            data.debug.sample_members ??
            [];

          if (
            availableMembers.length === 0
          ) {
            errorMessage =
              `${errorMessage} No members were found in the database used by Next.js (${data.debug.database}).`;
          }
        }

        setMessage({
          type: "error",
          text: errorMessage,
        });

        return;
      }

      // ========================================================
      // 11. SUCCESS
      // ========================================================

      console.log(
        "=========================================="
      );

      console.log(
        "MANUAL TRANSACTION SUCCESS:",
        data
      );

      console.log(
        "=========================================="
      );

      setMessage({
        type: "success",
        text:
          data.message ||
          "Transaction updated successfully.",
      });

      // ========================================================
      // 12. CLEAR TRANSACTION INPUTS
      // ========================================================

      setAmountInput("");
      setTransactionType("");

      // ========================================================
      // 13. REFRESH MEMBER DATA
      // ========================================================

      try {
        const refreshResponse =
          await fetch(
            `/api/admin_staff/members/${encodeURIComponent(
              String(memberId)
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

        if (
          refreshResponse.status === 401
        ) {
          console.warn(
            "Member refresh failed because the MD session expired."
          );

          return;
        }

        if (refreshResponse.ok) {
          const refreshData =
            await readJsonResponse(
              refreshResponse
            );

          const refreshedMember =
            refreshData?.data ??
            refreshData?.member ??
            null;

          if (
            refreshData?.success &&
            refreshedMember
          ) {
            setMemberData(
              refreshedMember
            );
          }
        }
      } catch (refreshError) {
        console.error(
          "Failed to refresh member balance:",
          refreshError
        );
      }
    } catch (error) {
      console.error(
        "Transaction update error:",
        error
      );

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to update transaction.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
   * ============================================================
   * CURRENCY FORMATTER
   * ============================================================
   */
  const formatCurrency = (
    amount:
      | number
      | string
      | null
      | undefined
  ) => {
    const numericAmount = Number(
      amount ?? 0
    );

    return new Intl.NumberFormat(
      "en-NG",
      {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(
      Number.isFinite(numericAmount)
        ? numericAmount
        : 0
    );
  };

  /*
   * ============================================================
   * LOGIN REDIRECT
   * ============================================================
   */
  const handleLoginRedirect = () => {
    router.push("/staff_login");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* ========================================================
          NAVBAR
      ======================================================== */}

      <nav className="sticky top-0 z-50 -mt-28 border-b border-slate-200 bg-white shadow-sm">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="flex h-16 items-center justify-between">

            {/* LOGO */}

            <div className="flex items-center gap-3">

              <Link
                href="/admin_staff/md/dashboard"
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

              <span className="hidden items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white sm:inline-flex">

                <Shield className="h-3.5 w-3.5 text-emerald-400" />

                Executive Portal

              </span>

            </div>

            {/* BACK */}

            <Link
              href="/admin_staff/md/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
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

      {/* ========================================================
          MAIN
      ======================================================== */}

      <main className="mx-auto mt-2 w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">

        {/* HERO */}

        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">

          <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div className="max-w-2xl space-y-3">

              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">

                <Briefcase className="h-3.5 w-3.5" />

                Financial Operations

              </span>

              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Manual Transaction Update
              </h1>

              <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
                Manually post member deposits, loan
                repayments, fixed deposits, and expected
                monthly contributions from the Managing
                Director control center.
              </p>

            </div>

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-emerald-300 ring-1 ring-white/10">

              <CircleDollarSign className="h-8 w-8" />

            </div>

          </div>

        </section>

        {/* ======================================================
            ALERT
        ====================================================== */}

        {message && (
          <div
            className={`flex items-start gap-3 rounded-2xl border p-4 text-xs font-semibold shadow-sm ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >

            {message.type === "success" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            )}

            <div className="flex-1">

              <p className="font-bold">

                {message.type === "success"
                  ? "Transaction Updated"
                  : "Unable to Update Transaction"}

              </p>

              <p className="mt-1 font-medium opacity-90">
                {message.text}
              </p>

              {message.type === "error" &&
                message.text
                  .toLowerCase()
                  .includes("login") && (

                  <button
                    type="button"
                    onClick={
                      handleLoginRedirect
                    }
                    className="mt-3 rounded-lg bg-slate-900 px-3 py-2 text-[11px] font-bold text-white transition hover:bg-slate-800"
                  >
                    Go to Staff Login
                  </button>

                )}

            </div>

          </div>
        )}

        {/* ======================================================
            FORM CARD
        ====================================================== */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          {/* HEADER */}

          <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5 sm:px-8">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">

                <Wallet className="h-5 w-5" />

              </div>

              <div>

                <h2 className="text-sm font-extrabold text-slate-900">
                  Update Member Account
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Enter the member and transaction
                  information below.
                </p>

              </div>

            </div>

          </div>

          {/* FORM */}

          <div className="p-6 sm:p-8">

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              {/* MEMBER INFORMATION */}

              <div className="space-y-4">

                <div className="flex items-center gap-2">

                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                  <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-700">
                    Member Information
                  </h3>

                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  {/* MEMBER ID */}

                  <div className="space-y-1.5">

                    <label
                      htmlFor="member_id"
                      className="text-xs font-bold text-slate-700"
                    >
                      Member ID
                    </label>

                    <div className="relative">

                      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        type="number"
                        id="member_id"
                        name="member_id"
                        min="1"
                        step="1"
                        required
                        placeholder="e.g. 101"
                        value={memberIdInput}
                        onChange={(e) => {
                          setMemberIdInput(
                            e.target.value
                          );

                          setMessage(null);
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-xs font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                      />

                      {isSearchingMember && (
                        <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-emerald-600" />
                      )}

                    </div>

                    <p className="text-[10px] text-slate-400">
                      Enter a valid Member ID to retrieve
                      account details.
                    </p>

                  </div>

                  {/* FULL NAME */}

                  <div className="space-y-1.5">

                    <label
                      htmlFor="full_name"
                      className="text-xs font-bold text-slate-700"
                    >
                      Member Full Name
                    </label>

                    <div className="relative">

                      <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        readOnly
                        placeholder="Auto-filled member name"
                        value={
                          memberData?.full_name ||
                          ""
                        }
                        className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 py-3 pl-10 pr-3 text-xs font-bold text-slate-700 outline-none"
                      />

                    </div>

                    <p className="text-[10px] text-slate-400">
                      This field is automatically populated.
                    </p>

                  </div>

                </div>

              </div>

              {/* ==================================================
                  FINANCIAL OVERVIEW
              ================================================== */}

              {memberData && (

                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">

                  <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">

                    <div>

                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Live Financial Overview
                      </p>

                      <p className="mt-1 text-xs font-bold text-slate-700">
                        {memberData.full_name}
                      </p>

                    </div>

                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">

                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                      Live

                    </span>

                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                    {/* SAVINGS */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

                          <PiggyBank className="h-5 w-5" />

                        </div>

                        <div>

                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            Savings Balance
                          </p>

                          <p className="mt-1 text-sm font-extrabold text-emerald-700">

                            {formatCurrency(
                              memberData.savings_balance
                            )}

                          </p>

                        </div>

                      </div>

                    </div>

                    {/* LOAN */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">

                          <Wallet className="h-5 w-5" />

                        </div>

                        <div>

                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            Loan Balance
                          </p>

                          <p className="mt-1 text-sm font-extrabold text-rose-700">

                            {formatCurrency(
                              memberData.loan_balance
                            )}

                          </p>

                        </div>

                      </div>

                    </div>

                    {/* FIXED DEPOSIT */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">

                          <Landmark className="h-5 w-5" />

                        </div>

                        <div>

                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            Fixed Deposit
                          </p>

                          <p className="mt-1 text-sm font-extrabold text-purple-700">

                            {formatCurrency(
                              memberData.fixed_balance
                            )}

                          </p>

                        </div>

                      </div>

                    </div>

                    {/* MONTHLY CONTRIBUTION */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                          <CalendarCheck className="h-5 w-5" />

                        </div>

                        <div>

                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            Expected Monthly Contribution
                          </p>

                          <p className="mt-1 text-sm font-extrabold text-blue-700">

                            {formatCurrency(
                              memberData.monthly_balance
                            )}

                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              )}

              {/* ==================================================
                  TRANSACTION
              ================================================== */}

              <div className="space-y-4 border-t border-slate-200 pt-6">

                <div className="flex items-center gap-2">

                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                  <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-700">
                    Transaction Information
                  </h3>

                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  {/* AMOUNT */}

                  <div className="space-y-1.5">

                    <label
                      htmlFor="amount"
                      className="text-xs font-bold text-slate-700"
                    >
                      Transaction Amount
                    </label>

                    <div className="relative">

                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-400">
                        ₦
                      </span>

                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        min="0.01"
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={amountInput}
                        onChange={(e) => {
                          setAmountInput(
                            e.target.value
                          );

                          setMessage(null);
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-8 pr-3 text-xs font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                      />

                    </div>

                  </div>

                  {/* TYPE */}

                  <div className="space-y-1.5">

                    <label
                      htmlFor="type"
                      className="text-xs font-bold text-slate-700"
                    >
                      Transaction Type
                    </label>

                    <select
                      id="type"
                      name="type"
                      required
                      value={transactionType}
                      onChange={(e) => {
                        setTransactionType(
                          e.target.value as TransactionType
                        );

                        setMessage(null);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                    >

                      <option value="">
                        Select Transaction Type
                      </option>

                      <option value="deposit">
                        Savings Deposit
                      </option>

                      <option value="repayment">
                        Loan Repayment
                      </option>

                      <option value="fixed_deposit">
                        Fixed Deposit
                      </option>

                      <option value="monthly_contribution">
                        Monthly Contribution
                      </option>

                    </select>

                  </div>

                </div>

              </div>

              {/* ==================================================
                  SUBMIT
              ================================================== */}

              <div className="border-t border-slate-200 pt-6">

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    isSearchingMember
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />

                      Updating Account...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />

                      Update Member Account
                    </>
                  )}

                </button>

                <p className="mt-3 text-center text-[10px] leading-relaxed text-slate-400">
                  Verify the Member ID, transaction amount,
                  and transaction type before submitting.
                </p>

              </div>

            </form>

          </div>

        </section>

      </main>

      {/* ========================================================
          FOOTER
      ======================================================== */}

      <footer className="border-t border-slate-200 bg-white py-6">

        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">

          <p className="text-xs text-slate-500">

            &copy; {new Date().getFullYear()} DCG
            Multipurpose Cooperative Society Ltd.
            All rights reserved.

          </p>

        </div>

      </footer>

    </div>
  );
}
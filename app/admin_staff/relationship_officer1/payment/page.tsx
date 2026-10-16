"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Landmark,
  Loader2,
  LogOut,
  Receipt,
  Search,
  Shield,
  Upload,
  UserCheck,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";

/* ============================================================
   TYPES
============================================================ */

type Member = {
  member_id: number;
  full_name: string;
};

type Transaction = {
  transaction_id: number;
  member_id: number;
  full_name: string | null;
  type: string;
  amount: number;
  payment_method: string;
  reference: string;
  month: string;
  year: number;
  payment_date: string;
  status: string;
};

/* ============================================================
   MONTHS
============================================================ */

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/* ============================================================
   PAYMENT FORM
============================================================ */

type PaymentForm = {
  member_id: string;
  type: string;
  amount: string;
  payment_method: string;
  reference: string;
  payment_date: string;
  month: string;
  year: string;
};

const initialPaymentForm: PaymentForm = {
  member_id: "",
  type: "",
  amount: "",
  payment_method: "",
  reference: "",
  payment_date: "",
  month: "",
  year: new Date().getFullYear().toString(),
};

/* ============================================================
   DASHBOARD
============================================================ */

export default function RelationshipOfficer1Dashboard() {
  const router = useRouter();

  const [paymentForm, setPaymentForm] =
    useState<PaymentForm>(initialPaymentForm);

  const [member, setMember] = useState<Member | null>(null);
  const [memberSearching, setMemberSearching] = useState(false);
  const [memberNotFound, setMemberNotFound] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [loadingTransactions, setLoadingTransactions] =
    useState(true);

  const [isSubmittingPayment, setIsSubmittingPayment] =
    useState(false);

  const [isUploading, setIsUploading] = useState(false);

  const [csvFile, setCsvFile] = useState<File | null>(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /* ============================================================
     FETCH TRANSACTIONS
  ============================================================ */

  const fetchTransactions = async () => {
    setLoadingTransactions(true);

    try {
      const apiUrl =
        "/api/admin_staff/relationship_officer1/payments";

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

      const rawText = await response.text();

      console.log(
        "Relationship Officer 1 Payments API response:",
        {
          status: response.status,
          contentType,
          body: rawText.slice(0, 3000),
        }
      );

      /* --------------------------------------------------------
         UNAUTHORIZED
      -------------------------------------------------------- */

      if (response.status === 401) {
        router.push("/admin_staff/staff/login");
        return;
      }

      /* --------------------------------------------------------
         FORBIDDEN
      -------------------------------------------------------- */

      if (response.status === 403) {
        let result: any = null;

        try {
          result = rawText
            ? JSON.parse(rawText)
            : null;
        } catch {
          // Ignore invalid JSON
        }

        throw new Error(
          result?.message ||
            "Access denied. Relationship Officer 1 access is required."
        );
      }

      /* --------------------------------------------------------
         NOT FOUND
      -------------------------------------------------------- */

      if (response.status === 404) {
        throw new Error(
          `Relationship Officer 1 payments API route was not found (${response.status}). Make sure this file exists: app/api/admin_staff/relationship-officer1/payments/route.ts`
        );
      }

      /* --------------------------------------------------------
         EMPTY RESPONSE
      -------------------------------------------------------- */

      if (!rawText.trim()) {
        throw new Error(
          `The payments server returned an empty response (${response.status}).`
        );
      }

      /* --------------------------------------------------------
         INVALID CONTENT TYPE
      -------------------------------------------------------- */

      if (
        !contentType
          .toLowerCase()
          .includes("application/json")
      ) {
        throw new Error(
          `The payments server returned an invalid response (${response.status}).`
        );
      }

      /* --------------------------------------------------------
         PARSE JSON
      -------------------------------------------------------- */

      let data: any;

      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          "The payments server returned invalid JSON."
        );
      }

      /* --------------------------------------------------------
         API ERROR
      -------------------------------------------------------- */

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Unable to load submitted transactions. Server returned ${response.status}.`
        );
      }

      /* --------------------------------------------------------
         TRANSACTIONS
      -------------------------------------------------------- */

      const loadedTransactions = Array.isArray(
        data.transactions
      )
        ? data.transactions
        : Array.isArray(data.payments)
        ? data.payments
        : [];

      setTransactions(
        loadedTransactions.map((transaction: any) => ({
          transaction_id: Number(
            transaction.transaction_id ||
              transaction.payment_id ||
              0
          ),

          member_id: Number(
            transaction.member_id || 0
          ),

          full_name:
            transaction.full_name ||
            "Unknown Member",

          type:
            transaction.type ||
            transaction.transaction_type ||
            "",

          amount: Number(
            transaction.amount || 0
          ),

          payment_method:
            transaction.payment_method || "",

          reference:
            transaction.reference || "",

          month:
            transaction.month || "",

          year: Number(
            transaction.year ||
              new Date().getFullYear()
          ),

          payment_date:
            transaction.payment_date ||
            transaction.transaction_date ||
            "",

          status:
            transaction.status ||
            "pending_accountant",
        }))
      );
    } catch (error) {
      console.error(
        "Relationship Officer 1 transactions error:",
        error
      );

      setTransactions([]);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load submitted transactions."
      );
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  /* ============================================================
     MEMBER SEARCH
  ============================================================ */

  useEffect(() => {
    const memberId =
      paymentForm.member_id.trim();

    if (!memberId) {
      setMember(null);
      setMemberNotFound(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setMemberSearching(true);
        setMemberNotFound(false);

        const response = await fetch(
          `/api/admin_staff/members/search?member_id=${encodeURIComponent(
            memberId
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

        if (response.status === 401) {
          router.push("/admin_staff/staff/login");
          return;
        }

        if (!response.ok) {
          setMember(null);
          setMemberNotFound(true);
          return;
        }

        const contentType =
          response.headers.get("content-type") || "";

        if (
          !contentType
            .toLowerCase()
            .includes("application/json")
        ) {
          setMember(null);
          setMemberNotFound(true);
          return;
        }

        const data = await response.json();

        if (data.member) {
          setMember(data.member);
          setMemberNotFound(false);
        } else {
          setMember(null);
          setMemberNotFound(true);
        }
      } catch (error) {
        console.error(
          "Relationship Officer 1 member search error:",
          error
        );

        setMember(null);
        setMemberNotFound(true);
      } finally {
        setMemberSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [paymentForm.member_id, router]);

  /* ============================================================
     PAYMENT FORM CHANGE
  ============================================================ */

  const handlePaymentChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setPaymentForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* ============================================================
     SUBMIT PAYMENT
  ============================================================ */

  const handlePaymentSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!member) {
      setErrorMessage(
        "Please enter a valid member ID before submitting the payment."
      );

      return;
    }

    if (
      !paymentForm.amount ||
      Number(paymentForm.amount) <= 0
    ) {
      setErrorMessage(
        "Please enter a valid payment amount."
      );

      return;
    }

    setIsSubmittingPayment(true);

    try {
      const response = await fetch(
        "/api/admin_staff/relationship-officer1/payments",
        {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            member_id: Number(
              paymentForm.member_id
            ),

            amount: Number(
              paymentForm.amount
            ),

            type: paymentForm.type,

            payment_method:
              paymentForm.payment_method,

            reference:
              paymentForm.reference,

            payment_date:
              paymentForm.payment_date,

            month:
              paymentForm.month,

            year: Number(
              paymentForm.year
            ),
          }),
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      const rawText = await response.text();

      console.log(
        "Relationship Officer 1 submit payment API response:",
        {
          status: response.status,
          contentType,
          body: rawText.slice(0, 3000),
        }
      );

      if (response.status === 401) {
        router.push("/admin_staff/staff/login");
        return;
      }

      if (response.status === 403) {
        let result: any = null;

        try {
          result = rawText
            ? JSON.parse(rawText)
            : null;
        } catch {
          // Ignore invalid JSON
        }

        throw new Error(
          result?.message ||
            "Access denied. Relationship Officer 1 access is required."
        );
      }

      if (!rawText.trim()) {
        throw new Error(
          `Server returned an empty response (${response.status}).`
        );
      }

      if (
        !contentType
          .toLowerCase()
          .includes("application/json")
      ) {
        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }

      let data: any;

      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          "The server returned invalid JSON."
        );
      }

      if (
        !response.ok ||
        data?.success === false
      ) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to submit payment."
        );
      }

      setSuccessMessage(
        data.message ||
          "Payment submitted successfully and forwarded to the Accountant."
      );

      setPaymentForm(initialPaymentForm);
      setMember(null);
      setMemberNotFound(false);

      await fetchTransactions();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Relationship Officer 1 payment submission error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting payment."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  /* ============================================================
     BULK UPLOAD
  ============================================================ */

  const handleBulkUpload = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!csvFile) {
      setErrorMessage(
        "Please select a CSV or Excel file."
      );

      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();

      formData.append(
        "csv_file",
        csvFile
      );

      const response = await fetch(
        "/api/admin_staff/relationship-officer1/payments/bulk",
        {
          method: "POST",
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

      const rawText = await response.text();

      console.log(
        "Relationship Officer 1 bulk upload API response:",
        {
          status: response.status,
          contentType,
          body: rawText.slice(0, 3000),
        }
      );

      if (response.status === 401) {
        router.push("/admin_staff/staff/login");
        return;
      }

      if (response.status === 403) {
        let result: any = null;

        try {
          result = rawText
            ? JSON.parse(rawText)
            : null;
        } catch {
          // Ignore invalid JSON
        }

        throw new Error(
          result?.message ||
            "Access denied. Relationship Officer 1 access is required."
        );
      }

      if (!rawText.trim()) {
        throw new Error(
          `Server returned an empty response (${response.status}).`
        );
      }

      if (
        !contentType
          .toLowerCase()
          .includes("application/json")
      ) {
        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }

      let data: any;

      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          "The server returned invalid JSON."
        );
      }

      if (
        !response.ok ||
        data?.success === false
      ) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Bulk upload failed."
        );
      }

      setSuccessMessage(
        data.message ||
          "Bulk payment file uploaded successfully."
      );

      setCsvFile(null);

      const fileInput =
        document.getElementById(
          "csv_file"
        ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      await fetchTransactions();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Relationship Officer 1 bulk upload error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong during bulk upload."
      );
    } finally {
      setIsUploading(false);
    }
  };

  /* ============================================================
     LOGOUT
  ============================================================ */

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        }
      );

      router.push(
        "/admin_staff/staff/login"
      );
    } catch {
      router.push(
        "/admin_staff/relationship_officer1/payment"
      );
    }
  };

  /* ============================================================
     FORMAT HELPERS
  ============================================================ */

  const formatCurrency = (
    amount: number
  ) => {
    return new Intl.NumberFormat(
      "en-NG",
      {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 2,
      }
    ).format(amount);
  };

  const formatTransactionType = (
    type: string
  ) => {
    return type
      .replaceAll("_", " ")
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
  };

  const formatPaymentMethod = (
    method: string
  ) => {
    return method
      .replaceAll("_", " ")
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans -mt-28 text-slate-900">

      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
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

              <span className="hidden items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white sm:inline-flex">
                <Shield className="h-3 w-3 text-emerald-400" />
                Relationship Officer 1 Portal
              </span>

            </div>

            <div className="flex items-center gap-2 sm:gap-3">

              {transactions.length > 0 && (
                <div className="hidden items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 md:flex">

                  <Bell className="h-3.5 w-3.5 text-amber-600" />

                  {transactions.length} Pending

                </div>
              )}

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
              >

                <LogOut className="h-4 w-4" />

                <span className="hidden sm:inline">
                  {isLoggingOut
                    ? "Logging out..."
                    : "Logout"}
                </span>

              </button>

            </div>

          </div>

        </div>
      </nav>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 mt-6 sm:px-6 lg:px-8">

        {/* ====================================================
            WELCOME BANNER
        ==================================================== */}

        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">

          <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl space-y-2">

            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">

              <Shield className="h-3.5 w-3.5" />

              Relationship Officer 1 Financial Operations

            </span>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Relationship Officer 1 Payment Dashboard
            </h1>

            <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
              Record member payments, upload bulk
              transactions, and monitor submitted
              transactions awaiting Accountant
              acknowledgement.
            </p>

          </div>

        </div>

        {/* ====================================================
            ALERTS
        ==================================================== */}

        {successMessage && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 shadow-sm">

            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

            <div>

              <p className="text-sm font-bold">
                Success
              </p>

              <p className="mt-1 text-xs">
                {successMessage}
              </p>

            </div>

          </div>
        )}

        {errorMessage && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 shadow-sm">

            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />

            <div>

              <p className="text-sm font-bold">
                Operation Failed
              </p>

              <p className="mt-1 text-xs">
                {errorMessage}
              </p>

            </div>

          </div>
        )}

        {/* ====================================================
            PAYMENT FORM
        ==================================================== */}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <SectionHeader
            icon={
              <Wallet className="h-5 w-5" />
            }
            title="Make Payment"
            description="Record a member payment and forward it for Accountant acknowledgement."
          />

          <form
            onSubmit={handlePaymentSubmit}
            className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2"
          >

            {/* MEMBER ID */}

            <div>

              <label
                htmlFor="member_id"
                className="mb-2 block text-xs font-bold text-slate-700"
              >
                Member ID

                <span className="ml-1 text-emerald-600">
                  *
                </span>

              </label>

              <div className="relative">

                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  id="member_id"
                  name="member_id"
                  type="number"
                  value={
                    paymentForm.member_id
                  }
                  onChange={
                    handlePaymentChange
                  }
                  placeholder="Enter Member ID"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />

              </div>

            </div>

            {/* MEMBER RESULT */}

            <div
              className={`rounded-xl border p-4 transition-all ${
                member
                  ? "border-emerald-200 bg-emerald-50"
                  : memberNotFound
                  ? "border-rose-200 bg-rose-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >

              {memberSearching ? (

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">

                  <Loader2 className="h-4 w-4 animate-spin" />

                  Searching for member...

                </div>

              ) : member ? (

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                    Member Found
                  </p>

                  <div className="mt-1 flex items-center gap-2">

                    <UserCheck className="h-4 w-4 text-emerald-600" />

                    <span className="text-sm font-bold text-emerald-900">
                      {member.full_name}
                    </span>

                  </div>

                  <p className="mt-1 text-[11px] text-emerald-700">
                    Member ID: {member.member_id}
                  </p>

                </div>

              ) : memberNotFound ? (

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-wide text-rose-600">
                    Member Not Found
                  </p>

                  <p className="mt-1 text-xs text-rose-700">
                    No member was found with this ID.
                  </p>

                </div>

              ) : (

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Member Information
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Enter a member ID to search.
                  </p>

                </div>

              )}

            </div>

            {/* PAYMENT TYPE */}

            <FormSelect
              label="Payment Type"
              name="type"
              value={paymentForm.type}
              onChange={
                handlePaymentChange
              }
              required
              options={[
                {
                  value: "",
                  label:
                    "Select Payment Type",
                },
                {
                  value:
                    "loan_repayment",
                  label:
                    "Loan Repayment",
                },
                {
                  value:
                    "monthly_contribution",
                  label:
                    "Monthly Contribution",
                },
              ]}
            />

            {/* AMOUNT */}

            <FormInput
              label="Amount"
              name="amount"
              type="number"
              value={paymentForm.amount}
              onChange={
                handlePaymentChange
              }
              placeholder="Enter Amount"
              step="0.01"
              min="0"
              required
            />

            {/* PAYMENT METHOD */}

            <FormSelect
              label="Payment Method"
              name="payment_method"
              value={
                paymentForm.payment_method
              }
              onChange={
                handlePaymentChange
              }
              required
              options={[
                {
                  value: "",
                  label:
                    "Select Payment Method",
                },
                {
                  value: "cash",
                  label: "Cash",
                },
                {
                  value:
                    "bank_transfer",
                  label:
                    "Bank Transfer",
                },
                {
                  value: "pos",
                  label: "POS",
                },
              ]}
            />

            {/* REFERENCE */}

            <FormInput
              label="Payment Reference"
              name="reference"
              type="text"
              value={
                paymentForm.reference
              }
              onChange={
                handlePaymentChange
              }
              placeholder="Payment Reference"
              required
            />

            {/* PAYMENT DATE */}

            <FormInput
              label="Payment Date"
              name="payment_date"
              type="date"
              value={
                paymentForm.payment_date
              }
              onChange={
                handlePaymentChange
              }
              required
            />

            {/* MONTH */}

            <FormSelect
              label="Month"
              name="month"
              value={paymentForm.month}
              onChange={
                handlePaymentChange
              }
              required
              options={[
                {
                  value: "",
                  label: "Select Month",
                },

                ...months.map(
                  (month) => ({
                    value: month,
                    label: month,
                  })
                ),
              ]}
            />

            {/* YEAR */}

            <FormInput
              label="Year"
              name="year"
              type="number"
              value={paymentForm.year}
              onChange={
                handlePaymentChange
              }
              min="2020"
              max="2100"
              required
            />

            {/* SUBMIT */}

            <div className="md:col-span-2">

              <button
                type="submit"
                disabled={
                  isSubmittingPayment ||
                  member === null
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {isSubmittingPayment ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting Payment...
                  </>
                ) : (
                  <>
                    <Receipt className="h-4 w-4" />
                    Submit Payment
                  </>
                )}

              </button>

            </div>

          </form>

        </section>

        {/* ====================================================
            BULK UPLOAD
        ==================================================== */}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <SectionHeader
            icon={
              <FileSpreadsheet className="h-5 w-5" />
            }
            title="Bulk Upload Payments"
            description="Upload multiple payment transactions from a CSV or Excel file."
          />

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">

            <form
              onSubmit={handleBulkUpload}
              className="space-y-4"
            >

              <div>

                <label
                  htmlFor="csv_file"
                  className="mb-2 block text-xs font-bold text-slate-700"
                >
                  CSV / Excel File
                </label>

                <input
                  id="csv_file"
                  type="file"
                  name="csv_file"
                  accept=".csv,.xlsx,.xls"
                  required
                  onChange={(e) =>
                    setCsvFile(
                      e.target.files?.[0] ||
                        null
                    )
                  }
                  className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-white text-xs text-slate-600 file:mr-4 file:border-0 file:bg-slate-900 file:px-4 file:py-3 file:text-xs file:font-bold file:text-white hover:file:bg-slate-800"
                />

                {csvFile && (
                  <p className="mt-2 text-xs text-slate-500">

                    Selected file:{" "}

                    <span className="font-bold text-slate-700">
                      {csvFile.name}
                    </span>

                  </p>
                )}

              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload CSV / Excel File
                  </>
                )}

              </button>

            </form>

            {/* FORMAT NOTE */}

            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">

              <div className="flex items-start gap-3">

                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

                <div className="min-w-0">

                  <p className="text-xs font-bold text-slate-900">
                    CSV / Excel Format
                  </p>

                  <div className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-3">

                    <code className="whitespace-nowrap text-[11px] leading-6 text-slate-300">

                      member_id,amount,type,payment_method,reference,payment_date,month,year

                      <br />

                      1,50000,monthly_contribution,cash,REF001,2026-05-16,May,2026

                      <br />

                      2,100000,loan_repayment,bank_transfer,REF002,2026-05-16,May,2026

                    </code>

                  </div>

                  <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                    Ensure the column names match the
                    required format and that each member ID
                    exists in the member database.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ====================================================
            TRANSACTIONS
        ==================================================== */}

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 p-5 sm:p-6">

            <SectionHeader
              icon={
                <Landmark className="h-5 w-5" />
              }
              title="Submitted Transactions"
              description="Payments currently awaiting Accountant acknowledgement."
            />

          </div>

          <div className="overflow-hidden">

            {loadingTransactions ? (

              <div className="flex min-h-52 items-center justify-center">

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">

                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />

                  Loading transactions...

                </div>

              </div>

            ) : transactions.length === 0 ? (

              <div className="p-12 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                  <Receipt className="h-6 w-6" />

                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-900">
                  No Pending Transactions
                </h3>

                <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                  There are currently no transactions
                  awaiting Accountant acknowledgement.
                </p>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1100px] border-collapse">

                  <thead>

                    <tr className="border-b border-slate-100 bg-slate-50/80">

                      <TableHeader>
                        Member ID
                      </TableHeader>

                      <TableHeader>
                        Full Name
                      </TableHeader>

                      <TableHeader>
                        Transaction Type
                      </TableHeader>

                      <TableHeader>
                        Amount
                      </TableHeader>

                      <TableHeader>
                        Payment Method
                      </TableHeader>

                      <TableHeader>
                        Reference
                      </TableHeader>

                      <TableHeader>
                        Month
                      </TableHeader>

                      <TableHeader>
                        Year
                      </TableHeader>

                      <TableHeader>
                        Payment Date
                      </TableHeader>

                      <TableHeader>
                        Status
                      </TableHeader>

                    </tr>

                  </thead>

                  <tbody>

                    {transactions.map(
                      (transaction) => (

                        <tr
                          key={
                            transaction.transaction_id
                          }
                          className="border-b border-slate-100 transition hover:bg-slate-50/70"
                        >

                          <TableCell>
                            <span className="font-bold text-slate-900">
                              {
                                transaction.member_id
                              }
                            </span>
                          </TableCell>

                          <TableCell>

                            <div className="flex items-center gap-2">

                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">

                                <Users className="h-4 w-4" />

                              </div>

                              <span className="font-semibold text-slate-700">
                                {
                                  transaction.full_name ||
                                  "Unknown Member"
                                }
                              </span>

                            </div>

                          </TableCell>

                          <TableCell>
                            <span className="text-slate-600">
                              {formatTransactionType(
                                transaction.type
                              )}
                            </span>
                          </TableCell>

                          <TableCell>
                            <span className="font-extrabold text-slate-900">
                              {formatCurrency(
                                Number(
                                  transaction.amount
                                )
                              )}
                            </span>
                          </TableCell>

                          <TableCell>
                            <span className="text-slate-600">
                              {formatPaymentMethod(
                                transaction.payment_method
                              )}
                            </span>
                          </TableCell>

                          <TableCell>
                            <span className="font-mono text-xs text-slate-600">
                              {
                                transaction.reference
                              }
                            </span>
                          </TableCell>

                          <TableCell>
                            {transaction.month}
                          </TableCell>

                          <TableCell>
                            {transaction.year}
                          </TableCell>

                          <TableCell>
                            {transaction.payment_date}
                          </TableCell>

                          <TableCell>

                            <StatusBadge
                              status={
                                transaction.status
                              }
                            />

                          </TableCell>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </section>

      </main>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="mt-auto border-t border-slate-200 bg-white py-6">

        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} DCG Multipurpose
            Cooperative Society Ltd. All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  );
}

/* ============================================================
   SECTION HEADER
============================================================ */

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
        {icon}
      </div>

      <div>

        <h2 className="text-sm font-extrabold text-slate-900 sm:text-base">
          {title}
        </h2>

        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
          {description}
        </p>

      </div>

    </div>
  );
}

/* ============================================================
   INPUT
============================================================ */

function FormInput({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  step,
  min,
  max,
}: {
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  placeholder?: string;
  required?: boolean;
  step?: string;
  min?: string;
  max?: string;
}) {
  return (
    <div>

      <label
        htmlFor={name}
        className="mb-2 block text-xs font-bold text-slate-700"
      >

        {label}

        {required && (
          <span className="ml-1 text-emerald-600">
            *
          </span>
        )}

      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        step={step}
        min={min}
        max={max}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
      />

    </div>
  );
}

/* ============================================================
   SELECT
============================================================ */

function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => void;
  options: {
    value: string;
    label: string;
  }[];
  required?: boolean;
}) {
  return (
    <div>

      <label
        htmlFor={name}
        className="mb-2 block text-xs font-bold text-slate-700"
      >

        {label}

        {required && (
          <span className="ml-1 text-emerald-600">
            *
          </span>
        )}

      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
      >

        {options.map(
          (option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          )
        )}

      </select>

    </div>
  );
}

/* ============================================================
   TABLE HEADER
============================================================ */

function TableHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

/* ============================================================
   TABLE CELL
============================================================ */

function TableCell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <td className="px-4 py-3 text-xs text-slate-600">
      {children}
    </td>
  );
}

/* ============================================================
   STATUS
============================================================ */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const statusConfig: Record<
    string,
    {
      label: string;
      className: string;
    }
  > = {
    pending_accountant: {
      label: "Pending Accountant",
      className:
        "bg-amber-50 text-amber-700 border-amber-200",
    },

    approved: {
      label: "Approved",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
    },

    rejected: {
      label: "Rejected",
      className:
        "bg-rose-50 text-rose-700 border-rose-200",
    },

    processing: {
      label: "Processing",
      className:
        "bg-blue-50 text-blue-700 border-blue-200",
    },
  };

  const config =
    statusConfig[status] || {
      label: status
        .replaceAll("_", " ")
        .replace(
          /\b\w/g,
          (letter) =>
            letter.toUpperCase()
        ),
      className:
        "bg-slate-100 text-slate-600 border-slate-200",
    };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
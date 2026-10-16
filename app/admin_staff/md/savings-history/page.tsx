"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  FileSpreadsheet,
  FileText,
  LogOut,
  Printer,
  Search,
  Shield,
  UserSearch,
  Wallet,
  X,
} from "lucide-react";

type SavingsRow = {
  type: string;
  amount_saved: number;
  narration: string;
  created_at: string;
  member_name: string;
  cumulative: number;
};

type ApiResponse = {
  success?: boolean;
  memberName?: string;
  rows?: SavingsRow[];
  cumulative?: number;
  error?: string;
  message?: string;
};

export default function SavingsHistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [memberId, setMemberId] = useState(
    searchParams.get("member_id") || ""
  );

  const [memberName, setMemberName] = useState(
    searchParams.get("member_name") || ""
  );

  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");

  const [rows, setRows] = useState<SavingsRow[]>([]);
  const [selectedMemberName, setSelectedMemberName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /**
   * ============================================================
   * LOAD SAVINGS HISTORY
   * ============================================================
   */
  const loadSavingsHistory = async () => {
    if (!memberId.trim() && !memberName.trim()) {
      setRows([]);
      setSelectedMemberName("");
      setError("");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (memberId.trim()) {
        params.set("member_id", memberId.trim());
      }

      if (memberName.trim()) {
        params.set("member_name", memberName.trim());
      }

      if (from) {
        params.set("from", from);
      }

      if (to) {
        params.set("to", to);
      }

      /*
       * ==========================================================
       * SAVINGS HISTORY API REQUEST
       * ==========================================================
       */
      const response = await fetch(
        `/api/admin_staff/md/savings-history?${params.toString()}`,
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
       * ==========================================================
       * CHECK RESPONSE CONTENT TYPE
       * ==========================================================
       */
      const contentType =
        response.headers.get("content-type") || "";

      let data: ApiResponse;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();

        throw new Error(
          response.status === 401
            ? "Unauthorized. Your MD login session was not found or has expired. Please log in again."
            : response.status === 403
              ? "Forbidden. MD authorization is required to view savings history."
              : response.status === 404
                ? "Savings history API route was not found."
                : response.status === 405
                  ? "This API does not allow the GET request."
                  : `Server returned an unexpected response (${response.status}). ${
                      text.substring(0, 150) || "Please try again."
                    }`
        );
      }

      /*
       * ==========================================================
       * HANDLE API ERRORS
       * ==========================================================
       */
      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            `Failed to load savings history. HTTP ${response.status}.`
        );
      }

      /*
       * ==========================================================
       * NORMALIZE API ROWS
       *
       * MySQL can sometimes return DECIMAL values as strings.
       * Convert numeric values before storing them in state.
       * ==========================================================
       */
      const normalizedRows: SavingsRow[] = Array.isArray(data.rows)
        ? data.rows.map((row) => ({
            type: String(row.type ?? ""),
            amount_saved: Number(row.amount_saved ?? 0),
            narration: String(row.narration ?? ""),
            created_at: String(row.created_at ?? ""),
            member_name: String(row.member_name ?? ""),
            cumulative: Number(row.cumulative ?? 0),
          }))
        : [];

      setRows(normalizedRows);

      setSelectedMemberName(
        data.memberName ||
          normalizedRows[0]?.member_name ||
          ""
      );
    } catch (err) {
      console.error(
        "LOAD SAVINGS HISTORY ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load savings history."
      );

      setRows([]);
      setSelectedMemberName("");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * ============================================================
   * LOAD DATA FROM URL ON INITIAL PAGE LOAD
   * ============================================================
   */
  useEffect(() => {
    const hasQuery =
      searchParams.get("member_id") ||
      searchParams.get("member_name");

    if (hasQuery) {
      loadSavingsHistory();
    }

    // Intentionally run only once on initial page load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * ============================================================
   * SEARCH SUBMIT
   * ============================================================
   */
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!memberId.trim() && !memberName.trim()) {
      setError("Enter a Member ID or Member Name.");
      setRows([]);
      setSelectedMemberName("");
      return;
    }

    const params = new URLSearchParams();

    if (memberId.trim()) {
      params.set("member_id", memberId.trim());
    }

    if (memberName.trim()) {
      params.set("member_name", memberName.trim());
    }

    if (from) {
      params.set("from", from);
    }

    if (to) {
      params.set("to", to);
    }

    router.push(
      `/admin_staff/md/savings-history?${params.toString()}`
    );

    await loadSavingsHistory();
  };

  /**
   * ============================================================
   * CLEAR FILTERS
   * ============================================================
   */
  const clearFilters = () => {
    setMemberId("");
    setMemberName("");
    setFrom("");
    setTo("");
    setRows([]);
    setSelectedMemberName("");
    setError("");

    router.push("/admin_staff/md/savings-history");
  };

  /**
   * ============================================================
   * PRINT
   * ============================================================
   */
  const handlePrint = () => {
    window.print();
  };

  /**
   * ============================================================
   * EXPORT CSV
   * ============================================================
   */
  const exportCSV = () => {
    if (!rows.length) {
      return;
    }

    const headers = [
      "S/N",
      "Month",
      "Amount (NGN)",
      "Cumulative (NGN)",
      "Narration",
      "Date",
    ];

    const csvRows = rows.map((row, index) => [
      index + 1,
      formatMonth(row.created_at),
      Number(row.amount_saved).toFixed(2),
      Number(row.cumulative).toFixed(2),
      row.narration,
      formatDate(row.created_at),
    ]);

    const csv = [headers, ...csvRows]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "Admin_Savings_History.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /**
   * ============================================================
   * DOWNLOAD PDF
   * ============================================================
   */
  const downloadPDF = async () => {
    if (!rows.length) {
      return;
    }

    try {
      const { jsPDF } = await import("jspdf");

      const autoTableModule =
        await import("jspdf-autotable");

      const autoTable =
        autoTableModule.default ||
        autoTableModule.autoTable;

      const doc = new jsPDF();

      doc.setFontSize(16);

      doc.text(
        "Admin Savings History",
        14,
        15
      );

      if (selectedMemberName) {
        doc.setFontSize(10);

        doc.text(
          `Member: ${selectedMemberName}`,
          14,
          22
        );
      }

      autoTable(doc, {
        startY: selectedMemberName ? 28 : 22,

        head: [
          [
            "S/N",
            "Month",
            "Amount (NGN)",
            "Cumulative (NGN)",
            "Narration",
            "Date",
          ],
        ],

        body: rows.map((row, index) => [
          index + 1,
          formatMonth(row.created_at),
          formatMoney(row.amount_saved),
          formatMoney(row.cumulative),
          row.narration,
          formatDate(row.created_at),
        ]),

        styles: {
          fontSize: 8,
          textColor: [15, 23, 42],
        },

        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
        },

        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
      });

      doc.save(
        "Admin_Savings_History.pdf"
      );
    } catch (error) {
      console.error(
        "PDF export failed:",
        error
      );

      alert(
        "PDF export requires jspdf and jspdf-autotable. Run: npm install jspdf jspdf-autotable"
      );
    }
  };

  /**
   * ============================================================
   * LOGOUT
   * ============================================================
   */
  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      router.push("/admin_staff/staff");
    } catch {
      router.push("/admin_staff/staff");
    } finally {
      setIsLoggingOut(false);
    }
  };

  /**
   * ============================================================
   * FORMAT MONEY
   * ============================================================
   */
  const formatMoney = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  };

  /**
   * ============================================================
   * FORMAT DATE
   * ============================================================
   */
  const formatDate = (dateValue: string) => {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  /**
   * ============================================================
   * FORMAT MONTH
   * ============================================================
   */
  const formatMonth = (dateValue: string) => {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return new Intl.DateTimeFormat("en-GB", {
      month: "long",
      year: "numeric",
    }).format(date);
  };

  /**
   * ============================================================
   * CHECK DEPOSIT
   * ============================================================
   */
  const isDeposit = (type: string) => {
    return type.toLowerCase() === "deposit";
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 -mt-28 flex flex-col">
      {/* =========================
          NAVBAR
      ========================== */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm print:hidden">
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

              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white">
                <Shield className="h-3 w-3 text-emerald-400" />
                Executive Portal
              </span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <Link
                href="/admin_staff/md/dashboard"
                className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
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

      {/* =========================
          MAIN
      ========================== */}
      <main
        id="printArea"
        className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 mt-2 sm:px-6 lg:px-8"
      >
        {/* Header */}
        <section className="mb-6 rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Wallet className="h-3.5 w-3.5" />
              Financial Records
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              MD – Net Savings History
            </h1>

            <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-300">
              Search and inspect approved savings transactions for
              individual cooperative members. You can filter by member
              and date range, print the report, or export it.
            </p>
          </div>
        </section>

        {/* =========================
            MEMBER INFORMATION
        ========================== */}
        {selectedMemberName && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <UserSearch className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                  Member
                </p>

                <p className="text-sm font-extrabold text-emerald-900">
                  {selectedMemberName}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =========================
            FILTER FORM
        ========================== */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 print:hidden">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Search className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                Search Savings
              </h2>

              <p className="text-xs text-slate-500">
                Enter a member ID or member name.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
          >
            {/* Member ID */}
            <div>
              <label
                htmlFor="member_id"
                className="mb-1.5 block text-xs font-bold text-slate-700"
              >
                Member ID
              </label>

              <input
                id="member_id"
                type="number"
                placeholder="e.g. 1001"
                value={memberId}
                onChange={(e) =>
                  setMemberId(e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Member Name */}
            <div>
              <label
                htmlFor="member_name"
                className="mb-1.5 block text-xs font-bold text-slate-700"
              >
                Member Name
              </label>

              <input
                id="member_name"
                type="text"
                placeholder="Search member name"
                value={memberName}
                onChange={(e) =>
                  setMemberName(e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* From */}
            <div>
              <label
                htmlFor="from"
                className="mb-1.5 block text-xs font-bold text-slate-700"
              >
                From
              </label>

              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  id="from"
                  type="date"
                  value={from}
                  onChange={(e) =>
                    setFrom(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* To */}
            <div>
              <label
                htmlFor="to"
                className="mb-1.5 block text-xs font-bold text-slate-700"
              >
                To
              </label>

              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  id="to"
                  type="date"
                  value={to}
                  onChange={(e) =>
                    setTo(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2 sm:flex-row md:col-span-2 lg:col-span-4">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Search className="h-4 w-4" />

                {isLoading
                  ? "Loading..."
                  : "View Savings"}
              </button>

              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}
        </section>

        {/* =========================
            ACTION BUTTONS
        ========================== */}
        {rows.length > 0 && (
          <section className="mt-5 flex flex-wrap gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              <Printer className="h-4 w-4 text-slate-600" />
              Print
            </button>

            <button
              onClick={downloadPDF}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700"
            >
              <FileText className="h-4 w-4" />
              PDF
            </button>

            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel / CSV
            </button>
          </section>
        )}

        {/* =========================
            REPORT SUMMARY
        ========================== */}
        {rows.length > 0 && (
          <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Transactions
              </p>

              <p className="mt-1 text-2xl font-extrabold text-slate-900">
                {rows.length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Total Deposits
              </p>

              <p className="mt-1 text-xl font-extrabold text-emerald-600">
                ₦
                {formatMoney(
                  rows
                    .filter((row) =>
                      isDeposit(row.type)
                    )
                    .reduce(
                      (sum, row) =>
                        sum +
                        Number(
                          row.amount_saved
                        ),
                      0
                    )
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Net Savings
              </p>

              <p
                className={`mt-1 text-xl font-extrabold ${
                  Number(
                    rows[rows.length - 1]
                      .cumulative
                  ) >= 0
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}
              >
                ₦
                {formatMoney(
                  Number(
                    rows[rows.length - 1]
                      .cumulative
                  )
                )}
              </p>
            </div>
          </section>
        )}

        {/* =========================
            TABLE
        ========================== */}
        <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {rows.length > 0 ? (
            <>
              {/* Table header */}
              <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">
                    Savings Transactions
                  </h2>

                  <p className="text-xs text-slate-500">
                    Approved savings transactions ordered
                    from oldest to newest.
                  </p>
                </div>

                <span className="inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                  {rows.length} record
                  {rows.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table
                  id="savingsTable"
                  className="w-full min-w-[900px] border-collapse text-left"
                >
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide">
                        S/N
                      </th>

                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide">
                        Month
                      </th>

                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide">
                        Amount (₦)
                      </th>

                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide">
                        Cumulative (₦)
                      </th>

                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide">
                        Narration
                      </th>

                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {rows.map((row, index) => {
                      const deposit =
                        isDeposit(row.type);

                      return (
                        <tr
                          key={`${row.created_at}-${index}`}
                          className="transition-colors hover:bg-slate-50"
                        >
                          <td className="px-4 py-3 text-xs font-semibold text-slate-500">
                            {index + 1}
                          </td>

                          <td className="px-4 py-3 text-xs font-semibold text-slate-700">
                            {formatMonth(
                              row.created_at
                            )}
                          </td>

                          <td
                            className={`px-4 py-3 text-xs font-extrabold ${
                              deposit
                                ? "text-emerald-600"
                                : "text-rose-600"
                            }`}
                          >
                            {deposit ? "+" : "-"}₦
                            {formatMoney(
                              Number(
                                row.amount_saved
                              )
                            )}
                          </td>

                          <td
                            className={`px-4 py-3 text-xs font-extrabold ${
                              Number(
                                row.cumulative
                              ) >= 0
                                ? "text-slate-900"
                                : "text-rose-600"
                            }`}
                          >
                            ₦
                            {formatMoney(
                              Number(
                                row.cumulative
                              )
                            )}
                          </td>

                          <td className="max-w-xs px-4 py-3 text-xs text-slate-600">
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  deposit
                                    ? "bg-emerald-500"
                                    : "bg-rose-500"
                                }`}
                              />

                              <span className="truncate">
                                {row.narration}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-xs font-medium text-slate-600">
                            {formatDate(
                              row.created_at
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Wallet className="h-7 w-7" />
              </div>

              <h3 className="mt-4 text-sm font-extrabold text-slate-900">
                No savings records
              </h3>

              <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-500">
                {memberId || memberName
                  ? "No approved savings records were found for the selected member or date range."
                  : "Enter a Member ID or Member Name above to view savings history."}
              </p>
            </div>
          )}
        </section>

        {/* Print footer */}
        {rows.length > 0 && (
          <div className="mt-5 hidden text-center print:block">
            <p className="text-xs text-slate-500">
              DCG Multipurpose Cooperative Society Ltd.
            </p>

            <p className="text-[10px] text-slate-400">
              Generated on{" "}
              {new Date().toLocaleString("en-NG")}
            </p>
          </div>
        )}
      </main>

      {/* =========================
          FOOTER
      ========================== */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 print:hidden">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} DCG Multipurpose
            Cooperative Society Ltd. All rights reserved.
          </p>
        </div>
      </footer>

      {/* =========================
          PRINT STYLES
      ========================== */}
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 10mm;
          }

          body {
            background: white !important;
            color: #0f172a !important;
          }

          #printArea {
            max-width: none !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          table {
            width: 100% !important;
          }

          th {
            background: #0f172a !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          tr {
            break-inside: avoid;
          }

          .shadow-sm,
          .shadow-md {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
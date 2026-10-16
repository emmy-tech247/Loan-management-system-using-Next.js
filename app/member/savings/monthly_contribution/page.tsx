"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SavingsNavbar from "@/components/navigation/SavingsNavbar";
import {
  ArrowLeft,
  CalendarDays,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Printer,
  Wallet,
  RefreshCw,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";

interface SavingsRow {
  type: string;
  amount_saved: number;
  narration: string | null;
  created_at: string;
  cumulative: number;
}

export default function SavingsHistoryPage() {
  const [rows, setRows] = useState<SavingsRow[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");

  const fetchSavingsHistory = async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (from) {
        params.set("from", from);
      }

      if (to) {
        params.set("to", to);
      }

      const response = await fetch(
        `/api/member/savings-history?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load savings history.");
      }

      setRows(data.data || []);
    } catch (err) {
      console.error("Savings history error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load savings history."
      );

      setRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavingsHistory();
  }, []);

  const handleFilter = async (e: React.FormEvent) => {
    e.preventDefault();

    if (from && to && from > to) {
      setError("The From date cannot be later than the To date.");
      return;
    }

    await fetchSavingsHistory();
  };

  const clearFilter = async () => {
    setFrom("");
    setTo("");

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/member/savings/monthly_contribution", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load savings history.");
      }

      setRows(data.data || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load savings history."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatMonth = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalDeposits = rows
    .filter((row) => row.type === "deposit")
    .reduce((sum, row) => sum + Number(row.amount_saved), 0);

  const totalWithdrawals = rows
    .filter((row) => row.type !== "deposit")
    .reduce((sum, row) => sum + Number(row.amount_saved), 0);

  const currentBalance =
    rows.length > 0 ? Number(rows[rows.length - 1].cumulative) : 0;

  // --------------------------------------------------
  // PRINT
  // --------------------------------------------------

  const printTable = () => {
    window.print();
  };

  // --------------------------------------------------
  // CSV / EXCEL
  // --------------------------------------------------

  const exportCSV = () => {
    if (rows.length === 0) {
      alert("There is no savings data to export.");
      return;
    }

    setIsExporting(true);

    try {
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
        row.narration || row.type,
        formatDate(row.created_at),
      ]);

      const csvContent = [
        headers,
        ...csvRows,
      ]
        .map((row) =>
          row
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `savings-history-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  // --------------------------------------------------
  // PDF
  // --------------------------------------------------

  const downloadPDF = async () => {
    if (rows.length === 0) {
      alert("There is no savings data to export.");
      return;
    }

    setIsExporting(true);

    try {
      const jsPDFModule = await import("jspdf");
      const autoTableModule = await import("jspdf-autotable");

      const jsPDF = jsPDFModule.default;

      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("DCG Multipurpose Cooperative Society Ltd.", 14, 15);

      doc.setFontSize(14);
      doc.text("My Net Savings History", 14, 25);

      doc.setFontSize(10);
      doc.text(
        `Generated: ${new Date().toLocaleDateString("en-GB")}`,
        14,
        33
      );

      autoTableModule.default(doc, {
        startY: 40,
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
          formatCurrency(Number(row.amount_saved)),
          formatCurrency(Number(row.cumulative)),
          row.narration || row.type,
          formatDate(row.created_at),
        ]),
        styles: {
          fontSize: 8,
        },
        headStyles: {
          fillColor: [15, 23, 42],
        },
      });

      doc.save(
        `savings-history-${new Date().toISOString().slice(0, 10)}.pdf`
      );
    } catch (error) {
      console.error("PDF export error:", error);

      alert(
        "PDF export requires jspdf and jspdf-autotable. Please install them first."
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">

      {/* =========================================================
          NAVBAR
      ========================================================= */}

        <SavingsNavbar />


      {/* =========================================================
          MAIN
      ========================================================= */}

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 -mt-24 sm:px-6 lg:px-8">

        {/* Page Banner */}

        <div className="relative mb-6 overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">

          <div className="pointer-events-none absolute right-0 top-0 -mr-8 -mt-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10">

            <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Wallet className="h-4 w-4" />
              Savings Management
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Monthly Contributions
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
              View your approved savings transactions, track your cumulative
              savings balance, filter transactions by date, and download your
              savings history.
            </p>

          </div>
        </div>


        {/* =========================================================
            SUMMARY CARDS
        ========================================================= */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* Deposits */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total Deposits
                </p>

                <p className="mt-2 text-xl font-extrabold text-slate-900">
                  ₦{formatCurrency(totalDeposits)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ArrowUpCircle className="h-5 w-5" />
              </div>

            </div>

          </div>


          {/* Withdrawals */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Withdrawals
                </p>

                <p className="mt-2 text-xl font-extrabold text-slate-900">
                  ₦{formatCurrency(totalWithdrawals)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <ArrowDownCircle className="h-5 w-5" />
              </div>

            </div>

          </div>


          {/* Balance */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Current Savings Balance
                </p>

                <p className="mt-2 text-xl font-extrabold text-emerald-700">
                  ₦{formatCurrency(currentBalance)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp className="h-5 w-5" />
              </div>

            </div>

          </div>

        </div>


        {/* =========================================================
            HISTORY CARD
        ========================================================= */}

        <section
          id="printArea"
          className="rounded-3xl border border-slate-200 bg-white shadow-sm"
        >

          {/* Card Header */}

          <div className="border-b border-slate-200 p-5 sm:p-6">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Wallet className="h-5 w-5" />
                  </div>

                  <div>

                    <h2 className="text-lg font-extrabold text-slate-900">
                      My Net Savings History
                    </h2>

                    <p className="text-xs text-slate-500">
                      Approved savings transactions
                    </p>

                  </div>

                </div>

              </div>


              {/* Export Buttons */}

              <div className="flex flex-wrap gap-2 print:hidden">

                <button
                  type="button"
                  onClick={printTable}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </button>

                <button
                  type="button"
                  onClick={downloadPDF}
                  disabled={isExporting}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FileText className="h-4 w-4" />
                  PDF
                </button>

                <button
                  type="button"
                  onClick={exportCSV}
                  disabled={isExporting}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel
                </button>

              </div>

            </div>


            {/* =====================================================
                DATE FILTER
            ===================================================== */}

            <form
              onSubmit={handleFilter}
              className="mt-5 flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 md:flex-row md:items-end print:hidden"
            >

              <div className="flex-1">

                <label
                  htmlFor="from"
                  className="mb-1.5 block text-xs font-bold text-slate-600"
                >
                  From Date
                </label>

                <div className="relative">

                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="from"
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />

                </div>

              </div>


              <div className="flex-1">

                <label
                  htmlFor="to"
                  className="mb-1.5 block text-xs font-bold text-slate-600"
                >
                  To Date
                </label>

                <div className="relative">

                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="to"
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />

                </div>

              </div>


              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                <Filter className="h-4 w-4" />
                Filter
              </button>


              {(from || to) && (
                <button
                  type="button"
                  onClick={clearFilter}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                >
                  <RefreshCw className="h-4 w-4" />
                  Clear
                </button>
              )}

            </form>

          </div>


          {/* =====================================================
              ERROR
          ===================================================== */}

          {error && (
            <div className="mx-5 mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 sm:mx-6">
              {error}
            </div>
          )}


          {/* =====================================================
              TABLE
          ===================================================== */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px] text-left">

              <thead className="bg-slate-900 text-white">

                <tr>

                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide">
                    S/N
                  </th>

                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide">
                    Month
                  </th>

                  <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wide">
                    Amount (₦)
                  </th>

                  <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wide">
                    Cumulative (₦)
                  </th>

                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide">
                    Narration
                  </th>

                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide">
                    Date
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {isLoading ? (

                  <tr>

                    <td
                      colSpan={6}
                      className="px-4 py-16 text-center"
                    >

                      <div className="flex flex-col items-center justify-center gap-3">

                        <RefreshCw className="h-7 w-7 animate-spin text-emerald-600" />

                        <p className="text-sm font-semibold text-slate-500">
                          Loading savings history...
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : rows.length === 0 ? (

                  <tr>

                    <td
                      colSpan={6}
                      className="px-4 py-16 text-center"
                    >

                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <Wallet className="h-7 w-7" />
                      </div>

                      <h3 className="mt-4 text-sm font-bold text-slate-900">
                        No savings transactions found
                      </h3>

                      <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
                        There are no approved savings transactions for the
                        selected date range.
                      </p>

                    </td>

                  </tr>

                ) : (

                  rows.map((row, index) => (

                    <tr
                      key={`${row.created_at}-${index}`}
                      className="transition hover:bg-slate-50"
                    >

                      <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                        {index + 1}
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                        {formatMonth(row.created_at)}
                      </td>

                      <td
                        className={`px-4 py-4 text-right text-sm font-bold ${
                          row.type === "deposit"
                            ? "text-emerald-700"
                            : "text-rose-600"
                        }`}
                      >
                        {row.type === "deposit" ? "+" : "-"}
                        {formatCurrency(Number(row.amount_saved))}
                      </td>

                      <td className="px-4 py-4 text-right text-sm font-extrabold text-slate-900">
                        {formatCurrency(Number(row.cumulative))}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {row.narration || row.type}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-500">
                        {formatDate(row.created_at)}
                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>


          {/* =====================================================
              TABLE FOOTER
          ===================================================== */}

          {rows.length > 0 && !isLoading && (

            <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">

              <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">

                <span>
                  Showing{" "}
                  <strong className="text-slate-900">
                    {rows.length}
                  </strong>{" "}
                  transaction{rows.length !== 1 ? "s" : ""}
                </span>

                <span>
                  Current balance:{" "}
                  <strong className="text-emerald-700">
                    ₦{formatCurrency(currentBalance)}
                  </strong>
                </span>

              </div>

            </div>

          )}

        </section>

      </main>


      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="mt-auto border-t border-slate-200 bg-white py-6">

        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">

          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} DCG Multipurpose Cooperative
            Society Ltd. All rights reserved.
          </p>

        </div>

      </footer>


      {/* =========================================================
          PRINT STYLES
      ========================================================= */}

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          nav,
          footer,
          button,
          form {
            display: none !important;
          }

          #printArea {
            border: none !important;
            box-shadow: none !important;
          }

          table {
            width: 100% !important;
          }
        }
      `}</style>

    </div>
  );
}
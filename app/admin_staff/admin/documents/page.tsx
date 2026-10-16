"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Shield,
  FileText,
  ExternalLink,
  CheckCircle2,
  Clock,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Search,
  FileCheck2,
  CalendarDays,
  Database,
} from "lucide-react";

type DocumentRecord = {
  document_id: number;
  file_name: string;
  file_path: string;
  type: string;
  uploaded_at: string;
  admin1_acknowledged: boolean | number;
};

type StatusMessage = {
  text: string;
  type: "success" | "error";
};

export default function Admin1DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusMessage, setStatusMessage] =
    useState<StatusMessage | null>(null);

  /**
   * Fetch uploaded documents
   */
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/admin_staff/admin/documents", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setDocuments(data.documents ?? []);
      } else {
        setStatusMessage({
          text: data.message || "Failed to load uploaded documents.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);

      setStatusMessage({
        text: "Network error. Could not retrieve uploaded documents.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  /**
   * Acknowledge document
   */
  const handleAcknowledge = async (documentId: number) => {
    setProcessingId(documentId);
    setStatusMessage(null);

    try {
      const response = await fetch(
        "/api/admin_staff/admin/documents/acknowledge",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            document_id: documentId,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMessage({
          text:
            data.message ||
            "Document acknowledged successfully.",
          type: "success",
        });

        setDocuments((previous) =>
          previous.map((document) =>
            document.document_id === documentId
              ? {
                  ...document,
                  admin1_acknowledged: true,
                }
              : document
          )
        );
      } else {
        setStatusMessage({
          text:
            data.message ||
            "Failed to acknowledge document.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Acknowledge error:", error);

      setStatusMessage({
        text:
          "Network error. Failed to acknowledge the document.",
        type: "error",
      });
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * Format uploaded date
   */
  const formatDate = (value?: string) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Convert file name to a nicer display
   */
  const getDisplayFileName = (fileName: string) => {
    if (!fileName) return "Unnamed document";

    return fileName.length > 45
      ? `${fileName.substring(0, 42)}...`
      : fileName;
  };

  /**
   * Search documents
   */
  const filteredDocuments = documents.filter((document) => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) return true;

    return (
      document.file_name?.toLowerCase().includes(query) ||
      document.type?.toLowerCase().includes(query) ||
      String(document.document_id).includes(query)
    );
  });

  const acknowledgedCount = documents.filter(
    (document) => Boolean(document.admin1_acknowledged)
  ).length;

  const pendingCount = documents.length - acknowledgedCount;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans -mt-28 text-slate-900">
      {/* ====================================================== */}
      {/* NAVBAR */}
      {/* ====================================================== */}

      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-xs">
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

              <span className="hidden items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold text-white sm:inline-flex">
                <Shield className="h-3 w-3 text-emerald-400" />
                Staff Portal
              </span>
            </div>

            {/* Back */}
            <Link
              href="/admin_staff/admin/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">
                Back to Dashboard
              </span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ====================================================== */}
      {/* MAIN */}
      {/* ====================================================== */}

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 mt-2 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* ================================================== */}
          {/* HERO */}
          {/* ================================================== */}

          <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">
            {/* Glow */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl space-y-3">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                  <FileCheck2 className="h-3.5 w-3.5" />
                  Document Operations
                </span>

                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                    Uploaded Documents
                  </h1>

                  <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
                    Review documents submitted by members, open uploaded
                    files, and acknowledge documents that have been verified
                    by Admin1.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchDocuments}
                disabled={isLoading}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    isLoading ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>
            </div>
          </section>

          {/* ================================================== */}
          {/* STATUS */}
          {/* ================================================== */}

          {statusMessage && (
            <div
              className={`flex items-start gap-3 rounded-2xl border p-4 text-xs font-medium ${
                statusMessage.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              )}

              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* ================================================== */}
          {/* SUMMARY */}
          {/* ================================================== */}

          {!isLoading && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Total */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Total Documents
                    </p>

                    <p className="mt-2 text-2xl font-extrabold text-slate-900">
                      {documents.length}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Database className="h-5 w-5" />
                  </div>
                </div>

                <p className="mt-2 text-[11px] text-slate-500">
                  All uploaded member documents.
                </p>
              </div>

              {/* Pending */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Pending
                    </p>

                    <p className="mt-2 text-2xl font-extrabold text-amber-600">
                      {pendingCount}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>

                <p className="mt-2 text-[11px] text-slate-500">
                  Documents awaiting acknowledgment.
                </p>
              </div>

              {/* Acknowledged */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Acknowledged
                    </p>

                    <p className="mt-2 text-2xl font-extrabold text-emerald-700">
                      {acknowledgedCount}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                </div>

                <p className="mt-2 text-[11px] text-slate-500">
                  Documents already acknowledged.
                </p>
              </div>
            </div>
          )}

          {/* ================================================== */}
          {/* DOCUMENT CONTAINER */}
          {/* ================================================== */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
            {/* Section Header */}
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  Member Documents
                </h2>

                <p className="mt-1 text-[11px] text-slate-400">
                  Uploaded documents sorted by most recent upload.
                </p>
              </div>

              {/* Search */}
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 shadow-xs outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Loading */}
            {isLoading ? (
              <div className="p-20 text-center">
                <Loader2 className="mx-auto mb-3 h-7 w-7 animate-spin text-emerald-600" />

                <p className="text-xs font-medium text-slate-400">
                  Loading uploaded documents...
                </p>
              </div>
            ) : filteredDocuments.length > 0 ? (
              <>
                {/* ================================================== */}
                {/* DESKTOP TABLE */}
                {/* ================================================== */}

                <div className="mt-5 hidden overflow-x-auto md:block">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                        <th className="pb-3 pr-4 font-bold">
                          ID
                        </th>

                        <th className="pb-3 pr-4 font-bold">
                          Document
                        </th>

                        <th className="pb-3 pr-4 font-bold">
                          Type
                        </th>

                        <th className="pb-3 pr-4 font-bold">
                          Uploaded
                        </th>

                        <th className="pb-3 text-right font-bold">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-50">
                      {filteredDocuments.map((document) => {
                        const acknowledged = Boolean(
                          document.admin1_acknowledged
                        );

                        return (
                          <tr
                            key={document.document_id}
                            className="group transition-colors hover:bg-slate-50/70"
                          >
                            {/* ID */}
                            <td className="py-4 pr-4">
                              <span className="font-mono text-xs font-bold text-slate-700">
                                #{document.document_id}
                              </span>
                            </td>

                            {/* File */}
                            <td className="py-4 pr-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-600">
                                  <FileText className="h-4 w-4" />
                                </div>

                                <div className="min-w-0">
                                  <a
                                    href={document.file_path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex max-w-xs items-center gap-1.5 truncate text-xs font-bold text-slate-900 transition-colors hover:text-emerald-700"
                                    title={document.file_name}
                                  >
                                    {getDisplayFileName(
                                      document.file_name
                                    )}

                                    <ExternalLink className="h-3 w-3 shrink-0 text-slate-400" />
                                  </a>

                                  <p className="mt-0.5 text-[10px] text-slate-400">
                                    Uploaded document
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Type */}
                            <td className="py-4 pr-4">
                              <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                                {document.type || "Document"}
                              </span>
                            </td>

                            {/* Date */}
                            <td className="py-4 pr-4">
                              <div className="flex items-center gap-1.5 text-slate-500">
                                <CalendarDays className="h-3.5 w-3.5 text-slate-400" />

                                <span className="text-[11px] font-medium">
                                  {formatDate(
                                    document.uploaded_at
                                  )}
                                </span>
                              </div>
                            </td>

                            {/* Action */}
                            <td className="py-4 text-right">
                              {acknowledged ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Acknowledged
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAcknowledge(
                                      document.document_id
                                    )
                                  }
                                  disabled={
                                    processingId ===
                                    document.document_id
                                  }
                                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-[11px] font-bold text-white shadow-xs transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {processingId ===
                                  document.document_id ? (
                                    <>
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                      Acknowledge
                                    </>
                                  )}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ================================================== */}
                {/* MOBILE CARDS */}
                {/* ================================================== */}

                <div className="mt-5 space-y-3 md:hidden">
                  {filteredDocuments.map((document) => {
                    const acknowledged = Boolean(
                      document.admin1_acknowledged
                    );

                    return (
                      <div
                        key={document.document_id}
                        className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition-colors hover:bg-slate-50"
                      >
                        {/* Top */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200">
                              <FileText className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Document #{document.document_id}
                              </p>

                              <a
                                href={document.file_path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 flex max-w-[210px] items-center gap-1 truncate text-xs font-bold text-slate-900 hover:text-emerald-700"
                              >
                                {getDisplayFileName(
                                  document.file_name
                                )}

                                <ExternalLink className="h-3 w-3 shrink-0 text-slate-400" />
                              </a>
                            </div>
                          </div>

                          {acknowledged ? (
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                          ) : (
                            <Clock className="h-5 w-5 shrink-0 text-amber-500" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Type
                            </p>

                            <p className="mt-1 text-[11px] font-semibold text-slate-700">
                              {document.type || "Document"}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Uploaded
                            </p>

                            <p className="mt-1 text-[11px] font-medium text-slate-600">
                              {formatDate(
                                document.uploaded_at
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Action */}
                        {acknowledged ? (
                          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" />
                            Acknowledged
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleAcknowledge(
                                document.document_id
                              )
                            }
                            disabled={
                              processingId ===
                              document.document_id
                            }
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {processingId ===
                            document.document_id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
                                Acknowledge Document
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              /* ================================================== */
              /* EMPTY */
              /* ================================================== */

              <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <FileText className="h-7 w-7" />
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-900">
                  {searchQuery
                    ? "No Documents Found"
                    : "No Uploaded Documents"}
                </h3>

                <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                  {searchQuery
                    ? `No documents match "${searchQuery}". Try another search term.`
                    : "There are currently no documents available in the document repository."}
                </p>

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ====================================================== */}
      {/* FOOTER */}
      {/* ====================================================== */}

      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <Link
            href="/admin_staff/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Staff Dashboard
          </Link>

          <p className="mt-2 text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} DCG Multipurpose
            Cooperative Society Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
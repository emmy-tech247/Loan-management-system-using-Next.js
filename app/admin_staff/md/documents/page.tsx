"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  FileText,
  Loader2,
  ShieldCheck,
} from "lucide-react";

type Document = {
  id: number;
  file_name: string;
  file_path: string;
  type: string;
  acknowledged_at: string;
};

export default function Admin2DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchDocuments = async () => {
    try {
      setError("");

      const response = await fetch("/api/admin_staff/md/documents", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }

      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load documents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleConfirm = async (documentId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to confirm this document?"
    );

    if (!confirmed) return;

    try {
      setConfirmingId(documentId);
      setError("");

      const response = await fetch("/api/admin_staff/md/documents/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_id: documentId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to confirm document");
      }

      // Remove the confirmed document from the pending list
      setDocuments((current) =>
        current.filter((document) => document.id !== documentId)
      );
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to confirm document. Please try again."
      );
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans -mt-28 text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/admin_staff/md"
              className="flex items-center gap-2 text-sm font-bold text-slate-800 transition-colors hover:text-emerald-600"
            >
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
              <span>Admin 2 Portal</span>
            </Link>

            <span className="hidden items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white sm:inline-flex">
              <FileCheck2 className="h-3 w-3 text-emerald-400" />
              Document Confirmation
            </span>
          </div>

          <Link
            href="/admin_staff/md/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </div>
      </nav>

      {/* Main */}
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 mt-2 sm:px-6 lg:px-8">
        {/* Header */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">
          <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Managing Director Confirmation
            </span>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Documents Awaiting MD Confirmation
            </h1>

            <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
              Review documents acknowledged by Admin 1 and confirm them for
              final processing.
            </p>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />

            <p className="mt-3 text-sm font-semibold text-slate-700">
              Loading pending documents...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Please wait while we retrieve the documents.
            </p>
          </div>
        ) : documents.length > 0 ? (
          <>
            {/* Summary */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Pending Documents
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {documents.length} document
                  {documents.length === 1 ? "" : "s"} awaiting confirmation
                </p>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                <FileCheck2 className="h-3.5 w-3.5 text-amber-600" />
                {documents.length} Pending
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        ID
                      </th>
                      <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        File Name
                      </th>
                      <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        Type
                      </th>
                      <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        Acknowledged At
                      </th>
                      <th className="px-5 py-4 text-right text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {documents.map((document) => (
                      <tr
                        key={document.id}
                        className="transition-colors hover:bg-slate-50/70"
                      >
                        {/* ID */}
                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                            #{document.id}
                          </span>
                        </td>

                        {/* File */}
                        <td className="px-5 py-4">
                          <a
                            href={document.file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex max-w-sm items-center gap-2"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-emerald-100 group-hover:text-emerald-700">
                              <FileText className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-slate-800 group-hover:text-emerald-700">
                                {document.file_name}
                              </p>

                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 group-hover:text-emerald-600">
                                Open document
                                <ExternalLink className="h-3 w-3" />
                              </span>
                            </div>
                          </a>
                        </td>

                        {/* Type */}
                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                            {document.type}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4">
                          <span className="text-xs font-medium text-slate-600">
                            {document.acknowledged_at}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleConfirm(document.id)}
                            disabled={confirmingId === document.id}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-xs transition-all hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {confirmingId === document.id ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Confirming...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Confirm
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-3 md:hidden">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <FileText className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <a
                          href={document.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block truncate text-sm font-bold text-slate-900 hover:text-emerald-700"
                        >
                          {document.file_name}
                        </a>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                          Document #{document.id}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                      {document.type}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Acknowledged
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-600">
                        {document.acknowledged_at}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleConfirm(document.id)}
                      disabled={confirmingId === document.id}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-xs font-extrabold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {confirmingId === document.id ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Confirming
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Confirm
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-sm font-extrabold text-slate-900">
              No documents pending MD confirmation
            </h3>

            <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-500">
              All documents acknowledged by Admin 1 have been confirmed, or
              there are currently no documents waiting for your review.
            </p>

            <Link
              href="/admin_staff/md/dashboard"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-slate-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Admin Dashboard
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} DCG Multipurpose Cooperative
            Society Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
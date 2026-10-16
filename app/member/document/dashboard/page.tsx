"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import DocumentNavbar from "@/components/navigation/DocumentNavbar";
import {
  FileText,
  Upload,
  Download,
  PenTool,
  ArrowLeft,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function DocumentPage() {
  const [document, setDocument] = useState<File | null>(null);
  const [type, setType] = useState("loan_form");
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!document) {
      setError("Please select a document to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("document", document);
    formData.append("type", type);

    setIsUploading(true);

    try {
      const response = await fetch("/api/member/document/dashboard", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed.");
      }

      setMessage("Document uploaded successfully.");
      setDocument(null);

      // Reset file input
      const fileInput = document.getElementById(
        "document"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Navbar */}
      <DocumentNavbar />

      {/* Main */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 -mt-24 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          
          <div className="absolute top-0 right-0 -mt-12 -mr-12 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300">
              <FileText className="h-6 w-6" />
            </div>

            <div>
              <span className="inline-block mb-1 rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                Member Documents
              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Document Centre
              </h1>

              <p className="mt-1 text-sm text-slate-300">
                Upload loan forms and savings agreements securely.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Card */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Upload className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Upload Loan Forms or Savings Agreements
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select the appropriate document type and upload your file.
              </p>
            </div>
          </div>

          {/* Success Message */}
          {message && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              {message}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-6">
            
            {/* File Input */}
            <div>
              <label
                htmlFor="document"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Select Document
              </label>

              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors">
                <input
                  id="document"
                  name="document"
                  type="file"
                  required
                  onChange={(e) => {
                    setDocument(e.target.files?.[0] || null);
                    setError("");
                    setMessage("");
                  }}
                  className="block w-full cursor-pointer text-sm text-slate-600
                    file:mr-4 file:rounded-xl
                    file:border-0
                    file:bg-slate-900
                    file:px-4
                    file:py-2.5
                    file:text-sm
                    file:font-semibold
                    file:text-white
                    hover:file:bg-emerald-600
                    file:transition-colors"
                />

                <p className="mt-2 text-xs text-slate-400">
                  PDF, DOC, DOCX or other supported document formats.
                </p>
              </div>

              {document && (
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                  <FileCheck className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium">{document.name}</span>
                </div>
              )}
            </div>

            {/* Document Type */}
            <div>
              <label
                htmlFor="type"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Document Type
              </label>

              <select
                id="type"
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-xs outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="loan_form">
                  Loan Form
                </option>

                <option value="savings_agreement">
                  Savings Agreement
                </option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isUploading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Document
                </>
              )}
            </button>
          </form>
        </section>

        {/* Information Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <FileText className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Loan Forms
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Upload completed loan application and related forms.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <FileCheck className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Savings Agreements
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Upload your completed savings agreement documents.
                </p>
              </div>
            </div>
          </div>
        </div>
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
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SavingsNavbar from "@/components/navigation/SavingsNavbar";
import {
  ArrowLeft,
  Upload,
  Receipt,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  X,
} from "lucide-react";

export default function UploadTopupReceiptPage() {
  const [amountSaved, setAmountSaved] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessage("");
    setSuccess(false);

    if (!amountSaved || Number(amountSaved) <= 0) {
      setMessage("Please enter a valid savings amount.");
      return;
    }

    if (!receipt) {
      setMessage("Please select a receipt.");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
    ];

    if (!allowedTypes.includes(receipt.type)) {
      setMessage("Invalid file type. Please upload JPG, PNG, or PDF.");
      return;
    }

    // Optional 5MB limit
    if (receipt.size > 5 * 1024 * 1024) {
      setMessage("Receipt file must not exceed 5MB.");
      return;
    }

    const formData = new FormData();

    formData.append("amount_saved", amountSaved);
    formData.append("receipt", receipt);

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "/api/member/savings/topups_savings",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Upload failed.");
        setSuccess(false);
        return;
      }

      setMessage(
        data.message ||
          "Receipt uploaded successfully. Awaiting admin acknowledgment."
      );

      setSuccess(true);

      // Reset form
      setAmountSaved("");
      setReceipt(null);

      const fileInput = document.getElementById(
        "receipt"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong. Please try again.");
      setSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">

      {/* ================= NAVBAR ================= */}
       <SavingsNavbar />

      {/* ================= MAIN ================= */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 -mt-24 sm:px-6 lg:px-8">

        {/* Header Banner */}
        <div className="relative mb-6 overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">

          <div className="pointer-events-none absolute right-0 top-0 -mr-10 -mt-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 max-w-2xl space-y-3">

            <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Wallet className="h-3.5 w-3.5" />
              Savings Top-up
            </span>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Upload Top-up Savings Receipt
            </h1>

            <p className="text-sm leading-relaxed text-slate-300">
              Submit your savings payment receipt for verification and
              acknowledgment by the cooperative administrators.
            </p>

          </div>
        </div>

        {/* ================= FORM CARD ================= */}
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">

          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Receipt className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Savings Payment Receipt
              </h2>

              <p className="text-sm text-slate-500">
                Enter your payment amount and upload the receipt.
              </p>
            </div>

          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 text-sm ${
                success
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {success ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              )}

              <p className="font-medium">
                {message}
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* Amount */}
            <div className="space-y-2">

              <label
                htmlFor="amount_saved"
                className="text-sm font-semibold text-slate-700"
              >
                Amount Saved
              </label>

              <div className="relative">

                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                  ₦
                </span>

                <input
                  type="number"
                  name="amount_saved"
                  id="amount_saved"
                  value={amountSaved}
                  onChange={(e) =>
                    setAmountSaved(e.target.value)
                  }
                  min="0"
                  step="100"
                  required
                  placeholder="Enter amount"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />

              </div>

              <p className="text-xs text-slate-500">
                Enter the exact amount shown on your payment receipt.
              </p>

            </div>

            {/* Receipt */}
            <div className="space-y-2">

              <label
                htmlFor="receipt"
                className="text-sm font-semibold text-slate-700"
              >
                Upload Receipt
              </label>

              <label
                htmlFor="receipt"
                className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center transition hover:border-emerald-400 hover:bg-emerald-50/50"
              >

                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm group-hover:text-emerald-600">
                  <Upload className="h-6 w-6" />
                </div>

                <p className="text-sm font-semibold text-slate-700">
                  {receipt
                    ? receipt.name
                    : "Click to select your receipt"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  JPG, JPEG, PNG or PDF — maximum 5MB
                </p>

                <input
                  type="file"
                  name="receipt"
                  id="receipt"
                  accept="image/jpeg,image/png,application/pdf"
                  required
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setReceipt(file);
                    setMessage("");
                  }}
                />

              </label>

              {receipt && (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

                  <div className="flex min-w-0 items-center gap-3">

                    <FileText className="h-5 w-5 shrink-0 text-emerald-600" />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-700">
                        {receipt.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {(receipt.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setReceipt(null);

                      const input = document.getElementById(
                        "receipt"
                      ) as HTMLInputElement | null;

                      if (input) {
                        input.value = "";
                      }
                    }}
                    className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <X className="h-4 w-4" />
                  </button>

                </div>
              )}

            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Uploading Receipt...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  Submit Receipt
                </>
              )}

            </button>

          </form>

          {/* Information */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">

            <p className="text-xs leading-relaxed text-slate-600">
              <strong className="text-slate-800">
                Important:
              </strong>{" "}
              Your receipt will remain pending until it has been
              reviewed and acknowledged by the appropriate cooperative
              administrator.
            </p>

          </div>

        </div>
      </main>

      {/* ================= FOOTER ================= */}
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
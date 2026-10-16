"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  CheckCircle2,
  FileCheck,
  FileText,
  ImageIcon,
  Loader2,
  Upload,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

import { uploadReceipt } from "@/app/actions/upload-receipt";

export default function UploadReceiptPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  /*
   * ---------------------------------------------------------
   * Handle file selection
   * ---------------------------------------------------------
   */

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile =
      event.target.files?.[0] || null;

    setMessage("");
    setIsSuccess(false);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    /*
     * Validate file type on client
     */

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setFile(null);

      setMessage(
        "Invalid file type. Only PDF, JPG, JPEG, and PNG are allowed."
      );

      return;
    }

    /*
     * Validate size
     */

    const maxSize = 5 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      setFile(null);

      setMessage(
        "File is too large. Maximum allowed size is 5 MB."
      );

      return;
    }

    setFile(selectedFile);
  };

  /*
   * ---------------------------------------------------------
   * Submit form
   * ---------------------------------------------------------
   */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMessage("");
    setIsSuccess(false);

    if (!file) {
      setMessage("Please select a receipt first.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();

      formData.append(
        "receipt",
        file
      );

      const result =
        await uploadReceipt(formData);

      setMessage(result.message);

      setIsSuccess(result.success);

      if (result.success) {
        setFile(null);

        /*
         * Reset file input
         */

        const input =
          document.getElementById(
            "receipt"
          ) as HTMLInputElement | null;

        if (input) {
          input.value = "";
        }
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "Something went wrong while uploading the receipt."
      );

      setIsSuccess(false);
    } finally {
      setIsUploading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * Format file size
   * ---------------------------------------------------------
   */

  const formatFileSize = (
    bytes: number
  ) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8 -mt-24 sm:px-6 lg:px-8">

        {/* Header */}

        <div className="mb-6 rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300">

              <FileCheck className="h-6 w-6" />

            </div>

            <div>

              <span className="mb-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">

                <ShieldCheck className="h-3.5 w-3.5" />

                Payment Verification

              </span>

              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">

                Upload Evidence of Payment

              </h1>

              <p className="mt-2 text-sm leading-relaxed text-slate-300">

                Upload your payment receipt for verification.
                Your receipt will be reviewed by the cooperative
                administrator before approval.

              </p>

            </div>

          </div>

        </div>

        {/* Upload Card */}

        <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">

          {/* Status Message */}

          {message && (

            <div
              className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 text-sm font-medium ${
                isSuccess
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >

              {isSuccess ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              )}

              <p>{message}</p>

            </div>

          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* File Input */}

            <div>

              <label
                htmlFor="receipt"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Select Receipt
                <span className="ml-1 text-rose-500">
                  *
                </span>
              </label>

              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 transition-colors hover:border-emerald-300 hover:bg-emerald-50/30 sm:p-8">

                <div className="flex flex-col items-center text-center">

                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">

                    <Upload className="h-7 w-7" />

                  </div>

                  <h2 className="text-sm font-bold text-slate-900">
                    Choose your payment receipt
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    PDF, JPG, JPEG or PNG
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Maximum file size: 5 MB
                  </p>

                  <label
                    htmlFor="receipt"
                    className="
                      mt-5
                      inline-flex
                      cursor-pointer
                      items-center
                      gap-2
                      rounded-xl
                      bg-slate-900
                      px-5
                      py-2.5
                      text-sm
                      font-bold
                      text-white
                      shadow-sm
                      transition-all
                      hover:bg-emerald-600
                      focus:outline-none
                      focus:ring-2
                      focus:ring-emerald-500
                      focus:ring-offset-2
                    "
                  >
                    <Upload className="h-4 w-4" />
                    Browse File
                  </label>

                  <input
                    id="receipt"
                    name="receipt"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="sr-only"
                    required
                  />

                </div>

              </div>

            </div>

            {/* Selected File */}

            {file && (

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">

                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

                    {file.type === "application/pdf" ? (
                      <FileText className="h-5 w-5" />
                    ) : (
                      <ImageIcon className="h-5 w-5" />
                    )}

                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-sm font-bold text-slate-900">
                      {file.name}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatFileSize(file.size)}
                    </p>

                  </div>

                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                    Ready
                  </span>

                </div>

              </div>

            )}

            {/* Information */}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

              <div className="flex gap-3">

                <FileCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                <div>

                  <h3 className="text-sm font-bold text-slate-900">
                    Before you upload
                  </h3>

                  <ul className="mt-2 space-y-1 text-xs leading-relaxed text-slate-500">

                    <li>
                      • Make sure the receipt is clear and readable.
                    </li>

                    <li>
                      • Accepted formats are PDF, JPG, JPEG and PNG.
                    </li>

                    <li>
                      • The maximum file size is 5 MB.
                    </li>

                    <li>
                      • Your receipt will be reviewed before approval.
                    </li>

                  </ul>

                </div>

              </div>

            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={isUploading || !file}
              className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-emerald-600
                px-5
                py-3
                text-sm
                font-bold
                text-white
                shadow-sm
                transition-all
                hover:bg-emerald-700
                focus:outline-none
                focus:ring-2
                focus:ring-emerald-500
                focus:ring-offset-2
                disabled:cursor-not-allowed
                disabled:bg-slate-300
                disabled:text-slate-500
              "
            >

              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading Receipt...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Receipt
                </>
              )}

            </button>

          </form>

        </section>

        {/* Back Button */}

        <div className="mt-6 flex justify-center">

          <Link
            href="/member/dashboard"
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-5
              py-2.5
              text-sm
              font-semibold
              text-slate-700
              shadow-xs
              transition-colors
              hover:border-slate-300
              hover:bg-slate-100
              hover:text-slate-900
            "
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Member Dashboard
          </Link>

        </div>

      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="mt-auto border-t border-slate-200 bg-white py-6">

        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">

          <p className="text-xs text-slate-500">

            &copy; {new Date().getFullYear()} DCG Multipurpose Cooperative Society Ltd. All rights reserved.

          </p>

        </div>

      </footer>

    </div>
  );
}
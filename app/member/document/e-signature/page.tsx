"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import DocumentNavbar from "@/components/navigation/DocumentNavbar";
import {
  ArrowLeft,
  CheckCircle2,
  FilePenLine,
  FileSignature,
  PenLine,
  Trash2,
  Upload,
} from "lucide-react";

export default function ESignaturePage() {
  const router = useRouter();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [purpose, setPurpose] = useState("");
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /*
   * ---------------------------------------------------------
   * Canvas setup
   * ---------------------------------------------------------
   */
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f172a";

    // White canvas background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  /*
   * ---------------------------------------------------------
   * Get pointer position relative to canvas
   * ---------------------------------------------------------
   */
  const getPointerPosition = (
    event: ReactPointerEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return { x: 0, y: 0 };
    }

    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  /*
   * ---------------------------------------------------------
   * Start drawing
   * ---------------------------------------------------------
   */
  const startDrawing = (
    event: ReactPointerEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const { x, y } = getPointerPosition(event);

    canvas.setPointerCapture(event.pointerId);

    ctx.beginPath();
    ctx.moveTo(x, y);

    setIsDrawing(true);
  };

  /*
   * ---------------------------------------------------------
   * Draw signature
   * ---------------------------------------------------------
   */
  const draw = (
    event: ReactPointerEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const { x, y } = getPointerPosition(event);

    ctx.lineTo(x, y);
    ctx.stroke();

    setHasSignature(true);
  };

  /*
   * ---------------------------------------------------------
   * Stop drawing
   * ---------------------------------------------------------
   */
  const stopDrawing = (
    event: ReactPointerEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;

    if (canvas) {
      try {
        canvas.releasePointerCapture(event.pointerId);
      } catch {
        // Ignore if pointer capture was already released
      }
    }

    setIsDrawing(false);
  };

  /*
   * ---------------------------------------------------------
   * Clear signature
   * ---------------------------------------------------------
   */
  const clearPad = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f172a";

    setHasSignature(false);
  };

  /*
   * ---------------------------------------------------------
   * Signature image upload
   * ---------------------------------------------------------
   */
  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      setSignatureFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid signature image.");
      event.target.value = "";
      return;
    }

    setSignatureFile(file);
  };

  /*
   * ---------------------------------------------------------
   * Submit form
   *
   * This replaces:
   * action="save_signature.php"
   * ---------------------------------------------------------
   */
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!purpose.trim()) {
      alert("Please enter the purpose of the signature.");
      return;
    }

    if (!hasSignature && !signatureFile) {
      alert(
        "Please draw your signature or upload a signature image."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("purpose", purpose.trim());

      /*
       * If the member drew a signature, convert the canvas
       * to a PNG data URL.
       */
      if (hasSignature && canvasRef.current) {
        const signatureData =
          canvasRef.current.toDataURL("image/png");

        formData.append("signature_data", signatureData);
      }

      /*
       * If the member uploaded an image, include it.
       */
      if (signatureFile) {
        formData.append("signature_file", signatureFile);
      }

      const response = await fetch(
        "/api/member/e-signature",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to save signature."
        );
      }

      alert("Signature submitted successfully.");

      router.push("/member");
    } catch (error) {
      console.error("Signature submission error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to submit signature."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">

      {/* =====================================================
          NAVBAR
      ====================================================== */}
       <DocumentNavbar />

      {/* =====================================================
          MAIN
      ====================================================== */}
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 -mt-24 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-6 rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">

          <div className="absolute top-0 right-0 -mt-12 -mr-12 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300">
              <FileSignature className="h-4 w-4" />
              Member E-Signature
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Mandate Signature
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
              Provide your electronic signature for loan forms,
              savings agreements, and other cooperative documents.
            </p>
          </div>
        </div>

        {/* =================================================
            FORM CARD
        ================================================== */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm"
        >

          {/* Purpose */}
          <div className="space-y-2">
            <label
              htmlFor="purpose"
              className="text-sm font-bold text-slate-800"
            >
              Purpose
            </label>

            <input
              id="purpose"
              name="purpose"
              type="text"
              value={purpose}
              onChange={(event) =>
                setPurpose(event.target.value)
              }
              placeholder="Enter the purpose of this signature"
              required
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-xs outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Divider */}
          <div className="my-8 border-t border-slate-100" />

          {/* Draw Signature */}
          <div className="space-y-3">

            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <PenLine className="h-4 w-4 text-emerald-600" />
                  Draw Signature
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Use your mouse, touchpad, or touchscreen.
                </p>
              </div>

              {hasSignature && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Signature added
                </span>
              )}
            </div>

            {/* Canvas */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-inner">
              <canvas
                ref={canvasRef}
                width={800}
                height={400}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerCancel={stopDrawing}
                onPointerLeave={stopDrawing}
                className="block h-auto w-full cursor-crosshair touch-none bg-white"
              />
            </div>

            {/* Clear Button */}
            <button
              type="button"
              onClick={clearPad}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
            >
              <Trash2 className="h-4 w-4" />
              Clear Signature
            </button>
          </div>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              OR
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Upload Signature */}
          <div className="space-y-3">

            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Upload className="h-4 w-4 text-emerald-600" />
                Upload Signature Image
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Upload a PNG, JPG, JPEG, or other image containing
                your signature.
              </p>
            </div>

            <label
              htmlFor="signature_file"
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center transition-all hover:border-emerald-400 hover:bg-emerald-50/40"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Upload className="h-5 w-5" />
              </div>

              <span className="text-sm font-bold text-slate-700">
                {signatureFile
                  ? signatureFile.name
                  : "Choose signature image"}
              </span>

              <span className="mt-1 text-xs text-slate-400">
                Click to browse your device
              </span>

              <input
                id="signature_file"
                name="signature_file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Submit */}
          <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FileSignature className="h-4 w-4" />

              {isSubmitting
                ? "Submitting..."
                : "Submit Signature"}
            </button>

          </div>

        </form>
      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} DCG Multipurpose
            Cooperative Society Ltd. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
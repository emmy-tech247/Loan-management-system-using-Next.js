"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Shield,
  Loader2,
  FileSignature,
  Calendar,
  User,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { SignedMandate } from "@/types/viewSignatures";

export default function ViewSignaturesPage() {
  const [signatures, setSignatures] = useState<SignedMandate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const fetchSignatures = useCallback(async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin_staff/admin/signatures");
      const json = await res.json();

      if (res.ok && json.success) {
        setSignatures(json.signatures || []);
      } else {
        setStatusMessage({
          text: json.message || "Failed to load signed mandates.",
          type: "error",
        });
      }
    } catch {
      setStatusMessage({
        text: "Network error. Could not retrieve signed mandates.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSignatures();
  }, [fetchSignatures]);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin_staff/staff/login" className="flex items-center gap-2">
                <Image
                  src="/images/logo2.png"
                  alt="Cooperative Logo"
                  width={140}
                  height={40}
                  className="h-9 w-auto object-contain"
                  priority
                />
              </Link>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold text-white">
                <Shield className="h-3 w-3 text-emerald-400" /> Staff Portal
              </span>
            </div>

            <Link
              href="/admin_staff/admin/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <FileSignature className="h-6 w-6 text-emerald-600" /> Signed Mandates
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review authorized digital signatures and deduction mandate forms submitted by cooperative members.
          </p>
        </div>

        {statusMessage && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800">
            {statusMessage.text}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-20 text-center text-xs text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-600" />
            Loading signed mandates...
          </div>
        ) : (
          <div className="space-y-4">
            {signatures.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {signatures.map((sig) => (
                  <div
                    key={sig.signature_id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Mandate #{sig.signature_id}
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {sig.member_id}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <p className="text-slate-700 flex items-center justify-between">
                          <span className="font-semibold text-slate-400 flex items-center gap-1">
                            <User className="h-3 w-3" /> Member:
                          </span>
                          <span className="font-bold text-slate-900">{sig.full_name}</span>
                        </p>
                        <p className="text-slate-700 flex items-start justify-between gap-2">
                          <span className="font-semibold text-slate-400 flex items-center gap-1 shrink-0">
                            <HelpCircle className="h-3 w-3" /> Purpose:
                          </span>
                          <span className="font-medium text-slate-800 text-right">{sig.purpose}</span>
                        </p>
                        <p className="text-slate-700 flex items-center justify-between">
                          <span className="font-semibold text-slate-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Date:
                          </span>
                          <span className="font-medium text-slate-600">{formatDate(sig.signed_at)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Signature Verification
                      </span>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-center relative h-24 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={sig.signature_path}
                          alt={`Signature for ${sig.full_name}`}
                          className="max-h-16 w-auto object-contain"
                        />
                        <a
                          href={sig.signature_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-lg border border-slate-200 shadow-2xs"
                          title="Open Full Image"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
                No signed mandates found.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Navigation */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 space-y-2">
          <Link
            href="/admin_staff/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Staff Dashboard
          </Link>
          <p className="text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} DCG Multipurpose Cooperative Society Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Shield,
  PenTool,
  User,
  FileText,
  Calendar,
  CheckCircle2,
  FileSignature,
} from "lucide-react";

import db from "@/lib/db";

type Signature = {
  signature_path: string;
  purpose: string;
  signed_at: string;
  full_name: string;
};

async function getSignatures(): Promise<Signature[]> {
  try {
    const [rows] = await db.query(`
      SELECT
        s.signature_path,
        s.purpose,
        s.signed_at,
        m.full_name
      FROM signatures s
      JOIN members m
        ON s.member_id = m.member_id
      ORDER BY s.signed_at DESC
    `);

    return rows as Signature[];
  } catch (error) {
    console.error("Failed to fetch signatures:", error);
    return [];
  }
}

export default async function SignedMandatesPage() {
  const signatures = await getSignatures();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans -mt-28 text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
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

              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold text-white">
                <Shield className="h-3 w-3 text-emerald-400" />
                Executive Portal
              </span>
            </div>

            {/* Back Button */}
            <Link
              href="/admin_staff/md/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to MD Dashboard</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 mt-2 lg:px-8 space-y-6">
        {/* Page Header */}
        <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              <FileSignature className="h-3.5 w-3.5" />
              Signed Documents
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Signed Mandates
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Review mandates and authorization documents digitally signed by
              cooperative members.
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <PenTool className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Signed Mandates
                </p>

                <p className="text-lg font-extrabold text-slate-900">
                  {signatures.length}
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[10px] font-bold text-emerald-700">
              <CheckCircle2 className="h-3 w-3" />
              Digitally Signed
            </div>
          </div>
        </div>

        {/* Empty State */}
        {signatures.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FileSignature className="h-6 w-6" />
            </div>

            <h2 className="mt-4 text-sm font-bold text-slate-900">
              No Signed Mandates Found
            </h2>

            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
              There are currently no signed mandates available for review.
            </p>
          </div>
        )}

        {/* Signature Cards */}
        {signatures.length > 0 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {signatures.map((signature, index) => (
              <div
                key={`${signature.signature_path}-${index}`}
                className="group rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <User className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Member
                      </p>

                      <h2 className="text-sm font-bold text-slate-900">
                        {signature.full_name}
                      </h2>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" />
                    Signed
                  </span>
                </div>

                {/* Purpose */}
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                      <FileText className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Purpose
                      </p>

                      <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-800">
                        {signature.purpose || "No purpose specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Signed Date */}
                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                      <Calendar className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Signed On
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-800">
                        {formatDate(signature.signed_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Signature Image */}
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Member Signature
                    </p>

                    <PenTool className="h-3.5 w-3.5 text-slate-400" />
                  </div>

                  <div className="relative flex min-h-[150px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    {signature.signature_path ? (
                      <img
                        src={signature.signature_path}
                        alt={`Signature of ${signature.full_name}`}
                        className="max-h-32 w-auto max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        <PenTool className="mx-auto h-8 w-8 text-slate-300" />
                        <p className="mt-2 text-xs text-slate-400">
                          Signature image unavailable
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="text-[10px] leading-relaxed text-slate-400">
                    This mandate was digitally submitted and signed by the
                    member.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Back Button */}
        <div className="flex justify-center pt-2">
          <Link
            href="/admin_staff/md/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to MD Dashboard
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
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

/**
 * Format database date for display.
 */
function formatDate(date: string) {
  if (!date) return "N/A";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
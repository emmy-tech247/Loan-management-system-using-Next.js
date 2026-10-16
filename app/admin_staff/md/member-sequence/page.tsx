import db from "@/lib/db";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Users,
  Mail,
  Phone,
  Landmark,
  CalendarDays,
  Hash,
  UserRound,
} from "lucide-react";
import type { RowDataPacket } from "mysql2/promise";

interface MemberRow extends RowDataPacket {
  member_id: number;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  account_type: "Current" | "Savings" | "Other" | null;
  created_at: Date | string | null;
  account_number: string | null;
  bank_name: string | null;
}

async function getMembers(): Promise<MemberRow[]> {
  try {
    const [rows] = await db.query<MemberRow[]>(`
      SELECT
        member_id,
        full_name,
        email,
        phone_number,
        account_type,
        created_at,
        account_number,
        bank_name
      FROM members
      WHERE deleted = 0
      ORDER BY member_id ASC
    `);

    return rows;
  } catch (error) {
    console.error("Database error while fetching members:", error);
    return [];
  }
}

function formatDate(date: Date | string | null): string {
  if (!date) {
    return "N/A";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "N/A";
  }

  return parsedDate.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function MembersPage() {
  const members = await getMembers();

  return (
    <div className="min-h-screen bg-slate-50 font-sans -mt-28 text-slate-900">
      {/* ============================================================
          HEADER
      ============================================================ */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Users className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-sm font-extrabold text-slate-900 sm:text-base">
                Registered Members
              </h1>

              <p className="hidden text-[11px] text-slate-500 sm:block">
                Managing Director Executive Portal
              </p>
            </div>
          </div>

          <div className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
            {members.length}{" "}
            {members.length === 1 ? "Member" : "Members"}
          </div>
        </div>
      </header>

      {/* ============================================================
          MAIN
      ============================================================ */}
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 mt-2 sm:px-6 lg:px-8">
        {/* ==========================================================
            PAGE INTRO
        ========================================================== */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                <Users className="h-3.5 w-3.5" />
                Member Management
              </span>

              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Registered Members
              </h2>

              <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
                View registered cooperative members, their contact
                information, account details, and registration dates.
              </p>
            </div>

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-emerald-300 ring-1 ring-white/10">
              <Users className="h-8 w-8" />
            </div>
          </div>
        </section>

        {/* ==========================================================
            STATISTICS
        ========================================================== */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Total Members */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Total Members
                </p>

                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {members.length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Database Status */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Database Status
                </p>

                <p className="mt-1 text-sm font-extrabold text-emerald-600">
                  Connected
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Landmark className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Records */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Records
                </p>

                <p className="mt-1 text-sm font-extrabold text-slate-900">
                  Active
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Hash className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================================
            MEMBERS TABLE
        ========================================================== */}
        <section className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm">
          {/* Table Header */}
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Member Directory
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                Complete list of registered cooperative members
              </p>
            </div>

            <a
              href="/api/admin_staff/md/members/download"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md"
            >
              <Download className="h-4 w-4" />
              Download Excel
            </a>
          </div>

          {/* Responsive Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border-b border-slate-200 px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    S/N
                  </th>

                  <th className="border-b border-slate-200 px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Member ID
                  </th>

                  <th className="border-b border-slate-200 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Member
                  </th>

                  <th className="border-b border-slate-200 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Contact
                  </th>

                  <th className="border-b border-slate-200 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Account Type
                  </th>

                  <th className="border-b border-slate-200 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Account Number
                  </th>

                  <th className="border-b border-slate-200 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Bank
                  </th>

                  <th className="border-b border-slate-200 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Joined On
                  </th>
                </tr>
              </thead>

              <tbody>
                {members.length > 0 ? (
                  members.map((member, index) => (
                    <tr
                      key={member.member_id}
                      className="group transition-colors hover:bg-slate-50"
                    >
                      {/* S/N */}
                      <td className="border-b border-slate-100 px-4 py-4 text-center text-xs font-semibold text-slate-500">
                        {index + 1}
                      </td>

                      {/* Member ID */}
                      <td className="border-b border-slate-100 px-4 py-4 text-center">
                        <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          #{member.member_id}
                        </span>
                      </td>

                      {/* Member */}
                      <td className="border-b border-slate-100 px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-600">
                            <UserRound className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {member.full_name || "N/A"}
                            </p>

                            <p className="mt-0.5 text-[11px] text-slate-400">
                              Cooperative Member
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="border-b border-slate-100 px-4 py-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                            <span className="break-all">
                              {member.email || "N/A"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                            {member.phone_number || "N/A"}
                          </div>
                        </div>
                      </td>

                      {/* Account Type */}
                      <td className="border-b border-slate-100 px-4 py-4">
                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold capitalize text-emerald-700">
                          {member.account_type || "N/A"}
                        </span>
                      </td>

                      {/* Account Number */}
                      <td className="border-b border-slate-100 px-4 py-4">
                        <p className="text-xs font-bold tracking-wide text-slate-700">
                          {member.account_number || "N/A"}
                        </p>
                      </td>

                      {/* Bank */}
                      <td className="border-b border-slate-100 px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Landmark className="h-4 w-4 shrink-0 text-slate-400" />

                          <span className="text-xs font-semibold text-slate-700">
                            {member.bank_name || "N/A"}
                          </span>
                        </div>
                      </td>

                      {/* Joined */}
                      <td className="border-b border-slate-100 px-4 py-4">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />

                          <span className="text-xs font-semibold text-slate-600">
                            {formatDate(member.created_at)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-16 text-center"
                    >
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <Users className="h-6 w-6" />
                      </div>

                      <h3 className="mt-4 text-sm font-bold text-slate-900">
                        No members found
                      </h3>

                      <p className="mx-auto mt-1 max-w-xs text-xs text-slate-500">
                        There are currently no registered members in the
                        database.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ==========================================================
            BOTTOM ACTIONS
        ========================================================== */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <a
            href="/api/admin_staff/md/members/download"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 shadow-sm transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <Download className="h-4 w-4" />
            Export Member Records
          </a>

          <Link
            href="/admin_staff/md/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-xs font-bold text-white shadow-sm transition-all hover:bg-rose-700 hover:shadow-md"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to MD Dashboard
          </Link>
        </div>
      </main>

      {/* ============================================================
          FOOTER
      ============================================================ */}
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
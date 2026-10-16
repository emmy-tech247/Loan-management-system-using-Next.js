"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Search,
  Users,
  Pencil,
} from "lucide-react";

type Member = {
  member_id: number;
  full_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  account_type?: string | null;
  created_at?: string | null;
  account_number?: string | null;
  bank_name?: string | null;
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadMembers() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin_staff/md/members");

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load members."
          );
        }

        setMembers(data.members || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load members."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMembers();
  }, []);

  const filteredMembers = members.filter((member) => {
    const search = searchQuery.toLowerCase();

    return (
      String(member.member_id)
        .toLowerCase()
        .includes(search) ||
      (member.full_name || "")
        .toLowerCase()
        .includes(search) ||
      (member.email || "")
        .toLowerCase()
        .includes(search) ||
      (member.phone_number || "")
        .toLowerCase()
        .includes(search) ||
      (member.account_type || "")
        .toLowerCase()
        .includes(search) ||
      (member.account_number || "")
        .toLowerCase()
        .includes(search) ||
      (member.bank_name || "")
        .toLowerCase()
        .includes(search)
    );
  });

  function downloadCSV() {
    if (members.length === 0) {
      return;
    }

    const headers = [
      "S/N",
      "Member ID",
      "Full Name",
      "Email",
      "Phone",
      "Account Type",
      "Account Number",
      "Bank",
      "Joined On",
    ];

    const rows = members.map((member, index) => [
      index + 1,
      member.member_id,
      member.full_name || "",
      member.email || "",
      member.phone_number || "",
      member.account_type || "",
      member.account_number || "N/A",
      member.bank_name || "N/A",
      member.created_at || "",
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => {
            const text = String(value);
            return `"${text.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "member_list.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Users size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Registered Members
              </h1>

              <p className="text-sm text-slate-500">
                View and manage all registered cooperative members.
              </p>
            </div>
          </div>

          <Link
            href="/admin_staff/md/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <ArrowLeft size={17} />
            Back to MD Dashboard
          </Link>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="relative w-full sm:max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <button
            type="button"
            onClick={downloadCSV}
            disabled={members.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={18} />
            Download as Excel
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

            <p className="text-sm text-slate-500">
              Loading members...
            </p>
          </div>
        ) : (
          <>
            {/* Member count */}
            <div className="mb-3 text-sm font-medium text-slate-600">
              Showing{" "}
              <span className="font-bold text-slate-900">
                {filteredMembers.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-900">
                {members.length}
              </span>{" "}
              members
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] border-collapse text-sm">

                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100 text-left">

                      <th className="px-4 py-4 font-bold text-slate-700">
                        S/N
                      </th>

                      <th className="px-4 py-4 font-bold text-slate-700">
                        Member ID
                      </th>

                      <th className="px-4 py-4 font-bold text-slate-700">
                        Full Name
                      </th>

                      <th className="px-4 py-4 font-bold text-slate-700">
                        Email
                      </th>

                      <th className="px-4 py-4 font-bold text-slate-700">
                        Phone
                      </th>

                      <th className="px-4 py-4 font-bold text-slate-700">
                        Account Type
                      </th>

                      <th className="px-4 py-4 font-bold text-slate-700">
                        Account Number
                      </th>

                      <th className="px-4 py-4 font-bold text-slate-700">
                        Bank
                      </th>

                      <th className="px-4 py-4 font-bold text-slate-700">
                        Joined On
                      </th>

                      <th className="px-4 py-4 text-right font-bold text-slate-700">
                        Action
                      </th>

                    </tr>
                  </thead>

                  <tbody>
                    {filteredMembers.length > 0 ? (
                      filteredMembers.map(
                        (member, index) => (
                          <tr
                            key={member.member_id}
                            className="border-b border-slate-100 transition hover:bg-slate-50"
                          >
                            <td className="px-4 py-4 text-slate-500">
                              {index + 1}
                            </td>

                            <td className="px-4 py-4 font-semibold text-slate-900">
                              {member.member_id}
                            </td>

                            <td className="px-4 py-4 font-medium text-slate-900">
                              {member.full_name || "N/A"}
                            </td>

                            <td className="px-4 py-4 text-slate-600">
                              {member.email || "N/A"}
                            </td>

                            <td className="px-4 py-4 text-slate-600">
                              {member.phone_number || "N/A"}
                            </td>

                            <td className="px-4 py-4">
                              <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                {member.account_type || "N/A"}
                              </span>
                            </td>

                            <td className="px-4 py-4 font-mono text-xs text-slate-600">
                              {member.account_number || "N/A"}
                            </td>

                            <td className="px-4 py-4 text-slate-600">
                              {member.bank_name || "N/A"}
                            </td>

                            <td className="px-4 py-4 text-slate-600">
                              {member.created_at
                                ? new Date(
                                    member.created_at
                                  ).toLocaleDateString()
                                : "N/A"}
                            </td>

                            <td className="px-4 py-4 text-right">
                              <Link
                                href={`/admin_staff/md/members/edit?memberId=${member.member_id}`}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                              >
                                <Pencil size={14} />
                                Edit
                              </Link>
                            </td>
                          </tr>
                        )
                      )
                    ) : (
                      <tr>
                        <td
                          colSpan={10}
                          className="px-6 py-12 text-center"
                        >
                          <Users
                            size={32}
                            className="mx-auto mb-3 text-slate-300"
                          />

                          <p className="text-sm font-semibold text-slate-700">
                            No members found.
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Try changing your search.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>

                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
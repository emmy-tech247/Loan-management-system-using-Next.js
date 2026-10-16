"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  Ban,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
  UserCheck,
  CreditCard,
  Briefcase,
  Users,
  ExternalLink,
  Shield,
  Loader2,
  MapPin,
  Building2,
  Wallet,
} from "lucide-react";

import { Member, MemberStatus } from "@/types/member";

export default function ManageMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | MemberStatus>("all");
  const [expandedMemberIds, setExpandedMemberIds] = useState<number[]>([]);
  const [actioningId, setActioningId] = useState<number | null>(null);

  // Fetch members
  const fetchMembers = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/members");

      if (res.ok) {
        const data: Member[] = await res.json();
        setMembers(data);
      }
    } catch (err) {
      console.error("Failed to load members", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Toggle details
  const toggleAccordion = (id: number) => {
    setExpandedMemberIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  // Member actions
  const handleAction = async (
    memberId: number,
    action: "approve" | "suspend" | "delete"
  ) => {
    if (
      action === "delete" &&
      !confirm(
        "Are you sure you want to permanently delete this member record?"
      )
    ) {
      return;
    }

    setActioningId(memberId);

    // Optimistic update
    if (action === "delete") {
      setMembers((prev) =>
        prev.filter((member) => member.member_id !== memberId)
      );
    } else {
      setMembers((prev) =>
        prev.map((member) =>
          member.member_id === memberId
            ? {
                ...member,
                status:
                  action === "approve" ? "approved" : "suspended",
              }
            : member
        )
      );
    }

    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          member_id: memberId,
          action,
        }),
      });

      if (!res.ok) {
        await fetchMembers();
      }
    } catch (err) {
      console.error("Failed to execute member action", err);
      await fetchMembers();
    } finally {
      setActioningId(null);
    }
  };

  // Filter members
  const filteredMembers = members.filter((member) => {
    const matchesTab =
      activeTab === "all" || member.status === activeTab;

    const query = searchQuery.toLowerCase().trim();

    const matchesSearch =
      member.full_name?.toLowerCase().includes(query) ||
      member.email?.toLowerCase().includes(query) ||
      member.nin?.toLowerCase().includes(query) ||
      member.phone_number?.toLowerCase().includes(query);

    return matchesTab && matchesSearch;
  });

  // Status colors
  const getStatusBadge = (status: MemberStatus) => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";

      case "suspended":
        return "bg-rose-100 text-rose-700 border-rose-200";

      default:
        return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  // Currency formatter
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* =========================================================
          NAVBAR
      ========================================================= */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link
                href="/admin/dashboard"
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
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to MD Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* =========================================================
          MAIN
      ========================================================= */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* =======================================================
            PAGE HEADER
        ======================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <UserCheck className="h-7 w-7 text-emerald-600" />
              Manage Member Accounts
            </h1>

            <p className="text-xs text-slate-500 mt-1">
              Review member registrations, verify KYC information, approve
              applications, and manage membership access.
            </p>
          </div>

          {/* Total Members */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Total Members:
            </span>

            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
              {members.length}
            </span>
          </div>
        </div>

        {/* =======================================================
            FILTER / SEARCH TOOLBAR
        ======================================================= */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/60 rounded-2xl text-xs font-semibold text-slate-600">
            {(["all", "pending", "approved", "suspended"] as const).map(
              (tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`capitalize px-3 py-2 rounded-xl transition-all ${
                    activeTab === tab
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

            <input
              type="text"
              placeholder="Search name, email, NIN, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-xs"
            />
          </div>
        </div>

        {/* =======================================================
            MEMBER LIST
        ======================================================= */}
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-3 shadow-xs">
            <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mx-auto" />

            <p className="text-xs text-slate-500">
              Loading member records...
            </p>
          </div>
        ) : filteredMembers.length > 0 ? (
          <div className="space-y-4">
            {filteredMembers.map((member) => {
              const isExpanded = expandedMemberIds.includes(
                member.member_id
              );

              const isProcessing =
                actioningId === member.member_id;

              return (
                <div
                  key={member.member_id}
                  className="rounded-3xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all overflow-hidden"
                >
                  {/* =================================================
                      MEMBER SUMMARY
                  ================================================= */}
                  <div className="p-5 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                      {/* Member */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Member Details
                        </span>

                        <h3 className="text-sm font-bold text-slate-900">
                          {member.full_name}
                        </h3>

                        <p className="text-xs text-slate-500 break-all">
                          {member.email}
                        </p>

                        <p className="text-[11px] text-slate-400">
                          Member #{member.member_id}
                        </p>
                      </div>

                      {/* Contact */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Contact & NIN
                        </span>

                        <p className="text-xs font-semibold text-slate-800">
                          {member.phone_number}
                        </p>

                        <p className="text-xs text-slate-500">
                          NIN: {member.nin}
                        </p>
                      </div>

                      {/* Contribution */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Financial Commitment
                        </span>

                        <p className="text-xs font-bold text-emerald-700">
                          {formatCurrency(
                            member.expected_monthly_contribution_amount
                          )}
                          /mo
                        </p>

                        <p className="text-[11px] text-slate-500">
                          Fixed Deposit:{" "}
                          {formatCurrency(member.fixed_deposit_amount)}
                        </p>

                        <p className="text-[11px] text-slate-400">
                          {member.fixed_deposit_years} year(s)
                        </p>
                      </div>

                      {/* Status */}
                      <div className="flex items-start md:justify-end">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border capitalize ${getStatusBadge(
                            member.status
                          )}`}
                        >
                          {member.status}
                        </span>
                      </div>
                    </div>

                    {/* =================================================
                        ACTION BAR
                    ================================================= */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* View Details */}
                      <button
                        type="button"
                        onClick={() =>
                          toggleAccordion(member.member_id)
                        }
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            Hide Details
                            <ChevronUp className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            View Details
                            <ChevronDown className="h-4 w-4" />
                          </>
                        )}
                      </button>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Approve */}
                        {member.status !== "approved" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleAction(
                                member.member_id,
                                "approve"
                              )
                            }
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 transition-colors shadow-xs"
                          >
                            {isProcessing ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                            Approve
                          </button>
                        )}

                        {/* Suspend */}
                        {member.status === "approved" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleAction(
                                member.member_id,
                                "suspend"
                              )
                            }
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-2 text-xs font-bold text-white hover:bg-amber-500 active:bg-amber-700 disabled:opacity-50 transition-colors shadow-xs"
                          >
                            {isProcessing ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Ban className="h-3.5 w-3.5" />
                            )}
                            Suspend
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() =>
                            handleAction(
                              member.member_id,
                              "delete"
                            )
                          }
                          disabled={isProcessing}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 disabled:opacity-50 transition-colors"
                          title="Delete Member"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">
                            Delete
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* =================================================
                      EXPANDED DETAILS
                  ================================================= */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/70 p-5 sm:p-6 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {/* Personal */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
                          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                              <UserCheck className="h-4 w-4" />
                            </div>

                            <div>
                              <h4 className="text-xs font-bold text-slate-900">
                                Personal Information
                              </h4>
                              <p className="text-[10px] text-slate-500">
                                Identity & location
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2 text-xs text-slate-600">
                            <p>
                              <strong className="text-slate-800">
                                State of Origin:
                              </strong>{" "}
                              {member.state_of_origin}
                            </p>

                            <p>
                              <strong className="text-slate-800">
                                LGA:
                              </strong>{" "}
                              {member.lga_of_origin}
                            </p>

                            <p>
                              <strong className="text-slate-800">
                                Permanent Address:
                              </strong>{" "}
                              {member.permanent_address}
                            </p>

                            <p>
                              <strong className="text-slate-800">
                                Residential Address:
                              </strong>{" "}
                              {member.residential_address}
                            </p>
                          </div>
                        </div>

                        {/* Banking */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
                          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                              <CreditCard className="h-4 w-4" />
                            </div>

                            <div>
                              <h4 className="text-xs font-bold text-slate-900">
                                Banking & Employment
                              </h4>
                              <p className="text-[10px] text-slate-500">
                                Financial information
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2 text-xs text-slate-600">
                            <p>
                              <strong className="text-slate-800">
                                Bank:
                              </strong>{" "}
                              {member.bank_name}
                            </p>

                            <p>
                              <strong className="text-slate-800">
                                Account Type:
                              </strong>{" "}
                              {member.account_type}
                            </p>

                            <p>
                              <strong className="text-slate-800">
                                Account Number:
                              </strong>{" "}
                              {member.account_number}
                            </p>

                            <p>
                              <strong className="text-slate-800">
                                Account Name:
                              </strong>{" "}
                              {member.account_name}
                            </p>

                            <p>
                              <strong className="text-slate-800">
                                Workplace:
                              </strong>{" "}
                              {member.place_of_work}
                            </p>

                            <p>
                              <strong className="text-slate-800">
                                Business Sector:
                              </strong>{" "}
                              {member.type_of_business_work}
                            </p>

                            <p>
                              <strong className="text-slate-800">
                                Monthly Earnings:
                              </strong>{" "}
                              {member.monthly_earning}
                            </p>

                            <p>
                              <strong className="text-slate-800">
                                Annual Income:
                              </strong>{" "}
                              {member.annual_income}
                            </p>
                          </div>
                        </div>

                        {/* Next of Kin */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
                          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                              <Users className="h-4 w-4" />
                            </div>

                            <div>
                              <h4 className="text-xs font-bold text-slate-900">
                                Next of Kin
                              </h4>
                              <p className="text-[10px] text-slate-500">
                                Emergency contact
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2 text-xs text-slate-600">
                            <p>
                              <strong className="text-slate-800">
                                Name:
                              </strong>{" "}
                              {member.full_name_of_next_of_kin}
                            </p>

                            <p>
                              <strong className="text-slate-800">
                                Relationship:
                              </strong>{" "}
                              {member.relationship_with_next_of_kin}
                            </p>

                            <p>
                              <strong className="text-slate-800">
                                Phone:
                              </strong>{" "}
                              {member.phone_number_of_next_of_kin}
                            </p>

                            <p>
                              <strong className="text-slate-800">
                                Address:
                              </strong>{" "}
                              {member.address_of_next_of_kin}
                            </p>

                            <p>
                              <strong className="text-slate-800">
                                Joined:
                              </strong>{" "}
                              {new Date(
                                member.created_at
                              ).toLocaleDateString("en-NG", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* =================================================
                          DOCUMENTS
                      ================================================= */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                            <FileText className="h-4 w-4" />
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-slate-900">
                              Verification Attachments
                            </h4>

                            <p className="text-[10px] text-slate-500">
                              Uploaded KYC documents
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {/* NIN */}
                          {member.id_document ? (
                            <a
                              href={`/uploads/${member.id_document}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-emerald-700 transition-colors"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              NIN ID Document
                            </a>
                          ) : (
                            <span className="inline-flex items-center rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-400">
                              No NIN Document
                            </span>
                          )}

                          {/* Passport */}
                          {member.passport ? (
                            <a
                              href={`/uploads/${member.passport}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-emerald-700 transition-colors"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              Passport Photo
                            </a>
                          ) : (
                            <span className="inline-flex items-center rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-400">
                              No Passport Photo
                            </span>
                          )}

                          {/* Receipt */}
                          {member.payment_receipt ? (
                            <a
                              href={`/uploads/${member.payment_receipt}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-emerald-700 transition-colors"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              Payment Receipt
                            </a>
                          ) : (
                            <span className="inline-flex items-center rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-400">
                              No Registration Receipt
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* =========================================================
             EMPTY STATE
          ========================================================= */
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-3 shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Users className="h-6 w-6" />
            </div>

            <h3 className="text-sm font-bold text-slate-900">
              No members found
            </h3>

            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              No member accounts matched your current status filter or
              search query.
            </p>
          </div>
        )}
      </main>

      {/* =========================================================
          FOOTER
      ========================================================= */}
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
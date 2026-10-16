"use client";

import { useEffect, useState } from "react";
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
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  Wallet,
} from "lucide-react";

import { Member, MemberStatus } from "@/types/member";

export default function ManageMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [activeTab, setActiveTab] = useState<
    "all" | MemberStatus
  >("all");

  const [expandedMemberIds, setExpandedMemberIds] = useState<number[]>(
    []
  );

  const [actioningId, setActioningId] = useState<number | null>(null);

  const [error, setError] = useState("");

  // ============================================================
  // FETCH MEMBERS
  // ============================================================
  const fetchMembers = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const res = await fetch("/api/admin_staff/md/members", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      // --------------------------------------------------------
      // Check content type before trying response.json()
      // --------------------------------------------------------
      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await res.text();

        console.error(
          "Members API returned non-JSON response:",
          text
        );

        throw new Error(
          `Server returned ${res.status} instead of JSON.`
        );
      }

      const data = await res.json();

      console.log("Members API response:", data);

      // --------------------------------------------------------
      // HTTP error
      // --------------------------------------------------------
      if (!res.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to load members."
        );
      }

      // --------------------------------------------------------
      // IMPORTANT:
      // API returns:
      //
      // {
      //   success: true,
      //   members: [...]
      // }
      //
      // Therefore we MUST use data.members.
      // --------------------------------------------------------
      let memberList: Member[] = [];

      if (Array.isArray(data)) {
        // Supports an API that returns the array directly.
        memberList = data;
      } else if (Array.isArray(data?.members)) {
        // Normal expected response.
        memberList = data.members;
      } else if (Array.isArray(data?.data)) {
        // Extra compatibility.
        memberList = data.data;
      } else {
        console.error(
          "Invalid members response. Expected an array:",
          data
        );

        throw new Error(
          "Invalid member data received from the server."
        );
      }

      // --------------------------------------------------------
      // GUARANTEE members is ALWAYS an array
      // --------------------------------------------------------
      setMembers(memberList);
    } catch (error) {
      console.error("Failed to load members:", error);

      setMembers([]);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load members."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================
  useEffect(() => {
    fetchMembers();
  }, []);

  // ============================================================
  // ACCORDION
  // ============================================================
  const toggleAccordion = (id: number) => {
    setExpandedMemberIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  // ============================================================
  // MEMBER ACTIONS
  // ============================================================
  const handleAction = async (
    memberId: number,
    action: "approve" | "suspend" | "delete"
  ) => {
    if (
      action === "delete" &&
      !window.confirm(
        "Are you sure you want to permanently delete this member record?"
      )
    ) {
      return;
    }

    setActioningId(memberId);

    // ----------------------------------------------------------
    // Optimistic update
    // ----------------------------------------------------------
    if (action === "delete") {
      setMembers((prev) =>
        Array.isArray(prev)
          ? prev.filter(
              (member) => member.member_id !== memberId
            )
          : []
      );
    } else {
      setMembers((prev) =>
        Array.isArray(prev)
          ? prev.map((member) =>
              member.member_id === memberId
                ? {
                    ...member,
                    status:
                      action === "approve"
                        ? "approved"
                        : "suspended",
                  }
                : member
            )
          : []
      );
    }

    try {
      const res = await fetch(
        "/api/admin_staff/md/members",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            member_id: memberId,
            action,
          }),
        }
      );

      const contentType =
        res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await res.text();

        console.error(
          "Member action returned non-JSON response:",
          text
        );

        throw new Error(
          `Server returned ${res.status} instead of JSON.`
        );
      }

      const data = await res.json();

      if (!res.ok || data?.success === false) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Member action failed."
        );
      }

      // Reload from database so the UI matches the server.
      await fetchMembers();
    } catch (error) {
      console.error(
        "Failed to execute member action:",
        error
      );

      // Restore actual database state.
      await fetchMembers();

      setError(
        error instanceof Error
          ? error.message
          : "Failed to execute member action."
      );
    } finally {
      setActioningId(null);
    }
  };

  // ============================================================
  // FILTERING
  // ============================================================
  const filteredMembers = Array.isArray(members)
    ? members.filter((member) => {
        const matchesTab =
          activeTab === "all" ||
          member.status === activeTab;

        const query = searchQuery.toLowerCase().trim();

        const matchesSearch =
          !query ||
          String(member.full_name || "")
            .toLowerCase()
            .includes(query) ||
          String(member.email || "")
            .toLowerCase()
            .includes(query) ||
          String(member.nin || "")
            .toLowerCase()
            .includes(query) ||
          String(member.phone_number || "")
            .toLowerCase()
            .includes(query);

        return matchesTab && matchesSearch;
      })
    : [];

  // ============================================================
  // STATUS STYLING
  // ============================================================
  const getStatusBadge = (status: MemberStatus) => {
    switch (status) {
      case "approved":
        return {
          wrapper:
            "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
        };

      case "suspended":
        return {
          wrapper:
            "bg-rose-50 text-rose-700 border-rose-200",
          dot: "bg-rose-500",
        };

      default:
        return {
          wrapper:
            "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
        };
    }
  };

  // ============================================================
  // CURRENCY
  // ============================================================
  const formatCurrency = (
    amount: number | string | null | undefined
  ) => {
    const numericAmount = Number(amount) || 0;

    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 2,
    }).format(numericAmount);
  };

  // ============================================================
  // COUNTS
  // ============================================================
  const safeMembers = Array.isArray(members)
    ? members
    : [];

  const pendingCount = safeMembers.filter(
    (member) => member.status === "pending"
  ).length;

  const approvedCount = safeMembers.filter(
    (member) => member.status === "approved"
  ).length;

  const suspendedCount = safeMembers.filter(
    (member) => member.status === "suspended"
  ).length;

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans -mt-28 text-slate-900">
      {/* =====================================================
          NAVBAR
      ====================================================== */}
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

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchMembers(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />

                <span className="hidden sm:inline">
                  {refreshing
                    ? "Refreshing..."
                    : "Refresh"}
                </span>
              </button>

              <Link
                href="/admin_staff/md/dashboard"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />

                <span className="hidden sm:inline">
                  Back to Dashboard
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* =====================================================
          MAIN
      ====================================================== */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 mt-2 lg:px-8 space-y-6">
        {/* =================================================
            HERO HEADER
        ================================================== */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-md">
          <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Users className="h-3.5 w-3.5" />
              Membership Management
            </span>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Manage Member Accounts
            </h1>

            <p className="max-w-2xl text-xs leading-relaxed text-slate-300 sm:text-sm">
              Review registration applications, verify member
              information and KYC documents, approve accounts,
              suspend access, and manage cooperative membership.
            </p>
          </div>
        </section>

        {/* =================================================
            ERROR
        ================================================== */}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-rose-800">
                  Unable to load member records
                </p>

                <p className="mt-1 text-xs text-rose-700">
                  {error}
                </p>
              </div>

              <button
                onClick={() => fetchMembers(true)}
                disabled={refreshing}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-500 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* =================================================
            STATISTICS
        ================================================== */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {/* Total */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Members
                </p>

                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {safeMembers.length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                  Pending
                </p>

                <p className="mt-1 text-2xl font-extrabold text-amber-700">
                  {pendingCount}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <UserCheck className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Approved */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Approved
                </p>

                <p className="mt-1 text-2xl font-extrabold text-emerald-700">
                  {approvedCount}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Suspended */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                  Suspended
                </p>

                <p className="mt-1 text-2xl font-extrabold text-rose-700">
                  {suspendedCount}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <Ban className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            FILTERS
        ================================================== */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Status tabs */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-slate-200/60 p-1 text-xs font-semibold text-slate-600">
            {(
              [
                "all",
                "pending",
                "approved",
                "suspended",
              ] as const
            ).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-xl px-3.5 py-2 capitalize transition-all ${
                  activeTab === tab
                    ? "bg-white font-bold text-slate-900 shadow-xs"
                    : "hover:bg-white/50 hover:text-slate-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search name, email, NIN, phone..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 shadow-xs transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Result count */}
        {!loading && (
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">
              Showing{" "}
              <span className="text-slate-900">
                {filteredMembers.length}
              </span>{" "}
              of{" "}
              <span className="text-slate-900">
                {safeMembers.length}
              </span>{" "}
              members
            </p>

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================== */}
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900">
              Loading member database
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Please wait while member records are retrieved.
            </p>
          </div>
        ) : filteredMembers.length > 0 ? (
          <div className="space-y-4">
            {filteredMembers.map((member) => {
              const isExpanded =
                expandedMemberIds.includes(
                  member.member_id
                );

              const isProcessing =
                actioningId === member.member_id;

              const statusStyle = getStatusBadge(
                member.status
              );

              return (
                <div
                  key={member.member_id}
                  className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs transition-all hover:border-slate-300 hover:shadow-sm"
                >
                  {/* MEMBER SUMMARY */}
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <div className="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Name */}
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Member
                          </span>

                          <h3 className="mt-1 text-sm font-bold text-slate-900">
                            {member.full_name}
                          </h3>

                          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                            <Mail className="h-3.5 w-3.5" />

                            <span className="truncate">
                              {member.email || "No email"}
                            </span>
                          </div>
                        </div>

                        {/* Contact */}
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Contact & NIN
                          </span>

                          <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />

                            {member.phone_number ||
                              "No phone"}
                          </div>

                          <p className="mt-1 text-xs text-slate-500">
                            NIN: {member.nin || "N/A"}
                          </p>
                        </div>

                        {/* Contribution */}
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Contribution
                          </span>

                          <div className="mt-1 flex items-center gap-1.5">
                            <Wallet className="h-3.5 w-3.5 text-emerald-600" />

                            <p className="text-xs font-bold text-emerald-700">
                              {formatCurrency(
                                member.expected_monthly_contribution_amount
                              )}
                              /mo
                            </p>
                          </div>

                          <p className="mt-1 text-[11px] text-slate-500">
                            Fixed Deposit:{" "}
                            {formatCurrency(
                              member.fixed_deposit_amount
                            )}{" "}
                            (
                            {member.fixed_deposit_years ||
                              0}{" "}
                            yrs)
                          </p>
                        </div>

                        {/* Status */}
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold capitalize ${statusStyle.wrapper}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                            />

                            {member.status}
                          </span>
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 xl:border-t-0 xl:pt-0">
                        {/* Details */}
                        <button
                          onClick={() =>
                            toggleAccordion(
                              member.member_id
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                        >
                          {isExpanded ? (
                            <>
                              Hide
                              <ChevronUp className="h-4 w-4" />
                            </>
                          ) : (
                            <>
                              Details
                              <ChevronDown className="h-4 w-4" />
                            </>
                          )}
                        </button>

                        {/* Approve */}
                        {member.status !==
                          "approved" && (
                          <button
                            onClick={() =>
                              handleAction(
                                member.member_id,
                                "approve"
                              )
                            }
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
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
                        {member.status ===
                          "approved" && (
                          <button
                            onClick={() =>
                              handleAction(
                                member.member_id,
                                "suspend"
                              )
                            }
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
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
                          onClick={() =>
                            handleAction(
                              member.member_id,
                              "delete"
                            )
                          }
                          disabled={isProcessing}
                          title="Delete member record"
                          className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* EXPANDED DETAILS */}
                  {isExpanded && (
                    <div className="space-y-5 border-t border-slate-100 bg-slate-50/70 p-5 sm:p-6">
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        {/* Personal */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
                          <h4 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs font-bold text-slate-900">
                            <UserCheck className="h-4 w-4 text-emerald-600" />
                            Personal & Location
                          </h4>

                          <div className="mt-3 space-y-2 text-xs text-slate-600">
                            <p>
                              <strong className="text-slate-800">
                                State of Origin:
                              </strong>{" "}
                              {member.state_of_origin ||
                                "N/A"}
                            </p>

                            <p>
                              <strong className="text-slate-800">
                                LGA:
                              </strong>{" "}
                              {member.lga_of_origin ||
                                "N/A"}
                            </p>

                            <p className="flex gap-1">
                              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />

                              <span>
                                <strong className="text-slate-800">
                                  Permanent Address:
                                </strong>{" "}
                                {member.permanent_address ||
                                  "N/A"}
                              </span>
                            </p>

                            <p className="flex gap-1">
                              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />

                              <span>
                                <strong className="text-slate-800">
                                  Residential Address:
                                </strong>{" "}
                                {member.residential_address ||
                                  "N/A"}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Bank & Employment */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
                          <h4 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs font-bold text-slate-900">
                            <CreditCard className="h-4 w-4 text-emerald-600" />
                            Bank & Employment
                          </h4>

                          <div className="mt-3 space-y-2 text-xs text-slate-600">
                            <p>
                              <strong className="text-slate-800">
                                Bank:
                              </strong>{" "}
                              {member.bank_name ||
                                "N/A"}{" "}
                              ({member.account_type ||
                                "N/A"})
                            </p>

                            <p>
                              <strong className="text-slate-800">
                                Account:
                              </strong>{" "}
                              {member.account_number ||
                                "N/A"}{" "}
                              -{" "}
                              {member.account_name ||
                                "N/A"}
                            </p>

                            <p className="flex gap-1">
                              <Briefcase className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />

                              <span>
                                <strong className="text-slate-800">
                                  Workplace:
                                </strong>{" "}
                                {member.place_of_work ||
                                  "N/A"}
                              </span>
                            </p>

                            <p>
                              <strong className="text-slate-800">
                                Business Sector:
                              </strong>{" "}
                              {member.type_of_business_work ||
                                "N/A"}
                            </p>

                            <p>
                              <strong className="text-slate-800">
                                Earnings:
                              </strong>{" "}
                              {member.monthly_earning ||
                                "N/A"}{" "}
                              / mo (
                              {member.annual_income ||
                                "N/A"}{" "}
                              / yr)
                            </p>
                          </div>
                        </div>

                        {/* Next of Kin */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
                          <h4 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs font-bold text-slate-900">
                            <Users className="h-4 w-4 text-emerald-600" />
                            Next of Kin
                          </h4>

                          <div className="mt-3 space-y-2 text-xs text-slate-600">
                            <p>
                              <strong className="text-slate-800">
                                Name:
                              </strong>{" "}
                              {member.full_name_of_next_of_kin ||
                                "N/A"}
                            </p>

                            <p>
                              <strong className="text-slate-800">
                                Relationship:
                              </strong>{" "}
                              {member.relationship_with_next_of_kin ||
                                "N/A"}
                            </p>

                            <p>
                              <strong className="text-slate-800">
                                Phone:
                              </strong>{" "}
                              {member.phone_number_of_next_of_kin ||
                                "N/A"}
                            </p>

                            <p>
                              <strong className="text-slate-800">
                                Address:
                              </strong>{" "}
                              {member.address_of_next_of_kin ||
                                "N/A"}
                            </p>

                            <p>
                              <strong className="text-slate-800">
                                Joined:
                              </strong>{" "}
                              {member.created_at
                                ? new Date(
                                    member.created_at
                                  ).toLocaleDateString(
                                    "en-NG"
                                  )
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* DOCUMENTS */}
                      <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
                        <h4 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs font-bold text-slate-900">
                          <FileText className="h-4 w-4 text-emerald-600" />
                          Verification Attachments
                        </h4>

                        <div className="flex flex-wrap items-center gap-2 pt-4">
                          {member.id_document ? (
                            <a
                              href={`/uploads/${member.id_document}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              NIN ID Document
                            </a>
                          ) : (
                            <span className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-400">
                              No NIN Document
                            </span>
                          )}

                          {member.passport ? (
                            <a
                              href={`/uploads/${member.passport}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              Passport Photo
                            </a>
                          ) : (
                            <span className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-400">
                              No Passport Photo
                            </span>
                          )}

                          {member.payment_receipt ? (
                            <a
                              href={`/uploads/${member.payment_receipt}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              Payment Receipt
                            </a>
                          ) : (
                            <span className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-400">
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
          /* EMPTY STATE */
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Search className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900">
              No members found
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
              No member accounts matched your active status
              filter or search query.
            </p>

            {(searchQuery ||
              activeTab !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveTab("all");
                }}
                className="mt-4 inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-800"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} DCG
            Multipurpose Cooperative Society Ltd. All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
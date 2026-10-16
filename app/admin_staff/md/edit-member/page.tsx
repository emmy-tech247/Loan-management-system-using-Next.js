"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Search,
  UserCheck,
  Shield,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileSpreadsheet,
  FileArchive,
  Image as ImageIcon,
  Eye,
  EyeOff,
  User,
  CreditCard,
  Briefcase,
  Users,
  Lock,
} from "lucide-react";
import { MemberData } from "@/types/member-editor";

export default function AdminMemberEditorPage() {
  const [searchId, setSearchId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [member, setMember] = useState<MemberData | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [idDocFile, setIdDocFile] = useState<File | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  // ============================================================
  // SEARCH MEMBER
  // ============================================================
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchId.trim()) {
      setMessage({
        type: "error",
        text: "Please enter a Member ID.",
      });
      return;
    }

    setIsSearching(true);
    setMessage(null);

    try {
      const res = await fetch(
        `/api/admin_staff/md/members/${encodeURIComponent(searchId.trim())}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error("Server returned a non-JSON response.");
      }

      const data = await res.json();

      if (res.ok && data.success) {
        setMember(data.member);
      } else {
        setMember(null);

        setMessage({
          type: "error",
          text: data.message || `No member found with ID: ${searchId}`,
        });
      }
    } catch (error) {
      console.error("Search member error:", error);

      setMember(null);

      setMessage({
        type: "error",
        text: "Failed to connect to the server.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // ============================================================
  // HANDLE INPUT CHANGES
  // ============================================================
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!member) return;

    const { name, value } = e.target;

    setMember((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  // ============================================================
  // SAVE MEMBER
  // ============================================================
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!member) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const formData = new FormData();

      // --------------------------------------------------------
      // Standard fields
      // --------------------------------------------------------
      Object.entries(member).forEach(([key, value]) => {
        if (
          value !== null &&
          value !== undefined &&
          key !== "passport" &&
          key !== "id_document" &&
          key !== "payment_receipt"
        ) {
          formData.append(key, String(value));
        }
      });

      // --------------------------------------------------------
      // New password
      // --------------------------------------------------------
      if (newPassword.trim()) {
        formData.append("new_password", newPassword);
      }

      // --------------------------------------------------------
      // Files
      // --------------------------------------------------------
      if (passportFile) {
        formData.append("passport", passportFile);
      }

      if (idDocFile) {
        formData.append("id_document", idDocFile);
      }

      if (receiptFile) {
        formData.append("payment_receipt", receiptFile);
      }

      // --------------------------------------------------------
      // Send update
      // --------------------------------------------------------
      const res = await fetch(
        `/api/admin_staff/md/members/${member.member_id}`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );

      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error("Server returned a non-JSON response.");
      }

      const data = await res.json();

      if (res.ok && data.success) {
        setMember(data.member);

        setNewPassword("");
        setPassportFile(null);
        setIdDocFile(null);
        setReceiptFile(null);

        setMessage({
          type: "success",
          text: data.message || "Member profile updated successfully.",
        });
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to update member profile.",
        });
      }
    } catch (error) {
      console.error("Update member error:", error);

      setMessage({
        type: "error",
        text: "Error saving member profile.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // FILE DISPLAY
  // ============================================================
  const getFileBadge = (filePath?: string | null) => {
    if (!filePath) {
      return (
        <p className="text-[11px] text-slate-400 italic">
          No document uploaded
        </p>
      );
    }

    const ext = filePath.split(".").pop()?.toLowerCase();

    // ----------------------------------------------------------
    // Images
    // ----------------------------------------------------------
    if (
      ["jpg", "jpeg", "png", "gif", "webp", "avif"].includes(ext || "")
    ) {
      return (
        <a
          href={filePath}
          target="_blank"
          rel="noreferrer"
          className="block my-2"
        >
          <img
            src={filePath}
            alt="Uploaded document"
            className="h-32 w-32 object-cover rounded-xl border border-slate-200 shadow-sm hover:opacity-90 transition-opacity"
          />
        </a>
      );
    }

    // ----------------------------------------------------------
    // PDF
    // ----------------------------------------------------------
    if (ext === "pdf") {
      return (
        <a
          href={filePath}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 p-3 my-2 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-200"
        >
          <FileText className="h-5 w-5 text-rose-600" />
          Open PDF Document
        </a>
      );
    }

    // ----------------------------------------------------------
    // Spreadsheet
    // ----------------------------------------------------------
    if (["xls", "xlsx", "csv"].includes(ext || "")) {
      return (
        <a
          href={filePath}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 p-3 my-2 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-200"
        >
          <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
          Open Spreadsheet
        </a>
      );
    }

    // ----------------------------------------------------------
    // Other files
    // ----------------------------------------------------------
    return (
      <a
        href={filePath}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 p-3 my-2 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-200"
      >
        <FileArchive className="h-5 w-5 text-blue-600" />
        Open File {ext ? `(${ext.toUpperCase()})` : ""}
      </a>
    );
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* ======================================================
          HEADER
      ====================================================== */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
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

            <Link
              href="/admin_staff/md/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* ======================================================
          MAIN
      ====================================================== */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* TITLE */}
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <UserCheck className="h-7 w-7 text-emerald-600" />
            MD — Member Profile Editor
          </h1>

          <p className="text-xs text-slate-500 mt-1">
            Search, inspect, and update cooperative member details, banking
            information, and official documents.
          </p>
        </div>

        {/* ====================================================
            ALERT
        ==================================================== */}
        {message && (
          <div
            className={`rounded-2xl border p-4 flex items-center gap-3 text-xs font-medium transition-all ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
            )}

            <span>{message.text}</span>
          </div>
        )}

        {/* ====================================================
            SEARCH
        ==================================================== */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

              <input
                type="number"
                placeholder="Enter Member ID (e.g. 101)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                required
                min="1"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}

              {isSearching ? "Searching..." : "Search Member"}
            </button>
          </form>
        </div>

        {/* ====================================================
            MEMBER EDITOR
        ==================================================== */}
        {member && (
          <form onSubmit={handleUpdate} className="space-y-6">
            {/* MEMBER HEADER */}
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <div>
                <h3 className="text-sm font-bold text-emerald-950">
                  Editing Profile: {member.full_name}
                </h3>

                <p className="text-[11px] font-medium text-emerald-700">
                  Member ID: #{member.member_id}
                </p>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors shadow-sm"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}

                {isSaving ? "Saving..." : "Save Updates"}
              </button>
            </div>

            {/* ==================================================
                SECTION 1
            ================================================== */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-100 pb-3">
                <User className="h-4 w-4 text-emerald-600" />
                Personal & Contact Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="full_name"
                    value={member.full_name || ""}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">
                    NIN
                  </label>

                  <input
                    type="text"
                    name="nin"
                    value={member.nin || ""}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Phone Number
                  </label>

                  <input
                    type="text"
                    name="phone_number"
                    value={member.phone_number || ""}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={member.email || ""}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">
                    State of Origin
                  </label>

                  <input
                    type="text"
                    name="state_of_origin"
                    value={member.state_of_origin || ""}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">
                    LGA of Origin
                  </label>

                  <input
                    type="text"
                    name="lga_of_origin"
                    value={member.lga_of_origin || ""}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Permanent Address
                  </label>

                  <input
                    type="text"
                    name="permanent_address"
                    value={member.permanent_address || ""}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Residential Address
                  </label>

                  <input
                    type="text"
                    name="residential_address"
                    value={member.residential_address || ""}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* ==================================================
                SECTION 2
            ================================================== */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-100 pb-3">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                Banking & Employment Info
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Bank Name
                  </label>

                  <input
                    type="text"
                    name="bank_name"
                    value={member.bank_name || ""}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Account Number
                  </label>

                  <input
                    type="text"
                    name="account_number"
                    value={member.account_number || ""}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Account Name
                  </label>

                  <input
                    type="text"
                    name="account_name"
                    value={member.account_name || ""}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Account Type
                  </label>

                  <select
                    name="account_type"
                    value={member.account_type || ""}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">Select account type</option>
                    <option value="Current">Current</option>
                    <option value="Savings">Savings</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Place of Work
                  </label>

                  <input
                    type="text"
                    name="place_of_work"
                    value={member.place_of_work || ""}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Business / Work Type
                  </label>

                  <input
                    type="text"
                    name="type_of_business_work"
                    value={member.type_of_business_work || ""}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* ==================================================
                SECTION 3
            ================================================== */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Briefcase className="h-4 w-4 text-emerald-600" />
                Contributions & Savings Setup
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Monthly Earning - ENUM */}
                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Monthly Earning
                  </label>

                  <select
                    name="monthly_earning"
                    value={member.monthly_earning || ""}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">Select monthly earning</option>
                    <option value="100k_below">₦100k and below</option>
                    <option value="100k_200k">₦100k - ₦200k</option>
                    <option value="200k_250k">₦200k - ₦250k</option>
                    <option value="250k_300k">₦250k - ₦300k</option>
                    <option value="300k_350k">₦300k - ₦350k</option>
                    <option value="400k_above">₦400k and above</option>
                  </select>
                </div>

                {/* Annual Income - ENUM */}
                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Annual Income
                  </label>

                  <select
                    name="annual_income"
                    value={member.annual_income || ""}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">Select annual income</option>
                    <option value="below_500k">Below ₦500k</option>
                    <option value="500k_1m">₦500k - ₦1m</option>
                    <option value="1m_2m">₦1m - ₦2m</option>
                    <option value="2m_3m">₦2m - ₦3m</option>
                    <option value="3m_4m">₦3m - ₦4m</option>
                    <option value="4m_5m">₦4m - ₦5m</option>
                    <option value="above_5m">Above ₦5m</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Expected Monthly Contribution (₦)
                  </label>

                  <input
                    type="number"
                    name="expected_monthly_contribution_amount"
                    value={
                      member.expected_monthly_contribution_amount ?? ""
                    }
                    min="0"
                    step="0.01"
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Fixed Deposit Amount (₦)
                  </label>

                  <input
                    type="number"
                    name="fixed_deposit_amount"
                    value={member.fixed_deposit_amount ?? ""}
                    min="0"
                    step="0.01"
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Fixed Deposit Tenure (Years)
                  </label>

                  <input
                    type="number"
                    name="fixed_deposit_years"
                    value={member.fixed_deposit_years ?? ""}
                    min="0"
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Contribution Start Date
                  </label>

                  <input
                    type="date"
                    name="contribution_start_date"
                    value={member.contribution_start_date || ""}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* ==================================================
                SECTION 4 - NEXT OF KIN
            ================================================== */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Users className="h-4 w-4 text-emerald-600" />
                Next of Kin Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Next of Kin Full Name
                  </label>

                  <input
                    type="text"
                    name="full_name_of_next_of_kin"
                    value={member.full_name_of_next_of_kin || ""}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Relationship
                  </label>

                  <input
                    type="text"
                    name="relationship_with_next_of_kin"
                    value={member.relationship_with_next_of_kin || ""}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Next of Kin Phone
                  </label>

                  <input
                    type="text"
                    name="phone_number_of_next_of_kin"
                    value={member.phone_number_of_next_of_kin || ""}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Next of Kin Address
                  </label>

                  <input
                    type="text"
                    name="address_of_next_of_kin"
                    value={member.address_of_next_of_kin || ""}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* ==================================================
                SECTION 5 - DOCUMENTS
            ================================================== */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-100 pb-3">
                <ImageIcon className="h-4 w-4 text-emerald-600" />
                Documents & ID Verification
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Passport */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Passport Photograph
                  </label>

                  {getFileBadge(member.passport)}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setPassportFile(e.target.files?.[0] || null)
                    }
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                  />

                  {passportFile && (
                    <p className="text-[10px] text-emerald-600 font-medium truncate">
                      New file: {passportFile.name}
                    </p>
                  )}
                </div>

                {/* ID Document */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Identity Document
                  </label>

                  {getFileBadge(member.id_document)}

                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={(e) =>
                      setIdDocFile(e.target.files?.[0] || null)
                    }
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                  />

                  {idDocFile && (
                    <p className="text-[10px] text-emerald-600 font-medium truncate">
                      New file: {idDocFile.name}
                    </p>
                  )}
                </div>

                {/* Payment Receipt */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Payment Receipt
                  </label>

                  {getFileBadge(member.payment_receipt)}

                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={(e) =>
                      setReceiptFile(e.target.files?.[0] || null)
                    }
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                  />

                  {receiptFile && (
                    <p className="text-[10px] text-emerald-600 font-medium truncate">
                      New file: {receiptFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ==================================================
                SECTION 6 - SECURITY
            ================================================== */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Lock className="h-4 w-4 text-emerald-600" />
                Account Security
              </h4>

              <div className="space-y-1 max-w-md">
                <label className="text-xs font-bold text-slate-700">
                  New Password (leave blank to keep existing)
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new account password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pr-10 pl-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* ==================================================
                BOTTOM SAVE
            ================================================== */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors shadow-sm"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}

                {isSaving
                  ? "Saving Changes..."
                  : "Save All Profile Updates"}
              </button>
            </div>
          </form>
        )}
      </main>

      {/* ======================================================
          FOOTER
      ====================================================== */}
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
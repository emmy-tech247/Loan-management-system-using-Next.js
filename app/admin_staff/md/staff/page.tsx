"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  UserPlus,
  Pencil,
  Trash2,
  Shield,
  LogOut,
  UserCog,
  Mail,
  Phone,
  BriefcaseBusiness,
  LockKeyhole,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
} from "lucide-react";

type Staff = {
  staff_id: number;
  full_name: string;
  email: string;
  phone: string;
  role: string;
};

type MessageType = "success" | "error" | "";

const roles = [
  {
    value: "relationship_officer1",
    label: "Relationship Officer 1",
  },
  {
    value: "relationship_officer2",
    label: "Relationship Officer 2",
  },
  {
    value: "auditor",
    label: "Auditor",
  },
  {
    value: "manager",
    label: "Manager",
  },
  {
    value: "accountant",
    label: "Accountant",
  },
  {
    value: "admin",
    label: "Admin",
  },
  {
    value: "md",
    label: "Managing Director",
  },
];

export default function ManageStaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState<MessageType>("");

  const [searchQuery, setSearchQuery] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "relationship_officer1",
    password: "",
  });

  // ============================================================
  // FETCH STAFF
  // ============================================================

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setMessage("");
      setMessageType("");

      const response = await fetch(
        "/api/admin_staff/md/staff",
        {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        }
      );

      // ========================================================
      // Check response content type before parsing JSON
      // ========================================================

      const contentType =
        response.headers.get("content-type") || "";

      let data: any;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();

        console.error(
          "Unexpected server response:",
          text
        );

        throw new Error(
          `Server returned an unexpected response (${response.status}).`
        );
      }

      // ========================================================
      // Check API response
      // ========================================================

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to load staff."
        );
      }

      // ========================================================
      // Store staff records
      // ========================================================

      setStaff(
        Array.isArray(data.staff)
          ? data.staff
          : []
      );
    } catch (error) {
      console.error("fetchStaff error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to load staff."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Load staff when page opens
  // ============================================================

  useEffect(() => {
    fetchStaff();
  }, []);

  // ============================================================
  // INPUT CHANGE
  // ============================================================

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // ============================================================
  // ADD STAFF
  // ============================================================

  const handleAddStaff = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        "/api/admin_staff/md/staff",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(form),
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      let data: any;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();

        console.error(
          "Unexpected server response:",
          text
        );

        throw new Error(
          `Server returned an unexpected response (${response.status}).`
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to add staff."
        );
      }

      setMessage("Staff member added successfully.");
      setMessageType("success");

      setForm({
        full_name: "",
        email: "",
        phone: "",
        role: "relationship_officer1",
        password: "",
      });

      await fetchStaff();
    } catch (error) {
      console.error("handleAddStaff error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while adding staff."
      );

      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // DELETE STAFF
  // ============================================================

  const handleDelete = async (staffId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this staff account?"
    );

    if (!confirmed) return;

    setDeletingId(staffId);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(
        `/api/admin_staff/md/staff/${staffId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      let data: any;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();

        console.error(
          "Unexpected delete response:",
          text
        );

        throw new Error(
          `Server returned an unexpected response (${response.status}).`
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to delete staff."
        );
      }

      setStaff((current) =>
        current.filter(
          (member) => member.staff_id !== staffId
        )
      );

      setMessage("Staff member deleted successfully.");
      setMessageType("success");
    } catch (error) {
      console.error("handleDelete error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while deleting staff."
      );

      setMessageType("error");
    } finally {
      setDeletingId(null);
    }
  };

  // ============================================================
  // FILTER STAFF
  // ============================================================

  const filteredStaff = staff.filter((member) => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) return true;

    return (
      member.full_name
        .toLowerCase()
        .includes(query) ||
      member.email
        .toLowerCase()
        .includes(query) ||
      member.phone
        .toLowerCase()
        .includes(query) ||
      member.role
        .toLowerCase()
        .includes(query)
    );
  });

  // ============================================================
  // ROLE LABEL
  // ============================================================

  const getRoleLabel = (role: string) => {
    const found = roles.find(
      (item) => item.value === role
    );

    return (
      found?.label ||
      role
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) =>
          letter.toUpperCase()
        )
    );
  };

  // ============================================================
  // ROLE BADGE
  // ============================================================

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "md":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "admin":
        return "bg-slate-900 text-white border-slate-800";

      case "manager":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "auditor":
        return "bg-violet-50 text-violet-700 border-violet-200";

      case "accountant":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "relationship_officer1":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";

      case "relationship_officer2":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";

      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* ========================================================
          NAVBAR
      ========================================================= */}

      <nav className="sticky top-0 z-50 border-b border-slate-200 -mt-28 bg-white shadow-sm">
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

              <span className="hidden items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white sm:inline-flex">
                <Shield className="h-3 w-3 text-emerald-400" />
                Executive Portal
              </span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              <Link
                href="/admin_staff/md/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />

                <span className="hidden sm:inline">
                  Dashboard
                </span>
              </Link>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              >
                <LogOut className="h-4 w-4" />

                <span className="hidden sm:inline">
                  Logout
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ========================================================
          MAIN
      ========================================================= */}

      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 mt-2 sm:px-6 lg:px-8">

        {/* Header */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">

          <div className="pointer-events-none absolute right-0 top-0 -mr-10 -mt-10 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl">

            <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300">
              <UserCog className="h-3.5 w-3.5" />
              Staff Administration
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Manage Staff
            </h1>

            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-300 sm:text-sm">
              Create and manage staff accounts for the
              cooperative&apos;s administrative and operational
              teams.
            </p>
          </div>
        </section>

        {/* ======================================================
            MESSAGE
        ====================================================== */}

        {message && (
          <div
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-sm ${
              messageType === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {messageType === "success" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            )}

            <span>{message}</span>

            <button
              type="button"
              onClick={() => {
                setMessage("");
                setMessageType("");
              }}
              className="ml-auto rounded-lg p-1 hover:bg-black/5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ======================================================
            ADD STAFF + SUMMARY
        ====================================================== */}

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Add Staff */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-7">

              <div className="mb-6 flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <UserPlus className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Add New Staff
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Create a secure staff account and assign
                    an appropriate role.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleAddStaff}
                className="grid grid-cols-1 gap-5 sm:grid-cols-2"
              >

                {/* Full Name */}
                <div>
                  <label
                    htmlFor="full_name"
                    className="mb-2 block text-xs font-bold text-slate-700"
                  >
                    Full Name
                  </label>

                  <div className="relative">
                    <UserCog className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="full_name"
                      name="full_name"
                      type="text"
                      value={form.full_name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter full name"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-bold text-slate-700"
                  >
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleInputChange}
                      required
                      placeholder="staff@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-xs font-bold text-slate-700"
                  >
                    Phone Number
                  </label>

                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="08012345678"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label
                    htmlFor="role"
                    className="mb-2 block text-xs font-bold text-slate-700"
                  >
                    Role
                  </label>

                  <div className="relative">
                    <BriefcaseBusiness className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <select
                      id="role"
                      name="role"
                      value={form.role}
                      onChange={handleInputChange}
                      required
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                    >
                      {roles.map((role) => (
                        <option
                          key={role.value}
                          value={role.value}
                        >
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Password */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="password"
                    className="mb-2 block text-xs font-bold text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleInputChange}
                      required
                      minLength={6}
                      placeholder="Enter a secure password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <p className="mt-1.5 text-[11px] text-slate-400">
                    Password must contain at least 6 characters.
                  </p>
                </div>

                {/* Submit */}
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    <UserPlus className="h-4 w-4" />

                    {isSubmitting
                      ? "Adding Staff..."
                      : "Add Staff"}
                  </button>
                </div>

              </form>
            </div>
          </div>

          {/* Staff Summary */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <div className="flex h-full flex-col">

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Users className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    Total Staff
                  </p>

                  <p className="text-2xl font-extrabold text-slate-900">
                    {staff.length}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-700">
                  Staff Management
                </p>

                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Add employees, assign administrative roles,
                  update account information, or remove staff
                  access.
                </p>
              </div>

              <div className="mt-auto pt-6">
                <Link
                  href="/admin_staff/md/dashboard"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to MD Dashboard
                </Link>
              </div>

            </div>
          </div>

        </section>

        {/* ======================================================
            STAFF LIST
        ====================================================== */}

        <section className="rounded-3xl border border-slate-200/90 bg-white shadow-sm">

          <div className="border-b border-slate-100 p-5 sm:p-6">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  All Staff
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  View and manage registered staff accounts.
                </p>
              </div>

              {/* Search */}
              <div className="relative w-full md:w-80">

                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  placeholder="Search staff..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />

              </div>

            </div>
          </div>

          {/* ====================================================
              LOADING
          ==================================================== */}

          {loading && (
            <div className="p-12 text-center">

              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

              <p className="mt-3 text-xs font-medium text-slate-500">
                Loading staff...
              </p>

            </div>
          )}

          {/* ====================================================
              DESKTOP TABLE
          ==================================================== */}

          {!loading && filteredStaff.length > 0 && (
            <div className="hidden overflow-x-auto md:block">

              <table className="w-full">

                <thead>
                  <tr className="bg-slate-900 text-left text-xs font-bold text-white">

                    <th className="px-5 py-4">
                      ID
                    </th>

                    <th className="px-5 py-4">
                      Staff Member
                    </th>

                    <th className="px-5 py-4">
                      Email
                    </th>

                    <th className="px-5 py-4">
                      Phone
                    </th>

                    <th className="px-5 py-4">
                      Role
                    </th>

                    <th className="px-5 py-4 text-right">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredStaff.map((member) => (
                    <tr
                      key={member.staff_id}
                      className="transition hover:bg-slate-50"
                    >

                      <td className="px-5 py-4 text-xs font-bold text-slate-500">
                        #{member.staff_id}
                      </td>

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                            <UserCog className="h-4 w-4" />
                          </div>

                          <span className="text-sm font-bold text-slate-900">
                            {member.full_name}
                          </span>

                        </div>

                      </td>

                      <td className="px-5 py-4 text-xs text-slate-600">
                        {member.email}
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-600">
                        {member.phone}
                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${getRoleBadge(
                            member.role
                          )}`}
                        >
                          {getRoleLabel(member.role)}
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          <Link
                            href={`/admin_staff/staff/edit?staff_id=${member.staff_id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                member.staff_id
                              )
                            }
                            disabled={
                              deletingId ===
                              member.staff_id
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />

                            {deletingId ===
                            member.staff_id
                              ? "Deleting..."
                              : "Delete"}
                          </button>

                        </div>

                      </td>

                    </tr>
                  ))}

                </tbody>
              </table>

            </div>
          )}

          {/* ====================================================
              MOBILE STAFF LIST
          ==================================================== */}

          {!loading && filteredStaff.length > 0 && (
            <div className="space-y-4 p-4 md:hidden">

              {filteredStaff.map((member) => (
                <div
                  key={member.staff_id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                        <UserCog className="h-4 w-4" />
                      </div>

                      <div>

                        <h3 className="text-sm font-bold text-slate-900">
                          {member.full_name}
                        </h3>

                        <p className="text-[11px] text-slate-500">
                          Staff ID #{member.staff_id}
                        </p>

                      </div>

                    </div>

                    <span
                      className={`rounded-full border px-2 py-1 text-[10px] font-bold ${getRoleBadge(
                        member.role
                      )}`}
                    >
                      {getRoleLabel(member.role)}
                    </span>

                  </div>

                  <div className="mt-4 space-y-3 rounded-xl bg-white p-3">

                    <div className="flex items-center gap-2">

                      <Mail className="h-3.5 w-3.5 text-slate-400" />

                      <span className="break-all text-xs text-slate-600">
                        {member.email}
                      </span>

                    </div>

                    <div className="flex items-center gap-2">

                      <Phone className="h-3.5 w-3.5 text-slate-400" />

                      <span className="text-xs text-slate-600">
                        {member.phone}
                      </span>

                    </div>

                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">

                    <Link
                      href={`/admin_staff/staff/edit?staff_id=${member.staff_id}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(member.staff_id)
                      }
                      disabled={
                        deletingId === member.staff_id
                      }
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />

                      {deletingId === member.staff_id
                        ? "Deleting..."
                        : "Delete"}
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}

          {/* ====================================================
              EMPTY STATE
          ==================================================== */}

          {!loading && filteredStaff.length === 0 && (
            <div className="p-12 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Users className="h-6 w-6" />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-900">
                {searchQuery
                  ? "No staff found"
                  : "No staff accounts"}
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                {searchQuery
                  ? `No staff members match "${searchQuery}". Try a different search.`
                  : "There are currently no staff accounts registered."}
              </p>

            </div>
          )}

        </section>
      </main>

      {/* ========================================================
          FOOTER
      ========================================================= */}

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

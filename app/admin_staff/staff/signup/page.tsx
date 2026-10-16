"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  UserPlus,
  Shield,
  ArrowLeft,
  Mail,
  Phone,
  Lock,
  User,
  BriefcaseBusiness,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";

export default function StaffSignupPage() {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setMessageType("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const data = {
      surname: formData.get("surname"),
      firstname: formData.get("firstname"),
      othername: formData.get("othername"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      role: formData.get("role"),
      password: formData.get("password"),
    };

    try {
      const response = await fetch("/api/staff/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Staff registration failed.");
        setMessageType("error");
        return;
      }

      setMessage(result.message || "Staff account created successfully.");
      setMessageType("success");

      form.reset();
    } catch (error) {
      console.error(error);

      setMessage("Unable to connect to the server. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans -mt-24 text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link
                href="/staff"
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
                Staff Portal
              </span>
            </div>

            {/* Back to Login */}
            <Link
              href="/staff"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Staff Login</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Banner */}
        <div className="relative mb-6 overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">
          {/* Decorative glow */}
          <div className="pointer-events-none absolute right-0 top-0 -mr-8 -mt-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-xs">
              <UserPlus className="h-3.5 w-3.5" />
              Staff Account Registration
            </span>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Create Staff Account
            </h1>

            <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
              Register a new staff member and assign the appropriate role
              within DCG Multipurpose Cooperative Society Ltd.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-8">
          {/* Card Header */}
          <div className="mb-6 flex items-center gap-4 border-b border-slate-100 pb-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <UserPlus className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Staff Information
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Enter the staff member&apos;s details below.
              </p>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 text-sm ${
                messageType === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              {messageType === "success" ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              ) : (
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
              )}

              <p className="font-medium">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-600" />

                <h3 className="text-sm font-bold text-slate-900">
                  Personal Details
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="surname"
                    className="mb-1.5 block text-xs font-bold text-slate-700"
                  >
                    Surname <span className="text-rose-500">*</span>
                  </label>

                  <input
                    id="surname"
                    type="text"
                    name="surname"
                    placeholder="Surname"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="firstname"
                    className="mb-1.5 block text-xs font-bold text-slate-700"
                  >
                    First Name <span className="text-rose-500">*</span>
                  </label>

                  <input
                    id="firstname"
                    type="text"
                    name="firstname"
                    placeholder="First Name"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="othername"
                    className="mb-1.5 block text-xs font-bold text-slate-700"
                  >
                    Other Name
                  </label>

                  <input
                    id="othername"
                    type="text"
                    name="othername"
                    placeholder="Other Name"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </section>

            {/* Contact */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-600" />

                <h3 className="text-sm font-bold text-slate-900">
                  Contact Information
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs font-bold text-slate-700"
                  >
                    Email Address <span className="text-rose-500">*</span>
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="staff@example.com"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1.5 block text-xs font-bold text-slate-700"
                  >
                    Phone Number <span className="text-rose-500">*</span>
                  </label>

                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      placeholder="08012345678"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Role */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <BriefcaseBusiness className="h-4 w-4 text-emerald-600" />

                <h3 className="text-sm font-bold text-slate-900">
                  Staff Role
                </h3>
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Select Role <span className="text-rose-500">*</span>
                </label>

                <select
                  id="role"
                  name="role"
                  required
                  defaultValue=""
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="" disabled>
                    -- Select Staff Role --
                  </option>

                  <option value="relationship_officer1">
                    Relationship Officer 1
                  </option>

                  <option value="relationship_officer2">
                    Relationship Officer 2
                  </option>

                  <option value="auditor">
                    Auditor
                  </option>

                  <option value="manager">
                    Manager
                  </option>

                  <option value="accountant">
                    Accountant
                  </option>

                  <option value="admin">
                    Admin
                  </option>

                  <option value="md">
                    Managing Director
                  </option>
                </select>
              </div>
            </section>

            {/* Password */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-600" />

                <h3 className="text-sm font-bold text-slate-900">
                  Account Security
                </h3>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Password <span className="text-rose-500">*</span>
                </label>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Create a secure password"
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <p className="mt-1.5 text-[11px] text-slate-400">
                  Use at least 6 characters for the staff account password.
                </p>
              </div>
            </section>

            {/* Submit */}
            <div className="border-t border-slate-100 pt-5">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registering Staff...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Create Staff Account
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 border-t border-slate-100 pt-5 text-center">
            <p className="text-xs text-slate-500">
              Already have a staff account?{" "}
              <Link
                href="/staff"
                className="font-bold text-emerald-600 transition-colors hover:text-emerald-700 hover:underline"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
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
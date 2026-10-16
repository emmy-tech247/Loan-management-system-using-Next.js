"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Shield, LogIn, Mail, Lock, ArrowLeft } from "lucide-react";
import { staffLogin } from "./actions";

export default function StaffLoginPage() {
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setIsLoggingIn(true);

    try {
      const result = await staffLogin(formData);

      if (result?.error) {
        setError(result.error);
        setIsLoggingIn(false);
      }
    } catch (err) {
      console.error("Staff login error:", err);
      setError("Something went wrong. Please try again.");
      setIsLoggingIn(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans -mt-24 text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/logo2.png"
                alt="DCG Cooperative Logo"
                width={140}
                height={40}
                className="h-9 w-auto object-contain"
                priority
              />
            </Link>

            <span className="hidden items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold text-white sm:inline-flex">
              <Shield className="h-3 w-3 text-emerald-400" />
              Executive Portal
            </span>
          </div>

          {/* Back Home */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back Home</span>
          </Link>
        </div>
      </nav>

      {/* Main */}
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 -mt-24 py-10 sm:px-6 lg:px-8">
        {/* Background Decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-slate-900/5 blur-3xl" />
        </div>

        {/* Login Container */}
        <div className="relative z-10 w-full max-w-md">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
              <Shield className="h-7 w-7 text-emerald-400" />
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Staff Login
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Sign in to access the DCG Cooperative staff portal.
            </p>
          </div>

          {/* Login Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-md sm:p-8">
            {/* Error Message */}
            {error && (
              <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                <p className="text-xs font-semibold leading-relaxed text-rose-700">
                  {error}
                </p>
              </div>
            )}

            {/* Login Form */}
            <form action={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-xs font-bold text-slate-700"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <Link
                  href="/forgot_password"
                  className="text-xs font-semibold text-emerald-600 transition-colors hover:text-emerald-700 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <LogIn className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />

                <span>
                  {isLoggingIn ? "Signing in..." : "Sign In"}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Staff Access
              </span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            {/* Signup */}
            <div className="text-center">
              <p className="text-xs text-slate-500">
                Don't have a staff account?
              </p>

              <Link
                href="/staff/signup"
                className="mt-2 inline-flex items-center justify-center rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
              >
                Create Staff Account
              </Link>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-5 flex items-center justify-center gap-2 text-center">
            <Shield className="h-3.5 w-3.5 text-emerald-600" />

            <p className="text-[10px] font-medium text-slate-400">
              Authorized DCG Cooperative staff only
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
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
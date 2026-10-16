"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  UserRound,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    const username = formData.get("username");
    const password = formData.get("password");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({
          username,
          password,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid login credentials.");
        setIsLoading(false);
        return;
      }

      window.location.href = "/member/dashboard";
      
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <header className="border-b border-slate-200 bg-white -mt-24">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <Image
              src="/images/logo2.png"
              alt="DCG Multipurpose Cooperative Society Logo"
              width={140}
              height={40}
              priority
              className="h-9 w-auto object-contain"
            />
          </Link>

          {/* Register */}
          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-medium text-slate-500 sm:inline">
              Don't have an account?
            </span>

            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              Register
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 lg:grid-cols-2">
          {/* Left Branding Panel */}
          <section className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            {/* Decorative Elements */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

            <div className="relative z-10">
              {/* Logo */}
              <div className="mb-12 flex items-center gap-3">
                <div className="rounded-2xl bg-white px-3 py-2 shadow-lg">
                  <Image
                    src="/images/logo2.png"
                    alt="DCG Cooperative"
                    width={150}
                    height={45}
                    className="h-10 w-auto object-contain"
                  />
                </div>
              </div>

              {/* Welcome */}
              <div className="max-w-md space-y-5">
                <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-300 ring-1 ring-inset ring-emerald-500/20">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure Member Portal
                </span>

                <h1 className="text-3xl font-extrabold tracking-tight xl:text-4xl">
                  Welcome back to{" "}
                  <span className="text-emerald-400">DCG Cooperative</span>
                </h1>

                <p className="text-sm leading-7 text-slate-300">
                  Access your cooperative account, manage your savings,
                  investments, loans, repayments, and stay connected with the
                  DCG community.
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="relative z-10 mt-12 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    Manage Your Account
                  </p>
                  <p className="text-[11px] text-slate-400">
                    View savings, investments and loan information.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    Secure Access
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Your account information is protected.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Login Panel */}
          <section className="p-6 sm:p-10">
            <div className="mx-auto w-full max-w-md">
              {/* Mobile Logo */}
              <div className="mb-8 flex justify-center lg:hidden">
                <Link href="/">
                  <Image
                    src="/images/logo2.png"
                    alt="DCG Cooperative Logo"
                    width={160}
                    height={50}
                    priority
                    className="h-11 w-auto object-contain"
                  />
                </Link>
              </div>

              {/* Heading */}
              <div className="mb-8 space-y-2">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <LockKeyhole className="h-5 w-5" />
                </div>

                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Sign in to your account
                </h2>

                <p className="text-sm leading-relaxed text-slate-500">
                  Enter your credentials below to access your DCG Cooperative
                  account.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div
                  role="alert"
                  className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />

                  <div>
                    <p className="font-bold">Login unsuccessful</p>
                    <p className="mt-0.5 text-xs text-rose-600">{error}</p>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username */}
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="text-xs font-bold text-slate-700"
                  >
                    Email or Phone Number
                  </label>

                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="username"
                      type="text"
                      name="username"
                      placeholder="Enter your email or phone"
                      autoComplete="username"
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-xs outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-xs font-bold text-slate-700"
                    >
                      Password
                    </label>

                    <Link
                      href="/forgot-password"
                      className="text-xs font-semibold text-emerald-600 transition-colors hover:text-emerald-700 hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-11 text-sm text-slate-900 placeholder-slate-400 shadow-xs outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  DCG Cooperative
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Register */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-xs text-slate-500">
                  Don't have a DCG account yet?
                </p>

                <Link
                  href="/register"
                  className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 transition-colors hover:text-emerald-700"
                >
                  Create an account
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-5">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} DCG Multipurpose Cooperative Society
            Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
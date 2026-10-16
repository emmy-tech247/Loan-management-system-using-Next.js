"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Shield,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LockKeyhole,
} from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (!currentPassword || !newPassword) {
      setMessage("Please fill in all required fields.");
      setMessageType("error");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("New password must be at least 6 characters.");
      setMessageType("error");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/staff/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to update password.");
        setMessageType("error");
        return;
      }

      setMessage(data.message || "Password updated successfully.");
      setMessageType("success");

      setCurrentPassword("");
      setNewPassword("");

      // Optional redirect after successful password change
      // setTimeout(() => {
      //   router.push("/staff/dashboard");
      // }, 1500);
    } catch (error) {
      console.error(error);

      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans -mt-28 text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link
                href="/staff/dashboard"
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

              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white">
                <Shield className="h-3 w-3 text-emerald-400" />
                Staff Portal
              </span>
            </div>

            {/* Back */}
            <Link
              href="/staff/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="flex flex-1 items-center justify-center px-4 py-10 mt-2 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <KeyRound className="h-6 w-6 text-emerald-400" />
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Change Password
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Update your staff portal password to keep your account secure.
            </p>
          </div>

          {/* Card */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-md sm:p-8">
            {/* Decorative background */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative z-10">
              {/* Message */}
              {message && (
                <div
                  className={`mb-6 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
                    messageType === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-rose-200 bg-rose-50 text-rose-700"
                  }`}
                >
                  {messageType === "success" ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                  )}

                  <span className="font-medium">{message}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Current Password */}
                <div>
                  <label
                    htmlFor="current_password"
                    className="mb-2 block text-xs font-bold text-slate-700"
                  >
                    Current Password
                  </label>

                  <div className="relative">
                    <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="current_password"
                      name="current_password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="Enter your current password"
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label
                    htmlFor="new_password"
                    className="mb-2 block text-xs font-bold text-slate-700"
                  >
                    New Password
                  </label>

                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="new_password"
                      name="new_password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="Enter your new password"
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <p className="mt-2 text-[11px] text-slate-400">
                    Your new password should contain at least 6 characters.
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      Update Password
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Security note */}
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center">
            <p className="text-[11px] leading-relaxed text-slate-500">
              <span className="font-bold text-slate-700">Security tip:</span>{" "}
              Never share your staff portal password with another person.
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
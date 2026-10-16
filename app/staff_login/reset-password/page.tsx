"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";
import Image from "next/image";

import { useSearchParams } from "next/navigation";

import {
  Lock,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams =
    useSearchParams();

  const token =
    searchParams.get("token") || "";

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError(
        "Password reset token is missing or invalid."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "/api/staff-auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      let data: any;

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        data = await response.json();
      } else {
        const text = await response.text();

        console.error(
          "Unexpected reset response:",
          text
        );

        throw new Error(
          `Server returned an unexpected response (${response.status}).`
        );
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to reset password."
        );
      }

      setSuccess(
        data.message ||
          "Password reset successfully."
      );

      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(
        "Reset password error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to reset password."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 -mt-28 px-4 py-10">
      <div className="mx-auto flex min-h-[90vh] w-full max-w-md items-center justify-center">
        <div className="w-full">
          <div className="mb-6 text-center">
            
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
              <KeyRound size={28} />
            </div>

            <h1 className="mt-5 text-3xl font-bold text-white">
              Reset Password
            </h1>

            <p className="mt-2 text-slate-400">
              Create a new password for your
              staff account.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-white p-6 shadow-2xl sm:p-8">
            {error && (
              <div className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertTriangle
                  size={20}
                  className="shrink-0"
                />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-6 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                <CheckCircle2
                  size={20}
                  className="shrink-0"
                />
                <span>{success}</span>
              </div>
            )}

            {!token ? (
              <div className="text-center">
                <p className="mb-6 text-slate-600">
                  This password reset link is
                  invalid or incomplete.
                </p>

                <Link
                  href="/staff_login/forgot-password"
                  className="inline-flex rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
                >
                  Request New Reset Link
                </Link>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    New Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      placeholder="Minimum 6 characters"
                      required
                      className="w-full rounded-xl border border-slate-300 py-3.5 pl-11 pr-12 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Confirm New Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        confirmPassword
                      }
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      placeholder="Repeat new password"
                      required
                      className="w-full rounded-xl border border-slate-300 py-3.5 pl-11 pr-12 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2
                        size={20}
                        className="animate-spin"
                      />
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      <KeyRound size={20} />
                      Reset Password
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 border-t border-slate-200 pt-6 text-center">
              <Link
                href="/staff_login/login"
                className="font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Back to Staff Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
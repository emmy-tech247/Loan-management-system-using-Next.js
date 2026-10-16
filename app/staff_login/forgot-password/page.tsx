"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";
import Image from "next/image";

import {
  Mail,
  Loader2,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const [error, setError] = useState("");
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
    setIsLoading(true);

    try {
      const response = await fetch(
        "/api/staff-auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email
              .trim()
              .toLowerCase(),
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
          "Unexpected response:",
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
            "Unable to process password reset."
        );
      }

      setSuccess(
        data.message ||
          "If your email is registered, a reset link has been sent."
      );
    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to process your request."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto flex min-h-[90vh] w-full max-w-md items-center justify-center">
        <div className="w-full">
          <div className="mb-6 text-center">
            <Link href="/">
              <Image
                src="/images/logo2.png"
                alt="DCG Cooperative Logo"
                width={90}
                height={90}
                className="mx-auto mb-4"
              />
            </Link>

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
              <KeyRound size={28} />
            </div>

            <h1 className="mt-5 text-3xl font-bold text-white">
              Forgot Password?
            </h1>

            <p className="mt-2 text-slate-400">
              Enter your staff email and we'll
              send you a password reset link.
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

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Staff Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    placeholder="staff@example.com"
                    required
                    className="w-full rounded-xl border border-slate-300 py-3.5 pl-11 pr-4 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
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
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail size={20} />
                    Send Reset Link
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-200 pt-6 text-center">
              <Link
                href="/staff_login/login"
                className="inline-flex items-center gap-2 font-semibold text-emerald-600 hover:text-emerald-700"
              >
                <ArrowLeft size={17} />
                Back to Staff Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
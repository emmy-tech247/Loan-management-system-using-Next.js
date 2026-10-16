"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    // Replace with your API call
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 2000);
  }

  return (
    <>

      {sent ? (

        <div className="rounded-xl bg-green-100 p-5 text-center">

          <h3 className="text-lg font-semibold text-green-700">
            Email Sent Successfully
          </h3>

          <p className="mt-2 text-green-600">
            If an account exists with this email, a password reset link has been sent.
          </p>

          <Link
            href="/login"
            className="mt-5 inline-block rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Back to Login
          </Link>

        </div>

      ) : (

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          <div className="relative">

            <Mail
              size={20}
              className="absolute left-4 top-4 text-gray-400"
            />

            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border py-3 pl-12 pr-4 outline-none focus:border-blue-600"
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
          >
            {loading
              ? "Sending Reset Link..."
              : "Send Reset Link"}
          </button>

          <div className="text-center">

            <Link
              href="/login"
              className="text-blue-600 hover:underline"
            >
              ← Back to Login
            </Link>

          </div>

        </form>

      )}

    </>
  );
}

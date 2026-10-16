"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";

export default function VerifyEmailForm() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (otp.length !== 6) {
      alert("Please enter a valid 6-digit verification code.");
      return;
    }

    setLoading(true);

    // Replace with API verification

    setTimeout(() => {
      setLoading(false);
      setVerified(true);
    }, 2000);
  }

  if (verified) {
    return (
      <div className="text-center">

        <div className="rounded-xl bg-green-100 p-6">

          <MailCheck
            className="mx-auto text-green-600"
            size={60}
          />

          <h3 className="mt-4 text-xl font-bold text-green-700">
            Email Verified Successfully
          </h3>

          <p className="mt-2 text-green-600">
            Your account has been activated.
          </p>

        </div>

        <Link
          href="/login"
          className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Continue to Login
        </Link>

      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >

      <input
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={otp}
        onChange={(e) =>
          setOtp(e.target.value.replace(/\D/g, ""))
        }
        placeholder="Enter 6-digit OTP"
        className="w-full rounded-xl border py-4 text-center text-2xl tracking-[12px] outline-none focus:border-blue-600"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
      >
        {loading
          ? "Verifying..."
          : "Verify Email"}
      </button>

      <div className="text-center">

        <button
          type="button"
          className="text-blue-600 hover:underline"
        >
          Resend Verification Code
        </button>

      </div>

      <div className="text-center">

        <Link
          href="/login"
          className="text-gray-600 hover:text-blue-600"
        >
          Back to Login
        </Link>

      </div>

    </form>
  );
}

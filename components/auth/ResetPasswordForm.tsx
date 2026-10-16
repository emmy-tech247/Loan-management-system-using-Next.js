"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);

    // Replace with your API request

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 2000);
  }

  if (success) {
    return (
      <div className="text-center">

        <div className="mb-6 rounded-xl bg-green-100 p-6">

          <h3 className="text-xl font-bold text-green-700">
            Password Updated Successfully
          </h3>

          <p className="mt-2 text-green-600">
            You can now sign in with your new password.
          </p>

        </div>

        <Link
          href="/login"
          className="inline-block rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Go to Login
        </Link>

      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >

      <div className="relative">

        <Lock
          className="absolute left-4 top-4 text-gray-400"
          size={20}
        />

        <input
          type={showPassword ? "text" : "password"}
          placeholder="New Password"
          className="w-full rounded-xl border py-3 pl-12 pr-12 outline-none focus:border-blue-600"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="button"
          className="absolute right-4 top-4"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>

      </div>

      <div className="relative">

        <Lock
          className="absolute left-4 top-4 text-gray-400"
          size={20}
        />

        <input
          type={showConfirm ? "text" : "password"}
          placeholder="Confirm Password"
          className="w-full rounded-xl border py-3 pl-12 pr-12 outline-none focus:border-blue-600"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button
          type="button"
          className="absolute right-4 top-4"
          onClick={() => setShowConfirm(!showConfirm)}
        >
          {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>

      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
      >
        {loading ? "Updating Password..." : "Reset Password"}
      </button>

      <div className="text-center">

        <Link
          href="/login"
          className="text-blue-600 hover:underline"
        >
          Back to Login
        </Link>

      </div>

    </form>
  );
}

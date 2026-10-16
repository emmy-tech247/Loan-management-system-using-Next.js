"use client";

import { useState } from "react";
import Link from "next/link";
import PasswordField from "./PasswordField";

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (!form.agree) {
      alert("Please accept the Terms & Conditions.");
      return;
    }

    setLoading(true);

    // Replace with your API call
    setTimeout(() => {
      setLoading(false);
      alert("Registration Successful!");
    }, 1500);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        <input
          type="text"
          placeholder="First Name"
          className="rounded-xl border px-4 py-3 focus:border-blue-600 outline-none"
          value={form.firstName}
          onChange={(e) => updateField("firstName", e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Last Name"
          className="rounded-xl border px-4 py-3 focus:border-blue-600 outline-none"
          value={form.lastName}
          onChange={(e) => updateField("lastName", e.target.value)}
          required
        />

      </div>

      <input
        type="email"
        placeholder="Email Address"
        className="w-full rounded-xl border px-4 py-3 focus:border-blue-600 outline-none"
        value={form.email}
        onChange={(e) => updateField("email", e.target.value)}
        required
      />

      <input
        type="tel"
        placeholder="Phone Number"
        className="w-full rounded-xl border px-4 py-3 focus:border-blue-600 outline-none"
        value={form.phone}
        onChange={(e) => updateField("phone", e.target.value)}
        required
      />

      <PasswordField
        placeholder="Password"
        value={form.password}
        onChange={(value) => updateField("password", value)}
      />

      <PasswordField
        placeholder="Confirm Password"
        value={form.confirmPassword}
        onChange={(value) => updateField("confirmPassword", value)}
      />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.agree}
          onChange={(e) => updateField("agree", e.target.checked)}
        />
        I agree to the Terms & Conditions
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>

      <p className="text-center text-sm">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-blue-600 hover:underline"
        >
          Login
        </Link>
      </p>

    </form>
  );
}

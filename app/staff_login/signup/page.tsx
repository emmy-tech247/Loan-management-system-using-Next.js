"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Mail,
  Phone,
  Lock,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const roles = [
  {
    value: "relationship_officer1",
    label: "Relationship Officer 1",
  },
  {
    value: "relationship_officer2",
    label: "Relationship Officer 2",
  },
  {
    value: "auditor",
    label: "Auditor",
  },
  {
    value: "manager",
    label: "Manager",
  },
  {
    value: "accountant",
    label: "Accountant",
  },
   {
    value: "admin",
    label: "Admin",
  },
   {
    value: "managing director",
    label: "Managing Director",
  },
];

export default function StaffSignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "/api/staff-auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            full_name: fullName,
            email,
            phone,
            role,
            password,
          }),
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      let data: any;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();

        console.error(
          "Unexpected signup response:",
          text
        );

        throw new Error(
          `Server returned an unexpected response (${response.status}).`
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to create staff account."
        );
      }

      setSuccess(
        "Staff account created successfully. Redirecting to login..."
      );

      setFullName("");
      setEmail("");
      setPhone("");
      setRole("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.replace("/staff_login/login");
      }, 1500);
    } catch (error) {
      console.error("Signup error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create staff account."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
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

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
            <ShieldCheck size={17} />
            Staff Portal
          </div>

          <h1 className="mt-5 text-3xl font-bold text-white">
            Create Staff Account
          </h1>

          <p className="mt-2 text-slate-400">
            Register your authorized DCG Cooperative staff
            account.
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
                Full Name
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)
                }
                placeholder="Enter full name"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="staff@example.com"
                    required
                    className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Phone Number
                </label>

                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    placeholder="08012345678"
                    required
                    className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Staff Role
              </label>

              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value)
                }
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">
                  Select staff role
                </option>

                {roles.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={18}
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
                      setPassword(e.target.value)
                    }
                    placeholder="Minimum 6 characters"
                    required
                    className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-12 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Confirm Password
                </label>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Repeat password"
                    required
                    className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-12 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Create Staff Account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-6 text-center">
            <p className="text-sm text-slate-500">
              Already have a staff account?
            </p>

            <Link
              href="/staff_login/login"
              className="mt-2 inline-block font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Sign in to Staff Portal
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to DCG Cooperative
          </Link>
        </div>
      </div>
    </main>
  );
}
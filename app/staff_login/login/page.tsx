"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";
import Image from "next/image";

import { useRouter } from "next/navigation";

import {
  Mail,
  Lock,
  LogIn,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";

export default function StaffLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "/api/staff-auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
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
          "Unexpected login response:",
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
            data.error ||
            "Incorrect email or password."
        );
      }

      const staff = data.staff;

      if (!staff) {
        throw new Error(
          "Login succeeded but staff information was not returned."
        );
      }

      const role = String(
        staff.role || ""
      )
        .trim()
        .toLowerCase();

      switch (role) {
        case "admin":
          router.replace(
            "/admin_staff/admin/dashboard"
          );
          break;

        case "auditor":
          router.replace(
            "/admin_staff/auditor/dashboard"
          );
          break;

        case "accountant":
          router.replace(
            "/admin_staff/accountant/dashboard"
          );
          break;

        case "relationship_officer1":
          router.replace(
            "/admin_staff/relationship_officer1/dashboard"
          );
          break;

        case "relationship_officer2":
          router.replace(
            "/admin_staff/relationship_officer2/dashboard"
          );
          break;

        case "manager":
          router.replace(
            "/admin_staff/manager/dashboard"
          );
          break;

        case "md":
          router.replace(
            "/admin_staff/md/dashboard"
          );
          break;

        default:
          throw new Error(
            "Your staff role is not recognized. Contact the system administrator."
          );
      }
    } catch (error) {
      console.error(
        "Staff login error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again."
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
            
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
              <ShieldCheck size={17} />
              Executive Staff Portal
            </div>

            <h1 className="mt-5 text-3xl font-bold text-white">
              Staff Sign In
            </h1>

            <p className="mt-2 text-slate-400">
              Access your DCG Cooperative staff
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

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address
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
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-300 py-3.5 pl-11 pr-4 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-semibold text-slate-700">
                    Password
                  </label>

                  <Link
                    href="/staff_login/forgot-password"
                    className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    Forgot password?
                  </Link>
                </div>

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
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-300 py-3.5 pl-11 pr-12 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
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
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2
                      size={20}
                      className="animate-spin"
                    />
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-200 pt-6 text-center">
              <p className="text-sm text-slate-500">
                Need a staff account?
              </p>

              <Link
                href="/staff_login/signup"
                className="mt-2 inline-block font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Create Staff Account
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
      </div>
    </main>
  );
}
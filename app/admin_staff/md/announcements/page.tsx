"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Megaphone,
  Shield,
  LogOut,
  ArrowLeft,
  CalendarDays,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock3,
  FileText,
} from "lucide-react";

export default function CreateAnnouncementPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [expiryOption, setExpiryOption] = useState("1_day");
  const [customDate, setCustomDate] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">(
    ""
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ---------------------------------------------------------
  // Submit announcement
  // ---------------------------------------------------------

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (!title.trim()) {
      setMessage("Please enter an announcement title.");
      setMessageType("error");
      return;
    }

    if (!content.trim()) {
      setMessage("Please write the announcement content.");
      setMessageType("error");
      return;
    }

    if (expiryOption === "custom" && !customDate) {
      setMessage("Please select a custom expiry date.");
      setMessageType("error");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin_staff/md/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          expiry_option: expiryOption,
          custom_date: customDate,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to publish announcement."
        );
      }

      setMessage(data.message || "Announcement published successfully!");
      setMessageType("success");

      // Clear form
      setTitle("");
      setContent("");
      setExpiryOption("1_day");
      setCustomDate("");
    } catch (error) {
      console.error("Announcement submission error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to publish announcement."
      );

      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------
  // Logout
  // ---------------------------------------------------------

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.push("/admin_staff/staff");
    } catch {
      router.push("/admin_staff/staff");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans -mt-28 text-slate-900">
      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link
                href="/admin_staff/staff/login"
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

              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold text-white">
                <Shield className="h-3 w-3 text-emerald-400" />
                Executive Portal
              </span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <Link
                href="/admin_staff/md/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" />
                <span>
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 mt-2 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">
          <div className="relative">
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative z-10">
              <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                <Megaphone className="h-3.5 w-3.5" />
                Executive Communication
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Post New Announcement
              </h1>

              <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-300 sm:text-sm">
                Publish important notices, updates and communications for
                cooperative members.
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            FORM CARD
        ================================================== */}

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* Card header */}
          <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FileText className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Announcement Details
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Enter the message members should receive.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
            {/* =================================================
                TITLE
            ================================================== */}

            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-xs font-bold text-slate-700"
              >
                Announcement Title
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Enter announcement title"
                maxLength={255}
                required
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-xs outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* =================================================
                CONTENT
            ================================================== */}

            <div>
              <label
                htmlFor="content"
                className="mb-2 block text-xs font-bold text-slate-700"
              >
                Announcement Content
              </label>

              <textarea
                id="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write announcement..."
                rows={8}
                required
                className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 placeholder-slate-400 shadow-xs outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />

              <p className="mt-2 text-[11px] text-slate-400">
                This message will be displayed to cooperative members.
              </p>
            </div>

            {/* =================================================
                EXPIRY
            ================================================== */}

            <div>
              <label
                htmlFor="expiry"
                className="mb-2 block text-xs font-bold text-slate-700"
              >
                Announcement Expiry
              </label>

              <div className="relative">
                <Clock3 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <select
                  id="expiry"
                  value={expiryOption}
                  onChange={(event) => {
                    setExpiryOption(event.target.value);

                    if (event.target.value !== "custom") {
                      setCustomDate("");
                    }
                  }}
                  required
                  className="w-full appearance-none rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 shadow-xs outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="1_day">1 Day</option>
                  <option value="1_week">1 Week</option>
                  <option value="1_month">1 Month</option>
                  <option value="1_year">1 Year</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            {/* =================================================
                CUSTOM DATE
            ================================================== */}

            {expiryOption === "custom" && (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                <label
                  htmlFor="custom_date"
                  className="mb-2 flex items-center gap-2 text-xs font-bold text-emerald-800"
                >
                  <CalendarDays className="h-4 w-4" />
                  Custom Expiry Date
                </label>

                <input
                  id="custom_date"
                  type="date"
                  value={customDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(event) => setCustomDate(event.target.value)}
                  required
                  className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-xs outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />

                <p className="mt-2 text-[11px] text-emerald-700">
                  The announcement will expire at 11:59 PM on the selected
                  date.
                </p>
              </div>
            )}

            {/* =================================================
                MESSAGE
            ================================================== */}

            {message && (
              <div
                className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${
                  messageType === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-800"
                }`}
              >
                {messageType === "success" ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                )}

                <div>
                  <p className="font-semibold">{message}</p>

                  {messageType === "success" && (
                    <p className="mt-1 text-xs text-emerald-700">
                      The announcement has been saved to the database.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* =================================================
                ACTIONS
            ================================================== */}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
              <Link
                href="/admin_staff/md/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" />

                {isSubmitting
                  ? "Publishing..."
                  : "Publish Announcement"}
              </button>
            </div>
          </form>
        </div>

        {/* =================================================
            INFORMATION CARD
        ================================================== */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Clock3 className="h-4 w-4" />
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-900">
                Expiry Information
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Expired announcements can be hidden from members by your
                announcement display logic using the{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px] text-slate-700">
                  expiry_date
                </code>{" "}
                column.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
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
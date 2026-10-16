"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Shield,
  Megaphone,
  CalendarDays,
  FileText,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock3,
} from "lucide-react";

type ExpiryOption =
  | "1_day"
  | "1_week"
  | "1_month"
  | "1_year"
  | "custom";

export default function CreateAnnouncementPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [expiryOption, setExpiryOption] =
    useState<ExpiryOption>("1_day");
  const [customDate, setCustomDate] = useState("");

  const [isPublishing, setIsPublishing] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessage("");
    setMessageType(null);

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

    setIsPublishing(true);

    try {
      const response = await fetch("/api/admin_staff/admin/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          expiryOption,
          customDate: expiryOption === "custom" ? customDate : null,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage("Announcement published successfully!");
        setMessageType("success");

        // Clear form after successful publication
        setTitle("");
        setContent("");
        setExpiryOption("1_day");
        setCustomDate("");
      } else {
        setMessage(data.message || "Failed to publish announcement.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Announcement publication error:", error);

      setMessage(
        "Network connection error. Could not publish the announcement."
      );
      setMessageType("error");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans -mt-28 text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link
                href="/staff_login/login"
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

            {/* Back button */}
            <Link
              href="/admin_staff/admin/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 mt-2 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-md">
            {/* Decorative glow */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative z-10 max-w-2xl space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                <Megaphone className="h-3.5 w-3.5" />
                Executive Communication
              </span>

              <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                <Megaphone className="h-7 w-7 text-emerald-400" />
                Post New Announcement
              </h1>

              <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
                Publish important notices, updates, and communications for
                cooperative members.
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs sm:p-7">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label
                  htmlFor="title"
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  <FileText className="h-4 w-4 text-emerald-600" />
                  Announcement Title
                </label>

                <input
                  id="title"
                  type="text"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter announcement title"
                  required
                  maxLength={255}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label
                  htmlFor="content"
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  <Megaphone className="h-4 w-4 text-emerald-600" />
                  Announcement Content
                </label>

                <textarea
                  id="content"
                  name="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write announcement..."
                  required
                  rows={8}
                  className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />

                <div className="flex justify-end">
                  <span className="text-[10px] font-medium text-slate-400">
                    {content.length} characters
                  </span>
                </div>
              </div>

              {/* Expiry */}
              <div className="space-y-2">
                <label
                  htmlFor="expiry"
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  <Clock3 className="h-4 w-4 text-emerald-600" />
                  Announcement Expiry
                </label>

                <select
                  id="expiry"
                  name="expiry_option"
                  value={expiryOption}
                  onChange={(e) =>
                    setExpiryOption(e.target.value as ExpiryOption)
                  }
                  required
                  className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="1_day">1 Day</option>
                  <option value="1_week">1 Week</option>
                  <option value="1_month">1 Month</option>
                  <option value="1_year">1 Year</option>
                  <option value="custom">Custom Date</option>
                </select>
              </div>

              {/* Custom date */}
              {expiryOption === "custom" && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <label
                    htmlFor="custom_date"
                    className="mb-2 flex items-center gap-2 text-xs font-bold text-emerald-800"
                  >
                    <CalendarDays className="h-4 w-4 text-emerald-600" />
                    Select Expiry Date
                  </label>

                  <input
                    id="custom_date"
                    type="date"
                    name="custom_date"
                    value={customDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setCustomDate(e.target.value)}
                    required
                    className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />

                  <p className="mt-2 text-[10px] font-medium text-emerald-700">
                    The announcement will expire at 11:59 PM on the selected
                    date.
                  </p>
                </div>
              )}

              {/* Message */}
              {message && (
                <div
                  className={`flex items-start gap-3 rounded-2xl border p-4 text-xs font-semibold ${
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

                  <span>{message}</span>
                </div>
              )}

              {/* Submit */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <Link
                  href="/admin_staff/admin/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={isPublishing}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Publish Announcement
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Information Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Shield className="h-4 w-4" />
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  Executive Communication
                </h3>

                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Published announcements can be made available to cooperative
                  members until their configured expiry date.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} DCG Multipurpose Cooperative
            Society Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
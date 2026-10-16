"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SupportNavbar from "@/components/navigation/SupportNavbar";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  ChevronDown,
  MessageSquare,
  HelpCircle,
  Clock,
} from "lucide-react";

interface Announcement {
  title: string;
  content: string;
  created_at: string;
  expiry_date: string | null;
}

export default function AnnouncementPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch("/api/announcements", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load announcements.");
        }

        setAnnouncements(data.announcements || []);
      } catch (err) {
        console.error("Failed to fetch announcements:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load announcements."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const toggleAnnouncement = (index: number) => {
    setExpanded((current) => (current === index ? null : index));
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getShortText = (content: string) => {
    const words = content.trim().split(/\s+/);

    if (words.length <= 30) {
      return {
        shortText: content,
        hasMore: false,
      };
    }

    return {
      shortText: words.slice(0, 30).join(" "),
      hasMore: true,
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* =========================
          NAVIGATION BAR
      ========================== */}
        <SupportNavbar />

      {/* =========================
          MAIN CONTENT
      ========================== */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 -mt-24 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">
          <div className="relative">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative z-10">
              <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                <Bell className="h-3.5 w-3.5" />
                Member Communication
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Latest Announcements
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
                Stay informed about important updates, loan services, savings,
                fixed deposits, and other activities of DCG Multipurpose
                Cooperative Society Ltd.
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

            <p className="text-sm font-medium text-slate-600">
              Loading announcements...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <Bell className="h-5 w-5" />
            </div>

            <h2 className="text-sm font-bold text-rose-800">
              Unable to load announcements
            </h2>

            <p className="mt-1 text-sm text-rose-600">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* No Announcements */}
        {!loading && !error && announcements.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Bell className="h-7 w-7" />
            </div>

            <h2 className="text-base font-bold text-slate-900">
              No announcements available
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              There are currently no active announcements. Please check again
              later for new updates.
            </p>
          </div>
        )}

        {/* Announcements */}
        {!loading && !error && announcements.length > 0 && (
          <div className="space-y-4">
            {announcements.map((announcement, index) => {
              const { shortText, hasMore } = getShortText(
                announcement.content
              );

              const isExpanded = expanded === index;

              return (
                <article
                  key={`${announcement.created_at}-${index}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
                >
                  {/* Announcement Header */}
                  <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                        <Bell className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                          {announcement.title}
                        </h2>

                        {/* Dates */}
                        <div className="mt-2 flex flex-col gap-1.5 text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />
                            Posted:{" "}
                            {formatDateTime(announcement.created_at)}
                          </span>

                          {announcement.expiry_date && (
                            <span className="inline-flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-amber-600" />
                              Expires:{" "}
                              {formatExpiryDate(announcement.expiry_date)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Announcement Content */}
                  <div className="px-5 py-5 sm:px-6">
                    <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                      {isExpanded || !hasMore
                        ? announcement.content
                        : `${shortText}...`}
                    </p>

                    {/* Show More / Less */}
                    {hasMore && (
                      <button
                        type="button"
                        onClick={() => toggleAnnouncement(index)}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        {isExpanded ? "Show Less" : "Show More"}

                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* =========================
          FOOTER
      ========================== */}
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
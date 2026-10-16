"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";


import {
  Menu,
  X,
  Megaphone,
  LogOut,
  ArrowLeft,
  PenTool,
  FileText,
} from "lucide-react";

const navigation = [
  {
    label: "Back",
    href: "/member/document/dashboard",
    icon: ArrowLeft,
  },
  {
    label: "E-Signature",
    href: "/member/document/e-signature",
    icon: PenTool,
  },
  {
    label: "Documents",
    href: "/member/document/dashboard",
    icon: FileText,
  },
];

export default function DocumentNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* ======================================================
          EXECUTIVE DOCUMENT NAVBAR
      ======================================================= */}

      <nav className="fixed left-0 top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="flex h-[76px] items-center justify-between">

            {/* ==================================================
                BRAND
            =================================================== */}

            <Link
              href="/member/dashboard"
              className="group flex items-center gap-3"
              aria-label="DCG Cooperative Documents"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 p-1.5 shadow-sm">
                <Image
                  src="/images/logo2.png"
                  alt="DCG Multipurpose Cooperative Society Logo"
                  width={120}
                  height={50}
                  className="h-10 w-auto object-contain"
                  priority
                />
              </div>

              <div className="hidden sm:block">
                <p className="text-base font-extrabold tracking-tight text-slate-900">
                  DCG Cooperative
                </p>

                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Documents Portal
                </p>
              </div>
            </Link>

            {/* ==================================================
                DESKTOP NAVIGATION
            =================================================== */}

            <div className="hidden items-center gap-1 lg:flex">
              {navigation.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Icon className="h-4 w-4 text-slate-400 transition group-hover:text-slate-700" />

                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* ==================================================
                MEMBER AREA / MOBILE MENU
            =================================================== */}

            <div className="flex items-center gap-3">

              {/* Notification */}

              <button
                type="button"
                className="relative hidden h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 sm:flex"
                aria-label="Notifications"
              >
                <Megaphone className="h-5 w-5" />

                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </button>

              {/* Divider */}

              <div className="hidden h-9 w-px bg-slate-200 sm:block" />

              {/* Member Profile */}

              <Link
                href="/member_reset_password"
                className="hidden items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-50 sm:flex"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  ME
                </div>

                <div className="hidden text-left md:block">
                  <p className="text-sm font-bold text-slate-900">
                    Member
                  </p>

                  <p className="text-xs font-medium text-slate-400">
                    Member Account
                  </p>
                </div>
              </Link>

              {/* Mobile Menu Button */}

              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen((value) => !value)
                }
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 lg:hidden"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>

            </div>
          </div>

          {/* ==================================================
              MOBILE NAVIGATION
          =================================================== */}

          {mobileMenuOpen && (
            <div className="border-t border-slate-200 bg-white py-4 shadow-lg lg:hidden">

              <div className="grid gap-1">

                {navigation.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      <Icon className="h-5 w-5 text-slate-400" />

                      {item.label}
                    </Link>
                  );
                })}

                {/* ==================================================
                    MOBILE ACCOUNT
                =================================================== */}

                <div className="mt-3 border-t border-slate-200 pt-3">

                  <Link
                    href="/member_reset_password"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                      ME
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Member Account
                      </p>

                      <p className="text-xs text-slate-400">
                        Account Settings
                      </p>
                    </div>
                  </Link>

                </div>

                {/* ==================================================
                    LOGOUT
                =================================================== */}

                <div className="mt-2 border-t border-slate-200 pt-2">

                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50"
                  >
                    <LogOut className="h-5 w-5" />

                    Logout
                  </Link>

                </div>

              </div>
            </div>
          )}

        </div>
      </nav>

      {/* ======================================================
          NAVBAR SPACER
      ======================================================= */}

      <div className="h-[76px]" />
    </>
  );
}
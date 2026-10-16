"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Home as HomeIcon,
  Info,
  Phone,
  HelpCircle,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* =========================================================
            LOGO
        ========================================================= */}
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="flex items-center gap-3"
        >
          <Image
            src="/images/logo2.png"
            alt="DCG Cooperative Logo"
            width={140}
            height={40}
            className="h-10 w-auto object-contain sm:h-11"
            priority
          />

          <div className="hidden sm:block">
            <h2 className="text-base font-extrabold tracking-tight text-slate-900">
              DCG Cooperative
            </h2>

            <p className="text-[10px] text-slate-500">
              Multipurpose Cooperative Society Ltd.
            </p>
          </div>
        </Link>

        {/* =========================================================
            DESKTOP NAVIGATION
        ========================================================= */}
        <nav className="hidden items-center gap-6 lg:flex">

          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
          >
            <HomeIcon className="h-4 w-4" />
            Home
          </Link>

          <Link
            href="/about"
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-emerald-600"
          >
            <Info className="h-4 w-4" />
            About
          </Link>

          <Link
            href="/contact"
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-emerald-600"
          >
            <Phone className="h-4 w-4" />
            Contact
          </Link>

          <Link
            href="/faq"
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-emerald-600"
          >
            <HelpCircle className="h-4 w-4" />
            FAQ
          </Link>

        </nav>

        {/* =========================================================
            DESKTOP BUTTONS
        ========================================================= */}
        <div className="hidden items-center gap-2 lg:flex">

          <Link
            href="/login"
            className="rounded-xl border border-emerald-600 px-4 py-2 text-xs font-bold text-emerald-600 transition-colors hover:bg-emerald-50"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
          >
            Register
          </Link>

          <Link
            href="/staff_login"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-slate-800"
          >
            <LayoutDashboard className="h-4 w-4 text-emerald-400" />
            Staff
          </Link>

        </div>

        {/* =========================================================
            MOBILE MENU BUTTON
        ========================================================= */}
        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 lg:hidden"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

      </div>

      {/* =========================================================
          MOBILE NAVIGATION
      ========================================================= */}
      <div
        className={`overflow-hidden border-t border-slate-100 bg-white transition-all duration-300 lg:hidden ${
          mobileOpen
            ? "max-h-[600px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">

          <div className="flex flex-col gap-2">

            {/* Home */}
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700"
            >
              <HomeIcon className="h-4 w-4" />
              Home
            </Link>

            {/* About */}
            <Link
              href="/about"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-emerald-600"
            >
              <Info className="h-4 w-4" />
              About Us
            </Link>

            {/* Contact */}
            <Link
              href="/contact"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-emerald-600"
            >
              <Phone className="h-4 w-4" />
              Contact Us
            </Link>

            {/* FAQ */}
            <Link
              href="/faq"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-emerald-600"
            >
              <HelpCircle className="h-4 w-4" />
              FAQ
            </Link>

            <div className="my-2 h-px bg-slate-100" />

            {/* Mobile Buttons */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">

              <Link
                href="/login"
                onClick={closeMobileMenu}
                className="rounded-xl border border-emerald-600 px-4 py-3 text-center text-sm font-bold text-emerald-600 transition-colors hover:bg-emerald-50"
              >
                Login
              </Link>

              <Link
                href="/register"
                onClick={closeMobileMenu}
                className="rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-emerald-700"
              >
                Register
              </Link>

              <Link
                href="/staff/login"
                onClick={closeMobileMenu}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
              >
                <LayoutDashboard className="h-4 w-4 text-emerald-400" />
                Staff Portal
              </Link>

            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
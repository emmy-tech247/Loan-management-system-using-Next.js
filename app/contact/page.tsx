import Image from "next/image";
import Link from "next/link";
import ContactForm from "@/components/contact/ContactForm";


import {
  Home as HomeIcon,
  Info,
  Phone,
  HelpCircle,
  LayoutDashboard,
} from "lucide-react";

export const metadata = {
  title: "Contact Us - DCG",
  description:
    "Get in touch with DCG Multipurpose Cooperative Society Ltd.",
};

export default function ContactPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* =========================================================
          NAVBAR
      ========================================================= */}
      <header className="fixed left-0 top-0 z-50 w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
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

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 lg:flex">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-emerald-600"
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

            {/* Active Contact */}
            <Link
              href="/contact"
              className="flex items-center gap-2 text-sm font-bold text-emerald-600 transition-colors hover:text-emerald-700"
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

          {/* Desktop Buttons */}
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

          {/* Mobile Menu */}
          <Link
            href="/"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 lg:hidden"
          >
            Home
          </Link>
        </div>
      </header>

      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}
      <main className="mx-auto w-full max-w-7xl px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">
            <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative z-10 max-w-2xl space-y-3">
              <span className="inline-flex rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                DCG Cooperative Support
              </span>

              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Contact Us
              </h1>

              <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
                Have a question, need assistance, or want to learn more about
                our cooperative services? Send us a message and our team will
                get back to you.
              </p>
            </div>
          </section>

          {/* Contact Layout */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Contact Information */}
            <div className="space-y-6 lg:col-span-1">
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg">
                    📞
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900">
                  Get in Touch
                </h2>

                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Our team is available to answer questions about membership,
                  savings, investments, loans, and other cooperative services.
                </p>

                <div className="mt-6 space-y-4">
                  {/* Phone */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Phone
                    </p>

                    <a
                      href="tel:+2348150915060"
                      className="mt-1 block text-sm font-bold text-slate-800 transition-colors hover:text-emerald-600"
                    >
                      +234 815 091 5060
                    </a>

                    <a
                      href="tel:+2347057745805"
                      className="mt-1 block text-sm font-bold text-slate-800 transition-colors hover:text-emerald-600"
                    >
                      +234 705 774 5805
                    </a>

                    <a
                      href="tel:+2348111586734"
                      className="mt-1 block text-sm font-bold text-slate-800 transition-colors hover:text-emerald-600"
                    >
                      +234 811 158 6734
                    </a>
                  </div>

                  {/* Email */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Email
                    </p>

                    <a
                      href="mailto:dcgcoopltd@gmail.com"
                      className="mt-1 block break-all text-sm font-bold text-slate-800 transition-colors hover:text-emerald-600"
                    >
                      dcgcoopltd@gmail.com
                    </a>
                  </div>

                  {/* Office */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Office
                    </p>

                    <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-700">
                      Plot A506U/A506W, Mpape II Layout,
                      <br />
                      Back of Crush Rock, Mpape,
                      <br />
                      Abuja, Nigeria.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Help */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                    ✓
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-emerald-900">
                      Need Quick Assistance?
                    </h3>

                    <p className="mt-1 text-xs leading-relaxed text-emerald-800">
                      For urgent inquiries, you can contact our team directly
                      using the phone numbers provided above.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6 border-b border-slate-100 pb-5">
                  <h2 className="text-xl font-bold text-slate-900">
                    Send Us a Message
                  </h2>

                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Fill out the form below and provide as much detail as
                    possible so we can assist you effectively.
                  </p>
                </div>

                <ContactForm />
              </div>
            </div>
          </section>

          {/* Bottom CTA */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  DCG Multipurpose Cooperative Society Ltd.
                </span>

                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  Ready to become part of our community?
                </h2>

                <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
                  Explore our cooperative services or create an account to
                  begin your journey with DCG.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/about"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
                >
                  Learn More
                </Link>

                <Link
                  href="/register"
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md"
                >
                  Register Now
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="mt-auto border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500">
            &copy; {currentYear} DCG Multipurpose Cooperative Society Ltd. All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

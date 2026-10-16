"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Clock3,
  DollarSign,
  Mail,
  Phone,
  PiggyBank,
  TrendingUp,
  Wallet,
  X,
  Menu,
  Home as HomeIcon,
  Info,
  HelpCircle,
  LayoutDashboard,
} from "lucide-react";

interface SelectedTier {
  range: string;
  rates: {
    years: number;
    rate: number;
  }[];
}

interface FixedDepositTier {
  range: string;
  rates: number[];
}

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SelectedTier | null>(null);

  // Investment amount entered by the user
  const [investmentAmount, setInvestmentAmount] = useState("");

  // ============================================================
  // FIXED DEPOSIT INVESTMENT RATES
  // ============================================================

  const fixedDepositData: FixedDepositTier[] = [
    {
      range: "₦1M and below Investment",
      rates: [20, 45, 75, 110, 150],
    },
    {
      range: "Above ₦1M to ₦5M Investment",
      rates: [21, 48, 80, 120, 165],
    },
    {
      range: "Above ₦5M to ₦10M Investment",
      rates: [22, 50, 83, 130, 175],
    },
    {
      range: "Above ₦10M to ₦20M Investment",
      rates: [23, 53, 90, 135, 185],
    },
    {
      range: "Above ₦20M Investment",
      rates: [24, 55, 92, 140, 200],
    },
  ];

  // ============================================================
  // SERVICES
  // ============================================================

  const services = [
    {
      name: "Credit Facilities",
      description:
        "Flexible financial support designed around members' needs.",
      image: "/images/dcg_credit.png",
      icon: Wallet,
    },
    {
      name: "Real Estate",
      description:
        "Investment and property opportunities for members.",
      image: "/images/dcg_estate.png",
      icon: Building2,
    },
    {
      name: "Financial Mentoring",
      description:
        "Practical guidance to help members make better financial decisions.",
      image: "/images/dcg_finance.png",
      icon: TrendingUp,
    },
    {
      name: "Fish Farming",
      description:
        "Agricultural investment opportunities through sustainable farming.",
      image: "/images/dcg_farming.png",
      icon: PiggyBank,
    },
  ];

  // ============================================================
  // BORROWING RATES
  // ============================================================

  const borrowingRates = [
    {
      number: 1,
      amount: "Amount less than or equal to your saved amount",
      rate: "2%",
    },
    {
      number: 2,
      amount: "Amount 2 times your saved amount",
      rate: "3%",
    },
    {
      number: 3,
      amount: "Amount 3 times your saved amount",
      rate: "4%",
    },
    {
      number: 4,
      amount: "Amount 4 times your saved amount",
      rate: "5%",
    },
    {
      number: 5,
      amount: "Amount 5 times and above your saved amount",
      rate: "6%",
    },
  ];

  // ============================================================
  // FORMAT CURRENCY
  // ============================================================

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // ============================================================
  // SHOW EARNINGS MODAL
  // ============================================================

  const handleShowEarnings = (tier: FixedDepositTier) => {
    setSelectedTier({
      range: tier.range,
      rates: tier.rates.map((rate, index) => ({
        years: index + 1,
        rate,
      })),
    });

    // Reset previous amount whenever another tier is opened
    setInvestmentAmount("");

    setModalOpen(true);
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTier(null);
    setInvestmentAmount("");
  };

  // ============================================================
  // CLOSE MOBILE MENU
  // ============================================================

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  // ============================================================
  // SANITIZE INVESTMENT INPUT
  // ============================================================

  const handleInvestmentAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    // Allow only numbers and decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setInvestmentAmount(value);
    }
  };

  // ============================================================
  // CURRENT INVESTMENT AMOUNT
  // ============================================================

  const numericInvestmentAmount =
    Number(investmentAmount.replace(/,/g, "")) || 0;

  // ============================================================
  // MONTHLY DIVIDEND CALCULATION
  // 1.5% PER MONTH
  // ============================================================

  const monthlyDividend =
    numericInvestmentAmount > 0
      ? numericInvestmentAmount * 0.015
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <header className="fixed left-0 top-0 z-50 w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Logo */}

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

          {/* Desktop Navigation */}

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
              href="/staff_login/login"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-slate-800"
            >
              <LayoutDashboard className="h-4 w-4 text-emerald-400" />
              Staff
            </Link>
          </div>

          {/* Mobile Menu Button */}

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

        {/* Mobile Navigation */}

        <div
          className={`overflow-hidden border-t border-slate-100 bg-white transition-all duration-300 lg:hidden ${
            mobileOpen
              ? "max-h-[600px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
            <div className="flex flex-col gap-2">

              <Link
                href="/"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700"
              >
                <HomeIcon className="h-4 w-4" />
                Home
              </Link>

              <Link
                href="/about"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-emerald-600"
              >
                <Info className="h-4 w-4" />
                About Us
              </Link>

              <Link
                href="/contact"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-emerald-600"
              >
                <Phone className="h-4 w-4" />
                Contact Us
              </Link>

              <Link
                href="/faq"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-emerald-600"
              >
                <HelpCircle className="h-4 w-4" />
                FAQ
              </Link>

              <div className="my-2 h-px bg-slate-100" />

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
                  href="/staff_login/login"
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

      {/* =========================================================
          HERO
      ========================================================= */}

      <header className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pt-20 text-white">

        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-emerald-400/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">

          <div className="grid items-center gap-12 lg:grid-cols-[1.4fr_0.6fr]">

            {/* Hero content */}

            <div className="max-w-3xl">

              <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-400/20">
                <Building2 className="h-3.5 w-3.5" />
                FCTA Registered Cooperative Society
              </span>

              <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                DCG MULTI-PURPOSE
                <span className="block text-emerald-400">
                  COOPERATIVE SOCIETY LIMITED
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Building financial strength through savings, investments,
                credit facilities, real estate, agriculture, and practical
                financial mentorship for our members.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">

                <a
                  href="#services"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-400"
                >
                  Explore Our Services
                  <ArrowRight className="h-4 w-4" />
                </a>

                <a
                  href="#investments"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
                >
                  Investment Rates
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                </a>

              </div>
            </div>

            {/* Hero stats */}

            <div className="grid grid-cols-2 gap-3">

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <DollarSign className="h-5 w-5 text-emerald-400" />

                <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Fixed Deposit
                </p>

                <p className="mt-1 text-2xl font-extrabold text-white">
                  20–200%
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  Depending on tenure
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <Clock3 className="h-5 w-5 text-emerald-400" />

                <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Tenure
                </p>

                <p className="mt-1 text-2xl font-extrabold text-white">
                  1–5
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  Years available
                </p>
              </div>

              <div className="col-span-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                    <Wallet className="h-4 w-4" />
                  </div>

                  <div>

                    <p className="text-xs font-bold text-emerald-300">
                      Monthly Dividend Option
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-300">
                      Investments intended for monthly dividends attract a
                      rate of 1.5% per month.
                    </p>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================
          MAIN
      ========================================================= */}

      <main className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
{/* =======================================================
    SERVICES
======================================================= */}

<section id="services">

  <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

    <div>

      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
        What We Do
      </span>

      <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
        Our Services
      </h2>

      <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
        Financial and investment solutions designed to support the
        growth of our cooperative members.
      </p>

    </div>
  </div>

  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

    {services.map((service) => {

      const Icon = service.icon;

      return (
        <div
          key={service.name}
          className="group overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
        >

          {/* SERVICE IMAGE */}

          <div className="relative h-56 w-full overflow-hidden bg-slate-100 sm:h-64">

            <Image
              src={service.image}
              alt={service.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

            <div className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 text-slate-800 shadow-sm">
              <Icon className="h-4 w-4" />
            </div>

          </div>

          {/* SERVICE CONTENT */}

          <div className="p-5">

            <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">
              {service.name}
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              {service.description}
            </p>

            <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              Learn More
              <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>

          </div>

        </div>
      );
    })}

  </div>
</section>

        {/* =======================================================
            QUICK INFORMATION
        ======================================================= */}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">

            <div className="flex items-start gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <PiggyBank className="h-5 w-5" />
              </div>

              <div>

                <h3 className="text-sm font-extrabold text-emerald-900">
                  Monthly Savings
                </h3>

                <p className="mt-2 text-xs leading-6 text-emerald-800/80">
                  Join our monthly savings programme and earn{" "}
                  <strong className="font-extrabold text-emerald-900">
                    100%
                  </strong>{" "}
                  of your monthly savings amount as dividends after 12 months.
                </p>

              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-start gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Calculator className="h-5 w-5" />
              </div>

              <div>

                <h3 className="text-sm font-extrabold text-slate-900">
                  Borrowing Rates
                </h3>

                <p className="mt-2 text-xs leading-6 text-slate-500">
                  Borrowing rates are determined relative to the member's
                  total saved amount and applicable loan tier.
                </p>

              </div>
            </div>
          </div>
        </section>

        {/* =======================================================
            FIXED DEPOSIT
        ======================================================= */}

        <section
          id="investments"
          className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm"
        >

          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-6 text-white sm:px-8">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Investment Opportunities
                </span>

                <h2 className="mt-1 text-xl font-extrabold">
                  Fixed Deposit Dividends
                </h2>

                <p className="mt-1 text-xs text-slate-300">
                  Review available investment ranges and projected return
                  rates.
                </p>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <TrendingUp className="h-5 w-5" />
              </div>

            </div>
          </div>

          <div className="p-4 sm:p-6">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px] border-collapse text-left text-xs">

                <thead>

                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">

                    <th className="p-3 font-bold">
                      Investment Range
                    </th>

                    <th className="p-3 font-bold">
                      1 Year
                    </th>

                    <th className="p-3 font-bold">
                      2 Years
                    </th>

                    <th className="p-3 font-bold">
                      3 Years
                    </th>

                    <th className="p-3 font-bold">
                      4 Years
                    </th>

                    <th className="p-3 font-bold">
                      5 Years
                    </th>

                    <th className="p-3 text-center font-bold">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {fixedDepositData.map((tier) => (

                    <tr
                      key={tier.range}
                      className="transition-colors hover:bg-slate-50"
                    >

                      <td className="p-3 font-bold text-slate-900">
                        {tier.range}
                      </td>

                      {tier.rates.map((rate, index) => (

                        <td
                          key={`${tier.range}-${index}`}
                          className="p-3 font-semibold text-slate-700"
                        >
                          {rate}%
                        </td>

                      ))}

                      <td className="p-3 text-center">

                        <button
                          type="button"
                          onClick={() => handleShowEarnings(tier)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-[10px] font-bold text-white transition-colors hover:bg-emerald-600"
                        >
                          Check Earnings
                          <ChevronRight className="h-3 w-3" />
                        </button>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">

              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

              <p className="leading-5">

                <strong className="font-extrabold">
                  Important:
                </strong>{" "}

                Investment of any amount with the intention of receiving
                monthly dividends shall be at{" "}

                <strong>
                  1.5% per month.
                </strong>

              </p>

            </div>
          </div>
        </section>

        {/* =======================================================
            BORROWING RATE
        ======================================================= */}

        <section className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-6 sm:px-8">

            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Loan Structure
            </span>

            <h2 className="mt-1 text-xl font-extrabold text-slate-900">
              Borrowing Rate Tier Structure
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Rates are calculated according to the relationship between the
              requested amount and your total saved amount.
            </p>

          </div>

          <div className="p-4 sm:p-6">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[650px] border-collapse text-left text-xs">

                <thead>

                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">

                    <th className="p-3 font-bold">
                      S/No
                    </th>

                    <th className="p-3 font-bold">
                      Amount
                    </th>

                    <th className="p-3 font-bold">
                      Rate
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {borrowingRates.map((item) => (

                    <tr
                      key={item.number}
                      className="transition-colors hover:bg-slate-50"
                    >

                      <td className="p-3">

                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-700">
                          {item.number}
                        </span>

                      </td>

                      <td className="p-3 font-medium text-slate-700">
                        {item.amount}
                      </td>

                      <td className="p-3">

                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700">
                          {item.rate}
                        </span>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>
            </div>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">

              <div className="flex items-start gap-3">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <Clock3 className="h-4 w-4" />
                </div>

                <div>

                  <p className="text-xs font-extrabold text-amber-900">
                    Borrowing Policy
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-800">
                    Borrowers must make monthly interest payments at{" "}
                    <strong>7%</strong> for up to 6 months before refunding
                    capital.
                  </p>

                </div>

              </div>
            </div>

          </div>
        </section>

        {/* =======================================================
            CALL TO ACTION
        ======================================================= */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">

          <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Grow With Us
              </span>

              <h2 className="mt-1 text-xl font-extrabold">
                Build your financial future with DCG
              </h2>

              <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-300">
                Save, invest, access credit facilities, and participate in
                opportunities created for cooperative members.
              </p>

            </div>

            <a
              href="mailto:dcgcoopltd@gmail.com"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-xs font-bold text-white transition-colors hover:bg-emerald-400"
            >
              Contact Us
              <ArrowRight className="h-4 w-4" />
            </a>

          </div>
        </section>

      </main>

      {/* =========================================================
          EARNINGS MODAL
      ========================================================= */}

      {modalOpen && selectedTier && (

        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="earnings-modal-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >

          <div className="my-8 w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">

            {/* Modal Header */}

            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-6 text-white">

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <TrendingUp className="h-5 w-5" />
              </div>

              <h3
                id="earnings-modal-title"
                className="mt-4 text-lg font-extrabold"
              >
                Investment Earnings Calculator
              </h3>

              <p className="mt-1 pr-8 text-xs text-slate-300">
                {selectedTier.range}
              </p>

            </div>

            {/* Modal Body */}

            <div className="p-5 sm:p-6">

              {/* Investment Amount */}

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

                <label
                  htmlFor="investmentAmount"
                  className="block text-xs font-extrabold text-emerald-900"
                >
                  Enter Investment Amount
                </label>

                <p className="mt-1 text-[11px] leading-5 text-emerald-800/80">
                  Enter the amount you intend to invest to calculate your
                  estimated return for each available tenure.
                </p>

                <div className="relative mt-3">

                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                    ₦
                  </span>

                  <input
                    id="investmentAmount"
                    type="text"
                    inputMode="decimal"
                    value={investmentAmount}
                    onChange={handleInvestmentAmountChange}
                    placeholder="Enter amount e.g. 1000000"
                    className="w-full rounded-xl border border-emerald-200 bg-white py-3 pl-8 pr-4 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />

                </div>

                {numericInvestmentAmount > 0 && (

                  <div className="mt-3 flex items-center justify-between rounded-xl bg-white px-3 py-2">

                    <span className="text-[10px] font-semibold text-slate-500">
                      Investment Amount
                    </span>

                    <span className="text-xs font-extrabold text-emerald-700">
                      {formatCurrency(numericInvestmentAmount)}
                    </span>

                  </div>

                )}

              </div>

              {/* Calculation Formula */}

              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">

                <div className="flex items-start gap-2">

                  <Calculator className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />

                  <div>

                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                      Calculation
                    </p>

                    <p className="mt-1 text-xs font-semibold text-slate-700">
                      Investment Amount × Rate ÷ 100 = Estimated Return
                    </p>

                  </div>

                </div>
              </div>

              {/* Earnings Table */}

              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[650px] border-collapse text-left text-xs">

                    <thead>

                      <tr className="border-b border-slate-200 bg-slate-50">

                        <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Duration
                        </th>

                        <th className="p-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Rate
                        </th>

                        <th className="p-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Estimated Return
                        </th>

                        <th className="p-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Total Value
                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-slate-100">

                      {selectedTier.rates.map((item) => {

                        const estimatedReturn =
                          numericInvestmentAmount > 0
                            ? numericInvestmentAmount *
                              (item.rate / 100)
                            : 0;

                        const totalValue =
                          numericInvestmentAmount +
                          estimatedReturn;

                        return (

                          <tr
                            key={item.years}
                            className="transition-colors hover:bg-slate-50"
                          >

                            <td className="p-3 font-bold text-slate-800">

                              {item.years} Year
                              {item.years > 1 ? "s" : ""}

                            </td>

                            <td className="p-3 text-right">

                              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700">
                                {item.rate}%
                              </span>

                            </td>

                            <td className="p-3 text-right font-extrabold text-emerald-700">

                              {numericInvestmentAmount > 0
                                ? formatCurrency(estimatedReturn)
                                : "—"}

                            </td>

                            <td className="p-3 text-right font-extrabold text-slate-900">

                              {numericInvestmentAmount > 0
                                ? formatCurrency(totalValue)
                                : "—"}

                            </td>

                          </tr>

                        );
                      })}

                    </tbody>

                  </table>

                </div>
              </div>

              {/* Example / Result Information */}

              {numericInvestmentAmount > 0 ? (

                <div className="mt-5 space-y-3">

                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

                    <div className="flex items-start gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <TrendingUp className="h-4 w-4" />
                      </div>

                      <div>

                        <p className="text-xs font-extrabold text-emerald-900">
                          Investment Calculation
                        </p>

                        <p className="mt-1 text-xs leading-5 text-emerald-800">

                          If you invest{" "}

                          <strong>
                            {formatCurrency(numericInvestmentAmount)}
                          </strong>
                          , your estimated return depends on the selected
                          tenure and applicable rate.

                        </p>

                      </div>

                    </div>
                  </div>

                  {/* Monthly Dividend */}

                  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">

                    <div className="flex items-start gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                        <Wallet className="h-4 w-4" />
                      </div>

                      <div className="flex-1">

                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                          <p className="text-xs font-extrabold text-blue-900">
                            Monthly Dividend Option
                          </p>

                          <span className="inline-flex w-fit rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-extrabold text-blue-700">
                            1.5% / Month
                          </span>

                        </div>

                        <p className="mt-1 text-xs leading-5 text-blue-800">

                          At 1.5% per month, the estimated monthly dividend
                          would be{" "}

                          <strong>
                            {formatCurrency(monthlyDividend)}
                          </strong>
                          .

                        </p>

                      </div>

                    </div>

                  </div>

                </div>

              ) : (

                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">

                  <Calculator className="mx-auto h-6 w-6 text-slate-400" />

                  <p className="mt-2 text-xs font-semibold text-slate-600">
                    Enter an investment amount above to see your estimated
                    returns.
                  </p>

                </div>

              )}

              {/* Important Notice */}

              <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">

                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

                <p className="text-xs leading-5 text-amber-800">

                  <strong className="font-extrabold">
                    Important:
                  </strong>{" "}

                  The figures shown are estimated returns based on the stated
                  rates. Monthly dividend investments use a separate rate of
                  <strong> 1.5% per month.</strong>

                </p>

              </div>

              {/* Close Button */}

              <button
                type="button"
                onClick={closeModal}
                className="mt-5 w-full rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Close
              </button>

            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="mt-10 border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">

            <div>

              <Image
                src="/images/logo2.png"
                alt="DCG Cooperative Logo"
                width={140}
                height={40}
                className="h-10 w-auto object-contain"
              />

              <p className="mt-4 max-w-md text-xs leading-6 text-slate-500">
                DCG Multipurpose Cooperative Society Limited provides savings,
                investment, credit, and business opportunities to help members
                achieve greater financial stability.
              </p>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-600">

                <CheckCircle2 className="h-3 w-3 text-emerald-600" />

                FCTA/ARDS/COOP/2019/3185

              </div>

            </div>

            <div>

              <h3 className="text-sm font-extrabold text-slate-900">
                Contact Us
              </h3>

              <div className="mt-4 space-y-3">

                <a
                  href="tel:+2348150915060"
                  className="flex items-center gap-3 text-xs text-slate-500 transition-colors hover:text-emerald-600"
                >

                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Phone className="h-3.5 w-3.5" />
                  </span>

                  +234 815 091 5060

                </a>

                <a
                  href="tel:+2347057745805"
                  className="flex items-center gap-3 text-xs text-slate-500 transition-colors hover:text-emerald-600"
                >

                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Phone className="h-3.5 w-3.5" />
                  </span>

                  +234 705 774 5805

                </a>

                <a
                  href="tel:+2348111586734"
                  className="flex items-center gap-3 text-xs text-slate-500 transition-colors hover:text-emerald-600"
                >

                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Phone className="h-3.5 w-3.5" />
                  </span>

                  +234 811 158 6734

                </a>

                <a
                  href="mailto:dcgcoopltd@gmail.com"
                  className="flex items-center gap-3 text-xs text-slate-500 transition-colors hover:text-emerald-600"
                >

                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Mail className="h-3.5 w-3.5" />
                  </span>

                  dcgcoopltd@gmail.com

                </a>

              </div>

            </div>

          </div>

          <div className="mt-8 border-t border-slate-200 pt-6 text-center">

            <p className="text-[11px] text-slate-500">

              &copy; {new Date().getFullYear()} DCG Multipurpose Cooperative
              Society Ltd. All rights reserved.

            </p>

          </div>

        </div>

      </footer>
    </div>
  );
}
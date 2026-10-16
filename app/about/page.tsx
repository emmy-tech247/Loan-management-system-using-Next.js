import Link from "next/link";
import AboutNavbar from "@/components/navigation/AboutNavbar";

export const metadata = {
  title: "About Us - DCG Cooperative",
  description:
    "Learn more about DCG Multi-Purpose Cooperative Society Limited.",
};

export default function AboutPage() {
  const fixedDepositData = [
    {
      range: "₦1M and below Investment",
      rates: ["20%", "45%", "75%", "110%", "150%"],
    },
    {
      range: "Above ₦1M to ₦5M Investment",
      rates: ["21%", "48%", "80%", "120%", "165%"],
    },
    {
      range: "Above ₦5M to ₦10M Investment",
      rates: ["22%", "50%", "83%", "130%", "175%"],
    },
    {
      range: "Above ₦10M to ₦20M Investment",
      rates: ["23%", "53%", "90%", "135%", "185%"],
    },
    {
      range: "Above ₦20M Investment",
      rates: ["24%", "55%", "92%", "140%", "200%"],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar */}
      <AboutNavbar />

      {/* Hero */}
      <header className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-3xl">
            <span className="mb-4 inline-flex rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-300">
              ABOUT DCG COOPERATIVE
            </span>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              DCG Multi-Purpose Cooperative Society Ltd.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Prosperity built on integrity. We provide financial,
              investment, agricultural, real estate, educational, and
              humanitarian opportunities designed to support our members and
              community.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1.5 text-xs font-semibold text-slate-300">
                Established 2022
              </span>

              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                Prosperity Built on Integrity
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Overview */}
        <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg">
              🏢
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                About DCG Multi-Purpose Cooperative Society
              </h2>
              <p className="text-xs text-slate-500">
                Our story and organizational background
              </p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            DCG Multi-purpose Cooperative Society Limited, with the motto
            &quot;Prosperity Built on Integrity,&quot; was established in 2022
            as DCG Thrift and Loans Cooperative Society Limited. The
            organization&apos;s name was later changed to DCG Multi-purpose
            Cooperative Society Limited in 2023. We are registered with the
            Benue State Government and the Federal Capital Territory (FCT),
            Abuja.
          </p>
        </section>

        {/* Offices + Leadership */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Offices */}
          <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                📍
              </div>

              <h2 className="text-lg font-extrabold text-slate-900">
                Our Offices
              </h2>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                  Benue Office
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  B12, Suswam Plaza, New Garage, Wadata, Makurdi
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                  Abuja Office
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  Plot A506U/A506W, Mpape II Layout, back of Crush Rock, Mpape
                </p>
              </div>
            </div>
          </section>

          {/* Formation */}
          <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                👥
              </div>

              <h2 className="text-lg font-extrabold text-slate-900">
                Formation & Leadership
              </h2>
            </div>

            <p className="text-sm leading-relaxed text-slate-600">
              The cooperative is founded by 10 serious-minded personalities
              called initial founding members.{" "}
              <strong className="font-bold text-slate-900">
                Anyam T. Daniel Ph.D.
              </strong>{" "}
              is the President.
            </p>

            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-700">
                Registered Members
              </p>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Investors
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Those who invested their capital in the cooperative for
                    monthly or yearly dividends. Investment can be through
                    fixed deposits or monthly savings.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Borrowers
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Those who registered with the cooperative for the purpose
                    of borrowing.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs leading-relaxed text-amber-800">
                <strong>Note:</strong> One can be both an investor and a
                borrower if such a person invests for dividends and also
                borrows from the cooperative.
              </p>
            </div>
          </section>
        </div>

        {/* Management */}
        <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg">
              👔
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Cooperative Management
              </h2>
              <p className="text-xs text-slate-500">
                Experienced leadership and financial expertise
              </p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            The cooperative is managed by the Credit and Investment Experts
            Team, composed of experienced financial analysts. It is headed by
            the President,{" "}
            <strong className="text-slate-900">
              Dr. Anyam Daniel Terkimbi
            </strong>
            , a Chartered Accountant and Financial Expert. He leads the team
            with 11 dedicated members.
          </p>
        </section>

        {/* Services */}
        <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-extrabold text-slate-900">
              Services Offered
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Our key areas of operation
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Financial services (loans, savings, and investments)",
              "Real Estate",
              "Agrobusiness",
              "Education",
              "Other lucrative and legal businesses",
              "Humanitarian services",
            ].map((service) => (
              <div
                key={service}
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-emerald-200 hover:bg-emerald-50"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xs font-extrabold text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white">
                    ✓
                  </span>

                  <span className="text-sm font-medium leading-relaxed text-slate-700">
                    {service}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Investment */}
        <section className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-900 px-6 py-6 text-white sm:px-8">
            <h2 className="text-lg font-extrabold">
              Investment & Dividends
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Fixed deposit investment structure
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="rounded-tl-xl p-3 text-xs font-bold">
                      Investment Range
                    </th>
                    <th className="p-3 text-xs font-bold">1 Year</th>
                    <th className="p-3 text-xs font-bold">2 Years</th>
                    <th className="p-3 text-xs font-bold">3 Years</th>
                    <th className="p-3 text-xs font-bold">4 Years</th>
                    <th className="rounded-tr-xl p-3 text-xs font-bold">
                      5 Years
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {fixedDepositData.map((row, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                    >
                      <td className="p-3 font-semibold text-slate-900">
                        {row.range}
                      </td>

                      {row.rates.map((rate, rIdx) => (
                        <td
                          key={rIdx}
                          className="p-3 font-semibold text-emerald-700"
                        >
                          {rate}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs leading-relaxed text-emerald-800 sm:text-sm">
                👉 Investors may also opt for{" "}
                <strong className="font-extrabold text-emerald-900">
                  monthly dividends at 1.5% per month
                </strong>
                . Example: ₦20M investment yields ₦300,000 monthly while
                keeping the capital of ₦20M intact.
              </p>
            </div>

            <p className="mt-4 text-xs italic leading-relaxed text-slate-500">
              Note: Once investors deposit money to the designated cooperative
              account, the President issues investment certificates signed
              solely by him.
            </p>
          </div>
        </section>

        {/* Monthly Savings */}
        <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              💰
            </div>

            <h2 className="text-lg font-extrabold text-slate-900">
              Monthly Savings Dividends
            </h2>
          </div>

          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            Our monthly savings plan offers{" "}
            <strong className="font-extrabold text-slate-900">
              100% dividends
            </strong>{" "}
            on your monthly savings amount after 12 months. For example, if
            you save ₦100,000 monthly for 12 months, you will receive
            ₦1,300,000 instead of ₦1,200,000.
          </p>
        </section>

        {/* Borrowing Rates */}
        <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-extrabold text-slate-900">
              Borrowing Rates
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Rates relative to the member&apos;s saved amount
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [
                "Amount less than or equal to your Saved Amount",
                "2% per month",
              ],
              ["Amount 2 times your saved Amount", "2% per month"],
              ["Amount 3 times your saved Amount", "3% per month"],
              ["Amount 4 times your Saved Amount", "4% per month"],
              ["Amount 5 times your Saved Amount", "5% per month"],
              [
                "Loan to keep capital and service interest every month until capital is refunded",
                "7% per month",
              ],
            ].map(([description, rate], index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-xs leading-relaxed text-slate-600">
                  {description}
                </p>

                <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">
                  {rate}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs leading-relaxed text-emerald-800 sm:text-sm">
              However, monthly savers who joined the monthly savings up to one
              year can be admitted into DCG Multipurpose Cooperative Society
              Foundation where they can borrow:
            </p>

            <div className="mt-3 space-y-2 text-xs font-semibold text-emerald-900">
              <p>• 2 times savings at 12% per year.</p>
              <p>• 3 times savings at 18% per year.</p>
              <p>
                • Their first-year savings generating a minimum of 20% per
                year.
              </p>
            </div>
          </div>
        </section>

        {/* Foundation */}
        <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              📅
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                DCG Multipurpose Cooperative Society Foundation Launch
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                DCG Multipurpose Cooperative Society Foundation shall be
                launched on{" "}
                <strong className="text-slate-900">
                  December 5, 2025
                </strong>
                . This milestone will mark a significant step in our mission
                to empower our members and create a supportive community.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-extrabold text-slate-900">
              Benefits for Monthly Contributors
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Benefits available after reaching one year of savings
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {[
              {
                title: "Competitive Dividend Rates",
                text: "Keep earning a minimum of 20% per annum on their first-year savings, which will be converted to a fixed deposit.",
              },
              {
                title: "Savings Growth",
                text: "Earn 100% dividends on their monthly savings amount in a year.",
              },
              {
                title: "Access to Loans",
                text: "Borrow up to two times their total savings at 1% per month or three times their total savings at 1.5% per month.",
              },
              {
                title: "Free Financial Coaching",
                text: "Have free access to our financial coaching and consultation services.",
              },
              {
                title: "Social Responsibility Benefits",
                text: "Be opportune to benefit from the cooperative's social responsibility initiatives.",
              },
            ].map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-emerald-200 hover:bg-emerald-50"
              >
                <h3 className="text-sm font-bold text-slate-900">
                  {benefit.title}
                </h3>

                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                  {benefit.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Vision + Community */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              🎯
            </div>

            <h2 className="text-lg font-extrabold text-slate-900">
              Our Vision
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              The DCG Multipurpose Cooperative Society Foundation aims to create
              a supportive community that helps members build wealth and achieve
              their financial goals. We foster cooperation and mutual support,
              enabling members to thrive and live fulfilling lives.
            </p>
          </section>

          <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              🤝
            </div>

            <h2 className="text-lg font-extrabold text-slate-900">
              Join Our Community
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              By joining our community, you&apos;ll become part of a network of
              like-minded individuals who share a commitment to financial
              growth and well-being. We look forward to working together to
              achieve our goals.
            </p>
          </section>
        </div>

        {/* Contact CTA */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-md sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 text-center">
            <span className="inline-flex rounded-lg bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
              GET IN TOUCH
            </span>

            <h2 className="mt-3 text-xl font-extrabold sm:text-2xl">
              For Inquiries, Please Contact
            </h2>

            <div className="mt-5 space-y-2 text-sm text-slate-300">
              <p>
                <strong className="text-white">
                  Dr. Anyam Daniel Terkimbi
                </strong>{" "}
                (President):{" "}
                <a
                  href="tel:08162577877"
                  className="font-semibold text-emerald-300 underline decoration-emerald-500/50 underline-offset-2 hover:text-emerald-200"
                >
                  08162577877
                </a>
              </p>

              <p>
                <strong className="text-white">
                  Iorgbo Ortserga Raphael
                </strong>{" "}
                (PRO):{" "}
                <a
                  href="tel:07060437732"
                  className="font-semibold text-emerald-300 underline decoration-emerald-500/50 underline-offset-2 hover:text-emerald-200"
                >
                  07060437732
                </a>
              </p>
            </div>

            <div className="mt-7 border-t border-slate-700 pt-6">
              <a
                href="https://chat.whatsapp.com/LyDTbDDVxhG6u8PAGev8Jy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-500 hover:shadow-emerald-500/20"
              >
                👉 Join WhatsApp Group
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-slate-200 bg-white py-6">
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
import { MailCheck, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function VerifyEmailBanner() {
  return (
    <section className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-blue-700 to-indigo-700 p-16 text-white">

      <h1 className="text-5xl font-bold leading-tight">
        Verify Your Email
      </h1>

      <p className="mt-6 text-lg text-blue-100">
        Enter the 6-digit verification code sent to your registered email address to activate your Loan Management System account.
      </p>

      <div className="mt-12 space-y-8">

        <div className="flex gap-4">
          <MailCheck size={40} />
          <div>
            <h3 className="font-semibold">
              Email Verification
            </h3>

            <p className="text-blue-100">
              Confirm ownership of your email.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <ShieldCheck size={40} />

          <div>
            <h3 className="font-semibold">
              Secure Registration
            </h3>

            <p className="text-blue-100">
              Protect your account against unauthorized access.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <CheckCircle2 size={40} />

          <div>
            <h3 className="font-semibold">
              Quick Activation
            </h3>

            <p className="text-blue-100">
              Verify once and start using your dashboard immediately.
            </p>
          </div>
        </div>

      </div>

    </section>
  );
}

import { LockKeyhole, ShieldCheck, CheckCircle } from "lucide-react";

export default function ResetPasswordBanner() {
  return (
    <section className="hidden lg:flex flex-col justify-center bg-blue-700 p-16 text-white">

      <h1 className="text-5xl font-bold">
        Create a New Password
      </h1>

      <p className="mt-6 text-lg text-blue-100">
        Choose a strong password to keep your Loan Management System account secure.
      </p>

      <div className="mt-12 space-y-8">

        <div className="flex gap-4">
          <ShieldCheck size={40} />
          <div>
            <h3 className="font-semibold">
              Secure Account
            </h3>
            <p className="text-blue-100">
              Your account remains protected at all times.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <LockKeyhole size={40} />
          <div>
            <h3 className="font-semibold">
              Strong Password
            </h3>
            <p className="text-blue-100">
              Use at least 8 characters including numbers and symbols.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <CheckCircle size={40} />
          <div>
            <h3 className="font-semibold">
              Instant Access
            </h3>
            <p className="text-blue-100">
              Sign in immediately after resetting your password.
            </p>
          </div>
        </div>

      </div>

    </section>
  );
}

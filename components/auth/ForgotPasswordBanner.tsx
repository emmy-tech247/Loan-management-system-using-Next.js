import { ShieldCheck, MailCheck, LockKeyhole } from "lucide-react";

export default function ForgotPasswordBanner() {
  return (
    <section className="hidden lg:flex flex-col justify-center bg-blue-700 p-16 text-white">

      <h1 className="text-5xl font-bold leading-tight">
        Reset Your Password
      </h1>

      <p className="mt-6 text-lg text-blue-100">
        Don't worry! Enter your registered email address and we'll send you a secure password reset link.
      </p>

      <div className="mt-12 space-y-8">

        <div className="flex items-center gap-4">
          <MailCheck size={40} />
          <div>
            <h3 className="font-semibold">Email Verification</h3>
            <p className="text-blue-100">
              Receive a secure password reset email.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ShieldCheck size={40} />
          <div>
            <h3 className="font-semibold">Protected Account</h3>
            <p className="text-blue-100">
              Your account stays secure during recovery.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <LockKeyhole size={40} />
          <div>
            <h3 className="font-semibold">Fast Recovery</h3>
            <p className="text-blue-100">
              Create a new password in just a few minutes.
            </p>
          </div>
        </div>

      </div>

    </section>
  );
}

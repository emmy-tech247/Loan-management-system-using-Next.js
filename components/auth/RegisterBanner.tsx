import { ShieldCheck, Landmark, PiggyBank } from "lucide-react";

export default function RegisterBanner() {
  return (
    <section className="hidden lg:flex flex-col justify-center bg-blue-700 p-16 text-white">
      <h1 className="text-5xl font-bold">
        Join Our Loan Management System
      </h1>

      <p className="mt-6 text-lg text-blue-100">
        Create an account to apply for loans, manage savings, and monitor fixed deposits from anywhere.
      </p>

      <div className="mt-12 space-y-8">

        <div className="flex items-center gap-4">
          <ShieldCheck size={40} />
          <div>
            <h3 className="font-semibold">Secure Registration</h3>
            <p className="text-blue-100">
              Your information is protected with modern encryption.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Landmark size={40} />
          <div>
            <h3 className="font-semibold">Fast Loan Access</h3>
            <p className="text-blue-100">
              Apply for loans and monitor approvals online.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <PiggyBank size={40} />
          <div>
            <h3 className="font-semibold">Savings & Investments</h3>
            <p className="text-blue-100">
              Grow your savings with secure investment options.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}

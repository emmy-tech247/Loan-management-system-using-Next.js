import { ShieldCheck, Landmark, PiggyBank } from "lucide-react";

export default function LoginBanner() {
  return (
    <section className="hidden lg:flex flex-col justify-center bg-blue-700 p-16 text-white">
      <h1 className="text-5xl font-bold leading-tight">
        Loan Management System
      </h1>

      <p className="mt-6 text-lg text-blue-100">
        Securely manage loans, savings, fixed deposits and repayments from one dashboard.
      </p>

      <div className="mt-12 space-y-8">

        <div className="flex items-center gap-4">
          <ShieldCheck size={40}/>
          <div>
            <h3 className="font-semibold">Bank-Level Security</h3>
            <p className="text-blue-100">
              Your information is encrypted and protected.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Landmark size={40}/>
          <div>
            <h3 className="font-semibold">Easy Loan Processing</h3>
            <p className="text-blue-100">
              Apply and track your loans instantly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <PiggyBank size={40}/>
          <div>
            <h3 className="font-semibold">Savings & Fixed Deposits</h3>
            <p className="text-blue-100">
              Grow your money with secure savings.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}

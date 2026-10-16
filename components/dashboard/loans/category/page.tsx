"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PiggyBank, HandCoins, AlertCircle, ArrowRight } from "lucide-react";

export default function SelectLoanCategoryPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (accountType === "loan_saver") {
      router.push("/dashboard/loans/saver-form");
    } else if (accountType === "loan_borrower") {
      router.push("/dashboard/loans/borrower-form");
    } else {
      setError("❌ Please select an option.");
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">
          Select Loan Category
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Monthly Saver Option */}
          <label
            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
              accountType === "loan_saver"
                ? "border-emerald-600 bg-emerald-50/50 text-slate-900"
                : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  accountType === "loan_saver"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <PiggyBank className="h-5 w-5" />
              </div>
              <span className="font-semibold">Monthly Saver</span>
            </div>
            <input
              type="radio"
              name="account_type"
              value="loan_saver"
              checked={accountType === "loan_saver"}
              onChange={(e) => {
                setAccountType(e.target.value);
                setError("");
              }}
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
            />
          </label>

          {/* Loan Borrower Option */}
          <label
            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
              accountType === "loan_borrower"
                ? "border-emerald-600 bg-emerald-50/50 text-slate-900"
                : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  accountType === "loan_borrower"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <HandCoins className="h-5 w-5" />
              </div>
              <span className="font-semibold">Loan Borrower</span>
            </div>
            <input
              type="radio"
              name="account_type"
              value="loan_borrower"
              checked={accountType === "loan_borrower"}
              onChange={(e) => {
                setAccountType(e.target.value);
                setError("");
              }}
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
            />
          </label>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
          >
            <span>Continue</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Verified | DCG Cooperative",
  description: "Your email has been verified successfully.",
};

export default function VerifySuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg text-center">

        <div className="mb-5 text-6xl">
          ✅
        </div>

        <h1 className="mb-4 text-3xl font-bold text-green-700">
          Email Verified
        </h1>

        <p className="mb-8 text-gray-600">
          Your email address has been verified successfully.
          Your registration is now awaiting administrative approval.
        </p>

        <Link
          href="/login"
          className="inline-block rounded-lg bg-blue-700 px-8 py-3 font-semibold text-white hover:bg-blue-800"
        >
          Proceed to Login
        </Link>

      </div>
    </main>
  );
}

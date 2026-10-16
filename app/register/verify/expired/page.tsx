import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verification Expired",
};

export default function VerifyExpiredPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">

      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg text-center">

        <div className="mb-5 text-6xl">
          ⏰
        </div>

        <h1 className="mb-4 text-3xl font-bold text-orange-600">
          Verification Link Expired
        </h1>

        <p className="mb-8 text-gray-600">
          Your verification link has expired.
          Please request another verification email.
        </p>

        <Link
          href="/register/resend-verification"
          className="rounded-lg bg-orange-600 px-8 py-3 text-white hover:bg-orange-700"
        >
          Resend Verification
        </Link>

      </div>

    </main>
  );
}

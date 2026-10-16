import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verification Failed",
};

export default function VerifyErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg text-center">

        <div className="mb-5 text-6xl">
          ❌
        </div>

        <h1 className="mb-4 text-3xl font-bold text-red-600">
          Verification Failed
        </h1>

        <p className="mb-8 text-gray-600">
          The verification link is invalid or has been tampered with.
        </p>

        <Link
          href="/register"
          className="rounded-lg bg-blue-700 px-8 py-3 text-white"
        >
          Register Again
        </Link>

      </div>
    </main>
  );
}

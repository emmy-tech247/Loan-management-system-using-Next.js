import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Already Verified",
};

export default function AlreadyVerifiedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">

      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg text-center">

        <div className="mb-5 text-6xl">
          ℹ️
        </div>

        <h1 className="mb-4 text-3xl font-bold text-blue-700">
          Email Already Verified
        </h1>

        <p className="mb-8 text-gray-600">
          Your email address has already been verified.
          You can log in once your account has been approved.
        </p>

        <Link
          href="/login"
          className="rounded-lg bg-blue-700 px-8 py-3 text-white hover:bg-blue-800"
        >
          Go to Login
        </Link>

      </div>

    </main>
  );
}

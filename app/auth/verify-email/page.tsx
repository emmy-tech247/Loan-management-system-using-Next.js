import VerifyEmailBanner from "@/components/auth/VerifyEmailBanner";
import VerifyEmailCard from "@/components/auth/VerifyEmailCard";

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">
        <VerifyEmailBanner />
        <VerifyEmailCard />
      </div>
    </main>
  );
}

import ForgotPasswordBanner from "@/components/auth/ForgotPasswordBanner";
import ForgotPasswordCard from "@/components/auth/ForgotPasswordCard";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">
        <ForgotPasswordBanner />
        <ForgotPasswordCard />
      </div>
    </main>
  );
}

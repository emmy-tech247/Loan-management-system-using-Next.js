import ResetPasswordBanner from "@/components/auth/ResetPasswordBanner";
import ResetPasswordCard from "@/components/auth/ResetPasswordCard";

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">
        <ResetPasswordBanner />
        <ResetPasswordCard />
      </div>
    </main>
  );
}

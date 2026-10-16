import VerifyEmailForm from "./VerifyEmailForm";

export default function VerifyEmailCard() {
  return (
    <section className="flex items-center justify-center px-6 py-12">

      <div className="w-full max-w-md rounded-3xl bg-white/80 p-8 shadow-2xl backdrop-blur-xl">

        <div className="text-center mb-8">

          <h2 className="text-3xl font-bold">
            Email Verification
          </h2>

          <p className="mt-2 text-gray-500">
            Enter the verification code sent to your email.
          </p>

        </div>

        <VerifyEmailForm />

      </div>

    </section>
  );
}

import LoginForm from "./LoginForm";

export default function LoginCard() {
  return (
    <section className="flex items-center justify-center px-6 py-12">

      <div className="w-full max-w-md rounded-3xl bg-white/80 backdrop-blur-xl p-8 shadow-2xl">

        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold">
            Welcome Back
          </h2>

          <p className="mt-2 text-gray-500">
            Login to your account
          </p>
        </div>

        <LoginForm/>

      </div>

    </section>
  );
}

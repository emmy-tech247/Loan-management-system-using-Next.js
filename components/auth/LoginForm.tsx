"use client";

import Link from "next/link";
import { useState } from "react";
import PasswordInput from "./PasswordInput";

export default function LoginForm() {

  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [loading,setLoading]=useState(false);

  async function handleSubmit(
    e:React.FormEvent
  ){
    e.preventDefault();

    setLoading(true);

    setTimeout(()=>{
      setLoading(false);
      alert("Login Successful");
    },1500);
  }

  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >

      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        className="w-full rounded-xl border px-4 py-3 focus:border-blue-600 outline-none"
        required
      />

      <PasswordInput
        value={password}
        onChange={setPassword}
      />

      <div className="flex items-center justify-between">

        <label className="flex items-center gap-2 text-sm">

          <input type="checkbox"/>

          Remember me

        </label>

        <Link
          href="/forgot-password"
          className="text-blue-600 text-sm"
        >
          Forgot Password?
        </Link>

      </div>

      <button
        disabled={loading}
        className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 transition"
      >

        {loading ? "Signing In..." : "Login"}

      </button>

      <div className="text-center text-sm">

        Don't have an account?

        <Link
          href="/register"
          className="ml-2 text-blue-600 font-semibold"
        >
          Register
        </Link>

      </div>

    </form>

  );
}

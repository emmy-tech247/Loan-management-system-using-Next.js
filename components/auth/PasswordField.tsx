"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export default function PasswordField({
  value,
  onChange,
  placeholder,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border px-4 py-3 pr-12 focus:border-blue-600 outline-none"
        required
      />

      <button
        type="button"
        className="absolute right-4 top-4"
        onClick={() => setShow(!show)}
      >
        {show ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}

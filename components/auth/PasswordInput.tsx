"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function PasswordInput({
  value,
  onChange,
}: Props) {

  const [show, setShow] = useState(false);

  return (
    <div className="relative">

      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        placeholder="Password"
        className="w-full rounded-xl border px-4 py-3 pr-12 focus:border-blue-600 outline-none"
      />

      <button
        type="button"
        onClick={()=>setShow(!show)}
        className="absolute right-4 top-4"
      >
        {show ? <EyeOff size={20}/> : <Eye size={20}/>}
      </button>

    </div>
  );
}

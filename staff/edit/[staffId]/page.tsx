"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Save, UserRound } from "lucide-react";

type Staff = {
  staff_id: number;
  full_name: string;
  email: string;
  phone: string;
  role: string;
};

const roles = [
  { value: "relationship_officer", label: "Relationship Officer" },
  { value: "auditor", label: "Auditor" },
  { value: "manager", label: "Manager" },
  { value: "accountant", label: "Accountant" },
  { value: "admin", label: "Admin" },
  { value: "md", label: "Managing Director" },
];

export default function EditStaffPage() {
  const params = useParams();
  const router = useRouter();

  const staffId = params.staffId as string;

  const [staff, setStaff] = useState<Staff | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch staff
  useEffect(() => {
    async function fetchStaff() {
      try {
        setLoading(true);

        const response = await fetch(`/api/admin/staff/${staffId}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Staff not found.");
        }

        setStaff(data.staff);
        setFullName(data.staff.full_name);
        setEmail(data.staff.email);
        setPhone(data.staff.phone);
        setRole(data.staff.role);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load staff."
        );
      } finally {
        setLoading(false);
      }
    }

    if (staffId) {
      fetchStaff();
    }
  }, [staffId]);

  // Update staff
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/admin/staff/${staffId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone,
          role,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update staff.");
      }

      setStaff(data.staff);
      setPassword("");
      setMessage("Staff updated successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update staff."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-500">Loading staff...</div>
      </div>
    );
  }

  if (error && !staff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="mb-5 text-red-600">{error}</p>

          <button
            onClick={() => router.push("/admin/staff")}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            <ArrowLeft size={16} />
            Back to Staff List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/admin/staff")}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={17} />
            Back to Staff List
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <UserRound size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Edit Staff
              </h1>

              <p className="text-sm text-slate-500">
                Update staff account information
              </p>
            </div>
          </div>
        </div>

        {/* Success message */}
        {message && (
          <div className="mb-5 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            <CheckCircle2 size={18} />
            {message}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="space-y-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="full_name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Full Name
              </label>

              <input
                id="full_name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Phone
              </label>

              <input
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Role */}
            <div>
              <label
                htmlFor="role"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Role
              </label>

              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {roles.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                New Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1.5 text-xs text-slate-500">
                Leave blank if you do not want to change the password.
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="mt-7 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#003d6a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#005999] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />

              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
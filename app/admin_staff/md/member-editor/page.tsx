"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  FileText,
  Landmark,
  Loader2,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Save,
  Search,
  ShieldCheck,
  Upload,
  User,
  Users,
  X,
} from "lucide-react";

type Member = {
  member_id: number;

  full_name: string | null;
  nin: string | null;

  state_of_origin: string | null;
  lga_of_origin: string | null;

  permanent_address: string | null;
  residential_address: string | null;

  phone_number: string | null;
  email: string | null;

  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
  account_type: string | null;

  place_of_work: string | null;
  type_of_business_work: string | null;

  monthly_earning: string | number | null;
  annual_income: string | number | null;

  expected_monthly_contribution_amount: string | number | null;

  fixed_deposit_amount: string | number | null;
  fixed_deposit_years: string | number | null;

  contribution_start_date: string | null;

  full_name_of_next_of_kin: string | null;
  address_of_next_of_kin: string | null;
  phone_number_of_next_of_kin: string | null;
  relationship_with_next_of_kin: string | null;

  passport: string | null;
  id_document: string | null;
  payment_receipt: string | null;
};

type FormState = {
  full_name: string;
  nin: string;

  state_of_origin: string;
  lga_of_origin: string;

  permanent_address: string;
  residential_address: string;

  phone_number: string;
  email: string;

  bank_name: string;
  account_number: string;
  account_name: string;
  account_type: string;

  place_of_work: string;
  type_of_business_work: string;

  monthly_earning: string;
  annual_income: string;

  expected_monthly_contribution_amount: string;

  fixed_deposit_amount: string;
  fixed_deposit_years: string;

  contribution_start_date: string;

  full_name_of_next_of_kin: string;
  address_of_next_of_kin: string;
  phone_number_of_next_of_kin: string;
  relationship_with_next_of_kin: string;
};

const emptyForm: FormState = {
  full_name: "",
  nin: "",

  state_of_origin: "",
  lga_of_origin: "",

  permanent_address: "",
  residential_address: "",

  phone_number: "",
  email: "",

  bank_name: "",
  account_number: "",
  account_name: "",
  account_type: "",

  place_of_work: "",
  type_of_business_work: "",

  monthly_earning: "",
  annual_income: "",

  expected_monthly_contribution_amount: "",

  fixed_deposit_amount: "",
  fixed_deposit_years: "",

  contribution_start_date: "",

  full_name_of_next_of_kin: "",
  address_of_next_of_kin: "",
  phone_number_of_next_of_kin: "",
  relationship_with_next_of_kin: "",
};

const editableFields: (keyof FormState)[] = [
  "full_name",
  "nin",

  "state_of_origin",
  "lga_of_origin",

  "permanent_address",
  "residential_address",

  "phone_number",
  "email",

  "bank_name",
  "account_number",
  "account_name",
  "account_type",

  "place_of_work",
  "type_of_business_work",

  "monthly_earning",
  "annual_income",

  "expected_monthly_contribution_amount",

  "fixed_deposit_amount",
  "fixed_deposit_years",

  "contribution_start_date",

  "full_name_of_next_of_kin",
  "address_of_next_of_kin",
  "phone_number_of_next_of_kin",
  "relationship_with_next_of_kin",
];

const labels: Record<keyof FormState, string> = {
  full_name: "Full Name",
  nin: "NIN",

  state_of_origin: "State of Origin",
  lga_of_origin: "LGA of Origin",

  permanent_address: "Permanent Address",
  residential_address: "Residential Address",

  phone_number: "Phone Number",
  email: "Email Address",

  bank_name: "Bank Name",
  account_number: "Account Number",
  account_name: "Account Name",
  account_type: "Account Type",

  place_of_work: "Place of Work",
  type_of_business_work: "Type of Business / Work",

  monthly_earning: "Monthly Earning",
  annual_income: "Annual Income",

  expected_monthly_contribution_amount:
    "Expected Monthly Contribution",

  fixed_deposit_amount: "Fixed Deposit Amount",
  fixed_deposit_years: "Fixed Deposit Years",

  contribution_start_date: "Contribution Start Date",

  full_name_of_next_of_kin: "Full Name of Next of Kin",
  address_of_next_of_kin: "Address of Next of Kin",
  phone_number_of_next_of_kin: "Phone Number of Next of Kin",
  relationship_with_next_of_kin:
    "Relationship with Next of Kin",
};

function memberToForm(member: Member): FormState {
  return {
    full_name: member.full_name ?? "",
    nin: member.nin ?? "",

    state_of_origin: member.state_of_origin ?? "",
    lga_of_origin: member.lga_of_origin ?? "",

    permanent_address: member.permanent_address ?? "",
    residential_address: member.residential_address ?? "",

    phone_number: member.phone_number ?? "",
    email: member.email ?? "",

    bank_name: member.bank_name ?? "",
    account_number: member.account_number ?? "",
    account_name: member.account_name ?? "",
    account_type: member.account_type ?? "",

    place_of_work: member.place_of_work ?? "",
    type_of_business_work:
      member.type_of_business_work ?? "",

    monthly_earning:
      member.monthly_earning?.toString() ?? "",

    annual_income:
      member.annual_income?.toString() ?? "",

    expected_monthly_contribution_amount:
      member.expected_monthly_contribution_amount?.toString() ??
      "",

    fixed_deposit_amount:
      member.fixed_deposit_amount?.toString() ?? "",

    fixed_deposit_years:
      member.fixed_deposit_years?.toString() ?? "",

    contribution_start_date:
      member.contribution_start_date
        ? member.contribution_start_date.substring(0, 10)
        : "",

    full_name_of_next_of_kin:
      member.full_name_of_next_of_kin ?? "",

    address_of_next_of_kin:
      member.address_of_next_of_kin ?? "",

    phone_number_of_next_of_kin:
      member.phone_number_of_next_of_kin ?? "",

    relationship_with_next_of_kin:
      member.relationship_with_next_of_kin ?? "",
  };
}

function getFileUrl(path: string | null | undefined): string | null {
  if (!path) return null;

  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  if (path.startsWith("/")) {
    return path;
  }

  return `/${path.replace(/^\/+/, "")}`;
}

function formatMoney(value: string | number | null) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const numeric = Number(value);

  if (Number.isNaN(numeric)) {
    return String(value);
  }

  return numeric.toLocaleString("en-NG");
}

export default function EditMemberPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [member, setMember] = useState<Member | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [memberId, setMemberId] = useState("");

  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [passportFile, setPassportFile] =
    useState<File | null>(null);

  const [idDocumentFile, setIdDocumentFile] =
    useState<File | null>(null);

  const [paymentReceiptFile, setPaymentReceiptFile] =
    useState<File | null>(null);

  const [newPassword, setNewPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  useEffect(() => {
    const id = searchParams.get("member_id");

    if (id) {
      setMemberId(id);
      loadMember(id);
    }
  }, [searchParams]);

  async function loadMember(id: string) {
    const cleanId = id.trim();

    if (!cleanId) {
      setError("Please enter a member ID.");
      return;
    }

    setSearching(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin_staff/md/edit-member?member_id=${encodeURIComponent(
          cleanId
        )}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await response.text();

        console.error(
          "Unexpected server response:",
          text.substring(0, 500)
        );

        throw new Error(
          `Server returned an unexpected response (${response.status}).`
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load member."
        );
      }

      setMember(data.member);
      setForm(memberToForm(data.member));
    } catch (err) {
      console.error(err);

      setMember(null);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load member."
      );
    } finally {
      setSearching(false);
    }
  }

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  }

  function validateFile(
    file: File,
    fieldName: string
  ): boolean {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];

    const extension =
      file.name.split(".").pop()?.toLowerCase();

    const allowedExtensions = [
      "jpg",
      "jpeg",
      "png",
      "pdf",
    ];

    if (
      !allowedTypes.includes(file.type) &&
      !(
        extension &&
        allowedExtensions.includes(extension)
      )
    ) {
      setError(
        `${fieldName}: Only JPG, JPEG, PNG and PDF files are allowed.`
      );

      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        `${fieldName}: File size must not exceed 5MB.`
      );

      return false;
    }

    return true;
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
    type:
      | "passport"
      | "id_document"
      | "payment_receipt"
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const fieldName =
      type === "passport"
        ? "Passport Photograph"
        : type === "id_document"
        ? "ID Document"
        : "Payment Receipt";

    if (!validateFile(file, fieldName)) {
      event.target.value = "";
      return;
    }

    if (type === "passport") {
      setPassportFile(file);
    }

    if (type === "id_document") {
      setIdDocumentFile(file);
    }

    if (type === "payment_receipt") {
      setPaymentReceiptFile(file);
    }

    setMessage("");
    setError("");
  }

  function clearSelectedFile(
    type:
      | "passport"
      | "id_document"
      | "payment_receipt"
  ) {
    if (type === "passport") {
      setPassportFile(null);
    }

    if (type === "id_document") {
      setIdDocumentFile(null);
    }

    if (type === "payment_receipt") {
      setPaymentReceiptFile(null);
    }
  }

  async function handleSearch(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!memberId.trim()) {
      setError("Enter a member ID.");
      return;
    }

    await loadMember(memberId);
  }

  async function handleSave(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!member) {
      setError("No member is currently loaded.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();

      formData.append(
        "member_id",
        String(member.member_id)
      );

      editableFields.forEach((field) => {
        formData.append(field, form[field]);
      });

      if (newPassword.trim()) {
        formData.append(
          "new_password",
          newPassword.trim()
        );
      }

      if (passportFile) {
        formData.append(
          "passport",
          passportFile
        );
      }

      if (idDocumentFile) {
        formData.append(
          "id_document",
          idDocumentFile
        );
      }

      if (paymentReceiptFile) {
        formData.append(
          "payment_receipt",
          paymentReceiptFile
        );
      }

      const response = await fetch(
        "/api/admin_staff/md/edit-member",
        {
          method: "PUT",
          body: formData,
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await response.text();

        console.error(
          "Unexpected server response:",
          text.substring(0, 500)
        );

        throw new Error(
          `Server returned an unexpected response (${response.status}).`
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update member."
        );
      }

      setMember(data.member);
      setForm(memberToForm(data.member));

      setPassportFile(null);
      setIdDocumentFile(null);
      setPaymentReceiptFile(null);
      setNewPassword("");

      setMessage(
        data.message ||
          "Member information updated successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update member."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }

    router.push("/staff");
  }

  function renderInput(
    field: keyof FormState,
    options?: {
      type?: string;
      placeholder?: string;
      icon?: React.ReactNode;
    }
  ) {
    return (
      <div className="space-y-2 ">
        <label
          htmlFor={field}
          className="text-sm font-semibold text-slate-700"
        >
          {labels[field]}
        </label>

        <div className="relative">
          {options?.icon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {options.icon}
            </div>
          )}

          <input
            id={field}
            name={field}
            type={options?.type || "text"}
            value={form[field]}
            onChange={handleChange}
            placeholder={
              options?.placeholder ||
              `Enter ${labels[field].toLowerCase()}`
            }
            className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 ${
              options?.icon ? "pl-10" : ""
            }`}
          />
        </div>
      </div>
    );
  }

  function renderTextarea(field: keyof FormState) {
    return (
      <div className="space-y-2">
        <label
          htmlFor={field}
          className="text-sm font-semibold text-slate-700"
        >
          {labels[field]}
        </label>

        <textarea
          id={field}
          name={field}
          value={form[field]}
          onChange={handleChange}
          rows={3}
          placeholder={`Enter ${labels[
            field
          ].toLowerCase()}`}
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        />
      </div>
    );
  }

  function renderFileSection(
    title: string,
    description: string,
    currentPath: string | null,
    selectedFile: File | null,
    type:
      | "passport"
      | "id_document"
      | "payment_receipt",
    accept: string
  ) {
    const fileUrl = getFileUrl(currentPath);

    const isImage =
      type === "passport" &&
      fileUrl &&
      /\.(jpg|jpeg|png|webp)$/i.test(fileUrl);

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800">
              {title}
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {description}
            </p>
          </div>

          <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
            {type === "passport" ? (
              <User size={20} />
            ) : (
              <FileText size={20} />
            )}
          </div>
        </div>

        {fileUrl && (
          <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {isImage ? (
              <div className="relative flex min-h-[220px] items-center justify-center p-4">
                <Image
                  src={fileUrl}
                  alt={`${title} for ${member?.full_name || "member"}`}
                  width={220}
                  height={220}
                  className="max-h-[220px] w-auto rounded-xl object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-slate-200 p-3 text-slate-700">
                    <FileText size={22} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Existing document
                    </p>

                    <p className="text-xs text-slate-500">
                      Click below to view
                    </p>
                  </div>
                </div>

                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                >
                  View
                </a>
              </div>
            )}
          </div>
        )}

        {selectedFile && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <div className="flex min-w-0 items-center gap-3">
              <CheckCircle2
                size={18}
                className="shrink-0 text-emerald-600"
              />

              <div className="min-w-0">
                <p className="text-xs font-semibold text-emerald-800">
                  New file selected
                </p>

                <p className="truncate text-xs text-emerald-700">
                  {selectedFile.name}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => clearSelectedFile(type)}
              className="rounded-lg p-2 text-emerald-700 hover:bg-emerald-100"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-700 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700">
          <Upload size={18} />

          {selectedFile
            ? "Choose Different File"
            : fileUrl
            ? "Replace File"
            : "Upload File"}

          <input
            type="file"
            className="hidden"
            accept={accept}
            onChange={(event) =>
              handleFileChange(event, type)
            }
          />
        </label>

        <p className="mt-2 text-center text-[11px] text-slate-400">
          Maximum 5MB • JPG, JPEG, PNG or PDF
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 -mt-28 text-slate-800">
      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/admin_staff/md/dashboard"
            className="flex items-center gap-3"
          >
            <Image
              src="/images/logo2.png"
              alt="DCG Cooperative"
              width={140}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />

            <div className="hidden border-l border-slate-200 pl-3 sm:block">
              <p className="text-sm font-bold text-slate-800">
                Executive Portal
              </p>

              <p className="text-[11px] text-slate-500">
                Managing Director
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/admin_staff/md/dashboard"
              className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:flex"
            >
              <ArrowLeft size={17} />
              Dashboard
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">
                Logout
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 mt-5 lg:px-8">
        {/* PAGE HEADER */}
        <div className="mb-6 rounded-2xl bg-slate-900 p-6 text-white shadow-lg">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-emerald-300">
                <ShieldCheck size={19} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Executive Management
                </span>
              </div>

              <h1 className="text-2xl font-bold sm:text-3xl">
                Member Information Editor
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Review and update member information,
                income records, contribution details and
                member documents.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300">
              <Users size={28} />
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <form
          onSubmit={handleSearch}
          className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-3 flex items-center gap-2">
            <Search
              size={19}
              className="text-emerald-600"
            />

            <h2 className="font-bold text-slate-800">
              Find Member
            </h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="number"
              value={memberId}
              onChange={(event) =>
                setMemberId(event.target.value)
              }
              placeholder="Enter Member ID"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 sm:flex-1"
            />

            <button
              type="submit"
              disabled={searching}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {searching ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={17} />
                  Search Member
                </>
              )}
            </button>
          </div>
        </form>

        {/* ALERTS */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <X size={19} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0"
            />
            <span>{message}</span>
          </div>
        )}

        {!member && !searching && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Users size={30} />
            </div>

            <h2 className="text-lg font-bold text-slate-700">
              No Member Selected
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Enter a member ID above to load the member's
              information.
            </p>
          </div>
        )}

        {member && (
          <form onSubmit={handleSave}>
            {/* MEMBER SUMMARY */}
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  {getFileUrl(member.passport) ? (
                    <Image
                      src={getFileUrl(member.passport)!}
                      alt={member.full_name || "Member"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <User size={30} />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-800">
                      {member.full_name ||
                        "Unnamed Member"}
                    </h2>

                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                      Member #{member.member_id}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                    {member.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail size={14} />
                        {member.email}
                      </span>
                    )}

                    {member.phone_number && (
                      <span className="flex items-center gap-1.5">
                        <Phone size={14} />
                        {member.phone_number}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* PERSONAL INFORMATION */}
            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
                  <User size={20} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-800">
                    Personal Information
                  </h2>

                  <p className="text-xs text-slate-500">
                    Basic member identification and contact
                    information.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {renderInput("full_name", {
                  icon: <User size={17} />,
                })}

                {renderInput("nin", {
                  icon: <BadgeCheck size={17} />,
                })}

                {renderInput("state_of_origin")}

                {renderInput("lga_of_origin")}

                {renderInput("phone_number", {
                  type: "tel",
                  icon: <Phone size={17} />,
                })}

                {renderInput("email", {
                  type: "email",
                  icon: <Mail size={17} />,
                })}

                <div className="md:col-span-2">
                  {renderTextarea(
                    "permanent_address"
                  )}
                </div>

                <div className="md:col-span-2">
                  {renderTextarea(
                    "residential_address"
                  )}
                </div>
              </div>
            </section>

            {/* BANK */}
            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
                  <Landmark size={20} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-800">
                    Bank & Account Information
                  </h2>

                  <p className="text-xs text-slate-500">
                    Member banking and account information.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {renderInput("bank_name", {
                  icon: <Landmark size={17} />,
                })}

                {renderInput("account_number")}

                {renderInput("account_name")}

                <div className="space-y-2">
                  <label
                    htmlFor="account_type"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Account Type
                  </label>

                  <select
                    id="account_type"
                    name="account_type"
                    value={form.account_type}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  >
                    <option value="">
                      Select account type
                    </option>
                    <option value="Savings">
                      Savings
                    </option>
                    <option value="Current">
                      Current
                    </option>
                    <option value="Domiciliary">
                      Domiciliary
                    </option>
                  </select>
                </div>
              </div>
            </section>

            {/* EMPLOYMENT AND INCOME */}
            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
                  <BriefcaseBusiness size={20} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-800">
                    Employment & Income
                  </h2>

                  <p className="text-xs text-slate-500">
                    Employment information and member income
                    records.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {renderInput("place_of_work", {
                  icon: (
                    <BriefcaseBusiness size={17} />
                  ),
                })}

                {renderInput(
                  "type_of_business_work"
                )}

                {renderInput("monthly_earning", {
                  type: "number",
                  placeholder:
                    "Enter monthly earning",
                })}

                {renderInput("annual_income", {
                  type: "number",
                  placeholder:
                    "Enter annual income",
                })}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Current Monthly Earning
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-800">
                    ₦
                    {formatMoney(
                      member.monthly_earning
                    ) || "0"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Current Annual Income
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-800">
                    ₦
                    {formatMoney(
                      member.annual_income
                    ) || "0"}
                  </p>
                </div>
              </div>
            </section>

            {/* CONTRIBUTION */}
            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
                  <CalendarDays size={20} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-800">
                    Contribution & Fixed Deposit
                  </h2>

                  <p className="text-xs text-slate-500">
                    Member contribution and fixed deposit
                    information.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {renderInput(
                  "expected_monthly_contribution_amount",
                  {
                    type: "number",
                    placeholder:
                      "Enter expected monthly contribution",
                  }
                )}

                {renderInput("fixed_deposit_amount", {
                  type: "number",
                  placeholder:
                    "Enter fixed deposit amount",
                })}

                {renderInput("fixed_deposit_years", {
                  type: "number",
                  placeholder:
                    "Enter fixed deposit years",
                })}

                <div className="space-y-2">
                  <label
                    htmlFor="contribution_start_date"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                  >
                    <CalendarDays
                      size={16}
                      className="text-emerald-600"
                    />
                    Contribution Start Date
                  </label>

                  <input
                    id="contribution_start_date"
                    name="contribution_start_date"
                    type="date"
                    value={
                      form.contribution_start_date
                    }
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
              </div>
            </section>

            {/* NEXT OF KIN */}
            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
                  <Users size={20} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-800">
                    Next of Kin
                  </h2>

                  <p className="text-xs text-slate-500">
                    Emergency and beneficiary contact
                    information.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {renderInput(
                  "full_name_of_next_of_kin"
                )}

                {renderInput(
                  "phone_number_of_next_of_kin",
                  {
                    type: "tel",
                    icon: <Phone size={17} />,
                  }
                )}

                {renderInput(
                  "relationship_with_next_of_kin"
                )}

                <div className="md:col-span-2">
                  {renderTextarea(
                    "address_of_next_of_kin"
                  )}
                </div>
              </div>
            </section>

            {/* DOCUMENTS */}
            <section className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm sm:p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                  <FileText size={20} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-800">
                    Member Documents
                  </h2>

                  <p className="text-xs text-slate-500">
                    View existing documents or upload
                    replacements.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                {renderFileSection(
                  "Passport Photograph",
                  "Member's passport photograph.",
                  member.passport,
                  passportFile,
                  "passport",
                  "image/jpeg,image/jpg,image/png"
                )}

                {renderFileSection(
                  "ID Document",
                  "Member's identification document.",
                  member.id_document,
                  idDocumentFile,
                  "id_document",
                  "image/jpeg,image/jpg,image/png,application/pdf"
                )}

                {renderFileSection(
                  "Payment Receipt",
                  "Registration/payment receipt.",
                  member.payment_receipt,
                  paymentReceiptFile,
                  "payment_receipt",
                  "image/jpeg,image/jpg,image/png,application/pdf"
                )}
              </div>
            </section>

            {/* PASSWORD */}
            <section className="mb-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="rounded-xl bg-amber-50 p-2 text-amber-700">
                  <LockKeyhole size={20} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-800">
                    Password
                  </h2>

                  <p className="text-xs text-slate-500">
                    Leave this field blank if the member's
                    password should remain unchanged.
                  </p>
                </div>
              </div>

              <div className="max-w-xl">
                <label
                  htmlFor="new_password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  New Password
                </label>

                <div className="relative">
                  <input
                    id="new_password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value
                      )
                    }
                    placeholder="Enter new password"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-24 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 hover:text-emerald-700"
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Minimum 6 characters.
                </p>
              </div>
            </section>

            {/* STICKY SAVE BAR */}
            <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 shadow-2xl backdrop-blur">
              <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                <div className="hidden min-w-0 sm:block">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {member.full_name ||
                      "Member Information"}
                  </p>

                  <p className="text-xs text-slate-500">
                    Member ID: {member.member_id}
                  </p>
                </div>

                <div className="ml-auto flex items-center gap-3">
                  <Link
                    href="/admin_staff/md/dashboard"
                    className="hidden rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 sm:block"
                  >
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
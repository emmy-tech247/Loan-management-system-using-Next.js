"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

import type { RegistrationData } from "@/types/member";

interface UploadFiles {
  passport: File | null;
  id_document: File | null;
  payment_receipt: File | null;
}

const initialForm: RegistrationData = {
  surname: "",
  firstname: "",
  othername: "",

  nin: "",
  password: "",

  state_of_origin: "",
  lga_of_origin: "",

  permanent_address: "",
  residential_address: "",

  phone_number: "",
  email: "",

  bank_name: "",
  account_number: "",
  account_name: "",
  account_type: "Savings",

  place_of_work: "",
  type_of_business_work: "",

  monthly_earning: "100k_below",
  annual_income: "below_500k",

  expected_monthly_contribution_amount: 0,

  fixed_deposit_amount: 0,
  fixed_deposit_years: 0,

  contribution_start_date: "",

  full_name_of_next_of_kin: "",
  address_of_next_of_kin: "",
  phone_number_of_next_of_kin: "",
  relationship_with_next_of_kin: "",

  passport: null,
  id_document: null,
  payment_receipt: null,
};

export default function RegistrationForm() {
  const router = useRouter();

  const [form, setForm] =
    useState<RegistrationData>(initialForm);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [files, setFiles] =
    useState<UploadFiles>({
      passport: null,
      id_document: null,
      payment_receipt: null,
    });

  function handleChange(
    e: ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) {

    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleNumberChange(
    e: ChangeEvent<HTMLInputElement>
  ) {

    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  }

  function handleFileChange(
    e: ChangeEvent<HTMLInputElement>
  ) {

    const file =
      e.target.files?.[0] ?? null;

    if (!file) return;

    setFiles((prev) => ({
      ...prev,
      [e.target.name]: file,
    }));
  }

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {

    e.preventDefault();

    setLoading(true);

    setMessage("");

    setError("");

    try {

      const body = new FormData();

      Object.entries(form).forEach(([key, value]) => {

        if (
          key !== "passport" &&
          key !== "id_document" &&
          key !== "payment_receipt"
        ) {

          body.append(key, String(value));

        }

      });

      if (files.passport)
        body.append(
          "passport",
          files.passport
        );

      if (files.id_document)
        body.append(
          "id_document",
          files.id_document
        );

      if (files.payment_receipt)
        body.append(
          "payment_receipt",
          files.payment_receipt
        );

      const response = await fetch(
        "/api/register",
        {
          method: "POST",
          body,
        }
      );

      const result =
        await response.json();

      if (!response.ok) {

        throw new Error(
          result.message
        );

      }

      setMessage(result.message);

      setForm(initialForm);

      setFiles({
        passport: null,
        id_document: null,
        payment_receipt: null,
      });

      router.refresh();

    } catch (err: any) {

      setError(
        err.message ??
          "Registration failed."
      );

    } finally {

      setLoading(false);

    }
    return (
  <form
    onSubmit={handleSubmit}
    className="space-y-8 rounded-xl bg-white p-8 shadow-lg"
  >
    {/* Success Message */}

    {message && (
      <div className="rounded-lg border border-green-300 bg-green-100 p-4 text-green-700">
        {message}
      </div>
    )}

    {/* Error Message */}

    {error && (
      <div className="rounded-lg border border-red-300 bg-red-100 p-4 text-red-700">
        {error}
      </div>
    )}

    {/* ===========================
        PERSONAL INFORMATION
    ============================ */}

    <section className="space-y-6">

      <h2 className="border-b pb-2 text-2xl font-bold text-slate-800">
        Personal Information
      </h2>

      {/* Name */}

      <div className="grid gap-6 md:grid-cols-3">

        <div>

          <label className="mb-2 block font-semibold">
            Surname
          </label>

          <input
            type="text"
            name="surname"
            value={form.surname}
            onChange={handleChange}
            required
            className="w-full rounded-lg border p-3"
          />

        </div>

        <div>

          <label className="mb-2 block font-semibold">
            First Name
          </label>

          <input
            type="text"
            name="firstname"
            value={form.firstname}
            onChange={handleChange}
            required
            className="w-full rounded-lg border p-3"
          />

        </div>

        <div>

          <label className="mb-2 block font-semibold">
            Other Name
          </label>

          <input
            type="text"
            name="othername"
            value={form.othername}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
          />

        </div>

      </div>

      {/* NIN */}

      <div>

        <label className="mb-2 block font-semibold">
          National Identification Number (NIN)
        </label>

        <input
          type="text"
          name="nin"
          value={form.nin}
          onChange={handleChange}
          required
          className="w-full rounded-lg border p-3"
        />

      </div>

      {/* Password */}

      <div>

        <label className="mb-2 block font-semibold">
          Password
        </label>

        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full rounded-lg border p-3"
        />

      </div>

      {/* Passport */}

      <div>

        <label className="mb-2 block font-semibold">
          Passport Photograph
        </label>

        <input
          type="file"
          name="passport"
          accept="image/*"
          required
          onChange={handleFileChange}
          className="w-full rounded-lg border p-3"
        />

      </div>

      {/* ID Upload */}

      <div>

        <label className="mb-2 block font-semibold">
          Upload NIN Identification
        </label>

        <input
          type="file"
          name="id_document"
          accept=".jpg,.jpeg,.png,.pdf"
          required
          onChange={handleFileChange}
          className="w-full rounded-lg border p-3"
        />

      </div>

      {/* State / LGA */}

      <div className="grid gap-6 md:grid-cols-2">

        <div>

          <label className="mb-2 block font-semibold">
            State of Origin
          </label>

          <input
            type="text"
            name="state_of_origin"
            value={form.state_of_origin}
            onChange={handleChange}
            required
            className="w-full rounded-lg border p-3"
          />

        </div>

        <div>

          <label className="mb-2 block font-semibold">
            LGA of Origin
          </label>

          <input
            type="text"
            name="lga_of_origin"
            value={form.lga_of_origin}
            onChange={handleChange}
            required
            className="w-full rounded-lg border p-3"
          />

        </div>

      </div>

      {/* Permanent Address */}

      <div>

        <label className="mb-2 block font-semibold">
          Permanent Address
        </label>

        <textarea
          name="permanent_address"
          value={form.permanent_address}
          onChange={handleChange}
          rows={3}
          required
          className="w-full rounded-lg border p-3"
        />

      </div>

      {/* Residential Address */}

      <div>

        <label className="mb-2 block font-semibold">
          Residential Address
        </label>

        <textarea
          name="residential_address"
          value={form.residential_address}
          onChange={handleChange}
          rows={3}
          required
          className="w-full rounded-lg border p-3"
        />

      </div>

      {/* Phone & Email */}

      <div className="grid gap-6 md:grid-cols-2">

        <div>

          <label className="mb-2 block font-semibold">
            Phone Number
          </label>

          <input
            type="tel"
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            required
            className="w-full rounded-lg border p-3"
          />

        </div>

        <div>

          <label className="mb-2 block font-semibold">
            Email Address
          </label>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg border p-3"
          />

        </div>

      </div>

    </section>
    {/* ===========================
        BANKING INFORMATION
    ============================ */}

    <section className="space-y-6">

      <h2 className="border-b pb-2 text-2xl font-bold text-slate-800">
        Banking Information
      </h2>

      <div className="grid gap-6 md:grid-cols-3">

        <div>

          <label className="mb-2 block font-semibold">
            Bank Name
          </label>

          <input
            type="text"
            name="bank_name"
            value={form.bank_name}
            onChange={handleChange}
            required
            className="w-full rounded-lg border p-3"
          />

        </div>

        <div>

          <label className="mb-2 block font-semibold">
            Account Number
          </label>

          <input
            type="text"
            name="account_number"
            value={form.account_number}
            onChange={handleChange}
            required
            maxLength={10}
            className="w-full rounded-lg border p-3"
          />

        </div>

        <div>

          <label className="mb-2 block font-semibold">
            Account Name
          </label>

          <input
            type="text"
            name="account_name"
            value={form.account_name}
            onChange={handleChange}
            required
            className="w-full rounded-lg border p-3"
          />

        </div>

      </div>

      {/* Account Type */}

      <div>

        <label className="mb-3 block font-semibold">
          Account Type
        </label>

        <div className="flex flex-wrap gap-6">

          <label className="flex items-center gap-2">

            <input
              type="radio"
              name="account_type"
              value="Savings"
              checked={form.account_type === "Savings"}
              onChange={handleChange}
            />

            Savings

          </label>

          <label className="flex items-center gap-2">

            <input
              type="radio"
              name="account_type"
              value="Current"
              checked={form.account_type === "Current"}
              onChange={handleChange}
            />

            Current

          </label>

          <label className="flex items-center gap-2">

            <input
              type="radio"
              name="account_type"
              value="Other"
              checked={form.account_type === "Other"}
              onChange={handleChange}
            />

            Other

          </label>

        </div>

      </div>

    </section>

    {/* ===========================
        EMPLOYMENT INFORMATION
    ============================ */}

    <section className="space-y-6">

      <h2 className="border-b pb-2 text-2xl font-bold text-slate-800">
        Employment Information
      </h2>

      <div className="grid gap-6 md:grid-cols-2">

        <div>

          <label className="mb-2 block font-semibold">
            Place of Work
          </label>

          <input
            type="text"
            name="place_of_work"
            value={form.place_of_work}
            onChange={handleChange}
            required
            className="w-full rounded-lg border p-3"
          />

        </div>

        <div>

          <label className="mb-2 block font-semibold">
            Type of Business / Work
          </label>

          <input
            type="text"
            name="type_of_business_work"
            value={form.type_of_business_work}
            onChange={handleChange}
            required
            className="w-full rounded-lg border p-3"
          />

        </div>

      </div>

      {/* Monthly Earnings */}

      <div>

        <label className="mb-2 block font-semibold">
          Monthly Earnings
        </label>

        <select
          name="monthly_earning"
          value={form.monthly_earning}
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
        >

          <option value="100k_below">
            ₦100,000 and Below
          </option>

          <option value="100k_150k">
            Above ₦100,000 - ₦150,000
          </option>

          <option value="150k_200k">
            Above ₦150,000 - ₦200,000
          </option>

          <option value="200k_250k">
            Above ₦200,000 - ₦250,000
          </option>

          <option value="250k_300k">
            Above ₦250,000 - ₦300,000
          </option>

          <option value="300k_350k">
            Above ₦300,000 - ₦350,000
          </option>

          <option value="400k_above">
            ₦400,000 and Above
          </option>

        </select>

      </div>

      {/* Annual Income */}

      <div>

        <label className="mb-3 block font-semibold">
          Annual Income
        </label>

        <div className="grid gap-3 md:grid-cols-2">

          {[
            ["below_500k", "₦500k and Below"],
            ["500k_1m", "Above ₦500k - ₦1M"],
            ["1m_2m", "Above ₦1M - ₦2M"],
            ["2m_3m", "Above ₦2M - ₦3M"],
            ["3m_4m", "Above ₦3M - ₦4M"],
            ["4m_5m", "Above ₦4M - ₦5M"],
            ["above_5m", "Above ₦5M"],
          ].map(([value, label]) => (

            <label
              key={value}
              className="flex items-center gap-2"
            >

              <input
                type="radio"
                name="annual_income"
                value={value}
                checked={form.annual_income === value}
                onChange={handleChange}
              />

              {label}

            </label>

          ))}

        </div>

      </div>

    </section>



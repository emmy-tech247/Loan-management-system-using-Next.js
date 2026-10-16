"use client";

import { useState, useTransition, type FormEvent } from "react";
import { submitContactForm } from "@/app/actions/contact";

export function ContactForm() {
  const [isPending, startTransition] = useTransition();

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccess("");
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        const result = await submitContactForm(formData);

        if (result.success) {
          setSuccess(result.message);
          form.reset();
        } else {
          setError(result.message);
        }
      } catch (err) {
        console.error("Contact form error:", err);
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          required
          disabled={isPending}
          placeholder="Your name"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          required
          disabled={isPending}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
        />
      </div>

      <div>
        <label
          htmlFor="subject"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Subject
        </label>

        <input
          id="subject"
          name="subject"
          type="text"
          disabled={isPending}
          placeholder="Subject"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Message
        </label>

        <textarea
          id="message"
          name="message"
          required
          disabled={isPending}
          rows={6}
          placeholder="Write your message..."
          className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}

export default ContactForm;
"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/lib/auth";

export default function ForgotPasswordForm({
  prefillEmail,
  onBackToLogin,
}: {
  prefillEmail?: string;
  onBackToLogin: () => void;
}) {
  const [email, setEmail] = useState(prefillEmail || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    const result = await requestPasswordReset(email);
    setLoading(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    // Always show the same confirmation regardless of whether the email is
    // registered, so this can't be used to probe which emails have accounts.
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-gray-700">
          If an account exists for <span className="font-semibold">{email}</span>,
          we&apos;ve sent a link to reset your password. Check your inbox (and spam
          folder).
        </p>
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer"
        >
          ← Back to login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-500 text-center">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>
      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
      />
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {loading ? "Sending..." : "Send reset link →"}
      </button>
      <p className="text-center text-sm">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          ← Back to login
        </button>
      </p>
    </form>
  );
}

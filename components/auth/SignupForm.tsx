"use client";

import { useState } from "react";
import { registerUser, saveToken } from "@/lib/auth";
import PasswordInput from "./PasswordInput";

export default function SignupForm({
  prefill,
  onExistingUser,
  onSuccess,
}: {
  prefill?: { firstName?: string; lastName?: string; email?: string };
  onExistingUser: (email: string) => void;
  onSuccess: (firstName: string, lastName: string, email: string) => void;
}) {
  const [firstName, setFirstName] = useState(prefill?.firstName || "");
  const [lastName, setLastName] = useState(prefill?.lastName || "");
  const [email, setEmail] = useState(prefill?.email || "");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Compared ignoring capitals and spaces at the ends (the backend does the same).
  const emailsMatch =
    email.trim().toLowerCase() === confirmEmail.trim().toLowerCase();
  const showMismatch = confirmEmail.trim().length > 0 && !emailsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !confirmEmail.trim() || !password) {
      setError("All fields are required.");
      return;
    }
    // Same rule as the backend: a dot in the domain and a 2+ letter ending,
    // so typos like "name@gmail.c" or "name@gmailcom" are caught here.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!emailsMatch) {
      setError("The email addresses don't match. Please check and try again.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const result = await registerUser({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      confirmEmail: confirmEmail.trim(),
      password,
    });
    setLoading(false);

    if (!result.ok) {
      if (result.status === 409) {
        onExistingUser(email.trim());
      } else {
        setError(result.message);
      }
      return;
    }

    saveToken(result.data.token);
    onSuccess(firstName.trim(), lastName.trim(), email.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
      />
      <input
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
      />
      <input
        type="email"
        placeholder="you@example.com"
        aria-label="Email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
      />
      <div>
        <input
          type="email"
          placeholder="Re-type your email"
          aria-label="Confirm email"
          aria-invalid={showMismatch}
          aria-describedby="confirm-email-hint"
          autoComplete="off"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          className={`w-full px-4 py-3 rounded-xl bg-white/60 border outline-none transition focus:ring-2 ${
            showMismatch
              ? "border-red-400 focus:border-red-500 focus:ring-red-200"
              : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
          }`}
        />
        <p id="confirm-email-hint" className="mt-1 text-xs min-h-[1rem]" aria-live="polite">
          {showMismatch ? (
            <span className="text-red-500">Emails don&apos;t match yet.</span>
          ) : confirmEmail.trim() && emailsMatch ? (
            <span className="text-green-600">✓ Emails match</span>
          ) : null}
        </p>
      </div>
      <PasswordInput
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
        autoComplete="new-password"
      />
      <PasswordInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
        autoComplete="new-password"
      />
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {loading ? "Creating account..." : "Sign Up →"}
      </button>
    </form>
  );
}
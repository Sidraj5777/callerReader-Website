"use client";

import { useState } from "react";
import { registerUser, saveToken } from "@/lib/auth";

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
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError("All fields are required.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
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
    const result = await registerUser({ firstName, lastName, email, password });
    setLoading(false);

    if (!result.ok) {
      if (result.status === 409) {
        onExistingUser(email);
      } else {
        setError(result.message);
      }
      return;
    }

    saveToken(result.data.token);
    onSuccess(firstName, lastName, email);
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
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
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

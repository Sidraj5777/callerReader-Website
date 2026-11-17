"use client";

import { useState, useEffect } from "react";
import { loginUser, saveToken } from "@/lib/auth";
import PasswordInput from "./PasswordInput";

export default function LoginForm({
  prefillEmail,
  onSuccess,
  onForgotPassword,
}: {
  prefillEmail?: string;
  onSuccess: (email: string) => void;
  onForgotPassword: () => void;
}) {
  const [email, setEmail] = useState(prefillEmail || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (prefillEmail) setEmail(prefillEmail);
  }, [prefillEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    const result = await loginUser({ email, password });
    setLoading(false);

    if (!result.ok) {
      setError(result.status === 401 ? "Invalid email or password." : result.message);
      return;
    }

    saveToken(result.data.token);
    onSuccess(email);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
      />
      <PasswordInput
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
        autoComplete="current-password"
      />
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {loading ? "Logging in..." : "Login →"}
      </button>
      <p className="text-center text-sm">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
        >
          Forgot password?
        </button>
      </p>
    </form>
  );
}
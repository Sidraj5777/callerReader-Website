"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"login" | "signup" | "forgot">("signup");
  const [existingEmail, setExistingEmail] = useState<string | undefined>();

  const prefill = {
    firstName: searchParams.get("firstName") || undefined,
    lastName: searchParams.get("lastName") || undefined,
    email: searchParams.get("email") || undefined,
  };

  const goToForm = (firstName: string, lastName: string, email: string) => {
    router.push(
      `/form?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(
        lastName,
      )}&email=${encodeURIComponent(email)}`,
    );
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden flex items-center justify-center px-6">
      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" />
      <div className="fixed inset-0 -z-10 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#3b82f6_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,#6366f1_0%,transparent_50%)]" />
      </div>

      <div className="glass-card p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent mb-6">
          Recall Radar
        </h1>

        <div className="flex mb-6 rounded-full bg-white/40 p-1">
          <button
            onClick={() => setTab("signup")}
            className={`flex-1 py-2 rounded-full font-semibold transition cursor-pointer ${
              tab === "signup" ? "bg-blue-600 text-white" : "text-gray-600"
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setTab("login")}
            className={`flex-1 py-2 rounded-full font-semibold transition cursor-pointer ${
              tab === "login" || tab === "forgot" ? "bg-blue-600 text-white" : "text-gray-600"
            }`}
          >
            Login
          </button>
        </div>

        {tab === "signup" ? (
          <>
            {existingEmail && (
              <p className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                This email is already registered. Please log in to continue.
              </p>
            )}
            <SignupForm
              prefill={prefill}
              onExistingUser={(email) => {
                setExistingEmail(email);
                setTab("login");
              }}
              onSuccess={goToForm}
            />
          </>
        ) : tab === "forgot" ? (
          <ForgotPasswordForm
            prefillEmail={existingEmail || prefill.email}
            onBackToLogin={() => setTab("login")}
          />
        ) : (
          <LoginForm
            prefillEmail={existingEmail || prefill.email}
            onSuccess={(email) => {
              // No firstName/lastName back from login yet — /form will default to
              // "there" until the profile-fetch step exists.
              router.push(`/form?email=${encodeURIComponent(email)}`);
            }}
            onForgotPassword={() => setTab("forgot")}
          />
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageContent />
    </Suspense>
  );
}

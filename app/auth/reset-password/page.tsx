"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

function ResetPasswordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // NOTE: assumes the reset-password email links to this page as
  // /auth/reset-password?token=... — adjust the param name here if the
  // backend's email template uses something else.
  const token = searchParams.get("token") || "";
  const [done, setDone] = useState(false);

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

        {!token ? (
          <p className="text-center text-red-500">
            This reset link is missing or invalid. Please request a new one
            from the login page.
          </p>
        ) : done ? (
          <div className="space-y-4 text-center">
            <p className="text-gray-700">
              Your password has been reset. You can now log in with your new
              password.
            </p>
            <button
              type="button"
              onClick={() => router.push("/auth")}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200 cursor-pointer"
            >
              Go to login →
            </button>
          </div>
        ) : (
          <ResetPasswordForm token={token} onSuccess={() => setDone(true)} />
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearToken, getMyProfile, getToken } from "@/lib/auth";

/*
 * "Manage Preferences" link in recall emails (recallradar.info/preferences).
 * Preferences live on the profile form, so: logged in -> /form,
 * otherwise -> login first, then back to /form.
 */
export default function PreferencesPage() {
  const router = useRouter();

  useEffect(() => {
    const toLogin = () => router.replace("/auth?next=/form");
    if (!getToken()) {
      toLogin();
      return;
    }
    // A saved login can be expired; check it before sending them to the form.
    getMyProfile().then((profile) => {
      if (profile) {
        router.replace("/form");
      } else {
        clearToken();
        toLogin();
      }
    });
  }, [router]);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" />
      <div className="text-center space-y-4" role="status" aria-live="polite">
        <div className="mx-auto h-10 w-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" aria-hidden />
        <p className="text-gray-700">Opening your preferences…</p>
      </div>
    </div>
  );
}

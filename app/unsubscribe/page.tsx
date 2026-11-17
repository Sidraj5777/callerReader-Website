"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getUnsubscribeStatus,
  requestUnsubscribeLink,
  resubscribe,
  unsubscribe,
  type UnsubscribeStatus,
} from "@/lib/emailPreferences";

/*
 * "Unsubscribe" link in recall emails: /unsubscribe?token=...
 * Nothing changes on page load (email scanners open links automatically);
 * the user confirms with a button and can undo it.
 *
 * Emails sent before this change link to /unsubscribe?userId=55. Those aren't
 * trusted any more: the user enters their email and gets a proper link.
 */
type View = "loading" | "confirm" | "done" | "request";

function UnsubscribePageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [view, setView] = useState<View>(token ? "loading" : "request");
  const [status, setStatus] = useState<UnsubscribeStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(
    token ? "" : "This unsubscribe link is from an older email. Enter your email and we'll send you a new one.",
  );
  const [email, setEmail] = useState("");
  const [linkSent, setLinkSent] = useState("");
  const loaded = useRef(false);

  useEffect(() => {
    if (!token || loaded.current) return;
    loaded.current = true;
    getUnsubscribeStatus(token).then((r) => {
      if (!r.ok) {
        setNotice(
          r.status === 0
            ? r.message
            : "This unsubscribe link isn't valid any more. Enter your email and we'll send you a new one.",
        );
        setView("request");
        return;
      }
      setStatus(r.data);
      setView(r.data.unsubscribed ? "done" : "confirm");
    });
  }, [token]);

  const run = async (action: typeof unsubscribe) => {
    setError("");
    setBusy(true);
    const r = await action(token);
    setBusy(false);
    if (!r.ok) {
      setError(r.message);
      return;
    }
    setStatus(r.data);
    setView(r.data.unsubscribed ? "done" : "confirm");
  };

  const handleRequestLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    const r = await requestUnsubscribeLink(email.trim());
    setBusy(false);
    setLinkSent(r.ok ? r.data.message : r.message);
  };

  const primaryBtn =
    "w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <div className="relative min-h-screen overflow-x-hidden flex items-center justify-center px-6">
      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" />
      <div className="fixed inset-0 -z-10 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#3b82f6_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,#6366f1_0%,transparent_50%)]" />
      </div>

      <div className="glass-card p-8 rounded-2xl shadow-xl w-full max-w-md" role="status" aria-live="polite">
        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent mb-6">
          Recall Radar
        </h1>

        {view === "loading" && (
          <div className="text-center space-y-4">
            <div className="mx-auto h-10 w-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" aria-hidden />
            <p className="text-gray-700">Loading…</p>
          </div>
        )}

        {view === "confirm" && status && (
          <div className="space-y-4 text-center">
            <h2 className="text-xl font-bold text-gray-800">Unsubscribe from recall emails?</h2>
            <p className="text-gray-700 text-sm">
              <span className="font-semibold break-all">{status.maskedEmail}</span> will stop
              receiving recall alert emails from Recall Radar.
            </p>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="button" disabled={busy} onClick={() => run(unsubscribe)} className={primaryBtn}>
              {busy ? "Unsubscribing…" : "Unsubscribe"}
            </button>
            <p className="text-sm text-gray-600">
              Getting too many emails?{" "}
              <Link href="/preferences" className="text-blue-600 hover:text-blue-700 font-medium">
                Change your preferences instead
              </Link>
            </p>
          </div>
        )}

        {view === "done" && status && (
          <div className="space-y-4 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl" aria-hidden>
              ✓
            </div>
            <h2 className="text-xl font-bold text-gray-800">You&apos;re unsubscribed</h2>
            <p className="text-gray-700 text-sm">
              <span className="font-semibold break-all">{status.maskedEmail}</span> won&apos;t get
              recall alert emails any more. You&apos;ll still get account emails, like password resets.
            </p>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="button" disabled={busy} onClick={() => run(resubscribe)} className={primaryBtn}>
              {busy ? "Resubscribing…" : "Changed your mind? Resubscribe"}
            </button>
            <Link href="/" className="block text-sm text-blue-600 hover:text-blue-700 font-medium">
              Go to recallradar.info
            </Link>
          </div>
        )}

        {view === "request" && (
          <div className="space-y-4 text-center">
            <h2 className="text-xl font-bold text-gray-800">Unsubscribe</h2>
            {notice && <p className="text-gray-700 text-sm">{notice}</p>}
            <form onSubmit={handleRequestLink} className="space-y-3">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
              <button type="submit" disabled={busy || !email.trim()} className={primaryBtn}>
                {busy ? "Sending…" : "Email me an unsubscribe link"}
              </button>
            </form>
            {linkSent && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">{linkSent}</p>
            )}
            <p className="text-sm text-gray-600">
              Or{" "}
              <Link href="/preferences" className="text-blue-600 hover:text-blue-700 font-medium">
                log in to manage your preferences
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={null}>
      <UnsubscribePageContent />
    </Suspense>
  );
}

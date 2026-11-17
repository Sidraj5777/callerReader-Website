"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CONSENT_OPEN_EVENT, getConsent, setConsent, type ConsentStatus } from "@/lib/consent";

/*
 * Cookie banner. Shown on every page until the visitor accepts or rejects,
 * and again when they click "Cookie settings" in the footer.
 * Reject is as easy to reach as Accept, as consent rules expect.
 */
export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<ConsentStatus | null>(null);
  const acceptRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const saved = getConsent();
    Promise.resolve().then(() => {
      setCurrent(saved);
      setOpen(saved === null);
    });
    const reopen = () => {
      setCurrent(getConsent());
      setOpen(true);
      requestAnimationFrame(() => acceptRef.current?.focus());
    };
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
  }, []);

  if (!open) return null;

  const choose = (status: ConsentStatus) => {
    setConsent(status);
    setCurrent(status);
    setOpen(false);
  };

  return (
    <div
      role="region"
      aria-label="Cookie preferences"
      className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 sm:px-6 sm:pb-6 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-xl shadow-2xl p-5 sm:p-6 sm:flex sm:items-center sm:gap-6">
        <div className="flex-1 text-sm text-gray-600 leading-relaxed">
          <p className="font-semibold text-gray-900 text-base">We value your privacy</p>
          <p className="mt-1">
            We use essential storage to keep you logged in. With your permission, we may also use cookies to understand
            how the site is used and improve it. You can change this anytime from &quot;Cookie settings&quot; at the
            bottom of the page. See our{" "}
            <Link href="/privacy" className="font-medium text-blue-700 underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </p>
          {current && (
            <p className="mt-2 text-xs text-gray-500">
              Current choice: {current === "accepted" ? "Accepted" : "Rejected"}
            </p>
          )}
        </div>
        <div className="mt-4 sm:mt-0 flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => choose("rejected")}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-full border border-blue-200 bg-white text-blue-700 font-semibold hover:bg-blue-50 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Reject
          </button>
          <button
            ref={acceptRef}
            type="button"
            onClick={() => choose("accepted")}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

/** Footer link that re-opens the banner. */
export function CookieSettingsButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))}
      className={className}
    >
      Cookie settings
    </button>
  );
}

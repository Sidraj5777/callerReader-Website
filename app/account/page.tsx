"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageShell from "@/components/site/PageShell";
import { clearToken, getMyProfile } from "@/lib/auth";
import {
  formatDate,
  getMySubscription,
  isLoggedIn,
  openBillingPortal,
  type MySubscription,
} from "@/lib/billing";

/*
 * My account: current plan, renewal / end date, Manage billing (Stripe
 * Customer Portal: update card, invoices, switch monthly/yearly, cancel).
 * Stripe sends people back here after the portal (stripe.portal-return-url).
 */
export default function AccountPage() {
  const router = useRouter();
  const [me, setMe] = useState<MySubscription | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/auth?next=/account");
      return;
    }
    Promise.all([getMySubscription(), getMyProfile()]).then(([sub, profile]) => {
      if (!sub.ok && (sub.status === 401 || sub.status === 403)) {
        clearToken();
        router.replace("/auth?next=/account");
        return;
      }
      if (sub.ok) setMe(sub.data);
      else setError(sub.message);
      if (profile) {
        setName([profile.firstName, profile.lastName].filter(Boolean).join(" "));
        setEmail(profile.email || "");
      }
      setLoading(false);
    });
  }, [router]);

  const manageBilling = async () => {
    setError("");
    setBusy(true);
    const r = await openBillingPortal();
    if (r.ok) {
      window.location.assign(r.data.url);
      return;
    }
    setBusy(false);
    setError(r.message);
  };

  const logout = () => {
    clearToken();
    router.push("/");
  };

  return (
    <PageShell>
      <section className="px-6 py-14 sm:py-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">My account</h1>
          {(name || email) && (
            <p className="text-gray-600 mt-2">
              {name}
              {name && email ? ", " : ""}
              {email}
            </p>
          )}

          {loading ? (
            <p className="mt-10 text-blue-700" aria-live="polite">
              Loading your plan…
            </p>
          ) : me ? (
            <div className="mt-8 glass-card rounded-3xl p-8">
              <p className="text-sm font-semibold text-gray-500">Your plan</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{me.premium ? "Premium" : "Free"}</p>
              <p className="text-gray-700 mt-3">{planSummary(me)}</p>

              {!me.accountActive && (
                <p className="mt-4 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  Your account is inactive, so recall alerts are paused. Getting Premium reactivates it. To
                  reactivate on Free,{" "}
                  <Link href="/support" className="underline font-semibold">
                    contact support
                  </Link>
                  .
                </p>
              )}

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                {!me.premium && (
                  <Link
                    href="/subscribe"
                    className="text-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg transition"
                  >
                    Get instant alerts with Premium
                  </Link>
                )}
                {me.hasBillingAccount && (
                  <button
                    type="button"
                    onClick={manageBilling}
                    disabled={busy}
                    className="px-6 py-3 rounded-full bg-white text-blue-700 font-semibold border border-blue-200 hover:bg-blue-50 transition disabled:opacity-60"
                  >
                    {busy ? "Opening…" : "Manage billing"}
                  </button>
                )}
              </div>
              {me.hasBillingAccount && (
                <p className="text-xs text-gray-500 mt-3">
                  Update your card, download invoices, switch between monthly and yearly, or cancel.
                </p>
              )}
            </div>
          ) : null}

          {error && (
            <p role="alert" className="mt-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-4">
              {error}
            </p>
          )}

          <div className="mt-8 glass-card rounded-3xl p-8">
            <p className="text-sm font-semibold text-gray-500">Your household profile</p>
            <p className="text-gray-700 mt-2">
              The people, pets, vehicles and products we match recalls against.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/form"
                className="text-center px-6 py-3 rounded-full bg-white text-blue-700 font-semibold border border-blue-200 hover:bg-blue-50 transition"
              >
                Update my profile
              </Link>
              <button
                type="button"
                onClick={logout}
                className="px-6 py-3 rounded-full text-gray-600 font-semibold hover:text-gray-900 transition"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function planSummary(me: MySubscription): string {
  if (me.premium) {
    const date = formatDate(me.currentPeriodEnd);
    if (me.cancelAtPeriodEnd)
      return `Premium ends on ${date}. After that you'll move to Free and get one recall email a week.`;
    return `We email you as soon as we detect a matching recall, with no ads. Renews on ${date}.`;
  }
  return "One email a week with every recall that matches your household. Upgrade to Premium to hear about recalls the moment we detect them.";
}

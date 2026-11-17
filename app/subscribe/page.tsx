"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageShell from "@/components/site/PageShell";
import {
  FALLBACK_PLANS,
  formatDate,
  formatPrice,
  getMySubscription,
  getPlans,
  isLoggedIn,
  openBillingPortal,
  startCheckout,
  type MySubscription,
  type Plan,
} from "@/lib/billing";

/*
 * Plans page. Two tiers:
 *   Free    - weekly email with every matched recall, includes ads
 *   Premium - email as soon as a matching recall is detected, no ads
 *             ($1.99/month or $20/year, launch prices)
 * Paying happens on Stripe's hosted checkout page; we only redirect there.
 */

type Interval = "MONTH" | "YEAR";

export default function SubscribePage() {
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS);
  const [me, setMe] = useState<MySubscription | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [period, setPeriod] = useState<Interval>("YEAR");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const hasToken = isLoggedIn();
    Promise.resolve().then(() => setLoggedIn(hasToken));
    getPlans().then((r) => {
      if (r.ok && r.data.length) setPlans(r.data);
    });
    if (hasToken) {
      getMySubscription().then((r) => {
        if (r.ok) setMe(r.data);
      });
    }
  }, []);

  const monthly = plans.find((p) => p.billingInterval === "MONTH");
  const yearly = plans.find((p) => p.billingInterval === "YEAR");
  const selected = period === "YEAR" ? yearly : monthly;
  const perLabel = period === "YEAR" ? "year" : "month";

  // e.g. 12 x $1.99 = $23.88 vs $20 -> save 16%
  const yearlySavings =
    monthly && yearly && monthly.priceCents > 0
      ? Math.round((1 - yearly.priceCents / (monthly.priceCents * 12)) * 100)
      : 0;

  const isPremium = !!me?.premium;
  const accountInactive = me ? !me.accountActive : false;

  const goToCheckout = async () => {
    if (!selected) return;
    setError("");
    setBusy(true);
    const r = await startCheckout(selected.code);
    if (r.ok) {
      window.location.assign(r.data.url);
      return;
    }
    setBusy(false);
    if (r.status === 401 || r.status === 403) {
      window.location.assign("/auth?next=/subscribe");
      return;
    }
    setError(r.message);
  };

  const goToPortal = async () => {
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

  return (
    <PageShell>
      <section className="px-6 pt-14 pb-6 sm:pt-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 text-balance">
            Choose how you hear about recalls
          </h1>
          <p className="text-lg text-gray-600 mt-5 leading-relaxed">
            Both plans watch every recall for your household. Premium tells
            you the moment we find a match.
          </p>
        </div>
      </section>

      {/* Billing period switch */}
      <div className="flex justify-center px-6">
        <div
          role="radiogroup"
          aria-label="Billing period"
          className="inline-flex rounded-full bg-white/70 border border-blue-100 p-1 shadow-sm"
        >
          {(["MONTH", "YEAR"] as Interval[]).map((i) => (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={period === i}
              onClick={() => setPeriod(i)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                period === i ? "bg-blue-600 text-white shadow" : "text-gray-600 hover:text-blue-700"
              }`}
            >
              {i === "MONTH" ? "Monthly" : "Yearly"}
              {i === "YEAR" && yearlySavings > 0 && (
                <span className={`ml-2 ${period === i ? "text-blue-100" : "text-emerald-600"}`}>
                  save {yearlySavings}%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <section className="px-6 py-10">
        <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2 items-stretch">
          {/* FREE */}
          <article className="glass-card rounded-3xl p-8 flex flex-col">
            <h2 className="text-2xl font-bold text-gray-900">Free</h2>
            <p className="mt-1 text-gray-600">A weekly recall roundup.</p>
            <p className="mt-6 flex items-baseline gap-1">
              <span className="text-5xl font-extrabold text-gray-900">$0</span>
              <span className="text-gray-500">forever</span>
            </p>
            <ul className="mt-6 space-y-3 text-gray-700 flex-1">
              <Feature>One email a week with every recall that matches your household</Feature>
              <Feature>Matched to the people, pets, cars and products in your profile</Feature>
              <Feature>Supported by ads</Feature>
              <Feature>No card needed</Feature>
            </ul>
            <div className="mt-8">
              {!loggedIn ? (
                <Link
                  href="/#signup"
                  className="block text-center px-6 py-3 rounded-full bg-white text-blue-700 font-semibold border border-blue-200 hover:bg-blue-50 transition"
                >
                  Create a free account
                </Link>
              ) : me && !isPremium && !accountInactive ? (
                <p className="text-center px-6 py-3 rounded-full bg-gray-100 text-gray-600 font-semibold">
                  Your current plan
                </p>
              ) : null}
            </div>
          </article>

          {/* PREMIUM */}
          <article className="relative rounded-3xl p-8 flex flex-col bg-gradient-to-br from-blue-700 to-indigo-700 text-white shadow-2xl">
            <h2 className="text-2xl font-bold">Premium</h2>
            <p className="mt-1 text-blue-100">Alerts the moment a recall is detected.</p>
            <p className="mt-6 flex items-baseline gap-1">
              <span className="text-5xl font-extrabold">
                {selected ? formatPrice(selected.priceCents) : "—"}
              </span>
              <span className="text-blue-100">/ {perLabel}</span>
            </p>
            {selected?.regularPriceCents ? (
              <p className="mt-3 text-sm text-blue-50 bg-white/10 rounded-xl px-3 py-2">
                Launch price. Regular price {formatPrice(selected.regularPriceCents)}/{perLabel} after
                the launch period. Lock in your price now.
              </p>
            ) : null}
            <ul className="mt-6 space-y-3 flex-1">
              <Feature light>An email as soon as a matching recall is detected</Feature>
              <Feature light>No ads</Feature>
              <Feature light>Everything in Free</Feature>
              <Feature light>Cancel anytime from your account</Feature>
            </ul>

            <div className="mt-8">
              {isPremium ? (
                <>
                  <p className="text-center font-semibold">You&apos;re on Premium</p>
                  {me?.currentPeriodEnd && (
                    <p className="text-center text-sm text-blue-100 mt-1">
                      {me.cancelAtPeriodEnd ? "Ends" : "Renews"} on {formatDate(me.currentPeriodEnd)}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={goToPortal}
                    disabled={busy}
                    className="mt-4 w-full px-6 py-3 rounded-full bg-white text-blue-700 font-semibold hover:bg-blue-50 transition disabled:opacity-60"
                  >
                    {busy ? "Opening…" : "Manage billing"}
                  </button>
                </>
              ) : loggedIn ? (
                <button
                  type="button"
                  onClick={goToCheckout}
                  disabled={busy || !selected}
                  className="w-full px-6 py-3 rounded-full bg-white text-blue-700 font-semibold hover:bg-blue-50 transition disabled:opacity-60"
                >
                  {busy ? "Opening secure checkout…" : `Get Premium ${period === "YEAR" ? "yearly" : "monthly"}`}
                </button>
              ) : (
                <>
                  <Link
                    href="/auth?next=/subscribe"
                    className="block text-center w-full px-6 py-3 rounded-full bg-white text-blue-700 font-semibold hover:bg-blue-50 transition"
                  >
                    Log in to get Premium
                  </Link>
                  <p className="mt-3 text-center text-sm text-blue-100">
                    New here?{" "}
                    <Link href="/#signup" className="underline underline-offset-4 font-semibold text-white">
                      Create a free account
                    </Link>{" "}
                    first, then upgrade.
                  </p>
                </>
              )}

              {!isPremium && (
                <p className="mt-4 text-xs text-blue-100 leading-relaxed">
                  Renews automatically every {perLabel} until you cancel. Cancel anytime and keep Premium until
                  the end of the period you paid for. Payments are non-refundable. US cards only. See our{" "}
                  <Link href="/terms" className="underline underline-offset-2 text-white">
                    Terms of Service
                  </Link>
                  .
                </p>
              )}
            </div>
          </article>
        </div>

        {accountInactive && (
          <p className="max-w-4xl mx-auto mt-6 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-4">
            Your account is inactive, so recall alerts are paused. Getting Premium reactivates it. To reactivate on
            the Free plan, <Link href="/support" className="underline font-semibold">contact support</Link>.
          </p>
        )}

        {error && (
          <div role="alert" className="max-w-4xl mx-auto mt-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-4">
            <p>{error}</p>
            {me?.hasBillingAccount && !isPremium && (
              <button
                type="button"
                onClick={goToPortal}
                className="mt-2 font-semibold underline underline-offset-4"
              >
                Open Manage billing
              </button>
            )}
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-8">
          Payments are processed securely by Stripe. Recall Radar never sees or stores your card number.
        </p>
      </section>
    </PageShell>
  );
}

function Feature({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <li className="flex gap-3">
      <svg
        viewBox="0 0 20 20"
        className={`w-5 h-5 mt-0.5 shrink-0 ${light ? "text-emerald-300" : "text-emerald-600"}`}
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z"
          clipRule="evenodd"
        />
      </svg>
      <span>{children}</span>
    </li>
  );
}

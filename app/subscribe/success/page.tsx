"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PageShell from "@/components/site/PageShell";
import {
  confirmCheckout,
  formatDate,
  getMySubscription,
  isLoggedIn,
  type MySubscription,
} from "@/lib/billing";

type State = "checking" | "active" | "pending" | "login" | "error";

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [state, setState] = useState<State>("checking");
  const [me, setMe] = useState<MySubscription | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) {
      Promise.resolve().then(() => setState("login"));
      return;
    }
    let cancelled = false;

    const run = async () => {
      // 1) Ask the backend to read the finished checkout from Stripe right away.
      if (sessionId) {
        const r = await confirmCheckout(sessionId);
        if (cancelled) return;
        if (r.ok && r.data.premium) {
          setMe(r.data);
          setState("active");
          return;
        }
        if (!r.ok && r.status !== 502) {
          setMessage(r.message);
          setState("error");
          return;
        }
      }
      // 2) Otherwise wait for Stripe's webhook to land (usually a few seconds).
      for (let attempt = 0; attempt < 6; attempt++) {
        await new Promise((res) => setTimeout(res, 2000));
        if (cancelled) return;
        const r = await getMySubscription();
        if (r.ok && r.data.premium) {
          setMe(r.data);
          setState("active");
          return;
        }
      }
      if (!cancelled) setState("pending");
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <section className="flex items-center justify-center px-6 py-16 sm:py-24">
      <div className="glass-card max-w-xl w-full p-8 md:p-10 rounded-3xl shadow-2xl text-center" aria-live="polite">
        {state === "checking" && (
          <>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Confirming your payment…</h1>
            <p className="text-gray-600 mt-3">This usually takes a few seconds. Please keep this page open.</p>
          </>
        )}

        {state === "active" && (
          <>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Premium is active</h1>
            <p className="text-gray-700 mt-4 text-lg">
              From now on we&apos;ll email you as soon as we detect a recall that matches your household, with no
              ads.
            </p>
            {me?.currentPeriodEnd && (
              <p className="text-gray-500 mt-2">Your plan renews on {formatDate(me.currentPeriodEnd)}.</p>
            )}
            <p className="text-gray-500 mt-2 text-sm">A receipt is on its way to your email.</p>
            <Actions />
          </>
        )}

        {state === "pending" && (
          <>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Payment received</h1>
            <p className="text-gray-600 mt-3">
              We&apos;re still activating Premium on your account. Check your account page in a minute. If it
              still shows Free after 10 minutes, contact support and we&apos;ll sort it out.
            </p>
            <Actions />
          </>
        )}

        {state === "login" && (
          <>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Payment received</h1>
            <p className="text-gray-600 mt-3">Log in to see your Premium plan.</p>
            <Link
              href="/auth?next=/account"
              className="inline-block mt-8 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md"
            >
              Log in
            </Link>
          </>
        )}

        {state === "error" && (
          <>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">We couldn&apos;t confirm this payment</h1>
            <p className="text-gray-600 mt-3">{message}</p>
            <p className="text-gray-600 mt-2">
              If you were charged, contact support with the email you paid with.
            </p>
            <Actions />
          </>
        )}
      </div>
    </section>
  );
}

function Actions() {
  return (
    <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
      <Link
        href="/account"
        className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg transition"
      >
        Go to my account
      </Link>
      <Link
        href="/form"
        className="px-6 py-3 rounded-full bg-white text-blue-700 font-semibold border border-blue-200 hover:bg-blue-50 transition"
      >
        Update my profile
      </Link>
    </div>
  );
}

export default function SubscribeSuccessPage() {
  return (
    <PageShell>
      <Suspense fallback={null}>
        <SuccessContent />
      </Suspense>
    </PageShell>
  );
}

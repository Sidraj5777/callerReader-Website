import { authFetch, getToken } from "./auth";

/*
 * Client for the backend's /api/payments endpoints (Stripe).
 * The browser never talks to Stripe directly: the backend creates a Stripe
 * Checkout / Customer Portal session and we redirect to the URL it returns.
 */

export type BillingInterval = "NONE" | "MONTH" | "YEAR";

export interface Plan {
  code: string; // FREE | PREMIUM_MONTHLY | PREMIUM_YEARLY
  name: string;
  billingInterval: BillingInterval;
  priceCents: number;
  regularPriceCents: number | null;
  currency: string;
  deliveryMode: "WEEKLY_DIGEST" | "INSTANT";
  adsEnabled: boolean;
}

export interface MySubscription {
  accountActive: boolean;
  planCode: string;
  planName: string;
  premium: boolean;
  deliveryMode: "WEEKLY_DIGEST" | "INSTANT";
  adsEnabled: boolean;
  subscriptionStatus: "ACTIVE" | "CANCEL_SCHEDULED" | "PAYMENT_FAILED" | "ENDED" | null;
  currentPeriodEnd: string | null; // ISO date
  cancelAtPeriodEnd: boolean;
  hasBillingAccount: boolean;
}

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

async function call<T>(path: string, init: RequestInit = {}): Promise<Result<T>> {
  try {
    const res = await authFetch(path, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        message:
          (data && (data.message || data.error)) ||
          "Something went wrong. Please try again.",
      };
    }
    return { ok: true, data: data as T };
  } catch (err) {
    console.error(err);
    return { ok: false, status: 0, message: "Network error. Please check your connection and try again." };
  }
}

export const isLoggedIn = () => !!getToken();

export const getPlans = () => call<Plan[]>("/api/payments/plans");

export const getMySubscription = () => call<MySubscription>("/api/payments/me");

export const startCheckout = (planCode: string) =>
  call<{ url: string }>("/api/payments/checkout", {
    method: "POST",
    body: JSON.stringify({ planCode }),
  });

export const confirmCheckout = (sessionId: string) =>
  call<MySubscription>(
    `/api/payments/checkout/confirm?sessionId=${encodeURIComponent(sessionId)}`,
    { method: "POST" },
  );

export const openBillingPortal = () =>
  call<{ url: string }>("/api/payments/portal", { method: "POST" });

/** 199 -> "$1.99", 2000 -> "$20" */
export function formatPrice(cents: number): string {
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

/** "2026-11-22T10:00:00Z" -> "November 22, 2026" */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

/** Fallback plans so the page still renders if the API is slow or down. */
export const FALLBACK_PLANS: Plan[] = [
  { code: "FREE", name: "Free", billingInterval: "NONE", priceCents: 0, regularPriceCents: null, currency: "usd", deliveryMode: "WEEKLY_DIGEST", adsEnabled: true },
  { code: "PREMIUM_MONTHLY", name: "Premium Monthly", billingInterval: "MONTH", priceCents: 199, regularPriceCents: 600, currency: "usd", deliveryMode: "INSTANT", adsEnabled: false },
  { code: "PREMIUM_YEARLY", name: "Premium Yearly", billingInterval: "YEAR", priceCents: 2000, regularPriceCents: 3000, currency: "usd", deliveryMode: "INSTANT", adsEnabled: false },
];

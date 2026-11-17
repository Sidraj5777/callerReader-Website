/*
 * Cookie consent: stores the visitor's Accept / Reject choice.
 *
 * Nothing optional (analytics, ad or tracking scripts) is loaded yet. When you
 * add one, load it only after consent, for example:
 *
 *   import { onConsentChange } from "@/lib/consent";
 *   onConsentChange((status) => { if (status === "accepted") loadAnalytics(); });
 *
 * The choice is saved in localStorage (for the site) and in a first-party
 * cookie "rr_consent" (so the server / Nginx can read it later if needed).
 * Bump CONSENT_VERSION if what you use cookies for changes; everyone is
 * asked again.
 */

export type ConsentStatus = "accepted" | "rejected";

const STORAGE_KEY = "rr_cookie_consent";
const COOKIE_NAME = "rr_consent";
const CONSENT_VERSION = 1;
const MAX_AGE_DAYS = 365;
const CHANGE_EVENT = "rr:consent-change";
const OPEN_EVENT = "rr:consent-open";

interface StoredConsent {
  status: ConsentStatus;
  version: number;
  date: string;
}

/** The visitor's saved choice, or null if they haven't chosen (or it expired). */
export function getConsent(): ConsentStatus | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as StoredConsent;
    const ageDays = (Date.now() - new Date(saved.date).getTime()) / 86_400_000;
    if (saved.version !== CONSENT_VERSION || !(ageDays < MAX_AGE_DAYS)) return null;
    return saved.status === "accepted" || saved.status === "rejected" ? saved.status : null;
  } catch {
    return null;
  }
}

/** True only when the visitor clicked Accept. Use this before loading optional scripts. */
export function hasConsent(): boolean {
  return getConsent() === "accepted";
}

export function setConsent(status: ConsentStatus): void {
  const saved: StoredConsent = { status, version: CONSENT_VERSION, date: new Date().toISOString() };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // Storage blocked (private mode etc.): the cookie below still records the choice for this session.
  }
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=${status}; Max-Age=${MAX_AGE_DAYS * 86_400}; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent<ConsentStatus>(CHANGE_EVENT, { detail: status }));
}

/**
 * Runs `callback` with the current choice (if any) and again whenever it changes.
 * Returns a function that stops listening.
 */
export function onConsentChange(callback: (status: ConsentStatus) => void): () => void {
  const current = getConsent();
  if (current) callback(current);
  const handler = (e: Event) => callback((e as CustomEvent<ConsentStatus>).detail);
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
}

/** Re-opens the banner so the visitor can change their choice (footer "Cookie settings"). */
export function openConsentBanner(): void {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export const CONSENT_OPEN_EVENT = OPEN_EVENT;

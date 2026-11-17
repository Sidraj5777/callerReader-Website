/*
 * Central site details used by the header, footer, support and legal pages.
 * Update values here instead of editing each page.
 *
 * TODO before launch: fill in LEGAL.* with the real company details and have
 * the Privacy Policy and Terms of Service reviewed by a lawyer.
 */

export const SITE = {
  name: "Recall Radar",
  tagline: "We worry so you don't have to.",
  // Used for sitemap.xml / robots.txt. Set NEXT_PUBLIC_SITE_URL per environment.
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://testrecallradar.com").replace(/\/$/, ""),
  supportEmail: "Raj@recallradar.info",
  privacyEmail: "Raj@recallradar.info",
  social: {
    facebook: "https://www.facebook.com/people/Recall-Radar/100089118953760/?sk=about",
    x: "https://x.com/RecallRadar",
    instagram: "https://www.instagram.com/recallradar/",
  },
} as const;

export const LEGAL = {
  // Registered legal name (also the public business name in Stripe)
  entityName: "Safety Works, LLC",
  // TODO: state whose law governs the Terms, e.g. "Delaware"
  governingState: "the state in which Recall Radar is registered",
  // TODO: postal address for legal notices (optional but recommended)
  mailingAddress: "",
  lastUpdated: "October 22, 2026",
} as const;

/** "How we share information" -> "how-we-share-information" (used for section anchors) */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

# Website update: Oct 27 (Raj's website mods, recall_website_mods_10_25.docx)

1. Blog removed: /blog and all /blog/<post> pages, the homepage "Recall know-how" section,
   header + footer "Blog" links and the sitemap entries. Deleted app/blog, components/blog,
   lib/blog.ts (the articles are still in git history for re-use in the weekly email).
   headingId() moved to lib/site.ts (used by the legal pages).
2. Homepage bottom panel: "Join Early Access" button removed (only "See plans" remains).
3. Privacy: sensitive-information paragraph added to end of section 1; section 4
   "How we share information" replaced with the new text (placeholder removed).
4. Terms: section 7 "Your information" placeholder replaced with the same sharing text.
5. FAQ "How much does it cost?" answer updated (two plans: free weekly w/ ads, paid instant + ad free).
6. "Early Access" language removed:
   - Signup card heading -> "Get Relevant Recall Notices"
   - Header + footer button -> "Get Recall Notices"
   - Bottom panel price line "Early access:" -> "Premium:"
   - /subscribe "Early access price." -> "Launch price."
   - /form "Continue below to get early access to personalized..." -> "...to get personalized..."
   - Terms s.1 dropped "especially while the service is in early access";
     Terms price changes "early-access prices" -> "introductory prices"

## Cookie consent (Accept / Reject)
- components/site/CookieConsent.tsx: banner on every page (added in app/layout.tsx) until the
  visitor chooses. Footer "Support & legal" has a "Cookie settings" link to change the choice.
- lib/consent.ts: saves the choice (localStorage "rr_cookie_consent" + cookie "rr_consent",
  365 days) and exposes getConsent(), hasConsent(), onConsentChange(), openConsentBanner().
- Nothing optional is loaded yet. When adding analytics/ads, load them only inside
  onConsentChange((s) => s === "accepted" && ...). Bump CONSENT_VERSION to re-ask everyone.

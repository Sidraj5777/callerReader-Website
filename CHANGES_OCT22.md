# Frontend update: Oct 22 (Raj's profile feedback + Stripe plans)

## Raj's profile feedback (app/form/page.tsx)
1. Gender: "Other" removed (adult question and the clothing/cosmetics people list).
   Old saved "OTHER" values show as unselected, so the person picks again.
2. Each child now has a required Gender (Male, Female, Transgender, Non binary,
   Prefer not to answer). Needs backend edits: backend-changes/PROFILE_FIXES_OCT22.md
3. Child allergies are multi-select chips ("No allergies" + options + Other with
   free text). Saved as "PEANUT,MILK" in the existing column; old single values load fine.
4/5. Returning users see "Thank you for joining!" / "You can modify your selections
   below and we will update our recall radar search for you." Button: "Update my profile".
6. Save errors: a 5xx now shows a clear message instead of "Server error: Could not
   save your profile". Root cause and fixes are in backend-changes/PROFILE_FIXES_OCT22.md.
   Also fixed: removing a child no longer shifts typed allergy text into another child.

## Subscription (Stripe)
| Route | What it does |
| --- | --- |
| /subscribe | Plans page: Free vs Premium, monthly/yearly switch, early-access prices, renewal/no-refund disclosure. Logged-in users go straight to Stripe Checkout; Premium users get Manage billing. Replaces the interest form. |
| /subscribe/success | Stripe returns here after paying. Confirms with the backend, waits for the webhook if needed. |
| /subscribe/cancel | Stripe returns here if checkout is abandoned. |
| /account | Current plan, renewal or end date, Manage billing (Stripe portal), Update my profile, Log out. |

Other changes:
- lib/billing.ts: client for /api/payments/*. lib/auth.ts: authFetch exported, child gender type, better error text.
- Header: "Subscribe" -> "Plans"; shows "My account" when logged in. Footer: "Plans & pricing".
- /auth?next=/subscribe opens on Login and returns there after login (only same-site paths allowed).
- Thank-you page: plan-aware text (Free = weekly email) with Premium link and My account button.
- Homepage plan section: real plan copy instead of "coming soon".
- robots.txt: /account and /subscribe/success|cancel excluded.
- Inactive-account banner on the form now says "Your account is inactive" and links to plans.

## Backend settings these pages rely on
stripe.success-url = ${app.frontend.base-url}/subscribe/success?session_id={CHECKOUT_SESSION_ID}
stripe.cancel-url  = ${app.frontend.base-url}/subscribe/cancel
stripe.portal-return-url = ${app.frontend.base-url}/account

---

# Update v4 (Oct 22, later)

| Change | Files |
| --- | --- |
| New /about page: Raj's photo, credentials under the photo, "Meet the Founder" text exactly as provided. Linked in header ("About"), footer ("About the founder") and sitemap. | app/about/page.tsx, public/team/raj-ratwani.jpg (cropped, 800x1000, photo metadata removed) |
| Legal entity is now "Safety Works, LLC" (used in Terms and Privacy intros). Last updated: October 22, 2026. | lib/site.ts |
| Privacy: "data sharing terms" placeholder in section 4. Removed the statements that contradicted Raj's plan ("we don't sell or share", "we don't use your profile for advertising"). Billing/Stripe bullet replaces the old "subscription interest" bullet. | app/privacy/page.tsx |
| Terms: "Subscriptions and payment" now has the real plan terms (auto-renewal, cancel anytime, no refunds, failed payment -> Free, plan switch at renewal, US cards, early-access price changes). "Your information" has the data sharing placeholder. DRAFT for Raj / lawyer review. | app/terms/page.tsx |

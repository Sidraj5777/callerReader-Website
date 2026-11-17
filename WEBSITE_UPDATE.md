# Website update: October 2026

This update adds new public pages and improves the homepage. **No login, signup,
password reset, profile form, subscribe or thank-you logic was changed.** Round 2
(below) made small, approved UI additions to the auth forms and the subscribe page
frame; their submit logic and API calls are still unchanged.

## Files that were NOT touched (byte-identical to the previous version)

- `app/form/page.tsx` (household profile form and matching inputs)
- `app/auth/page.tsx`, `app/auth/reset-password/page.tsx`
- `app/subscribe/page.tsx`, `app/thank-you/page.tsx`
- `app/layout.tsx`
- `components/auth/*` (LoginForm, SignupForm, ForgotPasswordForm, ResetPasswordForm)
- `lib/auth.ts`, `components/Reveal.tsx`, `components/icons/RecallIcons.tsx`
- `backend-changes/*`, all `.env*` files, `package.json` (no new dependencies)

## Changed files

| File | What changed |
| --- | --- |
| `app/page.tsx` | Homepage redesigned (details below). The signup/login/forgot-password widget, its state, `goToForm`, and the `router.push` calls to `/form` and `/subscribe` are unchanged. |
| `app/globals.css` | Only **appended** styles at the end of the file (radar animation, anchor scroll offset, focus ring, article typography). Existing classes untouched. |

## New pages

| Route | Purpose |
| --- | --- |
| `/approach` | "Our approach": the public explanation of how Recall Radar works. Uses our own six-stage model (Watch, Decode, Know your home, Match, Double-check, Deliver), principles, and a note that matching rules are proprietary. **No algorithm logic is described.** |
| `/blog` | Blog index with topic filter and a featured post. |
| `/blog/[slug]` | Article pages with "short version" summary, table of contents, callouts, signup CTA and related posts. Statically generated. |
| `/support` | Quick-help cards, contact form, direct email, and a medical-emergency notice. |
| `/privacy` | Privacy Policy (draft, see legal notes). |
| `/terms` | Terms of Service (draft, see legal notes). Includes anti-scraping and anti-reverse-engineering clauses. |
| `/sitemap.xml`, `/robots.txt` | SEO. `/form`, `/auth`, `/thank-you` are excluded from crawling. |

No public recall listing pages were added, as requested.

## New components and config

- `lib/site.ts`: one place for the site URL, support email, social links and legal placeholders.
- `components/site/SiteHeader.tsx`: shared header with mobile menu.
- `components/site/SiteFooter.tsx`: shared footer (What we watch / Recall Radar / Support & legal).
- `components/site/PageShell.tsx`: shared background, header and footer for new pages.
- `components/home/RadarVisual.tsx`: animated radar hero with an example alert card (illustrative only).
- `components/home/Faq.tsx`: homepage FAQ.
- `components/blog/*`: cover art (SVG, no stock photos), post cards, index filter, bold-text renderer.
- `components/support/SupportForm.tsx`: support form.
- `components/legal/LegalPage.tsx`: shared layout for legal pages.
- `lib/blog.ts`: all blog posts as data.

## Homepage changes

1. Shared header with links to How it works, Our approach, Blog, Support (plus mobile menu).
2. Two-column hero: headline and the existing signup widget (now `id="signup"`) on the left, animated radar and example alert on the right.
3. "What Recall Radar watches for you" section: the five categories with descriptions and the existing SVG icons.
4. Problem statement and stats (same copy and numbers as before).
5. New "One profile for everyone under your roof" section showing per-person / per-pet matching.
6. How It Works (same three steps), with a link to `/approach`.
7. New comparison table: checking agency websites yourself vs Recall Radar.
8. Testimonials carousel (same content; added accessible labels to the dots).
9. New "Recall know-how" section with the three latest blog posts.
10. New FAQ.
11. Subscribe CTA (same text) plus a Join Early Access button.
12. Shared footer.

## Before launch: please review

**Content to confirm with the team**
- FAQ answer "Will you sell my information? No." and the privacy statements must match what the backend actually does.
- The example alert ("Why you're seeing this…") should reflect the real alert email format.
- Approach page wording ("monitored around the clock", "verified before they're sent") must match the real pipeline.

**Legal**
- Privacy Policy and Terms are drafts written for this product, not legal advice. Have them reviewed by a lawyer, especially because the profile holds health-related data (allergies, medications), which some U.S. state laws treat as sensitive.
- Fill in `LEGAL.entityName`, `LEGAL.governingState` and optionally `LEGAL.mailingAddress` in `lib/site.ts`.
- Update the Terms "Subscriptions and payment" section once pricing is final.

**Config**
- Set `NEXT_PUBLIC_SITE_URL` in each `.env.*` file (used by sitemap/robots). Defaults to `https://testrecallradar.com`.

**Support form**
- There is no support API yet, so the form opens the visitor's email app with the message pre-filled to `SITE.supportEmail`. To send it through the backend instead, replace the body of `handleSubmit` in `components/support/SupportForm.tsx` with a `fetch()` call (the fields stay the same).

## Adding a blog post

Add an object to the `posts` array in `lib/blog.ts` with a unique `slug`, a `category`, a `cover` style, `takeaways`, and `body` blocks (`p`, `h2`, `h3`, `list`, `callout`). Use `**text**` for bold. The page, sitemap entry and homepage card are generated automatically. Write original content only.

## Testing done

- `next build` succeeds (all 22 routes generate, including the 6 blog posts). In the sandbox, Google Fonts couldn't be downloaded, so the build was verified with the font import temporarily removed; `app/layout.tsx` itself is unchanged.
- ESLint passes on all new and changed files. Existing lint errors in `app/form/page.tsx` and `components/auth/LoginForm.tsx` were already there and were left alone on purpose.
- Pages checked visually at desktop (1366px) and mobile (390px) widths.

---

## Round 2 changes

### 1. Footer: removed "What we watch"
The footer column linking Food / Pet food / Children's products / Consumer products /
Medications & devices was removed. The footer now has: brand + contact, "Recall Radar"
links, and "Support & legal". No recall data is shown anywhere on the public site.

### 2. Subscribe page now uses the shared site layout
`app/subscribe/page.tsx`: only the outer frame changed. Its separate nav bar, background and
small footer were replaced with the same `PageShell` (header + footer) used by Support,
Blog, etc., so it no longer feels like a separate website. The form, validation, honeypot,
auto-fill for expired subscriptions, API call and success screen are untouched. When a user
arrives from the profile form (`?source=expired`), a "Back to my preferences" link still
appears above the form.

### 3. Show/hide password (eye) button
New `components/auth/PasswordInput.tsx`, used for every password field in `SignupForm`,
`LoginForm` and `ResetPasswordForm`. Each change replaces `<input type="password">` with
`<PasswordInput>` using the same value, onChange, placeholder and className. Validation and
submit code are unchanged. Also adds correct `autoComplete` hints so password managers work.

### 4. Continue with Google
- `components/auth/GoogleSignInButton.tsx`: Google Identity Services button (popup mode).
  It's shown under the Sign Up and Login tabs on the homepage and on `/auth`.
- `lib/auth.ts`: appended `loginWithGoogle()`, which posts the Google credential to
  `POST /api/auth/google`. Existing functions are unchanged.
- After Google sign-in, the token is saved with the existing `saveToken()` and the user goes
  to `/form`, exactly like email signup/login.
- **The button is hidden until `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set**, so this can be
  deployed safely before the backend is ready.
- Backend: `backend-changes/GoogleAuthController.java` + setup steps in
  `backend-changes/README.md` (Google Cloud client ID, Maven dependency, SecurityConfig,
  properties). Adapt the three `TODO` lines to your `AuthController` / `User` entity.

**Account linking:** if someone signs in with Google using an email that already has a
password account, they're logged into that same account (Google has verified they own
the email). New Google users get a random unusable password; they can set one later with
"Forgot password".

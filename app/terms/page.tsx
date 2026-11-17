import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/legal/LegalPage";
import { LEGAL, SITE } from "@/lib/site";

/*
 * DRAFT — have this reviewed by a lawyer before launch. In particular,
 * confirm governing law (LEGAL.governingState in lib/site.ts), the
 * limitation-of-liability wording, and subscription/refund terms once
 * pricing is final.
 */

export const metadata: Metadata = {
  title: "Terms of Service | Recall Radar",
  description: "The terms that apply when you use Recall Radar.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro={
        <p>
          These terms are an agreement between you and {LEGAL.entityName} (&quot;Recall Radar&quot;, &quot;we&quot;,
          &quot;us&quot;) and apply when you use the Recall Radar website and service. By creating an account or using the
          service, you agree to them. If you don&apos;t agree, please don&apos;t use Recall Radar.
        </p>
      }
      summary={[
        "Recall Radar helps you find out about recalls, but it can't guarantee it catches every one.",
        "Alerts are information, not medical, veterinary or legal advice. Always follow the official recall notice.",
        "Keep your account secure, and don't misuse, copy or scrape the service.",
        "Free is free. Premium renews automatically until you cancel; you can cancel anytime, and payments are non-refundable.",
      ]}
      sections={[
        {
          title: "The service",
          content: (
            <p>
              Recall Radar monitors publicly available product recall and safety information and sends you alerts about
              recalls that appear to match the household profile you provide. We may add, change or remove features over
              time.
            </p>
          ),
        },
        {
          title: "Important limits on what Recall Radar does",
          content: (
            <>
              <p>
                <strong>Recall Radar is an alert service, not a guarantee.</strong> We work hard to be accurate, but
                recall information comes from third parties and can be incomplete, delayed or changed after it&apos;s
                published. Matching depends on the information in your profile. We can&apos;t promise that we will
                identify every recall that affects you, or that every alert will apply to your specific product.
              </p>
              <p>
                <strong>It isn&apos;t professional advice.</strong> Nothing we send is medical, veterinary, pharmaceutical
                or legal advice. Always read and follow the official recall notice, and talk to a doctor, pharmacist or
                veterinarian before changing a medication or treatment. Don&apos;t stop a prescribed medication because
                of an alert without speaking to your healthcare provider.
              </p>
              <p>
                <strong>Emergencies:</strong> if someone may be harmed by a product, contact a healthcare provider or call
                911. Recall Radar is not an emergency service.
              </p>
            </>
          ),
        },
        {
          title: "Your account",
          content: (
            <ul>
              <li>You must be at least 18 years old to create an account.</li>
              <li>Give accurate information and keep your profile up to date. Better information means better matches.</li>
              <li>Keep your password confidential. You&apos;re responsible for activity under your account.</li>
              <li>Tell us promptly at <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> if you think your account has been compromised.</li>
            </ul>
          ),
        },
        {
          title: "Acceptable use",
          content: (
            <>
              <p>You agree not to:</p>
              <ul>
                <li>Copy, scrape, crawl, harvest or systematically download content or data from Recall Radar, by automated means or otherwise.</li>
                <li>Reverse engineer, decompile or attempt to discover our matching methods, source code or underlying data, except where the law expressly allows it.</li>
                <li>Interfere with or disrupt the service, probe its security, or bypass rate limits or access controls.</li>
                <li>Resell, redistribute or build a competing product using our alerts or content.</li>
                <li>Use the service for anything unlawful, or create accounts with false information or on behalf of others without permission.</li>
              </ul>
            </>
          ),
        },
        {
          title: "Subscriptions and payment",
          content: (
            <>
              <p>
                <strong>Plans.</strong> Recall Radar offers a Free plan and a paid Premium plan. The Free plan sends one email
                a week listing recalls that match your household profile and may include advertising. Premium sends an email
                when we detect a recall that matches your profile and does not include advertising. Plan features and
                prices are shown on our <Link href="/subscribe">plans page</Link> before you subscribe.
              </p>
              <p>
                <strong>Billing and automatic renewal.</strong> Premium is billed in advance, monthly or yearly, in US
                dollars. <strong>Your subscription renews automatically</strong> at the end of each billing period, and we
                charge your payment method for the next period, until you cancel. For yearly plans, we&apos;ll email you a
                reminder before your renewal. Payments are processed by Stripe; we don&apos;t store your full card number.
                Paid plans are available only with cards issued in the United States.
              </p>
              <p>
                <strong>Cancellation.</strong> You can cancel anytime from your account page (&quot;Manage billing&quot;).
                Cancellation stops future renewals. You keep Premium until the end of the period you already paid for, and
                your account then moves to the Free plan.
              </p>
              <p>
                <strong>No refunds.</strong> Payments are non-refundable, including for partially used billing periods, except
                where a refund is required by law.
              </p>
              <p>
                <strong>Failed payments.</strong> If a payment fails, your account moves to the Free plan right away. If the
                payment later succeeds (for example after you update your card), Premium is restored.
              </p>
              <p>
                <strong>Switching plans.</strong> You can switch between monthly and yearly billing from your account page.
                The change takes effect at your next renewal.
              </p>
              <p>
                <strong>Price changes.</strong> Launch prices are introductory prices and may increase later. If we change the
                price of your plan, we&apos;ll tell you in advance, and the new price will apply only from a renewal after
                that notice. You can cancel before then.
              </p>
            </>
          ),
        },
        {
          title: "Our content and intellectual property",
          content: (
            <p>
              Recall Radar, including its software, design, text, summaries, logos and matching methods, is owned by us or
              our licensors and protected by intellectual property laws. We give you a personal, non-transferable,
              revocable permission to use the service for your own household&apos;s non-commercial purposes. Underlying
              government recall notices remain public information.
            </p>
          ),
        },
        {
          title: "Your information",
          content: (
            <>
              <p>
                You keep ownership of the information you add to your profile. You give us permission to use it to provide
                and improve the service, as described in our <Link href="/privacy">Privacy Policy</Link>.
              </p>
              <p>
                <strong>
                  We do not sell your personal information. We do not share it with retailers, manufacturers, or
                  advertisers.
                </strong>
              </p>
              <p>We share information only in these limited situations:</p>
              <ul>
                <li>
                  <strong>Service providers.</strong> We use companies that help us run the Service, such as email
                  delivery, website hosting, analytics, customer support, and payment processing (Stripe). They may use
                  your information only to perform services for us and are not permitted to use it for their own
                  marketing.
                </li>
                <li>
                  <strong>Legal reasons.</strong> We may disclose information if required by law, subpoena, or other legal
                  process, or if needed to protect the safety, rights, or property of our users, the public, or Recall
                  Radar.
                </li>
                <li>
                  <strong>Business changes.</strong> If Recall Radar is involved in a merger, acquisition, financing, or
                  sale of assets, your information may be transferred. We will tell you before it becomes subject to a
                  different privacy policy.
                </li>
                <li>
                  <strong>With your direction.</strong> We share information when you ask us to.
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "Third-party links",
          content: (
            <p>
              Alerts and articles may link to government agencies, manufacturers or retailers. We don&apos;t control those
              sites and aren&apos;t responsible for their content or practices.
            </p>
          ),
        },
        {
          title: "Disclaimers",
          content: (
            <p>
              To the fullest extent permitted by law, Recall Radar is provided &quot;as is&quot; and &quot;as
              available&quot;, without warranties of any kind, whether express or implied, including warranties of
              accuracy, completeness, merchantability, fitness for a particular purpose and non-infringement.
            </p>
          ),
        },
        {
          title: "Limitation of liability",
          content: (
            <p>
              To the fullest extent permitted by law, Recall Radar will not be liable for any indirect, incidental,
              special, consequential or punitive damages, or for any loss arising from a recall we did not detect or an
              alert that was delayed or inaccurate. Our total liability for any claim relating to the service will not
              exceed the greater of the amount you paid us in the 12 months before the claim or US $50. Some places
              don&apos;t allow these limits, so they may not all apply to you.
            </p>
          ),
        },
        {
          title: "Indemnity",
          content: (
            <p>
              If you misuse the service or break these terms and that leads to a claim against us, you agree to cover the
              reasonable costs and losses that result, to the extent permitted by law.
            </p>
          ),
        },
        {
          title: "Ending your use",
          content: (
            <p>
              You can stop using Recall Radar and ask us to delete your account at any time. We may suspend or close
              accounts that break these terms or put the service or other users at risk. Sections that by their nature
              should continue (such as intellectual property, disclaimers and limitation of liability) survive.
            </p>
          ),
        },
        {
          title: "Governing law",
          content: (
            <p>
              These terms are governed by the laws of {LEGAL.governingState} and applicable U.S. federal law, without
              regard to conflict-of-law rules.
            </p>
          ),
        },
        {
          title: "Changes to these terms",
          content: (
            <p>
              We may update these terms as the service grows. We&apos;ll revise the &quot;Last updated&quot; date, and for
              significant changes we&apos;ll notify you by email or on the site before they take effect. Continuing to use
              Recall Radar after that means you accept the updated terms.
            </p>
          ),
        },
        {
          title: "Contact",
          content: (
            <p>
              Questions about these terms? Email <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> or visit
              our <Link href="/support">support page</Link>.
            </p>
          ),
        },
      ]}
    />
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/legal/LegalPage";
import { LEGAL, SITE } from "@/lib/site";

/*
 * DRAFT — have this reviewed by a lawyer before launch, and check every
 * statement against how the backend actually stores and processes data.
 */

export const metadata: Metadata = {
  title: "Privacy Policy | Recall Radar",
  description: "How Recall Radar collects, uses and protects your information.",
};

const mail = <a href={`mailto:${SITE.privacyEmail}`}>{SITE.privacyEmail}</a>;

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={
        <p>
          Recall Radar needs to know a little about your household to tell you which recalls matter to you. This policy
          explains what we collect, why, and the choices you have. It applies to the Recall Radar website and service
          operated by {LEGAL.entityName} (&quot;Recall Radar&quot;, &quot;we&quot;, &quot;us&quot;).
        </p>
      }
      summary={[
        "We collect your account details and the household profile you choose to give us.",
        "We use it to match recalls to your household and send you alerts.",
        "How we may share your information is described in section 4, \"How we share information\".",
        "You can ask us to access, correct or delete your information at any time.",
      ]}
      sections={[
        {
          title: "Information we collect",
          content: (
            <>
              <h3>Information you give us</h3>
              <ul>
                <li><strong>Account details:</strong> your first name, last name, email address and password.</li>
                <li>
                  <strong>Household profile:</strong> the information you add about the people, pets, foods, children&apos;s
                  products, consumer products, medications and medical devices in your home. This can include
                  health-related details such as allergies, dietary needs and medications.
                </li>
                <li>
                  <strong>Billing details:</strong> if you choose a paid plan, our payment processor, Stripe, collects your
                  card details. We never see or store your full card number. Stripe shares with us your plan, payment status,
                  billing period and the last four digits and expiry date of your card.
                </li>
                <li><strong>Support messages:</strong> anything you include when you contact us.</li>
              </ul>
              <p>
                Information about your allergies, your children, and your pets can be sensitive. We ask for it only so we
                can match recalls to you. By providing it, you consent to our using it for that purpose. We do not use it
                for advertising, and we do not share it with retailers, manufacturers, or advertisers. You can remove it
                from your account at any time, and you can withdraw your consent by deleting the information or your
                account.
              </p>
              <h3>Information collected automatically</h3>
              <ul>
                <li>
                  <strong>Login token:</strong> when you sign in, your browser stores a token in local storage so you stay
                  logged in. Logging out or clearing your browser data removes it.
                </li>
                <li>
                  <strong>Technical data:</strong> like most websites, our servers may record basic information such as IP
                  address, browser type and pages requested, for security and troubleshooting.
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "How we use your information",
          content: (
            <ul>
              <li>To create and secure your account.</li>
              <li>To compare recalls with your household profile and send you the alerts that match.</li>
              <li>To respond to support requests and subscription enquiries.</li>
              <li>To keep the service running, fix problems, prevent abuse, and improve the accuracy of our matching.</li>
              <li>To send service messages, such as password resets or important changes to these terms.</li>
              <li>To comply with the law.</li>
            </ul>
          ),
        },
        {
          title: "Health-related information",
          content: (
            <p>
              Allergy, dietary and medication details are sensitive. We use them to identify recalls that may affect your
              household. Any sharing of this information is covered in section 4, &quot;How we share information&quot;.
              You choose what to include, and you can remove it from your profile at any time.
              Recall Radar is not a healthcare provider, and adding this information does not create a doctor-patient
              or pharmacist relationship.
            </p>
          ),
        },
        {
          title: "How we share information",
          content: (
            <>
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
          title: "Cookies and tracking",
          content: (
            <p>
              We currently use browser local storage only to keep you logged in. We don&apos;t use advertising cookies. If
              we add analytics or other tracking tools in the future, we&apos;ll update this policy first.
            </p>
          ),
        },
        {
          title: "How long we keep information",
          content: (
            <p>
              We keep your account and profile while your account is active. If you ask us to delete your account,
              we&apos;ll delete or anonymize your information within a reasonable period, except where we need to keep
              some records to meet legal obligations, resolve disputes or prevent abuse.
            </p>
          ),
        },
        {
          title: "Security",
          content: (
            <p>
              We use administrative, technical and physical safeguards designed to protect your information, including
              encrypted connections between your browser and our servers. No system is perfectly secure, so please use a
              strong, unique password and tell us right away if you think your account has been compromised.
            </p>
          ),
        },
        {
          title: "Your choices and rights",
          content: (
            <>
              <p>You can:</p>
              <ul>
                <li>Review and update your household profile by logging in.</li>
                <li>Ask for a copy of the personal information we hold about you.</li>
                <li>Ask us to correct or delete your information, or close your account.</li>
                <li>Unsubscribe from alerts or non-essential emails.</li>
              </ul>
              <p>
                Depending on where you live, state privacy laws may give you additional rights. To make a request, email{" "}
                {mail} from the address on your account. We may need to verify your identity before acting on it, and we
                won&apos;t treat you differently for exercising your rights.
              </p>
            </>
          ),
        },
        {
          title: "Children's privacy",
          content: (
            <p>
              Recall Radar is intended for adults. We don&apos;t knowingly collect personal information directly from
              children under 13. Parents and guardians may add details about their children&apos;s products and needs to
              their own household profile so we can match relevant recalls. If you believe a child has created an
              account, contact us and we&apos;ll delete it.
            </p>
          ),
        },
        {
          title: "Changes to this policy",
          content: (
            <p>
              We&apos;ll update this page when our practices change and revise the &quot;Last updated&quot; date above. If
              a change is significant, we&apos;ll let you know by email or with a notice on the site before it takes effect.
            </p>
          ),
        },
        {
          title: "Contact us",
          content: (
            <p>
              Questions about privacy? Email {mail} or use our <Link href="/support">support page</Link>.
              {LEGAL.mailingAddress ? <> You can also write to us at {LEGAL.mailingAddress}.</> : null}
            </p>
          ),
        },
      ]}
    />
  );
}

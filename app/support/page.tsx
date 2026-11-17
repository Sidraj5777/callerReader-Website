import type { Metadata } from "next";
import Link from "next/link";
import PageShell, { PageIntro } from "@/components/site/PageShell";
import SupportForm from "@/components/support/SupportForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact support | Recall Radar",
  description: "Get help with your Recall Radar account, household profile, alerts or subscription.",
};

const quickHelp = [
  {
    title: "Can't log in?",
    text: "Use “Forgot password” on the login form to get a reset link by email. Check your spam folder if it doesn't arrive.",
    href: "/auth",
    cta: "Go to login",
  },
  {
    title: "Update your household",
    text: "Log in and you'll be taken to your profile, where you can add people, pets, products or medications.",
    href: "/auth",
    cta: "Edit my profile",
  },
  {
    title: "Subscription questions",
    text: "Plans are being finalized. Register your interest and we'll send details before anyone else.",
    href: "/subscribe",
    cta: "Subscribe",
  },
  {
    title: "Your data and privacy",
    text: "Read how we collect, use and protect your information, and how to request a copy or deletion.",
    href: "/privacy",
    cta: "Privacy Policy",
  },
];

export default function SupportPage() {
  return (
    <PageShell>
      <PageIntro kicker="Support" title="How can we help?">
        Find a quick answer below, or send us a message and a real person on our team will reply.
      </PageIntro>

      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {quickHelp.map((q) => (
            <div key={q.title} className="flex flex-col rounded-2xl bg-white/85 border border-white shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900">{q.title}</h2>
              <p className="mt-2 text-gray-600 leading-relaxed flex-1">{q.text}</p>
              <Link href={q.href} className="mt-4 font-semibold text-blue-700 hover:text-blue-900">
                {q.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-[1fr_22rem]">
          <div className="rounded-3xl bg-white/90 border border-white shadow-lg p-8 sm:p-10">
            <h2 className="text-2xl font-extrabold text-gray-900">Send us a message</h2>
            <p className="mt-2 text-gray-600 mb-8">
              Include the email address on your account so we can find your profile.
            </p>
            <SupportForm />
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white p-7 shadow-lg">
              <h2 className="text-lg font-bold">Email us directly</h2>
              <a href={`mailto:${SITE.supportEmail}`} className="mt-2 block text-blue-100 underline underline-offset-4 break-all">
                {SITE.supportEmail}
              </a>
              <p className="mt-4 text-blue-100/90 text-sm leading-relaxed">
                We read every message and reply as quickly as we can.
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-7">
              <h2 className="text-lg font-bold text-amber-950">Is someone sick or hurt?</h2>
              <p className="mt-2 text-amber-950/90 text-sm leading-relaxed">
                Recall Radar can&apos;t give medical advice. Contact a doctor, your veterinarian or Poison Control
                (1-800-222-1222). In an emergency, call 911.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </PageShell>
  );
}

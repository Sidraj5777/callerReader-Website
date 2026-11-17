import type { Metadata } from "next";
import Link from "next/link";
import PageShell, { PageIntro } from "@/components/site/PageShell";

export const metadata: Metadata = {
  title: "Our approach | Recall Radar",
  description:
    "How Recall Radar turns thousands of recall notices into a handful of alerts that actually matter to your household.",
};

const stages = [
  {
    name: "Watch",
    title: "We keep an eye on recall sources around the clock",
    text: "Recall and safety notices are published across many agency and manufacturer sources, in different formats and at different times. We monitor them continuously so nothing depends on you checking a website.",
    icon: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  },
  {
    name: "Decode",
    title: "Each notice is broken down into the details that matter",
    text: "A recall is more than a headline. We pull out the product, brand, sizes, lot and date codes, the hazard, any allergens involved, and where it was sold, so every notice can be compared like-for-like.",
    icon: "M4 6h16M4 12h10M4 18h7",
  },
  {
    name: "Know your home",
    title: "Your household profile tells us what to look for",
    text: "Your profile records the people, pets, foods, kids' products and medications in your home, including details for each person, like a peanut allergy or a blood pressure prescription.",
    icon: "M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z",
  },
  {
    name: "Match",
    title: "Every recall is weighed against your household",
    text: "Our matching engine compares each decoded recall with your profile and weighs how strongly it applies to you. A recall has to clear that bar to count as a match.",
    icon: "M8 12h8M12 8v8M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0Z",
  },
  {
    name: "Double-check",
    title: "Matches are verified before they're sent",
    text: "A false alarm costs you time and trust. Matches go through accuracy checks before anything reaches your inbox, so the alerts you get are ones worth reading.",
    icon: "m5 12 4.5 4.5L19 7",
  },
  {
    name: "Deliver",
    title: "You get a clear summary on your schedule",
    text: "Alerts arrive by email in plain language: what's affected, why it matched your household, how to check your product, and what to do next.",
    icon: "M4 6h16v12H4zM4 7l8 6 8-6",
  },
];

const principles = [
  {
    title: "Relevance over volume",
    text: "Thousands of recalls are issued every year. Sending you all of them would just recreate the problem. We'd rather send you three that matter than thirty you'll learn to ignore.",
  },
  {
    title: "Accuracy before alarm",
    text: "Getting it right matters more than being first. Every match is checked before it's sent.",
  },
  {
    title: "Plain language",
    text: "Recall notices are written for regulators. Our summaries are written for the person standing in front of their pantry.",
  },
  {
    title: "Your data serves you",
    text: "Your profile exists to match recalls to your household. That's what it's for.",
  },
];

const profileItems = [
  { label: "People", detail: "Allergies and dietary needs for each person" },
  { label: "Pets", detail: "Food, treats and products for each animal" },
  { label: "Kids", detail: "Baby gear, toys, car seats and nursery products" },
  { label: "Health", detail: "Medications, supplements and medical devices" },
  { label: "Groceries", detail: "The brands and products you buy regularly" },
];

export default function ApproachPage() {
  return (
    <PageShell>
      <PageIntro kicker="Our approach" title="From thousands of recalls to the few that matter to you">
        Here&apos;s how Recall Radar decides what reaches your inbox, and why most recalls never will.
      </PageIntro>

      {/* Funnel summary */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-4 text-center">
          {[
            { big: "Every notice", small: "watched across recall sources" },
            { big: "Your household", small: "compared against each one" },
            { big: "Only matches", small: "sent to your inbox" },
          ].map((f, i) => (
            <div
              key={f.big}
              className={`rounded-2xl px-6 py-7 ${
                i === 2 ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg" : "bg-white/75 border border-white"
              }`}
            >
              <p className={`text-2xl font-extrabold ${i === 2 ? "" : "text-gray-900"}`}>{f.big}</p>
              <p className={`mt-1 ${i === 2 ? "text-blue-100" : "text-gray-600"}`}>{f.small}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pipeline */}
      <section className="px-6 py-16 bg-white/40 border-y border-white/60" aria-labelledby="pipeline-heading">
        <div className="max-w-4xl mx-auto">
          <h2 id="pipeline-heading" className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center">
            The path every recall takes
          </h2>
          <p className="mt-4 text-lg text-gray-600 text-center max-w-2xl mx-auto">
            Six stages, running continuously in the background.
          </p>

          <ol className="relative mt-14 space-y-6">
            <span className="absolute left-7 top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-300 via-indigo-300 to-blue-500" aria-hidden="true" />
            {stages.map((s, i) => (
              <li key={s.name} className="relative flex gap-6">
                <span className="relative z-10 grid place-items-center w-14 h-14 shrink-0 rounded-2xl bg-white shadow-md border border-blue-100 text-blue-700">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={s.icon} />
                  </svg>
                </span>
                <div className="flex-1 rounded-2xl bg-white/85 border border-white shadow-sm p-6">
                  <p className="text-sm font-semibold text-blue-700">
                    Stage {i + 1}: {s.name}
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-gray-900">{s.title}</h3>
                  <p className="mt-2 text-gray-600 leading-relaxed">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Household profile */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Built around who actually lives with you</h2>
            <p className="mt-5 text-lg text-gray-600 leading-relaxed">
              A recall for a peanut-containing snack means nothing to one family and everything to another. That&apos;s
              why matching starts with your household, not with a list of categories. The profile takes less than 10
              minutes and you can update it whenever life changes: a new baby, a new pet, a new prescription.
            </p>
            <Link
              href="/#signup"
              className="mt-8 inline-block px-7 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg transition"
            >
              Build your profile
            </Link>
          </div>
          <ul className="grid gap-3">
            {profileItems.map((p) => (
              <li key={p.label} className="flex items-center gap-4 rounded-2xl bg-white/85 border border-white shadow-sm px-5 py-4">
                <span className="w-24 shrink-0 font-bold text-blue-700">{p.label}</span>
                <span className="text-gray-700">{p.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Principles */}
      <section className="px-6 py-20 bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold max-w-2xl">What guides every decision we make</h2>
          <div className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {principles.map((p) => (
              <div key={p.title} className="border-t border-white/20 pt-6">
                <h3 className="text-xl font-bold">{p.title}</h3>
                <p className="mt-2 text-blue-100/90 leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What stays private */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">A note on what we don&apos;t publish</h2>
          <p className="mt-5 text-lg text-gray-600 leading-relaxed">
            The exact rules our matching engine uses are proprietary, built and tuned by our team over many rounds of
            testing. We&apos;re happy to explain the process above in as much detail as you like. If you have a question
            about why you did or didn&apos;t receive an alert, <Link href="/support" className="text-blue-700 underline underline-offset-4">contact support</Link> and we&apos;ll look into it.
          </p>
        </div>
      </section>
    </PageShell>
  );
}

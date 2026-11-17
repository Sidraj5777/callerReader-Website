import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageShell from "@/components/site/PageShell";

export const metadata: Metadata = {
  title: "About | Recall Radar",
  description:
    "Meet Raj Ratwani, PhD, the human factors scientist and safety researcher who founded Recall Radar.",
};

export default function AboutPage() {
  return (
    <PageShell>
      <section className="px-6 pt-14 pb-24 sm:pt-20">
        <div className="max-w-5xl mx-auto grid gap-10 lg:gap-16 md:grid-cols-[minmax(0,20rem)_1fr] items-start">
          {/* Photo + credentials */}
          <figure className="md:sticky md:top-28 max-w-xs mx-auto md:max-w-none w-full">
            <div className="overflow-hidden rounded-3xl shadow-xl ring-1 ring-white/60 bg-white">
              <Image
                src="/team/raj-ratwani.jpg"
                alt="Raj Ratwani, founder of Recall Radar"
                width={800}
                height={1000}
                priority
                sizes="(min-width: 768px) 20rem, 80vw"
                className="w-full h-auto"
              />
            </div>
            <figcaption className="mt-5 text-center md:text-left">
              <p className="text-xl font-bold text-gray-900">Raj Ratwani, PhD</p>
              <p className="text-gray-600 mt-1">Professor, Georgetown University School of Medicine</p>
            </figcaption>
          </figure>

          {/* Story */}
          <article className="min-w-0">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 text-balance">
              Meet the Founder: A Passion for Keeping People Safe
            </h1>

            <div className="mt-8 space-y-6 text-lg text-gray-700 leading-relaxed max-w-[65ch]">
              <p>
                I&rsquo;ve spent my career working to make the world safer. As a human factors scientist, researcher,
                and safety expert, I&rsquo;ve dedicated my work to understanding how people interact with technology and
                everyday products&mdash;and how we can prevent harm before it happens.
              </p>
              <p>
                But safety shouldn&rsquo;t be something we think about only after an accident or tragedy. It should be
                something every family can count on.
              </p>
              <p>
                That belief inspired me to create Recall Radar. Every day, families bring food, toys, appliances, and
                other products into their homes, trusting that they&rsquo;re safe. Yet when a product is recalled, that
                critical information can be easy to miss or difficult to understand. I created Recall Radar to help
                change that&mdash;to make recall information easier to find, understand, and act on.
              </p>
              <p>
                As a husband, father, and safety researcher, I believe everyone deserves the information they need to
                protect the people they love. My goal is simple: to put the power of safety information into more
                people&rsquo;s hands, so fewer families are unknowingly exposed to preventable risks.
              </p>
              <p className="border-l-4 border-blue-600 pl-5 text-xl font-semibold text-gray-900">
                Because behind every recall is a real person, a real family, and an opportunity to prevent harm.
              </p>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-3">
              <Link
                href="/#signup"
                className="text-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg transition"
              >
                Join Recall Radar
              </Link>
              <Link
                href="/approach"
                className="text-center px-6 py-3 rounded-full bg-white/80 text-blue-700 font-semibold border border-blue-200 hover:bg-white transition"
              >
                How Recall Radar works
              </Link>
            </div>
          </article>
        </div>
      </section>
    </PageShell>
  );
}

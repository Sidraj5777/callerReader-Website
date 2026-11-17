import PageShell from "@/components/site/PageShell";
import { LEGAL, headingId } from "@/lib/site";

export interface LegalSection {
  title: string;
  content: React.ReactNode;
}

export default function LegalPage({
  title,
  intro,
  summary,
  sections,
}: {
  title: string;
  intro: React.ReactNode;
  summary: string[];
  sections: LegalSection[];
}) {
  return (
    <PageShell>
      <section className="px-6 pt-16 pb-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-blue-700 font-semibold">Last updated {LEGAL.lastUpdated}</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">{title}</h1>
          <div className="mt-5 text-lg text-gray-600 max-w-3xl leading-relaxed">{intro}</div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto grid gap-12 lg:grid-cols-[15rem_1fr]">
          <nav className="hidden lg:block" aria-label="Sections">
            <ol className="sticky top-28 space-y-2 text-sm list-decimal pl-5 marker:text-gray-400">
              {sections.map((s) => (
                <li key={s.title}>
                  <a href={`#${headingId(s.title)}`} className="text-gray-600 hover:text-blue-700">{s.title}</a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="min-w-0">
            <div className="rounded-2xl bg-white/85 border border-white shadow-sm p-6 mb-10">
              <h2 className="font-bold text-gray-900">In short</h2>
              <ul className="mt-3 space-y-2 list-disc pl-5 marker:text-blue-600 text-gray-700">
                {summary.map((s) => <li key={s}>{s}</li>)}
              </ul>
              <p className="mt-4 text-sm text-gray-500">This summary is for convenience. The full text below is what applies.</p>
            </div>

            <div className="prose-rr">
              {sections.map((s, i) => (
                <section key={s.title}>
                  <h2 id={headingId(s.title)}>{i + 1}. {s.title}</h2>
                  {s.content}
                </section>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

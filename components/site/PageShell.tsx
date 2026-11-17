import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

/** Shared background + header + footer for the marketing pages. */
export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden flex flex-col">
      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" />
      <div className="fixed inset-0 -z-10 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#3b82f6_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,#6366f1_0%,transparent_50%)]" />
      </div>
      <SiteHeader />
      <main id="main-content" className="relative z-10 flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

/** Consistent page heading block for inner pages. */
export function PageIntro({
  kicker,
  title,
  children,
}: {
  kicker?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="px-6 pt-16 pb-10 sm:pt-20">
      <div className="max-w-4xl mx-auto text-center">
        {kicker && <p className="text-blue-700 font-semibold mb-3">{kicker}</p>}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 text-balance">{title}</h1>
        {children && <div className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mt-6 leading-relaxed">{children}</div>}
      </div>
    </section>
  );
}

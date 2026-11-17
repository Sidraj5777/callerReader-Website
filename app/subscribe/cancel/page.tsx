import Link from "next/link";
import PageShell from "@/components/site/PageShell";

export const metadata = { title: "Checkout canceled | Recall Radar" };

export default function SubscribeCancelPage() {
  return (
    <PageShell>
      <section className="flex items-center justify-center px-6 py-16 sm:py-24">
        <div className="glass-card max-w-xl w-full p-8 md:p-10 rounded-3xl shadow-2xl text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Checkout canceled</h1>
          <p className="text-gray-600 mt-3">
            You weren&apos;t charged. You&apos;re still on your current plan and your recall alerts continue as
            before.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/subscribe"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg transition"
            >
              Back to plans
            </Link>
            <Link
              href="/"
              className="px-6 py-3 rounded-full bg-white text-blue-700 font-semibold border border-blue-200 hover:bg-blue-50 transition"
            >
              Home
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

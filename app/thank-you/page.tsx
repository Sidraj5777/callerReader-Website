"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMySubscription, type MySubscription } from "@/lib/billing";

export default function ThankYouPage() {
  const router = useRouter();
  const [me, setMe] = useState<MySubscription | null>(null);

  useEffect(() => {
    getMySubscription().then((r) => {
      if (r.ok) setMe(r.data);
    });
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Animated background (same as homepage & form) */}
      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" />
      <div className="fixed inset-0 -z-10 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#3b82f6_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,#6366f1_0%,transparent_50%)]" />
      </div>
      <div className="fixed inset-0 -z-5 opacity-20 pointer-events-none bg-[url('data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.04\' /%3E%3C/svg%3E')]" />

      {/* Optional Navbar */}
      <nav className="sticky top-0 z-50 flex justify-between items-center px-6 sm:px-10 py-4 backdrop-blur-xl bg-white/70 border-b border-white/30 shadow-sm">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
          Recall Radar
        </h1>
        <button
          onClick={() => router.push('/')}
          className="px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm text-blue-800 font-semibold border border-white/30 hover:bg-white/30 transition"
        >
          Home
        </button>
      </nav>

      {/* Thank You Content */}
      <section className="relative z-10 flex items-center justify-center min-h-[80vh] px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="glass-card p-10 rounded-3xl shadow-2xl">
            <div className="text-7xl mb-6">🎉</div>
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
              Thank You!
            </h1>
            <p className="text-xl text-gray-700 mt-4">
              Your profile information has been saved.
            </p>
            <div className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent my-6" />
            <p className="text-gray-600 text-lg">
              {me?.premium
                ? "We are now monitoring recalls for you and will email you as soon as we detect one that matches your household."
                : "We are now monitoring recalls for you. On the Free plan you get one email a week with every recall that matches your household."}
            </p>
            {me && !me.premium && (
              <p className="text-gray-600 mt-3">
                Want to hear about recalls the moment we detect them, with no ads?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/subscribe")}
                  className="font-semibold text-blue-700 underline underline-offset-4"
                >
                  See Premium
                </button>
              </p>
            )}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/account')}
                className="px-6 py-3 rounded-full bg-white text-blue-700 font-semibold border border-blue-200 hover:bg-blue-50 transition"
              >
                My account
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-gray-500 text-sm border-t border-gray-200 bg-white/40 backdrop-blur-sm">
        <p>© 2025 Recall Radar – Stay protected, stay informed.</p>
      </footer>
    </div>
  );
}
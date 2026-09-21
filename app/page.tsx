"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import Reveal from "@/components/Reveal";

const categories = [
  { icon: "🍔", label: "Food" },
  { icon: "🐾", label: "Pet food" },
  { icon: "🧸", label: "Children's products" },
  { icon: "🧴", label: "Consumer products" },
  { icon: "💊", label: "Medications & devices" },
];

const stats = [
  { value: "15.5M", label: "pounds of food recalled" },
  { value: "68M", label: "pounds of pet food recalled" },
  { value: "19M", label: "units of children's products recalled" },
];

const steps = [
  { step: "01", title: "Create your profile", desc: "A simple survey — takes less than 10 minutes — covers your food, pets, kids, and medications.", icon: "📝", gradient: "from-blue-500 to-cyan-500" },
  { step: "02", title: "We scan for you", desc: "Our algorithms continuously scan hundreds of sources to catch product recalls and safety notices.", icon: "🔍", gradient: "from-indigo-500 to-purple-500" },
  { step: "03", title: "Get what's relevant", desc: "We identify the recalls that match your household and email you an easy-to-read summary.", icon: "📧", gradient: "from-purple-500 to-pink-500" },
];

const testimonials = [
  { name: "Amy, John (& Jimmy)", role: "Pet owners", text: "Our dog, Jimmy, is our best friend. Ensuring his food and toys are safe, given all of the pet recalls we hear about, is our priority.", initials: "AJ" },
  { name: "Patty and family", role: "Parent", text: "My kids have nut allergies and I need to keep them safe by monitoring when products change their labels and disclose new allergy information that I never knew about.", initials: "PF" },
  { name: "Bill and Genie", role: "Managing health conditions", text: "We are managing high blood pressure and diabetes. Knowing which medications and medical devices have been recalled keeps us safe.", initials: "BG" },
];

export default function Home() {
  const router = useRouter();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Auth widget state
  const [authTab, setAuthTab] = useState<"signup" | "login" | "forgot">("signup");
  const [existingEmail, setExistingEmail] = useState<string | undefined>();

  // Refs for scrolling
  const howItWorksRef = useRef<HTMLElement>(null);
  const signupRef = useRef<HTMLDivElement>(null);

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToSignup = () => {
    signupRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToForm = (firstName: string, lastName: string, email: string) => {
    router.push(
      `/form?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(
        lastName,
      )}&email=${encodeURIComponent(email)}`,
    );
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" />
      <div className="fixed inset-0 -z-10 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#3b82f6_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,#6366f1_0%,transparent_50%)]" />
      </div>

      {/* Noise texture */}
      <div className="fixed inset-0 -z-5 opacity-20 pointer-events-none bg-[url('data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.04\' /%3E%3C/svg%3E')]" />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex justify-between items-center px-6 sm:px-10 py-4 backdrop-blur-xl bg-white/70 border-b border-white/30 shadow-sm">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
          Recall Radar
        </h1>
        <div className="flex gap-4 items-center">
          <button
            onClick={scrollToHowItWorks}
            className="hidden sm:block px-5 py-2 text-gray-600 hover:text-blue-600 transition font-medium"
          >
            How It Works
          </button>
          <button
            onClick={scrollToSignup}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg transition"
          >
            Join Early Access
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 text-center px-6 pt-20 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-full px-4 py-1.5 text-blue-700 text-sm mb-6 border border-white/40 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            We worry so you don&apos;t have to
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-700 bg-clip-text text-transparent">
              Stay Ahead of
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 bg-clip-text text-transparent animate-gradient">
              Product Recalls
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mt-8 mb-12">
            Thousands of potentially unsafe products are recalled every year. Recall Radar gives you
            personalized recall information so you no longer have to wonder.
          </p>

          {/* Signup Card + What We Monitor */}
          <div className="flex flex-col lg:flex-row gap-8 items-start max-w-5xl mx-auto">
            <div ref={signupRef} className="flex-1 w-full lg:max-w-md">
              <div className="glass-card p-8 rounded-2xl shadow-xl text-left">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Join Early Access</h2>
                <p className="text-gray-500 text-sm mb-6">No spam, only critical recalls.</p>

                <div className="flex mb-6 rounded-full bg-white/40 p-1">
                  <button
                    onClick={() => setAuthTab("signup")}
                    className={`flex-1 py-2 rounded-full font-semibold transition cursor-pointer ${
                      authTab === "signup" ? "bg-blue-600 text-white" : "text-gray-600"
                    }`}
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={() => setAuthTab("login")}
                    className={`flex-1 py-2 rounded-full font-semibold transition cursor-pointer ${
                      authTab === "login" || authTab === "forgot" ? "bg-blue-600 text-white" : "text-gray-600"
                    }`}
                  >
                    Login
                  </button>
                </div>

                {authTab === "signup" ? (
                  <>
                    {existingEmail && (
                      <p className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        This email is already registered. Please log in to continue.
                      </p>
                    )}
                    <SignupForm
                      onExistingUser={(email) => {
                        setExistingEmail(email);
                        setAuthTab("login");
                      }}
                      onSuccess={goToForm}
                    />
                  </>
                ) : authTab === "forgot" ? (
                  <ForgotPasswordForm
                    prefillEmail={existingEmail}
                    onBackToLogin={() => setAuthTab("login")}
                  />
                ) : (
                  <LoginForm
                    prefillEmail={existingEmail}
                    onSuccess={(email) => {
                      router.push(`/form?email=${encodeURIComponent(email)}`);
                    }}
                    onForgotPassword={() => setAuthTab("forgot")}
                  />
                )}
              </div>
            </div>

            {/* What We Monitor */}
            <div className="flex-1 w-full bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-md text-left">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-700 mb-4">
                What Recall Radar watches for you
              </div>
              <div className="grid grid-cols-1 gap-3">
                {categories.map((c) => (
                  <div key={c.label} className="flex items-center gap-3 bg-white/80 rounded-xl px-4 py-3 shadow-inner">
                    <span className="text-2xl">{c.icon}</span>
                    <span className="text-gray-800 font-medium">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem statement */}
      <section className="relative z-10 py-20 px-6 bg-white/40 backdrop-blur-sm border-y border-gray-200/50">
        <Reveal className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">
            When we buy something, we assume it&apos;s safe
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Unfortunately, thousands of recalls happen every year and most of us are never notified.
            Recalled products can cause temporary sickness, permanent harm, and even death. Recall
            Radar identifies the recalls that matter to your household and sends them to you in an
            easy-to-digest format.
          </p>
        </Reveal>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 120} className="space-y-1">
              <div className="text-4xl font-black bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                {s.value}+
              </div>
              <p className="text-gray-600">{s.label}</p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={300} className="max-w-2xl mx-auto text-center mt-4">
          <p className="text-gray-500 text-sm">
            Plus thousands of consumer products and hundreds of medications and medical devices recalled every year.
          </p>
        </Reveal>
      </section>

      {/* How It Works */}
      <section ref={howItWorksRef} className="relative z-10 py-24 px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto text-center">
          <Reveal>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-16">
              Our process is as easy as 1-2-3.
            </p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((item, i) => (
              <Reveal key={item.step} delay={i * 120} className="group relative">
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-r ${item.gradient} text-white flex items-center justify-center font-black text-xl shadow-lg group-hover:scale-110 transition`}>
                  {item.step}
                </div>
                <div className="feature-card pt-12 hover:scale-[1.02]">
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <h3 className="text-2xl font-bold mt-2">{item.title}</h3>
                  <p className="text-gray-600 mt-2">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Who Recall Radar Helps — testimonials */}
      <section className="relative z-10 py-24 px-6 bg-white/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <h2 className="text-4xl font-bold mb-12">Who Recall Radar Helps</h2>
          </Reveal>
          <div className="relative overflow-hidden">
            <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}>
              {testimonials.map((t, idx) => (
                <div key={idx} className="w-full flex-shrink-0 px-4">
                  <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/50">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold mx-auto mb-4">
                      {t.initials}
                    </div>
                    <p className="text-gray-700 text-lg italic">{t.text}</p>
                    <div className="mt-6">
                      <p className="font-bold text-gray-900">{t.name}</p>
                      <p className="text-sm text-gray-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-8 gap-2">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setCurrentTestimonial(i)} className={`h-2 w-8 rounded-full transition-all ${i === currentTestimonial ? "bg-blue-600 w-12" : "bg-gray-300"}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 text-center text-gray-500 text-sm border-t border-gray-200 bg-white/40 backdrop-blur-sm">
        <p>© 2026 Recall Radar — We worry so you don&apos;t have to.</p>
        <div className="flex justify-center items-center gap-6 mt-4">
          <a href="mailto:Raj@recallradar.info" className="hover:text-blue-600 transition">
            Raj@recallradar.info
          </a>
          <a
            href="https://www.facebook.com/people/Recall-Radar/100089118953760/?sk=about"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Recall Radar on Facebook"
            className="hover:text-blue-600 transition"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M13.5 21v-7.5H16l.5-3.2h-3V8.2c0-.9.3-1.6 1.7-1.6H16.6V3.8C16.1 3.7 15 3.6 13.8 3.6c-2.6 0-4.3 1.6-4.3 4.4v2.3H7v3.2h2.5V21h4Z" />
            </svg>
          </a>
          <a
            href="https://x.com/RecallRadar"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Recall Radar on X"
            className="hover:text-blue-600 transition"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M18.3 3H21l-6.4 7.3L22 21h-6.6l-5.2-6.4L4.2 21H1.5l6.9-7.9L1 3h6.7l4.7 5.9L18.3 3Zm-1.2 16h1.5L7.9 5h-1.6l10.8 14Z" />
            </svg>
          </a>
          <a
            href="https://www.instagram.com/recallradar/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Recall Radar on Instagram"
            className="hover:text-blue-600 transition"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.7">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}

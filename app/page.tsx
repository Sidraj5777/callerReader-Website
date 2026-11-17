"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import GoogleSignInButton, {
  type GoogleSignInResult,
} from "@/components/auth/GoogleSignInButton";
import Reveal from "@/components/Reveal";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import RadarVisual from "@/components/home/RadarVisual";
import Faq from "@/components/home/Faq";
import {
  FoodIcon,
  PetFoodIcon,
  KidsIcon,
  CleaningIcon,
  MedIcon,
} from "@/components/icons/RecallIcons";

const categories = [
  {
    Icon: FoodIcon,
    label: "Food",
    desc: "Contamination, undeclared allergens and mislabeling in groceries, snacks, produce and drinks.",
  },
  {
    Icon: PetFoodIcon,
    label: "Pet food",
    desc: "Kibble, wet food and treats recalled for bacteria, toxins or nutrient problems.",
  },
  {
    Icon: KidsIcon,
    label: "Children's products",
    desc: "Cribs, car seats, strollers, toys and baby food with safety hazards.",
  },
  {
    Icon: CleaningIcon,
    label: "Consumer products",
    desc: "Household goods, appliances and gear with fire, injury or chemical risks.",
  },
  {
    Icon: MedIcon,
    label: "Medications & devices",
    desc: "Prescriptions, over-the-counter drugs, supplements and medical devices.",
  },
];

const stats = [
  { value: "15.5M", label: "pounds of food recalled" },
  { value: "68M", label: "pounds of pet food recalled" },
  { value: "19M", label: "units of children's products recalled" },
];

const steps = [
  {
    step: "01",
    title: "Create your profile",
    desc: "A simple survey — takes less than 10 minutes — covers your food, pets, kids, and medications.",
    icon: "📝",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    step: "02",
    title: "We scan for you",
    desc: "Our algorithms continuously scan hundreds of sources to catch product recalls and safety notices.",
    icon: "🔍",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    step: "03",
    title: "Get what's relevant",
    desc: "We identify the recalls that match your household and email you an easy-to-read summary.",
    icon: "📧",
    gradient: "from-purple-500 to-pink-500",
  },
];

const household = [
  {
    who: "Mia, 7",
    tags: ["Peanut allergy", "Car seat"],
    color: "bg-rose-100 text-rose-700",
  },
  {
    who: "Dad",
    tags: ["Blood pressure Rx", "Gluten-free"],
    color: "bg-blue-100 text-blue-700",
  },
  {
    who: "Grandma",
    tags: ["Glucose monitor", "Supplements"],
    color: "bg-violet-100 text-violet-700",
  },
  {
    who: "Jimmy the dog",
    tags: ["Dry kibble", "Chew treats"],
    color: "bg-amber-100 text-amber-800",
  },
];

const comparison = [
  {
    label:
      "Food, pet food, kids' products, consumer products and medications in one place",
    diy: false,
    rr: true,
  },
  {
    label: "Checks recalls against each person and pet in your home",
    diy: false,
    rr: true,
  },
  {
    label: "Filters out recalls that don't apply to you",
    diy: false,
    rr: true,
  },
  {
    label: "Plain-language summary with what to do next",
    diy: false,
    rr: true,
  },
  { label: "No need to remember to check websites", diy: false, rr: true },
];

const testimonials = [
  {
    name: "Amy, John (& Jimmy)",
    role: "Pet owners",
    text: "Our dog, Jimmy, is our best friend. Ensuring his food and toys are safe, given all of the pet recalls we hear about, is our priority.",
    initials: "AJ",
  },
  {
    name: "Patty and family",
    role: "Parent",
    text: "My kids have nut allergies and I need to keep them safe by monitoring when products change their labels and disclose new allergy information that I never knew about.",
    initials: "PF",
  },
  {
    name: "Bill and Genie",
    role: "Managing health conditions",
    text: "We are managing high blood pressure and diabetes. Knowing which medications and medical devices have been recalled keeps us safe.",
    initials: "BG",
  },
];

export default function Home() {
  const router = useRouter();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Auth widget state
  const [authTab, setAuthTab] = useState<"signup" | "login" | "forgot">(
    "signup",
  );
  const [existingEmail, setExistingEmail] = useState<string | undefined>();

  // Refs for scrolling
  const signupRef = useRef<HTMLDivElement>(null);

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

  // Google sign-in: same destination as email signup/login.
  const handleGoogle = (r: GoogleSignInResult) => {
    if (r.firstName || r.lastName) goToForm(r.firstName, r.lastName, r.email);
    else router.push(`/form?email=${encodeURIComponent(r.email)}`);
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

      <SiteHeader />

      <main id="main-content">
        {/* Hero Section */}
        <section className="relative z-10 px-6 pt-14 pb-20 sm:pt-20">
          <div className="max-w-7xl mx-auto grid gap-14 lg:grid-cols-[1.05fr_1fr] items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-full px-4 py-1.5 text-blue-700 text-sm mb-6 border border-white/40 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                We worry so you don&apos;t have to™
              </div>
              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.05]">
                <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-700 bg-clip-text text-transparent">
                  Stay ahead of product recalls
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-xl mt-6 mb-10 leading-relaxed">
                Thousands of potentially unsafe products are recalled every
                year. Recall Radar checks each one against your household and
                tells you only about the ones that affect you.
              </p>

              {/* Signup Card */}
              <div ref={signupRef} id="signup" className="w-full max-w-md">
                <div className="glass-card p-8 rounded-2xl shadow-xl text-left">
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">
                    Get Relevant Recall Notices
                  </h2>
                  <p className="text-gray-500 text-sm mb-6">
                    No spam, only critical recalls.
                  </p>

                  <div className="flex mb-6 rounded-full bg-white/40 p-1">
                    <button
                      onClick={() => setAuthTab("signup")}
                      className={`flex-1 py-2 rounded-full font-semibold transition cursor-pointer ${
                        authTab === "signup"
                          ? "bg-blue-600 text-white"
                          : "text-gray-600"
                      }`}
                    >
                      Sign Up
                    </button>
                    <button
                      onClick={() => setAuthTab("login")}
                      className={`flex-1 py-2 rounded-full font-semibold transition cursor-pointer ${
                        authTab === "login" || authTab === "forgot"
                          ? "bg-blue-600 text-white"
                          : "text-gray-600"
                      }`}
                    >
                      Login
                    </button>
                  </div>

                  {authTab === "signup" ? (
                    <>
                      {existingEmail && (
                        <p className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                          This email is already registered. Please log in to
                          continue.
                        </p>
                      )}
                      <SignupForm
                        onExistingUser={(email) => {
                          setExistingEmail(email);
                          setAuthTab("login");
                        }}
                        onSuccess={goToForm}
                      />
                      <GoogleSignInButton
                        text="signup_with"
                        onSuccess={handleGoogle}
                      />
                    </>
                  ) : authTab === "forgot" ? (
                    <ForgotPasswordForm
                      prefillEmail={existingEmail}
                      onBackToLogin={() => setAuthTab("login")}
                    />
                  ) : (
                    <>
                      <LoginForm
                        prefillEmail={existingEmail}
                        onSuccess={(email) => {
                          router.push(
                            `/form?email=${encodeURIComponent(email)}`,
                          );
                        }}
                        onForgotPassword={() => setAuthTab("forgot")}
                      />
                      <GoogleSignInButton
                        text="signin_with"
                        onSuccess={handleGoogle}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:pl-4">
              <RadarVisual />
            </div>
          </div>
        </section>

        {/* What we watch */}
        <section
          id="watch"
          className="relative z-10 py-20 px-6 bg-white/40 backdrop-blur-sm border-y border-gray-200/50"
        >
          <div className="max-w-6xl mx-auto">
            <Reveal className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                What Recall Radar watches for you
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Five categories, covering nearly everything your family eats,
                uses and takes.
              </p>
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {categories.map(({ Icon, label, desc }) => (
                <div
                  key={label}
                  className="rounded-2xl bg-white/85 border border-white shadow-sm p-6"
                >
                  <Icon className="w-11 h-11 text-blue-600" />
                  <h3 className="mt-4 text-lg font-bold text-gray-900">
                    {label}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Problem statement */}
        <section className="relative z-10 py-20 px-6">
          <Reveal className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">
              When we buy something, we assume it&apos;s safe
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Unfortunately, thousands of recalls happen every year and most of
              us are never notified. Recalled products can cause temporary
              sickness, permanent harm, and even death. Recall Radar identifies
              the recalls that matter to your household and sends them to you in
              an easy-to-digest format.
            </p>
          </Reveal>

          {/* Stats */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center mt-14">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 120} className="space-y-1">
                <div className="text-5xl font-black bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  {s.value}+
                </div>
                <p className="text-gray-600">{s.label}</p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={300} className="max-w-2xl mx-auto text-center mt-6">
            <p className="text-gray-500 text-sm">
              Plus thousands of consumer products and hundreds of medications
              and medical devices recalled every year.
            </p>
          </Reveal>
        </section>

        {/* Household */}
        <section className="relative z-10 py-24 px-6 bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-900 text-white">
          <div className="max-w-6xl mx-auto grid gap-14 lg:grid-cols-2 items-center">
            <Reveal>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                One profile for everyone under your roof
              </h2>
              <p className="mt-6 text-lg text-blue-100/90 leading-relaxed">
                A peanut recall matters to one child, not the whole family. A
                kibble recall matters to your dog. Recall Radar keeps track of
                each person and pet separately, so every alert tells you exactly
                who it affects.
              </p>
              <Link
                href="/approach"
                className="mt-8 inline-block px-7 py-3.5 rounded-full bg-white text-blue-900 font-semibold shadow hover:bg-blue-50 transition"
              >
                See how matching works
              </Link>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2">
              {household.map((m) => (
                <div
                  key={m.who}
                  className="rounded-2xl bg-white/10 border border-white/15 p-5 backdrop-blur-sm"
                >
                  <p className="font-bold text-lg">{m.who}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {m.tags.map((t) => (
                      <span
                        key={t}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${m.color}`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              <p className="sm:col-span-2 text-sm text-blue-200/70">
                Example household
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="relative z-10 py-24 px-6">
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
                <Reveal
                  key={item.step}
                  delay={i * 120}
                  className="group relative"
                >
                  <div
                    className={`absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-r ${item.gradient} text-white flex items-center justify-center font-black text-xl shadow-lg`}
                  >
                    {item.step}
                  </div>
                  <div className="feature-card pt-12 h-full">
                    <div className="text-5xl mb-4">{item.icon}</div>
                    <h3 className="text-2xl font-bold mt-2">{item.title}</h3>
                    <p className="text-gray-600 mt-2">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Link
              href="/approach"
              className="mt-12 inline-block font-semibold text-blue-700 hover:text-blue-900 underline underline-offset-4"
            >
              Read more about our approach
            </Link>
          </div>
        </section>

        {/* Comparison */}
        <section className="relative z-10 py-20 px-6 bg-white/40 backdrop-blur-sm border-y border-gray-200/50">
          <div className="max-w-4xl mx-auto">
            <Reveal className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Why not just check recall websites?
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                You can. Recalls are published by several different agencies,
                each with its own site and format. Here&apos;s what Recall Radar
                does differently.
              </p>
            </Reveal>
            <div className="mt-12 overflow-x-auto rounded-2xl bg-white/90 border border-white shadow-lg">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th
                      scope="col"
                      className="p-5 font-semibold text-gray-500 text-sm"
                    >
                      <span className="sr-only">Feature</span>
                    </th>
                    <th
                      scope="col"
                      className="p-5 font-semibold text-gray-700 text-center w-32"
                    >
                      Checking yourself
                    </th>
                    <th
                      scope="col"
                      className="p-5 font-bold text-blue-700 text-center w-32 bg-blue-50/70"
                    >
                      Recall Radar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row) => (
                    <tr
                      key={row.label}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <th scope="row" className="p-5 font-medium text-gray-800">
                        {row.label}
                      </th>
                      <td className="p-5 text-center">
                        <span className="sr-only">
                          {row.diy ? "Yes" : "No"}
                        </span>
                        <span
                          aria-hidden="true"
                          className="text-gray-300 text-xl"
                        >
                          –
                        </span>
                      </td>
                      <td className="p-5 text-center bg-blue-50/70">
                        <span className="sr-only">Yes</span>
                        <svg
                          viewBox="0 0 20 20"
                          className="w-6 h-6 mx-auto text-blue-600"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z" />
                        </svg>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Who Recall Radar Helps — testimonials */}
        <section className="relative z-10 py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Reveal>
              <h2 className="text-4xl font-bold mb-12">
                Who Recall Radar Helps
              </h2>
            </Reveal>
            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{
                  transform: `translateX(-${currentTestimonial * 100}%)`,
                }}
              >
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
                {testimonials.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTestimonial(i)}
                    aria-label={`Show story from ${t.name}`}
                    aria-current={i === currentTestimonial}
                    className={`h-2 w-8 rounded-full transition-all ${i === currentTestimonial ? "bg-blue-600 w-12" : "bg-gray-300"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="relative z-10 py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-10">
              Questions, answered
            </h2>
            <Faq />
            <p className="mt-8 text-center text-gray-600">
              Still have a question?{" "}
              <Link
                href="/support"
                className="font-semibold text-blue-700 underline underline-offset-4"
              >
                Contact support
              </Link>
            </p>
          </div>
        </section>

        {/* Subscription call-to-action */}
        <section className="relative z-10 pb-24 px-6">
          <Reveal className="max-w-3xl mx-auto text-center glass-card p-10 rounded-3xl shadow-xl">
            <div className="text-5xl mb-4">🛡️</div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
              Keep your household protected
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Start free with a weekly recall email, or go Premium for alerts
              the moment a recall is detected. Premium: $1.99/month or $20/year.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push("/subscribe")}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200"
              >
                See plans
              </button>
            </div>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

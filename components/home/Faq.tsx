const faqs = [
  {
    q: "What does Recall Radar actually send me?",
    a: "Short, plain-language email summaries of recalls that match your household: what the product is, what the problem is, how to tell if yours is affected, and what to do next. Recalls that don't match your profile stay out of your inbox.",
  },
  {
    q: "How is this different from signing up for government recall emails?",
    a: "Agency lists send every recall in a category, so you still have to read each one and decide if it applies to you. Recall Radar compares each recall against the profile you build — the people, pets, medications and products in your home — and only sends what's relevant.",
  },
  {
    q: "How long does the profile take?",
    a: "Less than 10 minutes. It covers your food preferences and allergies, pets, kids' products and medications. You can come back and update it any time your household changes.",
  },
  {
    q: "Can I include my pets, kids and parents?",
    a: "Yes. The profile is built around your whole household, so allergies, medications and products are tracked for each person and pet you add.",
  },
  {
    q: "Will you sell my information?",
    a: "No. Your profile is used to match recalls to your household. See our Privacy Policy for the details of what we collect and how it's protected.",
  },
  {
    q: "How much does it cost?",
    a: "We currently offer two plans. A free plan which includes a weekly email with ads and a paid plan which includes emails at the time recalls are identified and is ad free.",
  },
];

export default function Faq() {
  return (
    <div className="divide-y divide-gray-200/80 border-y border-gray-200/80">
      {faqs.map((f) => (
        <details key={f.q} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left text-lg font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
            {f.q}
            <span className="grid place-items-center w-8 h-8 shrink-0 rounded-full bg-white/80 text-blue-700 transition-transform group-open:rotate-45">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
          </summary>
          <p className="mt-3 pr-12 text-gray-600 leading-relaxed">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

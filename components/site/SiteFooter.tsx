import Link from "next/link";
import { SITE } from "@/lib/site";
import { RadarMark } from "./SiteHeader";
import { CookieSettingsButton } from "./CookieConsent";

const columns = [
  {
    title: "Recall Radar",
    items: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Our approach", href: "/approach" },
      { label: "About the founder", href: "/about" },
      { label: "Plans & pricing", href: "/subscribe" },
      { label: "Get Recall Notices", href: "/#signup" },
    ],
  },
  {
    title: "Support & legal",
    items: [
      { label: "Contact support", href: "/support" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-gray-200 bg-white/60 backdrop-blur-sm text-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-14 grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5" aria-label="Recall Radar home">
            <RadarMark />
            <span className="text-xl font-bold text-gray-900">Recall Radar™</span>
          </Link>
          <p className="mt-4 text-gray-600 max-w-xs leading-relaxed">
            Personalized recall alerts for the food, pets, kids&apos; products and medications in your home.
          </p>
          <a href={`mailto:${SITE.supportEmail}`} className="mt-4 inline-block text-gray-700 hover:text-blue-700 transition">
            {SITE.supportEmail}
          </a>
          <div className="flex items-center gap-4 mt-4 text-gray-500">
            <SocialLinks />
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h2 className="font-semibold text-gray-900 mb-4">{col.title}</h2>
            <ul className="space-y-2.5">
              {col.items.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-gray-600 hover:text-blue-700 transition">
                    {item.label}
                  </Link>
                </li>
              ))}
              {col.title === "Support & legal" && (
                <li>
                  <CookieSettingsButton className="text-gray-600 hover:text-blue-700 transition cursor-pointer" />
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200/70">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-6 flex flex-col sm:flex-row gap-3 justify-between text-gray-500">
          <p>© {new Date().getFullYear()} Recall Radar. {SITE.tagline}</p>
          <p>
            Recall Radar is an independent service and is not affiliated with any government agency.
          </p>
        </div>
      </div>
    </footer>
  );
}

export function SocialLinks() {
  return (
    <>
      <a href={SITE.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Recall Radar on Facebook" className="hover:text-blue-600 transition">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M13.5 21v-7.5H16l.5-3.2h-3V8.2c0-.9.3-1.6 1.7-1.6H16.6V3.8C16.1 3.7 15 3.6 13.8 3.6c-2.6 0-4.3 1.6-4.3 4.4v2.3H7v3.2h2.5V21h4Z" />
        </svg>
      </a>
      <a href={SITE.social.x} target="_blank" rel="noopener noreferrer" aria-label="Recall Radar on X" className="hover:text-blue-600 transition">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M18.3 3H21l-6.4 7.3L22 21h-6.6l-5.2-6.4L4.2 21H1.5l6.9-7.9L1 3h6.7l4.7 5.9L18.3 3Zm-1.2 16h1.5L7.9 5h-1.6l10.8 14Z" />
        </svg>
      </a>
      <a href={SITE.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Recall Radar on Instagram" className="hover:text-blue-600 transition">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.7">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
        </svg>
      </a>
    </>
  );
}

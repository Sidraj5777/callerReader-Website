"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";

const links = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/approach", label: "Our approach" },
  { href: "/about", label: "About" },
  { href: "/support", label: "Support" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const hasToken = !!getToken();
    Promise.resolve().then(() => setLoggedIn(hasToken));
  }, [pathname]);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    Promise.resolve().then(() => setOpen(false));
  }, [pathname]);

  const isActive = (href: string) =>
    !href.startsWith("/#") && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/75 border-b border-white/40 shadow-sm">
      <nav className="flex justify-between items-center px-6 sm:px-10 py-4 max-w-7xl mx-auto" aria-label="Main">
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="Recall Radar home">
          <RadarMark />
          <span className="whitespace-nowrap text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
            Recall Radar™
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`px-4 py-2 rounded-full font-medium transition ${
                isActive(l.href) ? "text-blue-700 bg-blue-50" : "text-gray-600 hover:text-blue-700"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex gap-3 items-center">
          <Link
            href="/subscribe"
            className="hidden sm:block px-5 py-2 rounded-full bg-white/70 text-blue-700 font-semibold border border-blue-200 hover:bg-white transition"
          >
            Plans
          </Link>
          <Link
            href={loggedIn ? "/account" : "/#signup"}
            className="hidden sm:block px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg transition"
          >
            {loggedIn ? "My account" : "Get Recall Notices"}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="lg:hidden w-10 h-10 grid place-items-center rounded-full text-gray-700 hover:bg-white/80 transition"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="lg:hidden border-t border-white/50 bg-white/90 px-6 pb-5 pt-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-gray-700 font-medium border-b border-gray-100 last:border-0"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/subscribe"
            onClick={() => setOpen(false)}
            className="mt-4 block text-center px-5 py-3 rounded-full bg-white text-blue-700 font-semibold border border-blue-200"
          >
            Plans
          </Link>
          <Link
            href={loggedIn ? "/account" : "/#signup"}
            onClick={() => setOpen(false)}
            className="mt-3 block text-center px-5 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold"
          >
            {loggedIn ? "My account" : "Get Recall Notices"}
          </Link>
        </div>
      )}
    </header>
  );
}

export function RadarMark({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="rr-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2563eb" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="15" fill="url(#rr-mark)" />
      <circle cx="16" cy="16" r="10" fill="none" stroke="white" strokeOpacity=".45" strokeWidth="1.3" />
      <circle cx="16" cy="16" r="5" fill="none" stroke="white" strokeOpacity=".45" strokeWidth="1.3" />
      <path d="M16 16 L16 3 A13 13 0 0 1 27.3 9.5 Z" fill="white" fillOpacity=".55" />
      <circle cx="21.5" cy="10" r="1.9" fill="#fbbf24" />
    </svg>
  );
}

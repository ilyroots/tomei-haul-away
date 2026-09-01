"use client";

import { useState } from "react";
import Link from "next/link";
import { COMPANY_NAME, PHONE, formatPhone } from "@/lib/business/config";

const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/service-areas", label: "Service Areas" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-charcoal-200 bg-cream/95 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2"
          aria-label={`${COMPANY_NAME} home`}
        >
          {COMPANY_NAME}
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          <ul className="flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-base font-medium text-charcoal transition-colors hover:text-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4">
            <a
              href={`tel:${PHONE}`}
              className="text-base font-semibold text-navy hover:text-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2"
            >
              {formatPhone(PHONE)}
            </a>
            <Link
              href="/quote"
              className="rounded-md bg-orange px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-orange-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2"
            >
              Get a Free Quote
            </Link>
          </div>
        </nav>

        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-navy hover:bg-navy-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 md:hidden"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div
          id="mobile-menu"
          className="absolute left-0 right-0 top-full border-b border-charcoal-200 bg-cream shadow-lg md:hidden"
        >
          <nav aria-label="Mobile" className="container mx-auto px-4 py-4">
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-md px-3 py-3 text-lg font-medium text-charcoal hover:bg-navy-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-3 border-t border-charcoal-200 pt-4">
              <a
                href={`tel:${PHONE}`}
                className="block rounded-md px-3 py-3 text-lg font-semibold text-navy hover:bg-navy-50"
              >
                Call {formatPhone(PHONE)}
              </a>
              <Link
                href="/quote"
                onClick={() => setMobileOpen(false)}
                className="block rounded-md bg-orange px-3 py-3 text-center text-lg font-semibold text-white hover:bg-orange-700"
              >
                Get a Free Quote
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

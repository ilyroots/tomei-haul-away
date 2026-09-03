import Link from "next/link";
import Image from "next/image";
import {
  COMPANY_NAME,
  HOME_CITY,
  PHONE,
  TEXT_NUMBER,
  EMAIL,
  BUSINESS_HOURS,
  formatPhone,
} from "@/lib/business/config";
import { logoStacked } from "@/lib/public/images";

const SITEMAP_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/service-areas", label: "Service Areas" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
  { href: "/quote", label: "Get a Quote" },
  { href: "/schedule", label: "Schedule" },
];

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-primary py-12 text-brand-background">
      <div className="container mx-auto px-4">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Link
              href="/"
              className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
              aria-label={`${COMPANY_NAME} home`}
            >
              <Image
                src={logoStacked.src}
                alt={logoStacked.alt}
                width={160}
                height={182}
                className="h-auto w-32"
              />
            </Link>
            <p className="mt-3 text-brand-background/80">
              Reliable junk removal and cleanout services based in {HOME_CITY}.
            </p>
            <div className="mt-4 space-y-1 text-brand-background/80">
              <p>
                Phone:{" "}
                <a href={`tel:${PHONE}`} className="underline hover:text-brand-accent">
                  {formatPhone(PHONE)}
                </a>
              </p>
              <p>
                Text:{" "}
                <a href={`sms:${TEXT_NUMBER}`} className="underline hover:text-brand-accent">
                  {formatPhone(TEXT_NUMBER)}
                </a>
              </p>
              <p>
                Email:{" "}
                <a href={`mailto:${EMAIL}`} className="underline hover:text-brand-accent">
                  {EMAIL}
                </a>
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-brand-background">Hours</h2>
            <ul className="mt-3 space-y-1 text-brand-background/80">
              {BUSINESS_HOURS.map(({ day, hours }) => (
                <li key={day} className="flex justify-between gap-4">
                  <span>{day}</span>
                  <span>{hours}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-brand-background">Sitemap</h2>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-brand-background/80">
              {SITEMAP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-brand-accent hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-brand-background/20 pt-6 sm:flex-row">
          <p className="text-sm text-brand-background/70">
            © {currentYear} {COMPANY_NAME}. All rights reserved.
          </p>
          <ul className="flex gap-6 text-sm text-brand-background/70">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="hover:text-brand-accent hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

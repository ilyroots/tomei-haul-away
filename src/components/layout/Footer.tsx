import Link from "next/link";
import {
  COMPANY_NAME,
  HOME_CITY,
  PHONE,
  TEXT_NUMBER,
  EMAIL,
  BUSINESS_HOURS,
  formatPhone,
} from "@/lib/business/config";

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

const SOCIAL_PLACEHOLDERS = [
  { name: "Facebook", href: "#" },
  { name: "Instagram", href: "#" },
  { name: "Google Business", href: "#" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy py-12 text-cream">
      <div className="container mx-auto px-4">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="text-2xl font-bold tracking-tight">
              {COMPANY_NAME}
            </Link>
            <p className="mt-3 text-cream/80">
              Reliable junk removal and cleanout services based in {HOME_CITY}.
            </p>
            <div className="mt-4 space-y-1 text-cream/80">
              <p>
                Phone:{" "}
                <a href={`tel:${PHONE}`} className="underline hover:text-orange">
                  {formatPhone(PHONE)}
                </a>
              </p>
              <p>
                Text:{" "}
                <a href={`sms:${TEXT_NUMBER}`} className="underline hover:text-orange">
                  {formatPhone(TEXT_NUMBER)}
                </a>
              </p>
              <p>
                Email:{" "}
                <a href={`mailto:${EMAIL}`} className="underline hover:text-orange">
                  {EMAIL}
                </a>
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-cream">Hours</h2>
            <ul className="mt-3 space-y-1 text-cream/80">
              {BUSINESS_HOURS.map(({ day, hours }) => (
                <li key={day} className="flex justify-between gap-4">
                  <span>{day}</span>
                  <span>{hours}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-cream">Sitemap</h2>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-cream/80">
              {SITEMAP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-orange hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-cream">Connect</h2>
            <ul className="mt-3 space-y-2 text-cream/80">
              {SOCIAL_PLACEHOLDERS.map((social) => (
                <li key={social.name}>
                  <a
                    href={social.href}
                    aria-label={`${social.name} placeholder — link not yet configured`}
                    className="hover:text-orange hover:underline"
                  >
                    {social.name}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-cream/60">
              Social links are placeholders until profiles are set up.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-cream/20 pt-6 sm:flex-row">
          <p className="text-sm text-cream/70">
            © {currentYear} {COMPANY_NAME}. All rights reserved.
          </p>
          <ul className="flex gap-6 text-sm text-cream/70">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-orange hover:underline">
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

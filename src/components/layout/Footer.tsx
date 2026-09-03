import Link from "next/link";
import Image from "next/image";
import { COMPANY_NAME, HOME_CITY, PHONE, EMAIL, formatPhone } from "@/lib/business/config";
import { logoStacked } from "@/lib/public/images";

const FOOTER_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/service-areas", label: "Service Areas" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/photo-credits", label: "Photo Credits" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-primary py-8 text-brand-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-between">
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
              className="h-auto w-20"
            />
          </Link>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              {FOOTER_LINKS.map((link) => (
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
          </nav>

          <div className="text-center text-sm text-brand-background/80 md:text-right">
            <p>
              <a href={`tel:${PHONE}`} className="hover:text-brand-accent hover:underline">
                {formatPhone(PHONE)}
              </a>
            </p>
            <p>
              <a href={`mailto:${EMAIL}`} className="hover:text-brand-accent hover:underline">
                {EMAIL}
              </a>
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-brand-background/20 pt-4 text-sm text-brand-background/70 sm:flex-row">
          <p>
            © {currentYear} {COMPANY_NAME} · {HOME_CITY}. All rights reserved.
          </p>
          <ul className="flex gap-6">
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

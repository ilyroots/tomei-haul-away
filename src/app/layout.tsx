import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomBar } from "@/components/layout/MobileBottomBar";
import { COMPANY_NAME, PHONE, EMAIL, HOME_CITY, BUSINESS_HOURS } from "@/lib/business/config";
import { logoSocial } from "@/lib/public/images";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Tomei Haul Away | Junk Removal",
    template: "%s | Tomei Haul Away",
  },
  description:
    "Reliable junk removal and cleanout services for homes, businesses, and estates in the Haverhill, MA area. Request a free quote today.",
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  openGraph: {
    images: [
      {
        url: logoSocial.src,
        width: logoSocial.width,
        height: logoSocial.height,
        alt: logoSocial.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [logoSocial.src],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

function buildLocalBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "MovingCompany",
    name: COMPANY_NAME,
    description: "Reliable junk removal and cleanout services for homes, businesses, and estates.",
    url: process.env.APP_URL ?? "http://localhost:3000",
    telephone: PHONE,
    email: EMAIL,
    areaServed: {
      "@type": "City",
      name: HOME_CITY,
    },
    openingHoursSpecification: BUSINESS_HOURS.filter(({ hours }) => hours !== "Closed").map(
      ({ day, hours }) => {
        const [open, close] = hours.split(" – ");
        return {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: `https://schema.org/${day}`,
          opens: open,
          closes: close,
        };
      }
    ),
    sameAs: [],
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = buildLocalBusinessJsonLd();

  return (
    <html lang="en" className={`${barlowCondensed.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col bg-brand-background text-brand-text">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
        <Footer />
        <MobileBottomBar />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}

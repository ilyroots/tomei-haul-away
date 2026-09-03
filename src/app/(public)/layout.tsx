import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomBar } from "@/components/layout/MobileBottomBar";
import { COMPANY_NAME, PHONE, EMAIL, HOME_CITY, BUSINESS_HOURS } from "@/lib/business/config";

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

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = buildLocalBusinessJsonLd();

  return (
    <>
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
    </>
  );
}

import { Metadata } from "next";
import Link from "next/link";
import { SERVICE_AREA, COMPANY_NAME } from "@/lib/business/config";
import { SectionHeading } from "@/components/public/SectionHeading";
import { Button } from "@/components/ui/Button";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Service Areas",
  description: `${COMPANY_NAME} serves Haverhill, MA and surrounding communities within a ${SERVICE_AREA.radiusMiles}-mile radius.`,
  alternates: {
    canonical: `${appUrl}/service-areas`,
  },
  openGraph: {
    title: `Service Areas | ${COMPANY_NAME}`,
    description: "Junk removal in Haverhill and surrounding Massachusetts communities.",
    url: `${appUrl}/service-areas`,
    type: "website",
  },
};

export default function ServiceAreasPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <SectionHeading
        title="Service areas"
        subtitle={`We serve ${SERVICE_AREA.cities[0]} and neighboring communities within approximately ${SERVICE_AREA.radiusMiles} miles.`}
        centered
      />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICE_AREA.cities.map((city) => (
          <Link
            key={city}
            href={`/service-areas/${city.toLowerCase().replace(/\s+/g, "-")}`}
            className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-orange"
          >
            <h2 className="text-xl font-bold text-navy">{city}, MA</h2>
            <p className="mt-2 text-sm text-charcoal-600">Junk removal and cleanout services</p>
          </Link>
        ))}
      </div>

      <div className="mx-auto mt-12 max-w-3xl rounded-xl bg-cream-100 p-6">
        <h2 className="text-xl font-bold text-navy">ZIP codes served</h2>
        <p className="mt-2 text-sm text-charcoal-700">{SERVICE_AREA.zips.join(", ")}</p>
      </div>

      <div className="mt-12 text-center">
        <p className="text-charcoal-600">Not sure if we cover your address?</p>
        <Button asChild className="mt-4">
          <Link href="/quote">Check with a quote request</Link>
        </Button>
      </div>
    </div>
  );
}

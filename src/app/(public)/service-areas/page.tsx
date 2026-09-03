import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SERVICE_AREA, COMPANY_NAME, HOME_STATE } from "@/lib/business/config";
import { SectionHeading } from "@/components/public/SectionHeading";
import { Button } from "@/components/ui/Button";
import { getServiceAreaImage } from "@/lib/public/images";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Service Areas",
  description: `${COMPANY_NAME} serves ${SERVICE_AREA.cities[0]}, ${HOME_STATE} and surrounding communities within a ${SERVICE_AREA.radiusMiles}-mile radius.`,
  alternates: {
    canonical: `${appUrl}/service-areas`,
  },
  openGraph: {
    title: `Service Areas | ${COMPANY_NAME}`,
    description: "Junk removal in San Diego and surrounding California communities.",
    url: `${appUrl}/service-areas`,
    type: "website",
  },
};

export default function ServiceAreasPage() {
  const headerImage = getServiceAreaImage(0);

  return (
    <>
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0">
          <Image
            src={headerImage.src}
            alt={headerImage.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-brand-primary/80" />
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-brand-background md:text-5xl">Service areas</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-background/90">
            We serve {SERVICE_AREA.cities[0]} and neighboring communities within approximately{" "}
            {SERVICE_AREA.radiusMiles} miles.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <SectionHeading
          title="Cities we serve"
          subtitle="Reliable junk removal and cleanout services across the region."
          centered
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_AREA.cities.map((city) => (
            <Link
              key={city}
              href={`/service-areas/${city.toLowerCase().replace(/\s+/g, "-")}`}
              className="overflow-hidden rounded-xl bg-brand-surface shadow-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            >
              <div className="relative aspect-[3/2] w-full">
                <Image
                  src={getServiceAreaImage(SERVICE_AREA.cities.indexOf(city)).src}
                  alt={`Junk removal services in ${city}, ${HOME_STATE}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold text-brand-primary">
                  {city}, {HOME_STATE}
                </h2>
                <p className="mt-2 text-sm text-brand-text/80">
                  Junk removal and cleanout services
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-xl bg-brand-background p-6">
          <h2 className="text-xl font-bold text-brand-primary">ZIP codes served</h2>
          <p className="mt-2 text-sm text-brand-text/90">{SERVICE_AREA.zips.join(", ")}</p>
        </div>

        <div className="mt-12 text-center">
          <p className="text-brand-text/80">Not sure if we cover your address?</p>
          <Button asChild className="mt-4">
            <Link href="/quote">Check with a quote request</Link>
          </Button>
        </div>
      </div>
    </>
  );
}

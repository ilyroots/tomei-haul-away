import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { COMPANY_NAME, HOME_STATE, SERVICE_AREA, slugifyCity } from "@/lib/business/config";
import { SectionHeading } from "@/components/public/SectionHeading";
import { Button } from "@/components/ui/Button";
import { SERVICE_REGIONS, ServiceAreaRegion, regionForCitySlug } from "@/lib/public/areas";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Service Areas",
  description: `${COMPANY_NAME} is serving communities throughout San Diego County with junk removal, cleanouts, and hauling.`,
  alternates: {
    canonical: `${appUrl}/service-areas`,
  },
  openGraph: {
    title: `Service Areas | ${COMPANY_NAME}`,
    description:
      "Junk removal and cleanout services serving communities throughout San Diego County.",
    url: `${appUrl}/service-areas`,
    type: "website",
  },
};

function RegionCard({ region, priority }: { region: ServiceAreaRegion; priority: boolean }) {
  return (
    <Link
      href={`#cities-${region.slug}`}
      className="group block overflow-hidden rounded-xl bg-brand-surface shadow-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
    >
      <div className="grid md:grid-cols-2">
        <div className="relative aspect-video w-full">
          <Image
            src={region.image.src}
            alt={region.image.alt}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col justify-center p-6 md:p-8">
          <h3 className="text-2xl font-bold text-brand-primary group-hover:text-brand-accent">
            {region.region}
          </h3>
          <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-brand-accent">
            {region.cities.length} communities served
          </p>
          <p className="mt-3 text-sm text-brand-text/80">
            {region.cities.map((city) => city.name).join(" · ")}
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-primary group-hover:text-brand-accent">
            Browse {region.region} cities
            <span aria-hidden="true">↓</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ServiceAreasPage() {
  const [heroRegion] = SERVICE_REGIONS;

  return (
    <>
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0">
          <Image
            src={heroRegion.image.src}
            alt={heroRegion.image.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-brand-primary/80" />
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-brand-background md:text-5xl">
            Serving communities throughout San Diego County
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-background/90">
            From the North County coast to the South Bay, {COMPANY_NAME} provides junk removal,
            cleanouts, and hauling across San Diego County — with upfront pricing and on-time
            arrival windows.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <SectionHeading
          title="Our service regions"
          subtitle="Five regions, one reliable crew. Choose your area to see the cities we serve."
          centered
        />

        <div className="mt-10 space-y-8">
          {SERVICE_REGIONS.map((region, index) => (
            <RegionCard key={region.slug} region={region} priority={index === 0} />
          ))}
        </div>

        <div className="mt-20">
          <SectionHeading
            title="City index"
            subtitle="Every community we serve, listed by region. Select your city for local details."
            centered
          />

          <div className="mt-10 space-y-10">
            {SERVICE_REGIONS.map((region) => {
              const configCities = SERVICE_AREA.cities.filter((city) =>
                region.cities.some((c) => c.slug === slugifyCity(city))
              );
              if (configCities.length === 0) return null;
              return (
                <div key={region.slug} id={`cities-${region.slug}`} className="scroll-mt-24">
                  <h3 className="text-xl font-bold text-brand-primary">{region.region}</h3>
                  <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                    {configCities.map((city) => (
                      <li key={city}>
                        <Link
                          href={`/service-areas/${slugifyCity(city)}`}
                          className="text-brand-text/90 hover:text-brand-accent hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                        >
                          {city}, {HOME_STATE}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            {(() => {
              const unmatched = SERVICE_AREA.cities.filter(
                (city) => !regionForCitySlug(slugifyCity(city))
              );
              if (unmatched.length === 0) return null;
              return (
                <div id="cities-other" className="scroll-mt-24">
                  <h3 className="text-xl font-bold text-brand-primary">Additional communities</h3>
                  <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                    {unmatched.map((city) => (
                      <li key={city}>
                        <Link
                          href={`/service-areas/${slugifyCity(city)}`}
                          className="text-brand-text/90 hover:text-brand-accent hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                        >
                          {city}, {HOME_STATE}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}
          </div>
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

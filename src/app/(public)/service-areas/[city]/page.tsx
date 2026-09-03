import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  COMPANY_NAME,
  HOME_STATE,
  SERVICE_AREA,
  getCityBySlug,
  slugifyCity,
  getZipsForCity,
  PHONE,
  formatPhone,
} from "@/lib/business/config";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/public/SectionHeading";
import { regionForCitySlug } from "@/lib/public/areas";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

interface CityPageProps {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  return SERVICE_AREA.cities.map((city) => ({ city: slugifyCity(city) }));
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { city } = await params;
  const cityName = getCityBySlug(city);
  if (!cityName) {
    return { title: "Service Area Not Found" };
  }
  return {
    title: `Junk Removal in ${cityName}, ${HOME_STATE}`,
    description: `${COMPANY_NAME} provides junk removal, cleanouts, and hauling services in ${cityName}, ${HOME_STATE} and nearby San Diego County communities.`,
    alternates: {
      canonical: `${appUrl}/service-areas/${city}`,
    },
    openGraph: {
      title: `Junk Removal in ${cityName}, ${HOME_STATE} | ${COMPANY_NAME}`,
      description: `Reliable junk removal and cleanouts in ${cityName}, California.`,
      url: `${appUrl}/service-areas/${city}`,
      type: "website",
    },
  };
}

/** Deterministic per-city variation so each city page reads a little differently. */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

const JOB_SETS = [
  "garage cleanouts, furniture removal, and appliance pickup",
  "estate cleanouts, storage-unit cleanouts, and yard debris hauling",
  "renovation debris, mattress and couch removal, and single-item pickups",
  "office cleanouts, commercial junk removal, and donation-ready furniture pickup",
];

const INTRO_VARIANTS: Array<(city: string) => string> = [
  (city) =>
    `${city} homes and businesses rely on ${COMPANY_NAME} for no-hassle junk removal. Our crew does the lifting and loading so you don't have to, and everything we haul is sorted for donation, recycling, or disposal.`,
  (city) =>
    `When clutter takes over in ${city}, one call to ${COMPANY_NAME} takes care of it. We handle homes, apartments, offices, and job sites with on-time arrival windows and upfront pricing.`,
  (city) =>
    `${city} residents call ${COMPANY_NAME} when junk needs to be gone fast. From a single bulky item to a full property cleanout, we size the crew to the job and leave the space clean.`,
];

const JOB_VARIANTS: Array<(city: string, jobs: string) => string> = [
  (city, jobs) =>
    `Typical ${city} jobs include ${jobs}. Whether it's a one-item pickup or a whole-house cleanout, we bring the truck, the team, and the tools to finish in one visit.`,
  (city, jobs) =>
    `In ${city}, we're often called for ${jobs}. Every job starts with a free quote, and we confirm the exact price before lifting a thing.`,
  (city, jobs) =>
    `Our ${city} customers book us for ${jobs} — and just about anything else too big for the curb. You point, we haul.`,
];

const REGION_CONTEXT: Record<string, (city: string, region: string) => string> = {
  "north-county-coastal": (city, region) =>
    `${city} is one of the communities along San Diego's North County coastline, and our trucks run this corridor every week. See every city we cover in the ${region} region below.`,
  "north-county-inland": (city, region) =>
    `Set inland from the coast, ${city} is part of the ${region} communities we serve regularly, from downtown storefronts to hillside neighborhoods. The full city list for the region is below.`,
  "central-san-diego": (city, region) =>
    `${city} sits in the heart of San Diego, close to Mission Trails Regional Park, I-15, and the central neighborhoods we serve every day. Browse the other ${region} communities below.`,
  "east-county": (city, region) =>
    `${city} anchors part of East County, where we handle everything from suburban garage cleanouts to rural-property debris. The rest of the ${region} cities we serve are listed below.`,
  "south-bay": (city, region) =>
    `Down in the South Bay, ${city} is one of the communities we visit weekly, from Chula Vista to Imperial Beach. See the other ${region} cities we cover below.`,
};

export default async function CityPage({ params }: CityPageProps) {
  const { city } = await params;
  const cityName = getCityBySlug(city);
  if (!cityName) {
    notFound();
  }

  const zips = getZipsForCity(cityName);
  const region = regionForCitySlug(city);
  const regionCity = region?.cities.find((c) => c.slug === city);
  // Fall back to the region photo when a config city has no photo entry.
  const photo = regionCity?.image ?? region?.image;
  const siblingCities = region?.cities.filter((c) => c.slug !== city) ?? [];

  const hash = hashString(city);
  const intro = INTRO_VARIANTS[hash % INTRO_VARIANTS.length](cityName);
  const jobs = JOB_VARIANTS[hash % JOB_VARIANTS.length](cityName, JOB_SETS[hash % JOB_SETS.length]);
  const regionContext = region
    ? (REGION_CONTEXT[region.slug]?.(cityName, region.region) ??
      `${cityName} is part of the ${region.region} communities we serve across San Diego County. Browse the other cities in the region below.`)
    : `${cityName} is one of the San Diego County communities we serve, and our crew schedules runs nearby every week.`;

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/service-areas"
          className="text-sm font-semibold text-brand-primary hover:text-brand-accent hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
        >
          ← All service areas
        </Link>
        <SectionHeading
          title={`Junk removal in ${cityName}, ${HOME_STATE}`}
          subtitle={
            region
              ? `${COMPANY_NAME} serves ${cityName} and nearby ${region.region} communities.`
              : `${COMPANY_NAME} serves ${cityName} and surrounding San Diego County communities.`
          }
          level="h1"
          className="mt-4"
        />

        {photo && (
          <figure className="mt-8">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-2 text-xs text-brand-muted">
              Photo: {photo.attribution} (cropped and resized)
            </figcaption>
          </figure>
        )}

        <div className="mt-8 space-y-4 text-brand-text/90">
          <p>{intro}</p>
          <p>{jobs}</p>
          <p>{regionContext}</p>
        </div>

        <div className="mt-10 rounded-xl bg-brand-background p-6">
          <h2 className="text-xl font-bold text-brand-primary">
            ZIP codes we serve near {cityName}
          </h2>
          <p className="mt-2 text-sm text-brand-text/90">{zips.join(", ")}</p>
        </div>

        {region && (
          <div className="mt-10 rounded-xl border border-brand-border bg-brand-surface p-6">
            <h2 className="text-xl font-bold text-brand-primary">
              {cityName} is part of {region.region}
            </h2>
            <p className="mt-2 text-sm text-brand-text/90">
              We schedule junk removal runs throughout {region.region} every week.
            </p>
            <Link
              href={`/service-areas#cities-${region.slug}`}
              className="mt-3 inline-block text-sm font-semibold text-brand-primary hover:text-brand-accent hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            >
              View all {region.region} service areas →
            </Link>
          </div>
        )}

        {siblingCities.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-brand-primary">
              Other cities in {region?.region}
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {siblingCities.map((sibling) => (
                <li key={sibling.slug}>
                  <Link
                    href={`/service-areas/${sibling.slug}`}
                    className="text-brand-text/90 hover:text-brand-accent hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                  >
                    {sibling.name}, {HOME_STATE}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10">
          <h2 className="text-xl font-bold text-brand-primary">Scheduling</h2>
          <p className="mt-2 text-brand-text/90">
            Request a specific date and arrival window when you schedule online. We follow up to
            confirm, and same-day or next-day appointments are often available depending on crew
            availability.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href={`/quote?city=${encodeURIComponent(cityName)}`}>Request a free quote</Link>
          </Button>
          <Button asChild variant="ghost">
            <a href={`tel:${PHONE}`}>Call {formatPhone(PHONE)}</a>
          </Button>
        </div>
      </div>
    </div>
  );
}

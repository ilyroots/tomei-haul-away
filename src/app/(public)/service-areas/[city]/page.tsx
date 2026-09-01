import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  COMPANY_NAME,
  SERVICE_AREA,
  getCityBySlug,
  slugifyCity,
  getZipsForCity,
  getNeighboringCities,
  PHONE,
  formatPhone,
} from "@/lib/business/config";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/public/SectionHeading";

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
    title: `Junk Removal in ${cityName}, MA`,
    description: `${COMPANY_NAME} provides junk removal, cleanouts, and hauling services in ${cityName}, MA and nearby communities.`,
    alternates: {
      canonical: `${appUrl}/service-areas/${city}`,
    },
    openGraph: {
      title: `Junk Removal in ${cityName}, MA | ${COMPANY_NAME}`,
      description: `Reliable junk removal and cleanouts in ${cityName}, Massachusetts.`,
      url: `${appUrl}/service-areas/${city}`,
      type: "website",
    },
  };
}

export default async function CityPage({ params }: CityPageProps) {
  const { city } = await params;
  const cityName = getCityBySlug(city);
  if (!cityName) {
    notFound();
  }

  const zips = getZipsForCity(cityName);
  const neighbors = getNeighboringCities(cityName);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/service-areas"
          className="text-sm font-semibold text-navy hover:text-orange hover:underline"
        >
          ← All service areas
        </Link>
        <SectionHeading
          title={`Junk removal in ${cityName}, MA`}
          subtitle={`${COMPANY_NAME} serves ${cityName} and surrounding communities within approximately ${SERVICE_AREA.radiusMiles} miles of ${SERVICE_AREA.cities[0]}.`}
          level="h1"
          className="mt-4"
        />

        <div className="mt-8 space-y-4 text-charcoal-700">
          <p>
            Whether you are clearing out a garage, removing old furniture, or handling an estate
            cleanout, our crew can help in {cityName}.
          </p>
          <p>
            We handle homes, apartments, storage units, offices, and job sites. Request a free quote
            online or call us to discuss your job.
          </p>
        </div>

        <div className="mt-10 rounded-xl bg-cream-100 p-6">
          <h2 className="text-xl font-bold text-navy">ZIP codes we serve near {cityName}</h2>
          <p className="mt-2 text-sm text-charcoal-700">{zips.join(", ")}</p>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-bold text-navy">Neighboring communities</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {neighbors.map((neighbor) => (
              <li key={neighbor}>
                <Link
                  href={`/service-areas/${slugifyCity(neighbor)}`}
                  className="text-charcoal-700 hover:text-orange hover:underline"
                >
                  {neighbor}, MA
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-bold text-navy">Scheduling</h2>
          <p className="mt-2 text-charcoal-700">
            You can request a specific date and arrival window when you schedule online. We will
            follow up to confirm. Same-day and next-day appointments may be available depending on
            crew availability.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href={`/quote?city=${encodeURIComponent(cityName)}`}>Request a free quote</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/schedule">Schedule an appointment</Link>
          </Button>
          <Button asChild variant="ghost">
            <a href={`tel:${PHONE}`}>Call {formatPhone(PHONE)}</a>
          </Button>
        </div>
      </div>
    </div>
  );
}

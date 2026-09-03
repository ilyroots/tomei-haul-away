import { Metadata } from "next";
import Image from "next/image";
import { COMPANY_NAME } from "@/lib/business/config";
import { northCountyCoastal } from "@/lib/public/areas/north-county-coastal";
import { northCountyInland } from "@/lib/public/areas/north-county-inland";
import { centralSanDiego } from "@/lib/public/areas/central-san-diego";
import { eastCounty } from "@/lib/public/areas/east-county";
import { southBay } from "@/lib/public/areas/south-bay";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

// Imported at runtime so this page always reflects whatever regions and
// city entries the service-area data modules currently export.
const REGIONS = [northCountyCoastal, northCountyInland, centralSanDiego, eastCounty, southBay];

interface CreditEntry {
  subject: string;
  photo: {
    src: string;
    filePageUrl: string;
    photographer: string;
    license: string;
    attribution: string;
    alt: string;
  };
}

export const metadata: Metadata = {
  title: "Photo Credits",
  description: `Photo credits and licensing information for the service-area photography used on the ${COMPANY_NAME} website.`,
  alternates: {
    canonical: `${appUrl}/photo-credits`,
  },
};

export default function PhotoCreditsPage() {
  return (
    <div className="bg-brand-background py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold text-brand-primary">Photo Credits</h1>
          <p className="mt-4 text-brand-text/80">
            The service-area photographs on this site are sourced from Wikimedia Commons and are
            used under their stated licenses. {COMPANY_NAME} does not claim ownership of these
            images. Each photograph is credited to its photographer below, with a link to the
            original file page on Wikimedia Commons.
          </p>

          <div className="mt-10 space-y-8">
            {REGIONS.map((region) => {
              const entries: CreditEntry[] = [
                { subject: `${region.region} (region overview)`, photo: region.image },
                ...region.cities.map((city) => ({
                  subject: city.name,
                  photo: city.image,
                })),
              ];

              return (
                <section key={region.slug} className="rounded-xl bg-brand-surface p-6 shadow-sm">
                  <h2 className="text-2xl font-bold text-brand-primary">{region.region}</h2>
                  <ul className="mt-4 divide-y divide-brand-border">
                    {entries.map((entry) => (
                      <li
                        key={entry.photo.src}
                        className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center"
                      >
                        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md">
                          <Image
                            src={entry.photo.src}
                            alt={entry.photo.alt}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-brand-text">{entry.subject}</p>
                          <p className="mt-1 text-sm text-brand-muted">
                            Photo by {entry.photo.photographer} · {entry.photo.license}
                          </p>
                          <a
                            href={entry.photo.filePageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-block text-sm text-brand-primary hover:text-brand-accent hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                          >
                            View original on Wikimedia Commons
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

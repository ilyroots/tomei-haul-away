import { Metadata } from "next";
import Image from "next/image";
import { COMPANY_NAME, OWNER_NAME, HOME_CITY } from "@/lib/business/config";
import { SectionHeading } from "@/components/public/SectionHeading";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${COMPANY_NAME}, a local junk removal and cleanout business based in ${HOME_CITY}.`,
  alternates: {
    canonical: `${appUrl}/about`,
  },
  openGraph: {
    title: `About | ${COMPANY_NAME}`,
    description: `Local junk removal and cleanout services based in ${HOME_CITY}.`,
    url: `${appUrl}/about`,
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          title={`About ${COMPANY_NAME}`}
          subtitle={`Local junk removal and cleanout services based in ${HOME_CITY}.`}
          level="h1"
          centered
        />

        <div className="relative mx-auto mt-10 aspect-square w-full max-w-sm overflow-hidden rounded-xl bg-cream-100">
          <Image
            src="/placeholders/owner.svg"
            alt={`${OWNER_NAME} owner photo placeholder — replace with real headshot`}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
          />
        </div>

        <div className="mt-10 space-y-4 text-charcoal-700">
          <p>
            {COMPANY_NAME} is a locally owned junk removal and cleanout business serving homes,
            businesses, and estates in the {HOME_CITY} area.
          </p>
          <p>
            We started this business to help people reclaim their space without the hassle of
            renting a dumpster or making dozens of trips to donation centers and transfer stations.
          </p>
          <p>
            Our approach is simple: show up on time, communicate clearly, treat your property with
            respect, and dispose of items responsibly. When items are still usable, we route them to
            local donation or recycling options whenever possible.
          </p>
          <p>
            {OWNER_NAME} oversees day-to-day operations and works directly with customers to make
            sure every job is handled safely and efficiently.
          </p>
        </div>

        <div className="mt-10 rounded-xl bg-cream-100 p-6">
          <h2 className="text-xl font-bold text-navy">What we believe</h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-charcoal-700">
            <li>Clear communication beats surprise fees.</li>
            <li>Your time and property deserve respect.</li>
            <li>Usable items should get a second life when possible.</li>
            <li>Local businesses should show up for their communities.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

import { Metadata } from "next";
import Image from "next/image";
import { COMPANY_NAME, OWNER_NAME, HOME_CITY } from "@/lib/business/config";
import { SectionHeading } from "@/components/public/SectionHeading";
import {
  aboutOwnerImage,
  aboutCrewImage,
  aboutTruckImage,
  aboutCommunityImage,
} from "@/lib/public/images";

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
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          title={`About ${COMPANY_NAME}`}
          subtitle={`Local junk removal and cleanout services based in ${HOME_CITY}.`}
          level="h1"
          centered
        />

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl md:aspect-square">
            <Image
              src={aboutOwnerImage.src}
              alt={aboutOwnerImage.alt}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl md:aspect-square">
            <Image
              src={aboutCrewImage.src}
              alt={aboutCrewImage.alt}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover"
            />
          </div>
        </div>

        <div className="mt-10 space-y-4 text-brand-text/90">
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

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
            <Image
              src={aboutTruckImage.src}
              alt={aboutTruckImage.alt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="rounded-xl bg-brand-background p-6">
            <h2 className="text-xl font-bold text-brand-primary">What we believe</h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-brand-text/90">
              <li>Clear communication beats surprise fees.</li>
              <li>Your time and property deserve respect.</li>
              <li>Usable items should get a second life when possible.</li>
              <li>Local businesses should show up for their communities.</li>
            </ul>
          </div>
        </div>

        <div className="mt-10">
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl">
            <Image
              src={aboutCommunityImage.src}
              alt={aboutCommunityImage.alt}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <p className="mt-3 text-center text-sm text-brand-muted">
            Proudly serving the {HOME_CITY} area and surrounding communities.
          </p>
        </div>
      </div>
    </div>
  );
}

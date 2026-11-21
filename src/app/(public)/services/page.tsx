import Link from "next/link";
import { Metadata } from "next";
import { SERVICES, COMPANY_NAME } from "@/lib/business/config";
import { ServiceCard } from "@/components/public/ServiceCard";
import { SectionHeading } from "@/components/public/SectionHeading";
import { CleanoutPhotos } from "@/components/public/CleanoutPhotos";
import { Button } from "@/components/ui/Button";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Services",
  description: `Full list of junk removal and cleanout services offered by ${COMPANY_NAME}.`,
  alternates: {
    canonical: `${appUrl}/services`,
  },
  openGraph: {
    title: `Services | ${COMPANY_NAME}`,
    description: "Junk removal, cleanouts, appliance removal, and more.",
    url: `${appUrl}/services`,
    type: "website",
  },
};

export default function ServicesPage() {
  return (
    <>
      <section className="bg-brand-primary py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-[family-name:var(--font-inter)] text-4xl font-bold text-white md:text-5xl">Our services</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white">
            From single-item pickups to full-property cleanouts, we handle the heavy lifting.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 pt-10">
        <div className="mx-auto max-w-5xl">
          <CleanoutPhotos />
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <SectionHeading
          title="What we haul"
          subtitle="Reliable junk removal and cleanout services for homes, businesses, and estates."
          centered
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <ServiceCard
              key={service.slug}
              slug={service.slug}
              title={service.title}
              shortDescription={service.shortDescription}
            />
          ))}
        </div>
        <div className="mt-12 text-center">
          <p className="text-brand-text/80">Not sure which service fits your job?</p>
          <Button asChild className="mt-4">
            <Link href="/quote">Request a free quote</Link>
          </Button>
        </div>
      </div>
    </>
  );
}

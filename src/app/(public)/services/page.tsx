import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { SERVICES, COMPANY_NAME } from "@/lib/business/config";
import { ServiceCard } from "@/components/public/ServiceCard";
import { SectionHeading } from "@/components/public/SectionHeading";
import { Button } from "@/components/ui/Button";
import { finalCtaImage } from "@/lib/public/images";

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
      {/* Header image */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0">
          <Image
            src={finalCtaImage.src}
            alt={finalCtaImage.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-brand-primary/80" />
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-brand-background md:text-5xl">Our services</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-background/90">
            From single-item pickups to full-property cleanouts, we handle the heavy lifting.
          </p>
        </div>
      </section>

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

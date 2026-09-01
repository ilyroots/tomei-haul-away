import Link from "next/link";
import { Metadata } from "next";
import { SERVICES, COMPANY_NAME } from "@/lib/business/config";
import { ServiceCard } from "@/components/public/ServiceCard";
import { SectionHeading } from "@/components/public/SectionHeading";
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
    <div className="container mx-auto px-4 py-16">
      <SectionHeading
        title="Our services"
        subtitle="From single-item pickups to full-property cleanouts, we handle the heavy lifting."
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
        <p className="text-charcoal-600">Not sure which service fits your job?</p>
        <Button asChild className="mt-4">
          <Link href="/quote">Request a free quote</Link>
        </Button>
      </div>
    </div>
  );
}

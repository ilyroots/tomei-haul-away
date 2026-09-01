import { Metadata } from "next";
import Link from "next/link";
import { COMPANY_NAME } from "@/lib/business/config";
import { SectionHeading } from "@/components/public/SectionHeading";
import { PricingFactors } from "@/components/public/PricingFactors";
import { Button } from "@/components/ui/Button";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Pricing",
  description: `Learn how ${COMPANY_NAME} estimates junk removal and cleanout jobs. No fake prices — request a free, personalized quote.`,
  alternates: {
    canonical: `${appUrl}/pricing`,
  },
  openGraph: {
    title: `Pricing | ${COMPANY_NAME}`,
    description: "Honest junk removal pricing based on volume, access, and item type.",
    url: `${appUrl}/pricing`,
    type: "website",
  },
};

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <SectionHeading
        title="Pricing"
        subtitle="Every job is different. We provide upfront, personalized estimates so you know what to expect."
        centered
      />

      <div className="mx-auto mt-10 max-w-3xl">
        <p className="text-lg text-charcoal-700">
          We do not publish flat-rate prices because the cost of a junk removal job depends on
          several factors specific to your situation. Sending photos and a brief description is the
          fastest way to get an accurate estimate.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-4xl">
        <PricingFactors />
      </div>

      <div className="mx-auto mt-16 max-w-3xl rounded-xl bg-navy p-8 text-cream md:p-12">
        <h2 className="text-2xl font-bold text-cream md:text-3xl">Get your free estimate</h2>
        <p className="mt-3 text-cream/90">
          Fill out the quote form, upload photos, and we will respond with a clear estimate. There
          is no obligation until you approve the work.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/quote">Request a quote</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/services">Browse services</Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-3xl">
        <h2 className="text-2xl font-bold text-navy">What is included</h2>
        <ul className="mt-4 list-inside list-disc space-y-2 text-charcoal-700">
          <li>Labor to remove items from your property</li>
          <li>Loading and hauling to appropriate disposal or donation facilities</li>
          <li>A basic sweep of the area after removal</li>
        </ul>
        <p className="mt-4 text-charcoal-600">
          Extra fees may apply for specialty items, restricted materials, or job-site conditions
          that require additional equipment. We will disclose these before scheduling.
        </p>
      </div>
    </div>
  );
}

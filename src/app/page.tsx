import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { COMPANY_NAME, PHONE, SERVICES, SERVICE_AREA, formatPhone } from "@/lib/business/config";
import { getActiveFaqs, getActiveGalleryItems } from "@/lib/public/data";
import {
  heroImage,
  galleryPairs,
  teamImage,
  getServiceAreaImage,
  finalCtaImage,
  processImages,
} from "@/lib/public/images";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/public/SectionHeading";
import { TrustRow } from "@/components/public/TrustRow";
import { QuickQuoteStrip } from "@/components/public/QuickQuoteStrip";
import { ServiceCard } from "@/components/public/ServiceCard";
import { GalleryImage } from "@/components/public/GalleryImage";
import { PricingFactors } from "@/components/public/PricingFactors";
import { FaqStructuredData } from "@/components/public/FaqStructuredData";
import { TestimonialsSection } from "@/components/public/TestimonialsSection";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Junk Removal & Cleanouts",
  description: `${COMPANY_NAME} provides reliable junk removal, furniture removal, appliance pickup, cleanouts, and yard debris hauling in the Haverhill, MA area.`,
  alternates: {
    canonical: `${appUrl}/`,
  },
  openGraph: {
    title: `${COMPANY_NAME} | Junk Removal & Cleanouts`,
    description: "Reliable junk removal and cleanout services in the Haverhill, MA area.",
    url: `${appUrl}/`,
    type: "website",
  },
};

const STEPS = [
  {
    number: "01",
    title: "Request a quote",
    image: processImages.quote,
    description:
      "Fill out the quick form or call us. Share photos and details so we can understand the job.",
  },
  {
    number: "02",
    title: "Review your estimate",
    image: processImages.estimate,
    description:
      "We will contact you with questions and a clear, upfront estimate before any work begins.",
  },
  {
    number: "03",
    title: "We haul it away",
    image: processImages.haul,
    description: "Our crew arrives on time, removes your items, and sweeps up before we leave.",
  },
];

const WHY_ITEMS = [
  {
    title: "Straightforward communication",
    description: "You will know when we are arriving and what to expect before we start.",
  },
  {
    title: "Respectful of your space",
    description: "We protect floors and doorways and clean up after the job.",
  },
  {
    title: "Local focus",
    description: "We live and work in the same communities we serve.",
  },
  {
    title: "Flexible options",
    description: "Single-item pickups, full cleanouts, and recurring commercial service available.",
  },
];

async function getHomeData() {
  const [faqs, galleryItems] = await Promise.all([getActiveFaqs(), getActiveGalleryItems(6)]);
  return { faqs, galleryItems };
}

export default async function HomePage() {
  const { faqs, galleryItems } = await getHomeData();
  const hasGalleryItems = galleryItems.length > 0;
  const serviceAreaImage = getServiceAreaImage(0);

  return (
    <>
      <FaqStructuredData
        items={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))}
      />

      {/* 1. Hero */}
      <section className="relative overflow-hidden py-20 text-brand-background md:py-28">
        <div className="absolute inset-0">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-brand-primary/80" />
        </div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h1 className="text-4xl font-bold leading-tight text-brand-background md:text-5xl lg:text-6xl">
                Clear the clutter. We&apos;ll handle the heavy lifting.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-brand-background/90">
                {COMPANY_NAME} removes junk, furniture, appliances, and debris from homes,
                businesses, and estates across the Haverhill area.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/quote">Get a Free Quote</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href={`tel:${PHONE}`}>Call {formatPhone(PHONE)}</a>
                </Button>
              </div>
            </div>
            <div className="hidden lg:block" />
          </div>
          <div className="mt-12">
            <TrustRow />
          </div>
        </div>
      </section>

      {/* 2. Quick quote strip */}
      <QuickQuoteStrip />

      {/* 3. Service grid */}
      <section className="py-16 md:py-24" aria-labelledby="services-heading">
        <div className="container mx-auto px-4">
          <SectionHeading
            id="services-heading"
            title="Junk removal services"
            subtitle="From single-item pickups to full property cleanouts, we handle the heavy lifting."
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
          <div className="mt-10 text-center">
            <Button asChild variant="outline">
              <Link href="/services">View all services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 4. How it works */}
      <section
        className="bg-brand-background py-16 md:py-24"
        aria-labelledby="how-it-works-heading"
      >
        <div className="container mx-auto px-4">
          <SectionHeading
            id="how-it-works-heading"
            title="How it works"
            subtitle="Three simple steps to a cleaner space."
            centered
          />
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="overflow-hidden rounded-xl bg-brand-surface shadow-sm"
              >
                <div className="relative aspect-[3/2] w-full">
                  <Image
                    src={step.image.src}
                    alt={step.image.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <span className="text-4xl font-bold text-brand-accent">{step.number}</span>
                  <h3 className="mt-3 text-xl font-bold text-brand-primary">{step.title}</h3>
                  <p className="mt-2 text-brand-text/80">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Before-and-after gallery */}
      <section className="py-16 md:py-24" aria-labelledby="gallery-heading">
        <div className="container mx-auto px-4">
          <SectionHeading
            id="gallery-heading"
            title="Before & after"
            subtitle="Real transformations start with a single call."
            centered
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hasGalleryItems
              ? galleryItems.map((item) => (
                  <GalleryImage
                    key={item.id}
                    src={
                      item.assetKey ? `/api/assets/${item.assetKey}` : galleryPairs[0].before.src
                    }
                    alt={item.title ?? "Gallery photo"}
                    caption={item.title}
                  />
                ))
              : galleryPairs
                  .slice(0, 6)
                  .flatMap((pair, i) => [
                    <GalleryImage
                      key={`before-${i}`}
                      src={pair.before.src}
                      alt={pair.before.alt}
                      caption={pair.before.caption}
                    />,
                    <GalleryImage
                      key={`after-${i}`}
                      src={pair.after.src}
                      alt={pair.after.alt}
                      caption={pair.after.caption}
                    />,
                  ])}
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="outline">
              <Link href="/gallery">View full gallery</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 6. Pricing explanation */}
      <section
        className="bg-brand-primary py-16 text-brand-background md:py-24"
        aria-labelledby="pricing-heading"
      >
        <div className="container mx-auto px-4">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionHeading
                id="pricing-heading"
                title="Honest, upfront pricing"
                subtitle="Every job is different. We base estimates on what you actually need removed, not flat-rate guesses."
                level="h2"
              />
              <div className="mt-6">
                <p className="text-brand-background/80">
                  Send photos through our quote form and we will reply quickly with an estimate.
                  There is no obligation until you approve the work.
                </p>
                <div className="mt-6">
                  <Button asChild>
                    <Link href="/quote">Send photos for a fast estimate</Link>
                  </Button>
                </div>
              </div>
            </div>
            <PricingFactors />
          </div>
        </div>
      </section>

      {/* 7. Why Tomei */}
      <section className="py-16 md:py-24" aria-labelledby="why-heading">
        <div className="container mx-auto px-4">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl lg:aspect-square">
              <Image
                src={teamImage.src}
                alt={teamImage.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div>
              <SectionHeading
                id="why-heading"
                title="Why choose Tomei Haul Away"
                subtitle="Practical differences you will notice from the first call."
                level="h2"
              />
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {WHY_ITEMS.map((item) => (
                  <div key={item.title} className="rounded-xl bg-brand-surface p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-brand-primary">{item.title}</h3>
                    <p className="mt-2 text-brand-text/80">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Service area */}
      <section
        className="bg-brand-background py-16 md:py-24"
        aria-labelledby="service-area-heading"
      >
        <div className="container mx-auto px-4">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
              <Image
                src={serviceAreaImage.src}
                alt={serviceAreaImage.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div>
              <SectionHeading
                id="service-area-heading"
                title={`Serving ${SERVICE_AREA.cities[0]} and surrounding communities`}
                subtitle={`We work within roughly ${SERVICE_AREA.radiusMiles} miles of ${SERVICE_AREA.cities[0]}, Massachusetts.`}
                level="h2"
              />
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-brand-primary">Cities</h3>
                <p className="mt-1 text-brand-text/90">{SERVICE_AREA.cities.join(", ")}</p>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-brand-primary">ZIP codes</h3>
                <p className="mt-1 text-sm text-brand-text/90">{SERVICE_AREA.zips.join(", ")}</p>
              </div>
              <div className="mt-6">
                <Button asChild variant="outline">
                  <Link href="/service-areas">View service areas</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Testimonials */}
      <TestimonialsSection />

      {/* 10. FAQ */}
      <section className="py-16 md:py-24" aria-labelledby="faq-heading">
        <div className="container mx-auto px-4">
          <SectionHeading id="faq-heading" title="Frequently asked questions" centered />
          {faqs.length > 0 ? (
            <div className="mx-auto mt-10 max-w-3xl divide-y divide-brand-border rounded-xl bg-brand-surface shadow-sm">
              {faqs.map((faq) => (
                <details key={faq.id} className="group p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-brand-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2">
                    {faq.question}
                    <span
                      className="ml-4 text-brand-accent transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    >
                      ▼
                    </span>
                  </summary>
                  <p className="mt-3 text-brand-text/90">{faq.answer}</p>
                </details>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-center text-brand-text/70">
              No FAQs available yet. Call or text us with your questions.
            </p>
          )}
          <div className="mt-10 text-center">
            <Button asChild variant="outline">
              <Link href="/faq">View all FAQs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 11. Final CTA */}
      <section
        className="relative overflow-hidden py-16 md:py-24"
        aria-labelledby="final-cta-heading"
      >
        <div className="absolute inset-0">
          <Image
            src={finalCtaImage.src}
            alt={finalCtaImage.alt}
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-brand-primary/80" />
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h2
            id="final-cta-heading"
            className="text-3xl font-bold text-brand-background md:text-4xl"
          >
            Ready to get your space back?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-background/90">
            Request a free, no-obligation quote today. We will respond quickly and schedule around
            your availability.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild variant="secondary" size="lg">
              <Link href="/quote">Get a Free Quote</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href={`tel:${PHONE}`}>Call {formatPhone(PHONE)}</a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { COMPANY_NAME, PHONE, SERVICE_AREA, formatPhone } from "@/lib/business/config";
import { getActiveFaqs } from "@/lib/public/data";
import { heroImage, garageBeforeImage, garageAfterImage, finalCtaImage } from "@/lib/public/images";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/public/SectionHeading";
import { TrustRow } from "@/components/public/TrustRow";
import { ServiceCard } from "@/components/public/ServiceCard";
import { FaqStructuredData } from "@/components/public/FaqStructuredData";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Junk Removal & Cleanouts",
  description: `${COMPANY_NAME} provides reliable junk removal, furniture removal, appliance pickup, cleanouts, and yard debris hauling in the San Diego, CA area.`,
  alternates: {
    canonical: `${appUrl}/`,
  },
  openGraph: {
    title: `${COMPANY_NAME} | Junk Removal & Cleanouts`,
    description: "Reliable junk removal and cleanout services in the San Diego, CA area.",
    url: `${appUrl}/`,
    type: "website",
  },
};

const HOME_SERVICES = [
  {
    slug: "furniture-removal",
    title: "Furniture Removal",
    shortDescription: "Couches, mattresses, dressers, and more — we carry it out carefully.",
  },
  {
    slug: "appliance-removal",
    title: "Appliance Removal",
    shortDescription: "Refrigerators, washers, dryers, and ovens hauled away safely.",
  },
  {
    slug: "garage-home-cleanouts",
    title: "Home & Garage Cleanouts",
    shortDescription: "Reclaim your garage, basement, or attic — we handle the whole cleanout.",
  },
  {
    slug: "yard-debris",
    title: "Yard Debris",
    shortDescription: "Branches, brush, and storm debris hauled off your property.",
  },
  {
    slug: "construction-renovation-debris",
    title: "Renovation Debris",
    shortDescription: "Drywall, lumber, and remodel leftovers off your job site.",
  },
  {
    slug: "estate-cleanouts",
    title: "Commercial & Estate Cleanouts",
    shortDescription: "Respectful, efficient cleanouts for estates, offices, and rentals.",
  },
];

const STEPS = [
  {
    title: "Show us what needs to go",
    description:
      "Fill out the quick quote form with a few details or photos — or just call or text us.",
  },
  {
    title: "Choose a pickup window",
    description:
      "We reply with an upfront estimate and schedule a time that works for you, often within days.",
  },
  {
    title: "We load, haul, and clean up",
    description:
      "Our crew does all the lifting, sweeps up when we are done, and disposes of everything responsibly.",
  },
];

const WHY_ITEMS = [
  {
    title: "Clear communication",
    description:
      "You get a real answer fast — a straightforward estimate and a confirmed arrival window.",
  },
  {
    title: "Respect for your property",
    description: "We protect floors and doorways, work neatly, and leave the space broom-clean.",
  },
  {
    title: "Careful loading and cleanup",
    description:
      "Every item is loaded safely and routed to donation, recycling, or disposal — never dumped.",
  },
];

const FAQ_COUNT = 5;

export default async function HomePage() {
  const faqs = await getActiveFaqs();
  const homeFaqs = faqs.slice(0, FAQ_COUNT);
  const mainCities = SERVICE_AREA.cities.slice(0, 6);

  return (
    <>
      <FaqStructuredData
        items={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))}
      />

      {/* 1. Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-navy-950/60" />
        </div>
        <div className="container relative z-10 mx-auto flex min-h-[70vh] flex-col justify-center px-4 py-24 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              Make Room for What&apos;s Next.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/90">
              {COMPANY_NAME} removes junk, furniture, appliances, and debris from homes and
              businesses across the San Diego area — you point, we haul.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/quote">Get a Free Quote</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <a href={`tel:${PHONE}`}>Call {formatPhone(PHONE)}</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trust strip */}
      <TrustRow />

      {/* 3. Services */}
      <section className="py-16 md:py-24" aria-labelledby="services-heading">
        <div className="container mx-auto px-4">
          <SectionHeading
            id="services-heading"
            title="What we haul"
            subtitle="Six services, one call. If it needs to go, we can probably take it."
            centered
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {HOME_SERVICES.map((service) => (
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
        className="bg-brand-primary py-16 text-brand-background md:py-24"
        aria-labelledby="how-it-works-heading"
      >
        <div className="container mx-auto px-4">
          <SectionHeading
            id="how-it-works-heading"
            title="How it works"
            subtitle="Three steps and your space is clear."
            centered
          />
          <div className="mx-auto mt-12 grid max-w-4xl gap-10 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.title} className="text-center">
                <span className="text-4xl font-bold text-brand-accent">{index + 1}</span>
                <h3 className="mt-3 text-xl font-bold text-brand-background">{step.title}</h3>
                <p className="mt-2 text-brand-background/80">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button asChild variant="secondary" size="lg">
              <Link href="/quote">Start with a free quote</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 5. Before & after */}
      <section className="py-16 md:py-24" aria-labelledby="before-after-heading">
        <div className="container mx-auto px-4">
          <SectionHeading
            id="before-after-heading"
            title="Real results"
            subtitle="A recent garage cleanout — from packed to pristine in one visit."
            centered
          />
          <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
            <figure>
              <div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl">
                <Image
                  src={garageBeforeImage.src}
                  alt={garageBeforeImage.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                />
                <figcaption className="absolute left-3 top-3 rounded-md bg-navy-950/80 px-3 py-1 text-sm font-semibold uppercase tracking-wide text-white">
                  Before
                </figcaption>
              </div>
            </figure>
            <figure>
              <div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl">
                <Image
                  src={garageAfterImage.src}
                  alt={garageAfterImage.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                />
                <figcaption className="absolute left-3 top-3 rounded-md bg-brand-accent px-3 py-1 text-sm font-semibold uppercase tracking-wide text-brand-primary">
                  After
                </figcaption>
              </div>
            </figure>
          </div>
        </div>
      </section>

      {/* 6. Why Tomei */}
      <section className="bg-brand-background py-16 md:py-24" aria-labelledby="why-heading">
        <div className="container mx-auto px-4">
          <SectionHeading
            id="why-heading"
            title="Why homeowners call Tomei"
            subtitle="Three things you can count on every time."
            centered
          />
          <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-3">
            {WHY_ITEMS.map((item) => (
              <div key={item.title} className="border-t-4 border-brand-accent pt-5">
                <h3 className="text-xl font-bold text-brand-primary">{item.title}</h3>
                <p className="mt-2 text-brand-text/80">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Service area */}
      <section className="py-16 md:py-24" aria-labelledby="service-area-heading">
        <div className="container mx-auto px-4 text-center">
          <SectionHeading
            id="service-area-heading"
            title={`Local to ${SERVICE_AREA.cities[0]} and nearby towns`}
            subtitle={`We work within roughly ${SERVICE_AREA.radiusMiles} miles of ${SERVICE_AREA.cities[0]}, California — including ${mainCities.join(", ")}, and more.`}
            centered
          />
          <div className="mt-8">
            <Button asChild variant="outline">
              <Link href="/service-areas">See all service areas</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 8. FAQs */}
      <section className="bg-brand-background py-16 md:py-24" aria-labelledby="faq-heading">
        <div className="container mx-auto px-4">
          <SectionHeading id="faq-heading" title="Common questions" centered />
          {homeFaqs.length > 0 ? (
            <div className="mx-auto mt-10 max-w-3xl divide-y divide-brand-border rounded-xl bg-brand-surface shadow-sm">
              {homeFaqs.map((faq) => (
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

      {/* 9. Final CTA */}
      <section
        className="relative overflow-hidden py-20 md:py-28"
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
          <div className="absolute inset-0 bg-navy-950/60" />
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h2 id="final-cta-heading" className="text-3xl font-bold text-white md:text-4xl">
            Ready to get your space back?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            Get a free, no-obligation quote in minutes. We respond fast and schedule around you.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/quote">Get a Free Quote</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a href={`tel:${PHONE}`}>Call {formatPhone(PHONE)}</a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

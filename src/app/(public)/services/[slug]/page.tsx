import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SERVICES, getServiceBySlug, COMPANY_NAME } from "@/lib/business/config";
import { Button } from "@/components/ui/Button";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

interface ServiceDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return SERVICES.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) {
    return {
      title: "Service Not Found",
    };
  }
  return {
    title: service.title,
    description: service.shortDescription,
    alternates: {
      canonical: `${appUrl}/services/${service.slug}`,
    },
    openGraph: {
      title: `${service.title} | ${COMPANY_NAME}`,
      description: service.shortDescription,
      url: `${appUrl}/services/${service.slug}`,
      type: "article",
    },
  };
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) {
    notFound();
  }

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description,
    provider: {
      "@type": "MovingCompany",
      name: COMPANY_NAME,
    },
    areaServed: {
      "@type": "City",
      name: "Haverhill, MA",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/services"
            className="text-sm font-semibold text-navy hover:text-orange hover:underline"
          >
            ← All services
          </Link>
          <h1 className="mt-4 text-4xl font-bold text-navy md:text-5xl">{service.title}</h1>
          <p className="mt-4 text-xl text-charcoal-700">{service.shortDescription}</p>

          <div className="relative mt-8 aspect-[3/2] w-full overflow-hidden rounded-xl bg-cream-100">
            <Image
              src="/placeholders/service.svg"
              alt={`${service.title} photo placeholder — replace with real service photo`}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover"
            />
          </div>

          <div className="mt-8 space-y-4 text-charcoal-700">
            {service.description.split("\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href={`/quote?service=${service.slug}`}>Request a quote</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/services">View other services</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SERVICES, getServiceBySlug, COMPANY_NAME } from "@/lib/business/config";
import { getServiceImage } from "@/lib/public/images";
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

  const image = getServiceImage(slug);

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
      name: "San Diego, CA",
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
            className="text-sm font-semibold text-brand-primary hover:text-brand-accent hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
          >
            ← All services
          </Link>
          <h1 className="mt-4 text-4xl font-bold text-brand-primary md:text-5xl">
            {service.title}
          </h1>
          <p className="mt-4 text-xl text-brand-text/90">{service.shortDescription}</p>

          <div className="relative mt-8 aspect-[3/2] w-full overflow-hidden rounded-xl bg-brand-background">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover"
            />
          </div>

          <div className="mt-8 space-y-4 text-brand-text/90">
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

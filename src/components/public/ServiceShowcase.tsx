"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { getServiceImage } from "@/lib/public/images";

export interface ShowcaseService {
  slug: string;
  title: string;
  shortDescription: string;
  category: "Home" | "Property" | "Business";
}

const CATEGORIES = ["Home", "Property", "Business"] as const;

export function ServiceShowcase({ services }: { services: ShowcaseService[] }) {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Home");
  const visibleServices = services.filter((service) => service.category === category);

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-brand-border pb-4" role="tablist" aria-label="Service categories">
        {CATEGORIES.map((item) => {
          const active = item === category;
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCategory(item)}
              className={`min-h-11 rounded-md px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent ${
                active
                  ? "bg-brand-primary text-white"
                  : "text-brand-primary hover:bg-brand-surface hover:text-brand-accent"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
      <div
        className="mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-color:var(--brand-primary)_transparent]"
        role="tabpanel"
        aria-label={`${category} services`}
      >
        {visibleServices.map((service) => {
          const image = getServiceImage(service.slug);
          return (
            <article
              key={service.slug}
              className="flex w-[min(82vw,22rem)] shrink-0 snap-start flex-col overflow-hidden rounded-lg border border-brand-border bg-brand-surface shadow-sm"
            >
              <div className="relative aspect-[3/2] w-full bg-brand-background">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 768px) 82vw, 352px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-xl font-bold text-brand-primary">{service.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-brand-text/80">
                  {service.shortDescription}
                </p>
                <Link
                  href={`/services/${service.slug}`}
                  className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-brand-primary underline decoration-brand-accent decoration-2 underline-offset-4 hover:text-brand-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                >
                  Learn about {service.title.toLowerCase()}
                </Link>
              </div>
            </article>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between gap-4">
        <p className="text-sm text-brand-muted">Swipe or scroll to explore {category.toLowerCase()} services.</p>
        <Link href="/services" className="shrink-0 text-sm font-semibold text-brand-primary underline decoration-brand-accent underline-offset-4 hover:text-brand-accent">
          All services
        </Link>
      </div>
    </div>
  );
}

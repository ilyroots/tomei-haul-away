"use client";

import { useState } from "react";
import { StarRating } from "@/components/public/StarRating";

interface TestimonialItem {
  id: string;
  authorName: string;
  content: string;
  location: string | null;
  rating: number | null;
}

export function TestimonialsCarousel({ testimonials }: { testimonials: TestimonialItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = testimonials[activeIndex];

  if (!active) return null;

  const goTo = (nextIndex: number) => {
    setActiveIndex((nextIndex + testimonials.length) % testimonials.length);
  };

  return (
    <div className="mx-auto mt-8 max-w-3xl">
      <div
        className="border-y border-brand-border bg-brand-surface px-5 py-6 md:px-10 md:py-8"
        aria-live="polite"
      >
        {active.rating && <StarRating rating={active.rating} size="sm" />}
        <blockquote className="mt-4 text-lg leading-8 text-brand-text md:text-xl">
          “{active.content}”
        </blockquote>
        <footer className="mt-5 text-sm">
          <p className="font-semibold text-brand-primary">{active.authorName}</p>
          {active.location && <p className="text-brand-muted">{active.location}</p>}
        </footer>
      </div>
      {testimonials.length > 1 && (
        <div className="mt-5 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            className="min-h-11 rounded-md border border-brand-border px-4 text-sm font-semibold text-brand-primary hover:border-brand-primary hover:bg-brand-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            aria-label="Previous review"
          >
            Previous
          </button>
          <p className="text-sm text-brand-muted" aria-label={`Review ${activeIndex + 1} of ${testimonials.length}`}>
            {activeIndex + 1} of {testimonials.length}
          </p>
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            className="min-h-11 rounded-md border border-brand-border px-4 text-sm font-semibold text-brand-primary hover:border-brand-primary hover:bg-brand-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            aria-label="Next review"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

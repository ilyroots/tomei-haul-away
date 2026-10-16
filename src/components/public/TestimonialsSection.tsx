import Link from "next/link";
import { getApprovedTestimonials, getReviewStats } from "@/lib/public/data";
import { StarRating } from "@/components/public/StarRating";
import { SectionHeading } from "@/components/public/SectionHeading";
import { Button } from "@/components/ui/Button";
import { TestimonialsCarousel } from "@/components/public/TestimonialsCarousel";

export async function TestimonialsSection() {
  const [testimonials, stats] = await Promise.all([getApprovedTestimonials(3), getReviewStats()]);

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="bg-brand-background py-12 md:py-16" aria-labelledby="testimonials-heading">
      <div className="container mx-auto px-4">
        <SectionHeading id="testimonials-heading" title="What customers say" centered />
        {stats.total > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <StarRating rating={stats.average} />
            <p className="text-lg font-semibold text-brand-primary">
              {stats.average.toFixed(1)} out of 5
            </p>
            <p className="text-brand-muted">
              · based on {stats.total} {stats.total === 1 ? "review" : "reviews"}
            </p>
          </div>
        )}
        <TestimonialsCarousel testimonials={testimonials} />
        <div className="mt-10 text-center">
          <Button asChild variant="outline">
            <Link href="/reviews">Read all reviews</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

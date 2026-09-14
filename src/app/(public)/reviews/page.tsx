import Link from "next/link";
import { Metadata } from "next";
import { COMPANY_NAME } from "@/lib/business/config";
import { getApprovedTestimonials, getReviewStats } from "@/lib/public/data";
import { SectionHeading } from "@/components/public/SectionHeading";
import { StarRating } from "@/components/public/StarRating";
import { Button } from "@/components/ui/Button";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Reviews",
  description: `Read reviews from ${COMPANY_NAME} customers across the San Diego, CA area — junk removal, cleanouts, and hauling done right.`,
  alternates: {
    canonical: `${appUrl}/reviews`,
  },
  openGraph: {
    title: `Reviews | ${COMPANY_NAME}`,
    description: "What customers say about our junk removal and cleanout services.",
    url: `${appUrl}/reviews`,
    type: "website",
  },
};

const DISTRIBUTION_ROWS = [
  { label: "Excellent", stars: 5 },
  { label: "Great", stars: 4 },
  { label: "Average", stars: 3 },
  { label: "Poor", stars: 2 },
  { label: "Bad", stars: 1 },
] as const;

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

function splitLead(content: string): { title: string; body: string } {
  const match = content.match(/^(.+?[.!?])\s+([\s\S]+)$/);
  if (!match) {
    return { title: "", body: content };
  }
  return { title: match[1], body: match[2] };
}

function VerifiedPill() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-brand-border px-2 py-0.5 text-xs font-semibold text-brand-muted">
      <svg
        className="h-3 w-3 text-[#00b67a]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
      Verified
    </span>
  );
}

export default async function ReviewsPage() {
  const [stats, testimonials] = await Promise.all([getReviewStats(), getApprovedTestimonials()]);

  if (stats.total === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <SectionHeading
          title="Customer reviews"
          subtitle="We are just getting started — check back soon to see what our customers say."
          centered
        />
        <div className="mt-10">
          <Button asChild>
            <Link href="/quote">Get a Free Quote</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Summary header */}
      <section className="bg-brand-background py-16" aria-labelledby="reviews-heading">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl rounded-xl bg-brand-surface p-8 shadow-sm md:p-10">
            <div className="grid gap-10 md:grid-cols-2">
              <div className="text-center md:text-left">
                <h1
                  id="reviews-heading"
                  className="font-headline text-3xl font-bold text-brand-primary md:text-4xl"
                >
                  {COMPANY_NAME} reviews
                </h1>
                <p className="mt-6 font-headline text-6xl font-bold text-brand-primary">
                  {stats.average.toFixed(1)}
                </p>
                <div className="mt-3 flex justify-center md:justify-start">
                  <StarRating rating={stats.average} size="lg" />
                </div>
                <p className="mt-3 text-brand-text/80">
                  Based on {stats.total} {stats.total === 1 ? "review" : "reviews"}
                </p>
              </div>
              <ul className="flex flex-col justify-center gap-3">
                {DISTRIBUTION_ROWS.map(({ label, stars }) => {
                  const count = stats.distribution[stars];
                  const width = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <li key={label} className="flex items-center gap-3">
                      <span className="w-20 shrink-0 text-sm font-semibold text-brand-text">
                        {label}
                      </span>
                      <StarRating rating={stars} size="sm" />
                      <span
                        className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#f1f1e8]"
                        aria-hidden="true"
                      >
                        <span
                          className="block h-full rounded-full bg-[#00b67a]"
                          style={{ width: `${width}%` }}
                        />
                      </span>
                      <span className="w-8 shrink-0 text-right text-sm text-brand-muted">
                        {count}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Review cards */}
      <section className="py-16" aria-label="Customer reviews">
        <div className="container mx-auto px-4">
          <ul className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => {
              const { title, body } = splitLead(testimonial.content);
              return (
                <li key={testimonial.id}>
                  <article className="flex h-full flex-col rounded-xl bg-brand-surface p-6 shadow-sm">
                    {testimonial.rating && <StarRating rating={testimonial.rating} size="sm" />}
                    {title ? (
                      <p className="mt-3 font-bold text-brand-primary">{title}</p>
                    ) : null}
                    <p
                      className={
                        title ? "mt-2 flex-1 text-brand-text/90" : "mt-3 flex-1 text-brand-text/90"
                      }
                    >
                      {body}
                    </p>
                    <footer className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-brand-border pt-4 text-sm text-brand-muted">
                      <span className="font-semibold text-brand-primary">
                        {testimonial.authorName}
                      </span>
                      {testimonial.location && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{testimonial.location}</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <VerifiedPill />
                      <span aria-hidden="true">·</span>
                      <time dateTime={testimonial.submittedAt.toISOString()}>
                        {DATE_FORMATTER.format(testimonial.submittedAt)}
                      </time>
                    </footer>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-brand-primary py-16 text-brand-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-headline text-3xl font-bold md:text-4xl">
            Had a great experience with us?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-brand-background/80">
            We would love to help with your next cleanout. Get a free, no-obligation quote in
            minutes.
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/quote">Get a Free Quote</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

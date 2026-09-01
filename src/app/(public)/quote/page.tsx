import { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { QuoteForm } from "@/components/quote/QuoteForm";
import { getQuoteSubmissionToken } from "./actions";
import { quoteImage } from "@/lib/public/images";

export const metadata: Metadata = {
  title: "Request a Quote",
  description: "Get a free quote for junk removal, cleanouts, and specialty hauling.",
};

export default async function QuotePage() {
  const submissionToken = await getQuoteSubmissionToken();
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-brand-primary">Request a Free Quote</h1>
        <p className="mt-2 text-lg text-brand-text/80">
          Tell us about your job and we will get back to you quickly.
        </p>
      </div>
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-5 lg:items-start">
        <div className="lg:col-span-3">
          <Suspense
            fallback={<div className="text-center text-brand-text/80">Loading form...</div>}
          >
            <QuoteForm submissionToken={submissionToken} turnstileSiteKey={turnstileSiteKey} />
          </Suspense>
        </div>
        <div className="relative hidden aspect-[3/4] w-full overflow-hidden rounded-xl lg:col-span-2 lg:block">
          <Image
            src={quoteImage.src}
            alt={quoteImage.alt}
            fill
            sizes="40vw"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}

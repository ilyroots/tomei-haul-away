import { Metadata } from "next";
import { Suspense } from "react";
import { QuoteForm } from "@/components/quote/QuoteForm";
import { getQuoteSubmissionToken } from "./actions";

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
        <h1 className="text-4xl font-bold text-navy">Request a Free Quote</h1>
        <p className="mt-2 text-lg text-charcoal-600">
          Tell us about your job and we will get back to you quickly.
        </p>
      </div>
      <Suspense fallback={<div className="text-center text-charcoal-600">Loading form...</div>}>
        <QuoteForm submissionToken={submissionToken} turnstileSiteKey={turnstileSiteKey} />
      </Suspense>
    </div>
  );
}

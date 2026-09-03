import { Metadata } from "next";
import { QuoteForm } from "@/components/quote/QuoteForm";
import { getQuoteSubmissionToken } from "./actions";

export const metadata: Metadata = {
  title: "Request a Quote",
  description: "Get a free quote for junk removal, cleanouts, and specialty hauling.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export default async function QuotePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const submissionToken = await getQuoteSubmissionToken();
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-brand-primary">Request a Free Quote</h1>
        <p className="mt-2 text-lg text-brand-text/80">
          Two quick steps — tell us about the job and how to reach you. We respond fast.
        </p>
      </div>
      <QuoteForm
        submissionToken={submissionToken}
        turnstileSiteKey={turnstileSiteKey}
        initialService={firstParam(params.service)}
        initialZip={firstParam(params.zip)}
      />
    </div>
  );
}

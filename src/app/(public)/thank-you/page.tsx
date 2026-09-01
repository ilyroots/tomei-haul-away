import { Metadata } from "next";
import Link from "next/link";
import { PHONE, TEXT_NUMBER, EMAIL, formatPhone } from "@/lib/business/config";

export const metadata: Metadata = {
  title: "Thank You",
  description: "Your request has been submitted.",
};

interface ThankYouPageProps {
  searchParams: Promise<{ ref?: string; scheduled?: string }>;
}

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const { ref, scheduled } = await searchParams;

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl rounded-xl bg-brand-surface p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-accent/20 text-brand-accent">
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-brand-primary">Thank You!</h1>
        <p className="mt-3 text-lg text-brand-text/80">
          Your {scheduled ? "appointment request" : "quote request"} has been submitted.
        </p>

        {ref && (
          <div className="mt-6 rounded-lg bg-brand-background p-4">
            <p className="text-sm font-medium text-brand-muted">Your reference number</p>
            <p className="text-2xl font-bold tracking-wide text-brand-primary">{ref}</p>
            <p className="mt-1 text-xs text-brand-muted">
              Save this for your records. We will use it in all follow-ups.
            </p>
          </div>
        )}

        <div className="mt-8 space-y-3 text-left">
          <h2 className="text-center text-lg font-semibold text-brand-primary">
            What happens next?
          </h2>
          <ul className="mx-auto max-w-md list-inside list-disc space-y-2 text-brand-text/90">
            <li>We will review the details you submitted.</li>
            <li>
              {scheduled
                ? "We will contact you to confirm your requested appointment time."
                : "We will contact you with questions or an estimate."}
            </li>
            <li>You can reference {ref ? ref : "your request"} when you call or text us.</li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href={`tel:${PHONE}`} className="btn-primary">
            Call {formatPhone(PHONE)}
          </a>
          <a href={`sms:${TEXT_NUMBER}`} className="btn-secondary">
            Text Us
          </a>
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex items-center justify-center rounded-md px-6 py-3 font-semibold text-brand-primary transition-colors hover:bg-brand-primary/10 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
          >
            Email Us
          </a>
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="text-sm font-semibold text-brand-primary hover:text-brand-accent hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
          >
            Return to home page
          </Link>
        </div>
      </div>
    </div>
  );
}

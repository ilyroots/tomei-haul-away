import { Metadata } from "next";
import Image from "next/image";
import { COMPANY_NAME, PHONE, formatPhone } from "@/lib/business/config";
import { SectionHeading } from "@/components/public/SectionHeading";
import { ContactInfo } from "@/components/public/ContactInfo";
import { ContactForm } from "@/components/public/ContactForm";
import { contactImage } from "@/lib/public/images";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${COMPANY_NAME} by phone, text, email, or our simple contact form.`,
  alternates: {
    canonical: `${appUrl}/contact`,
  },
  openGraph: {
    title: `Contact | ${COMPANY_NAME}`,
    description: `Reach ${COMPANY_NAME} by phone, text, or email.`,
    url: `${appUrl}/contact`,
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <SectionHeading
        title="Contact us"
        subtitle={`Reach ${COMPANY_NAME} by phone, text, email, or the form below.`}
        centered
      />

      <div className="mx-auto mt-10 grid max-w-5xl gap-10 lg:grid-cols-2">
        <div className="rounded-xl bg-brand-surface p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-bold text-brand-primary">Send a message</h2>
          <p className="mt-2 text-sm text-brand-text/80">
            This form opens your email app with a pre-filled message. We do not store submissions on
            the server.
          </p>
          <ContactForm />
        </div>

        <div className="space-y-6">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
            <Image
              src={contactImage.src}
              alt={contactImage.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="rounded-xl bg-brand-background p-6 md:p-8">
            <ContactInfo />
            <div className="mt-6">
              <a
                href={`tel:${PHONE}`}
                className="inline-flex w-full items-center justify-center rounded-md bg-brand-accent px-6 py-3 text-center font-semibold text-brand-primary transition-colors hover:bg-brand-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
              >
                Call {formatPhone(PHONE)}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

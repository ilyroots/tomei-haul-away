import { Metadata } from "next";
import { COMPANY_NAME, PHONE, formatPhone } from "@/lib/business/config";
import { SectionHeading } from "@/components/public/SectionHeading";
import { ContactInfo } from "@/components/public/ContactInfo";
import { ContactForm } from "@/components/public/ContactForm";

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
        <div className="rounded-xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-bold text-navy">Send a message</h2>
          <p className="mt-2 text-sm text-charcoal-600">
            This form opens your email app with a pre-filled message. We do not store submissions on
            the server.
          </p>
          <ContactForm />
        </div>

        <div className="rounded-xl bg-cream-100 p-6 md:p-8">
          <ContactInfo />
          <div className="mt-6">
            <a
              href={`tel:${PHONE}`}
              className="inline-flex w-full items-center justify-center rounded-md bg-orange px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-orange-700"
            >
              Call {formatPhone(PHONE)}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Metadata } from "next";
import { COMPANY_NAME, EMAIL } from "@/lib/business/config";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of service for ${COMPANY_NAME}.`,
  alternates: {
    canonical: `${appUrl}/terms`,
  },
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold text-navy">Terms of Service</h1>
        <p className="mt-2 text-charcoal-600">
          Last updated: {new Date().toLocaleDateString("en-US")}
        </p>

        <div className="mt-8 space-y-6 text-charcoal-700">
          <section>
            <h2 className="text-xl font-bold text-navy">Agreement to terms</h2>
            <p className="mt-2">
              By using this website and requesting services from {COMPANY_NAME}, you agree to these
              terms. If you do not agree, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy">Services</h2>
            <p className="mt-2">
              We provide junk removal, cleanout, and related hauling services. All estimates are
              subject to on-site review and final approval before work begins.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy">Quotes and pricing</h2>
            <p className="mt-2">
              Online and phone estimates are based on the information you provide. Final pricing may
              change after an in-person assessment of volume, access, item type, and other job-site
              conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy">Appointments</h2>
            <p className="mt-2">
              Appointment requests submitted through our website are not confirmed until we contact
              you. We reserve the right to reschedule due to weather, availability, or unsafe
              conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy">Prohibited items</h2>
            <p className="mt-2">
              We do not remove hazardous materials, chemicals, explosives, or items that are illegal
              to transport or dispose of. Please ask us if you are unsure about a specific item.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy">Limitation of liability</h2>
            <p className="mt-2">
              {COMPANY_NAME} is not liable for indirect, incidental, or consequential damages
              arising from our services beyond the amount paid for the specific service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy">Changes to terms</h2>
            <p className="mt-2">
              We may update these terms from time to time. Continued use of our website and services
              after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy">Contact us</h2>
            <p className="mt-2">
              Questions about these terms? Contact us at{" "}
              <a href={`mailto:${EMAIL}`} className="text-navy hover:text-orange hover:underline">
                {EMAIL}
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

import { Metadata } from "next";
import { COMPANY_NAME, EMAIL } from "@/lib/business/config";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for ${COMPANY_NAME}.`,
  alternates: {
    canonical: `${appUrl}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold text-navy">Privacy Policy</h1>
        <p className="mt-2 text-charcoal-600">
          Last updated: {new Date().toLocaleDateString("en-US")}
        </p>

        <div className="mt-8 space-y-6 text-charcoal-700">
          <section>
            <h2 className="text-xl font-bold text-navy">Introduction</h2>
            <p className="mt-2">
              {COMPANY_NAME} respects your privacy. This policy explains what information we
              collect, how we use it, and how we protect it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy">Information we collect</h2>
            <p className="mt-2">
              We collect information you provide when requesting a quote or scheduling service, such
              as your name, address, phone number, email, photos of items, and job details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy">How we use your information</h2>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>To respond to your quote or scheduling request</li>
              <li>To provide and coordinate junk removal services</li>
              <li>To communicate with you about your appointment</li>
              <li>To send occasional updates if you opt in to marketing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy">Sharing your information</h2>
            <p className="mt-2">
              We do not sell your personal information. We may share information with service
              providers who help us operate our business, such as email or hosting services, under
              confidentiality obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy">Data security</h2>
            <p className="mt-2">
              We use reasonable administrative, technical, and physical safeguards to protect your
              information. No method of transmission over the internet is completely secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy">Your choices</h2>
            <p className="mt-2">
              You may opt out of marketing communications at any time by contacting us. You may also
              request that we update or delete your personal information, subject to legal or
              operational requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy">Contact us</h2>
            <p className="mt-2">
              If you have questions about this privacy policy, contact us at{" "}
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

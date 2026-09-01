import { Metadata } from "next";
import { COMPANY_NAME } from "@/lib/business/config";
import { getActiveFaqs } from "@/lib/public/data";
import { SectionHeading } from "@/components/public/SectionHeading";
import { FaqStructuredData } from "@/components/public/FaqStructuredData";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "FAQ",
  description: `Frequently asked questions about junk removal, pricing, and scheduling with ${COMPANY_NAME}.`,
  alternates: {
    canonical: `${appUrl}/faq`,
  },
  openGraph: {
    title: `FAQ | ${COMPANY_NAME}`,
    description: "Answers to common junk removal questions.",
    url: `${appUrl}/faq`,
    type: "website",
  },
};

export default async function FaqPage() {
  const faqs = await getActiveFaqs();

  return (
    <>
      <FaqStructuredData
        items={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))}
      />
      <div className="container mx-auto px-4 py-16">
        <SectionHeading
          title="Frequently asked questions"
          subtitle="Answers to common questions about our junk removal and cleanout services."
          centered
        />

        {faqs.length > 0 ? (
          <div className="mx-auto mt-10 max-w-3xl divide-y divide-charcoal-200 rounded-xl bg-white shadow-sm">
            {faqs.map((faq) => (
              <details key={faq.id} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2">
                  {faq.question}
                  <span
                    className="ml-4 text-orange transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  >
                    ▼
                  </span>
                </summary>
                <p className="mt-3 text-charcoal-700">{faq.answer}</p>
              </details>
            ))}
          </div>
        ) : (
          <p className="mt-10 text-center text-charcoal-600">
            No FAQs available yet. Please call or text us with your questions.
          </p>
        )}
      </div>
    </>
  );
}

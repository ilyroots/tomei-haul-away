import { getFAQs } from "./actions";
import { FAQForm } from "./components/FAQForm";
import { ToggleActiveButton } from "./components/ToggleActiveButton";
import { DeleteButton } from "./components/DeleteButton";

export default async function FAQPage() {
  const faqs = await getFAQs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cream">FAQ</h1>
        <p className="mt-1 text-cream-200">Manage frequently asked questions.</p>
      </div>

      <section className="rounded-lg bg-navy p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-cream">Add FAQ</h2>
        <FAQForm />
      </section>

      <section className="rounded-lg bg-navy p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-cream">Questions</h2>
        {faqs.length === 0 ? (
          <p className="text-cream-200">No FAQs yet.</p>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="rounded-lg border border-charcoal-600 bg-charcoal-800 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-semibold text-cream">{faq.question}</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      faq.isActive
                        ? "bg-green-900 text-green-100"
                        : "bg-charcoal-600 text-cream-200"
                    }`}
                  >
                    {faq.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                {faq.category && <p className="mt-1 text-xs text-orange">{faq.category}</p>}
                <p className="mt-2 whitespace-pre-wrap text-cream-200">{faq.answer}</p>
                <p className="mt-2 text-xs text-cream-200">Sort order: {faq.sortOrder}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <FAQForm item={faq} />
                  <ToggleActiveButton id={faq.id} isActive={faq.isActive} />
                  <DeleteButton id={faq.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

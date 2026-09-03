import { getFAQs } from "./actions";
import { FAQForm } from "./components/FAQForm";
import { ToggleActiveButton } from "./components/ToggleActiveButton";
import { DeleteButton } from "./components/DeleteButton";

export default async function FAQPage() {
  const faqs = await getFAQs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-brand-background">FAQ</h1>
        <p className="mt-1 text-brand-background/80">Manage frequently asked questions.</p>
      </div>

      <section className="rounded-lg bg-brand-primary p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-brand-background">Add FAQ</h2>
        <FAQForm />
      </section>

      <section className="rounded-lg bg-brand-primary p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-brand-background">Questions</h2>
        {faqs.length === 0 ? (
          <p className="text-brand-background/80">No FAQs yet.</p>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="rounded-lg border border-brand-text/30 bg-brand-text/70 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-semibold text-brand-background">{faq.question}</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      faq.isActive
                        ? "bg-green-900 text-green-100"
                        : "bg-brand-text/80 text-brand-background/80"
                    }`}
                  >
                    {faq.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                {faq.category && <p className="mt-1 text-xs text-brand-accent">{faq.category}</p>}
                <p className="mt-2 whitespace-pre-wrap text-brand-background/80">{faq.answer}</p>
                <p className="mt-2 text-xs text-brand-background/80">Sort order: {faq.sortOrder}</p>
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

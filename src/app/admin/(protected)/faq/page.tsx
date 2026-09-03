import { getFAQs } from "./actions";
import { FAQForm } from "./components/FAQForm";
import { ToggleActiveButton } from "./components/ToggleActiveButton";
import { DeleteButton } from "./components/DeleteButton";

export default async function FAQPage() {
  const faqs = await getFAQs();

  return (
    <div>
      <div className="mb-6 lg:mb-8">
        <h1 className="font-headline text-2xl lg:text-3xl font-bold text-brand-primary">FAQ</h1>
        <p className="mt-1 text-sm text-brand-muted">Manage frequently asked questions.</p>
      </div>

      <div className="space-y-6">
        <section className="rounded-lg border border-brand-border bg-brand-surface p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Add FAQ</h2>
          <FAQForm />
        </section>

        <section className="rounded-lg border border-brand-border bg-brand-surface p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Questions</h2>
          {faqs.length === 0 ? (
            <p className="text-sm text-brand-muted">No FAQs yet.</p>
          ) : (
            <div>
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="border-b border-brand-border p-4 last:border-b-0 hover:bg-brand-background/60"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-semibold">{faq.question}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        faq.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-brand-background text-brand-muted"
                      }`}
                    >
                      {faq.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {faq.category && <p className="mt-1 text-xs text-brand-accent">{faq.category}</p>}
                  <p className="mt-2 whitespace-pre-wrap text-sm text-brand-muted">{faq.answer}</p>
                  <p className="mt-2 text-xs text-brand-muted">Sort order: {faq.sortOrder}</p>
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
    </div>
  );
}

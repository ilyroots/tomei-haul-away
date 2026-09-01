const TRUST_ITEMS = [
  {
    title: "Locally owned",
    description: "Serving the Haverhill area and neighboring communities.",
  },
  {
    title: "Upfront estimates",
    description:
      "No hidden fees. We review your details and explain the estimate before any work begins.",
  },
  {
    title: "Convenient scheduling",
    description: "Request a date online or by phone. We will confirm what works for you.",
  },
  {
    title: "Responsible disposal",
    description: "Usable items are routed to donation or recycling whenever possible.",
  },
];

export function TrustRow() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {TRUST_ITEMS.map((item) => (
        <div key={item.title} className="rounded-lg bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-navy">{item.title}</h3>
          <p className="mt-1 text-sm text-charcoal-600">{item.description}</p>
        </div>
      ))}
    </div>
  );
}

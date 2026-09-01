const FACTORS = [
  {
    title: "Volume of items",
    description: "Larger or heavier loads require more crew time and truck space.",
  },
  {
    title: "Item location",
    description: "Basements, attics, stairs, and long carries add time and labor.",
  },
  {
    title: "Item type",
    description: "Appliances, construction debris, and specialty items may need special handling.",
  },
  {
    title: "Scheduling",
    description:
      "Same-day or weekend requests may be priced differently depending on availability.",
  },
];

export function PricingFactors() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {FACTORS.map((factor) => (
        <div key={factor.title} className="rounded-lg bg-brand-surface p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-brand-primary">{factor.title}</h3>
          <p className="mt-1 text-brand-text/80">{factor.description}</p>
        </div>
      ))}
    </div>
  );
}

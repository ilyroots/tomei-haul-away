const TRUST_ITEMS = [
  "Locally Owned",
  "Upfront Estimates",
  "Flexible Scheduling",
  "Responsible Disposal",
];

export function TrustRow() {
  return (
    <div className="border-b border-brand-border bg-brand-surface">
      <div className="container mx-auto px-4 py-6">
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {TRUST_ITEMS.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 text-sm font-semibold text-brand-primary"
            >
              <svg
                className="h-4 w-4 shrink-0 text-brand-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

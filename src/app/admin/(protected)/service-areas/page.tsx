import { getServiceAreas } from "./actions";
import { ServiceAreaForm } from "./components/ServiceAreaForm";
import { ToggleActiveButton } from "./components/ToggleActiveButton";
import { DeleteButton } from "./components/DeleteButton";

export default async function ServiceAreasPage() {
  const areas = await getServiceAreas();

  return (
    <div>
      <div className="mb-6 lg:mb-8">
        <h1 className="font-headline text-2xl font-bold text-brand-primary lg:text-3xl">
          Service areas
        </h1>
        <p className="mt-1 text-sm text-brand-muted">
          Manage cities and ZIP codes in the service area.
        </p>
      </div>

      <section className="mb-6 rounded-lg border border-brand-border bg-brand-surface p-6 shadow-sm lg:mb-8">
        <h2 className="mb-4 text-xl font-bold text-brand-primary">Add service area</h2>
        <ServiceAreaForm />
      </section>

      <section className="rounded-lg border border-brand-border bg-brand-surface p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-brand-primary">Service areas</h2>
        {areas.length === 0 ? (
          <p className="text-sm text-brand-muted">No service areas yet.</p>
        ) : (
          <div className="space-y-4">
            {areas.map((area) => (
              <div
                key={area.id}
                className="rounded-lg border border-brand-border bg-brand-background/40 p-4 hover:bg-brand-background/60"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-brand-text">
                      {area.city}, CA {area.zip}
                    </h3>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      area.isActive
                        ? "bg-green-100 text-green-800"
                        : "border border-brand-border bg-brand-background text-brand-muted"
                    }`}
                  >
                    {area.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                {area.pageContent && (
                  <p className="mt-2 line-clamp-2 text-sm text-brand-muted">{area.pageContent}</p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <ServiceAreaForm item={area} />
                  <ToggleActiveButton id={area.id} isActive={area.isActive} />
                  <DeleteButton id={area.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

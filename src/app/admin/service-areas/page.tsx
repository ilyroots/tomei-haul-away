import { getServiceAreas } from "./actions";
import { ServiceAreaForm } from "./components/ServiceAreaForm";
import { ToggleActiveButton } from "./components/ToggleActiveButton";
import { DeleteButton } from "./components/DeleteButton";

export default async function ServiceAreasPage() {
  const areas = await getServiceAreas();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cream">Service areas</h1>
        <p className="mt-1 text-cream-200">Manage cities and ZIP codes in the service area.</p>
      </div>

      <section className="rounded-lg bg-navy p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-cream">Add service area</h2>
        <ServiceAreaForm />
      </section>

      <section className="rounded-lg bg-navy p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-cream">Service areas</h2>
        {areas.length === 0 ? (
          <p className="text-cream-200">No service areas yet.</p>
        ) : (
          <div className="space-y-4">
            {areas.map((area) => (
              <div
                key={area.id}
                className="rounded-lg border border-charcoal-600 bg-charcoal-800 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-cream">
                      {area.city}, MA {area.zip}
                    </h3>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      area.isActive
                        ? "bg-green-900 text-green-100"
                        : "bg-charcoal-600 text-cream-200"
                    }`}
                  >
                    {area.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                {area.pageContent && (
                  <p className="mt-2 line-clamp-2 text-sm text-cream-200">{area.pageContent}</p>
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

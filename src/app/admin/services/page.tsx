import { getServices } from "./actions";
import { ServiceForm } from "./components/ServiceForm";
import { ToggleActiveButton } from "./components/ToggleActiveButton";
import { DeleteButton } from "./components/DeleteButton";

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cream">Services</h1>
        <p className="mt-1 text-cream-200">Manage service offerings.</p>
      </div>

      <section className="rounded-lg bg-navy p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-cream">Add service</h2>
        <ServiceForm />
      </section>

      <section className="rounded-lg bg-navy p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-cream">Services</h2>
        {services.length === 0 ? (
          <p className="text-cream-200">No services yet.</p>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="rounded-lg border border-charcoal-600 bg-charcoal-800 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-cream">{service.title}</h3>
                    <p className="text-sm text-orange">/{service.slug}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      service.isActive
                        ? "bg-green-900 text-green-100"
                        : "bg-charcoal-600 text-cream-200"
                    }`}
                  >
                    {service.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-cream-200">{service.shortDescription}</p>
                <p className="mt-2 text-xs text-cream-200">Sort order: {service.sortOrder}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <ServiceForm item={service} />
                  <ToggleActiveButton id={service.id} isActive={service.isActive} />
                  <DeleteButton id={service.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

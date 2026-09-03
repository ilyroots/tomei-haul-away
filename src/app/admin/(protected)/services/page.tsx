import { getServices } from "./actions";
import { ServiceForm } from "./components/ServiceForm";
import { ToggleActiveButton } from "./components/ToggleActiveButton";
import { DeleteButton } from "./components/DeleteButton";

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-brand-background">Services</h1>
        <p className="mt-1 text-brand-background/80">Manage service offerings.</p>
      </div>

      <section className="rounded-lg bg-brand-primary p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-brand-background">Add service</h2>
        <ServiceForm />
      </section>

      <section className="rounded-lg bg-brand-primary p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-brand-background">Services</h2>
        {services.length === 0 ? (
          <p className="text-brand-background/80">No services yet.</p>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="rounded-lg border border-brand-text/30 bg-brand-text/70 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-brand-background">{service.title}</h3>
                    <p className="text-sm text-brand-accent">/{service.slug}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      service.isActive
                        ? "bg-green-900 text-green-100"
                        : "bg-brand-text/80 text-brand-background/80"
                    }`}
                  >
                    {service.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-brand-background/80">{service.shortDescription}</p>
                <p className="mt-2 text-xs text-brand-background/80">
                  Sort order: {service.sortOrder}
                </p>
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

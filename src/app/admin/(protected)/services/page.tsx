import { getServices } from "./actions";
import { ServiceForm } from "./components/ServiceForm";
import { ToggleActiveButton } from "./components/ToggleActiveButton";
import { DeleteButton } from "./components/DeleteButton";

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div>
      <div className="mb-6 lg:mb-8">
        <h1 className="font-headline text-2xl font-bold text-brand-primary lg:text-3xl">
          Services
        </h1>
        <p className="mt-1 text-sm text-brand-muted">Manage service offerings.</p>
      </div>

      <section className="mb-6 rounded-lg border border-brand-border bg-brand-surface p-6 shadow-sm lg:mb-8">
        <h2 className="mb-4 text-xl font-bold text-brand-primary">Add service</h2>
        <ServiceForm />
      </section>

      <section className="rounded-lg border border-brand-border bg-brand-surface p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-brand-primary">Services</h2>
        {services.length === 0 ? (
          <p className="text-sm text-brand-muted">No services yet.</p>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="rounded-lg border border-brand-border bg-brand-background/40 p-4 hover:bg-brand-background/60"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-brand-text">{service.title}</h3>
                    <p className="text-sm text-brand-accent">/{service.slug}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      service.isActive
                        ? "bg-green-100 text-green-800"
                        : "border border-brand-border bg-brand-background text-brand-muted"
                    }`}
                  >
                    {service.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-brand-muted">{service.shortDescription}</p>
                <p className="mt-2 text-xs text-brand-muted">Sort order: {service.sortOrder}</p>
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

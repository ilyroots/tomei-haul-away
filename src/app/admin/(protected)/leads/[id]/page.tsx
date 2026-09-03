import { notFound } from "next/navigation";
import { getLeadById } from "../actions";
import { StatusUpdateForm } from "../components/StatusUpdateForm";
import { PriceUpdateForm } from "../components/PriceUpdateForm";
import { NoteForm } from "../components/NoteForm";
import { AppointmentEditForm } from "../components/AppointmentEditForm";

function formatPhone(phone: string | null): string {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatPrice(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return `$${Number(value).toFixed(2)}`;
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-accent">{lead.referenceNumber}</p>
          <h1 className="text-3xl font-bold text-brand-background">{lead.contactName}</h1>
          <p className="mt-1 text-brand-background/80">
            Submitted {formatDate(lead.createdAt)} · Status{" "}
            <span className="font-medium text-brand-background">
              {lead.status.replace(/_/g, " ")}
            </span>
          </p>
        </div>
        <StatusUpdateForm leadId={lead.id} currentStatus={lead.status} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* Contact details */}
          <section className="rounded-lg bg-brand-primary p-6 shadow">
            <h2 className="mb-4 text-xl font-bold text-brand-background">Contact details</h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-brand-background/80">Email</dt>
                <dd className="font-medium text-brand-background">
                  <a
                    href={`mailto:${lead.contactEmail}`}
                    className="hover:text-brand-accent hover:underline"
                  >
                    {lead.contactEmail}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-brand-background/80">Phone</dt>
                <dd className="font-medium text-brand-background">
                  {lead.contactPhone ? (
                    <a
                      href={`tel:${lead.contactPhone}`}
                      className="hover:text-brand-accent hover:underline"
                    >
                      {formatPhone(lead.contactPhone)}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-brand-background/80">Contact preference</dt>
                <dd className="font-medium text-brand-background">{lead.contactPreference}</dd>
              </div>
              <div>
                <dt className="text-sm text-brand-background/80">Service area</dt>
                <dd className="font-medium text-brand-background">
                  {lead.isInServiceArea
                    ? "In service area"
                    : lead.outOfServiceAreaNote || "Unknown"}
                </dd>
              </div>
            </dl>
          </section>

          {/* Address */}
          <section className="rounded-lg bg-brand-primary p-6 shadow">
            <h2 className="mb-4 text-xl font-bold text-brand-background">Address</h2>
            {lead.address ? (
              <address className="not-italic text-brand-background">
                <p className="font-medium">{lead.address.line1}</p>
                {lead.address.line2 && <p>{lead.address.line2}</p>}
                <p>
                  {lead.address.city}, {lead.address.state} {lead.address.zip}
                </p>
              </address>
            ) : (
              <p className="text-brand-background/80">No address on file.</p>
            )}
          </section>

          {/* Job details */}
          <section className="rounded-lg bg-brand-primary p-6 shadow">
            <h2 className="mb-4 text-xl font-bold text-brand-background">Job details</h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-brand-background/80">Services</dt>
                <dd className="font-medium text-brand-background">
                  {lead.services.map((ls) => ls.service.title).join(", ") || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-brand-background/80">Property type</dt>
                <dd className="font-medium text-brand-background">
                  {lead.propertyType?.replace(/_/g, " ") ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-brand-background/80">Load size</dt>
                <dd className="font-medium text-brand-background">
                  {lead.loadSize?.replace(/_/g, " ") ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-brand-background/80">Preferred date</dt>
                <dd className="font-medium text-brand-background">
                  {formatDate(lead.preferredDate)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-brand-background/80">Arrival window</dt>
                <dd className="font-medium text-brand-background">
                  {lead.arrivalWindow?.replace(/_/g, " ") ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-brand-background/80">Floor level</dt>
                <dd className="font-medium text-brand-background">{lead.floorLevel ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-brand-background/80">Stairs / Elevator / Long carry</dt>
                <dd className="font-medium text-brand-background">
                  {[
                    lead.hasStairs && "Stairs",
                    lead.hasElevator && "Elevator",
                    lead.longCarry && "Long carry",
                  ]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-brand-background/80">Disassembly required</dt>
                <dd className="font-medium text-brand-background">
                  {lead.disassemblyRequired ? "Yes" : "No"}
                </dd>
              </div>
            </dl>
            {lead.itemsDescription && (
              <div className="mt-4">
                <dt className="text-sm text-brand-background/80">Items description</dt>
                <dd className="mt-1 whitespace-pre-wrap text-brand-background">
                  {lead.itemsDescription}
                </dd>
              </div>
            )}
            {lead.heavySpecialtyItems && (
              <div className="mt-4">
                <dt className="text-sm text-brand-background/80">Heavy / specialty items</dt>
                <dd className="mt-1 whitespace-pre-wrap text-brand-background">
                  {lead.heavySpecialtyItems}
                </dd>
              </div>
            )}
          </section>

          {/* Appointments */}
          <section className="rounded-lg bg-brand-primary p-6 shadow">
            <h2 className="mb-4 text-xl font-bold text-brand-background">Appointments</h2>
            {lead.appointments.length === 0 ? (
              <p className="text-brand-background/80">No appointments linked to this lead.</p>
            ) : (
              <div className="space-y-4">
                {lead.appointments.map((appt) => (
                  <AppointmentEditForm key={appt.id} appointment={appt} />
                ))}
              </div>
            )}
          </section>

          {/* Photos */}
          <section className="rounded-lg bg-brand-primary p-6 shadow">
            <h2 className="mb-4 text-xl font-bold text-brand-background">Uploaded photos</h2>
            {lead.assets.length === 0 ? (
              <p className="text-brand-background/80">No photos uploaded.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {lead.assets.map((asset) => (
                  <a
                    key={asset.id}
                    href={asset.signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-md border border-brand-text/30 bg-brand-text/70"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.signedUrl}
                      alt={asset.originalName}
                      className="h-40 w-full object-cover"
                    />
                    <p className="truncate px-3 py-2 text-xs text-brand-background/80">
                      {asset.originalName}
                    </p>
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* Notes */}
          <section className="rounded-lg bg-brand-primary p-6 shadow">
            <h2 className="mb-4 text-xl font-bold text-brand-background">Internal notes</h2>
            <NoteForm leadId={lead.id} />
            <div className="mt-6 space-y-4">
              {lead.notes.length === 0 ? (
                <p className="text-brand-background/80">No notes yet.</p>
              ) : (
                lead.notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-md border border-brand-text/30 bg-brand-text/70 p-4"
                  >
                    <p className="whitespace-pre-wrap text-brand-background">{note.content}</p>
                    <p className="mt-2 text-xs text-brand-background/80">
                      {note.author.name || note.author.email} ·{" "}
                      {new Date(note.createdAt).toLocaleString("en-US")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Status history */}
          <section className="rounded-lg bg-brand-primary p-6 shadow">
            <h2 className="mb-4 text-xl font-bold text-brand-background">Status history</h2>
            {lead.statusHistory.length === 0 ? (
              <p className="text-brand-background/80">No status changes yet.</p>
            ) : (
              <ul className="space-y-3">
                {lead.statusHistory.map((change) => (
                  <li
                    key={change.id}
                    className="border-l-2 border-brand-accent pl-4 text-brand-background"
                  >
                    <p className="font-medium">
                      {change.fromStatus ?? "(none)"} → {change.toStatus}
                    </p>
                    {change.reason && (
                      <p className="mt-1 text-sm text-brand-background/80">
                        Reason: {change.reason}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-brand-background/80">
                      {change.changedBy?.name || change.changedBy?.email || "System"} ·{" "}
                      {new Date(change.createdAt).toLocaleString("en-US")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-6">
          <section className="rounded-lg bg-brand-primary p-6 shadow">
            <h2 className="mb-4 text-xl font-bold text-brand-background">Quote estimate</h2>
            <PriceUpdateForm
              leadId={lead.id}
              estimatedPriceMin={lead.estimatedPriceMin}
              estimatedPriceMax={lead.estimatedPriceMax}
            />
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-background/80">Current min</span>
                <span className="font-medium text-brand-background">
                  {formatPrice(lead.estimatedPriceMin)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-background/80">Current max</span>
                <span className="font-medium text-brand-background">
                  {formatPrice(lead.estimatedPriceMax)}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-lg bg-brand-primary p-6 shadow">
            <h2 className="mb-4 text-xl font-bold text-brand-background">Quick actions</h2>
            <div className="space-y-3">
              <a
                href={`mailto:${lead.contactEmail}`}
                className="block rounded-md bg-brand-text/70 px-4 py-2 text-center text-sm font-medium text-brand-background transition-colors hover:bg-brand-text/90"
              >
                Email customer
              </a>
              {lead.contactPhone && (
                <a
                  href={`tel:${lead.contactPhone}`}
                  className="block rounded-md bg-brand-text/70 px-4 py-2 text-center text-sm font-medium text-brand-background transition-colors hover:bg-brand-text/90"
                >
                  Call customer
                </a>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

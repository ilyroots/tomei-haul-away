import { notFound } from "next/navigation";
import Link from "next/link";
import { getAppointmentById } from "../actions";
import { AppointmentEditForm } from "../components/AppointmentEditForm";
import { AppointmentNoteForm } from "../components/AppointmentNoteForm";

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appointment = await getAppointmentById(id);

  if (!appointment) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="mb-6 lg:mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-brand-accent">
          {appointment.status.replace(/_/g, " ")}
        </p>
        <h1 className="font-headline text-2xl font-bold text-brand-primary lg:text-3xl">
          Appointment on {formatDate(appointment.scheduledDate)}
        </h1>
        {appointment.leadId && (
          <p className="mt-1 text-sm text-brand-muted">
            Lead:{" "}
            <Link
              href={`/admin/leads/${appointment.leadId}`}
              className="text-brand-accent hover:underline"
            >
              {appointment.lead?.referenceNumber || "View lead"}
            </Link>
          </p>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <AppointmentEditForm appointment={appointment} />
          <AppointmentNoteForm appointmentId={appointment.id} notes={appointment.notes} />

          <section className="rounded-lg border border-brand-border bg-brand-surface p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-brand-primary">Status history</h2>
            {appointment.statusHistory.length === 0 ? (
              <p className="text-brand-muted">No status changes yet.</p>
            ) : (
              <ul className="space-y-3">
                {appointment.statusHistory.map((change) => (
                  <li
                    key={change.id}
                    className="border-l-2 border-brand-accent pl-4 text-brand-text"
                  >
                    <p className="font-medium">
                      {change.fromStatus ?? "(none)"} → {change.toStatus}
                    </p>
                    {change.reason && (
                      <p className="mt-1 text-sm text-brand-muted">Reason: {change.reason}</p>
                    )}
                    <p className="mt-1 text-xs text-brand-muted">
                      {change.changedBy?.name || change.changedBy?.email || "System"} ·{" "}
                      {new Date(change.createdAt).toLocaleString("en-US")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-brand-border bg-brand-surface p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-brand-primary">Customer</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-brand-muted">
                  Name
                </dt>
                <dd className="font-medium text-brand-text">
                  {appointment.lead?.contactName || appointment.customer?.name || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-brand-muted">
                  Email
                </dt>
                <dd className="font-medium text-brand-text">
                  {appointment.lead?.contactEmail || appointment.customer?.email ? (
                    <a
                      href={`mailto:${appointment.lead?.contactEmail || appointment.customer?.email}`}
                      className="hover:text-brand-accent hover:underline"
                    >
                      {appointment.lead?.contactEmail || appointment.customer?.email}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-brand-muted">
                  Phone
                </dt>
                <dd className="font-medium text-brand-text">
                  {appointment.lead?.contactPhone || appointment.customer?.phone ? (
                    <a
                      href={`tel:${appointment.lead?.contactPhone || appointment.customer?.phone}`}
                      className="hover:text-brand-accent hover:underline"
                    >
                      {appointment.lead?.contactPhone || appointment.customer?.phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-brand-border bg-brand-surface p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-brand-primary">Address</h2>
            {appointment.address ? (
              <address className="not-italic text-brand-text">
                <p className="font-medium">{appointment.address.line1}</p>
                {appointment.address.line2 && <p>{appointment.address.line2}</p>}
                <p>
                  {appointment.address.city}, {appointment.address.state} {appointment.address.zip}
                </p>
              </address>
            ) : (
              <p className="text-brand-muted">No address on file.</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

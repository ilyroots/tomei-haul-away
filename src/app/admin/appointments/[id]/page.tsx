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
      <div>
        <p className="text-sm font-medium text-brand-accent">
          {appointment.status.replace(/_/g, " ")}
        </p>
        <h1 className="text-3xl font-bold text-brand-background">
          Appointment on {formatDate(appointment.scheduledDate)}
        </h1>
        {appointment.leadId && (
          <p className="mt-1 text-brand-background/80">
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

          <section className="rounded-lg bg-brand-primary p-6 shadow">
            <h2 className="mb-4 text-xl font-bold text-brand-background">Status history</h2>
            {appointment.statusHistory.length === 0 ? (
              <p className="text-brand-background/80">No status changes yet.</p>
            ) : (
              <ul className="space-y-3">
                {appointment.statusHistory.map((change) => (
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

        <aside className="space-y-6">
          <section className="rounded-lg bg-brand-primary p-6 shadow">
            <h2 className="mb-4 text-xl font-bold text-brand-background">Customer</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-brand-background/80">Name</dt>
                <dd className="font-medium text-brand-background">
                  {appointment.lead?.contactName || appointment.customer?.name || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-brand-background/80">Email</dt>
                <dd className="font-medium text-brand-background">
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
                <dt className="text-brand-background/80">Phone</dt>
                <dd className="font-medium text-brand-background">
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

          <section className="rounded-lg bg-brand-primary p-6 shadow">
            <h2 className="mb-4 text-xl font-bold text-brand-background">Address</h2>
            {appointment.address ? (
              <address className="not-italic text-brand-background">
                <p className="font-medium">{appointment.address.line1}</p>
                {appointment.address.line2 && <p>{appointment.address.line2}</p>}
                <p>
                  {appointment.address.city}, {appointment.address.state} {appointment.address.zip}
                </p>
              </address>
            ) : (
              <p className="text-brand-background/80">No address on file.</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

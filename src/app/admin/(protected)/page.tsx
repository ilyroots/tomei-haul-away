import Link from "next/link";
import { getDashboardSummary } from "./actions";
import { Button } from "@/components/ui/Button";

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminDashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="font-headline text-2xl font-bold text-brand-primary lg:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-brand-muted">Overview of today&apos;s activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-brand-primary p-6 shadow">
          <p className="text-sm font-medium text-brand-background/80">New leads</p>
          <p className="mt-2 text-4xl font-bold text-brand-accent">{summary.newLeadsCount}</p>
        </div>
        <div className="rounded-lg bg-brand-primary p-6 shadow">
          <p className="text-sm font-medium text-brand-background/80">
            Upcoming appointment requests
          </p>
          <p className="mt-2 text-4xl font-bold text-brand-accent">
            {summary.upcomingRequestsCount}
          </p>
        </div>
        <div className="rounded-lg bg-brand-primary p-6 shadow">
          <p className="text-sm font-medium text-brand-background/80">Leads needing follow-up</p>
          <p className="mt-2 text-4xl font-bold text-brand-accent">{summary.followUpLeadsCount}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-lg border border-brand-border bg-brand-surface p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-brand-primary">Recent leads</h2>
            <Link href="/admin/leads">
              <Button variant="outline" size="sm">
                View all
              </Button>
            </Link>
          </div>

          {summary.recentLeads.length === 0 ? (
            <p className="text-sm text-brand-muted">No recent leads.</p>
          ) : (
            <ul className="divide-y divide-brand-border">
              {summary.recentLeads.map((lead) => (
                <li key={lead.id} className="py-3">
                  <Link
                    href={`/admin/leads/${lead.id}`}
                    className="block rounded-md p-2 transition-colors hover:bg-brand-background/60"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-brand-text">{lead.referenceNumber}</span>
                      <span className="text-sm text-brand-muted">{formatDate(lead.createdAt)}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-sm">
                      <span className="text-brand-muted">{lead.contactName || "Unknown"}</span>
                      <span className="rounded-full bg-brand-primary px-2 py-0.5 text-xs text-brand-background">
                        {lead.status}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-brand-border bg-brand-surface p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-brand-primary">Upcoming appointments</h2>
            <Link href="/admin/appointments">
              <Button variant="outline" size="sm">
                View all
              </Button>
            </Link>
          </div>

          {summary.upcomingAppointments.length === 0 ? (
            <p className="text-sm text-brand-muted">No upcoming appointments.</p>
          ) : (
            <ul className="divide-y divide-brand-border">
              {summary.upcomingAppointments.map((appt) => (
                <li key={appt.id} className="py-3">
                  <Link
                    href={`/admin/appointments/${appt.id}`}
                    className="block rounded-md p-2 transition-colors hover:bg-brand-background/60"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-brand-text">
                        {formatDate(appt.scheduledDate)}
                      </span>
                      <span className="rounded-full bg-brand-primary px-2 py-0.5 text-xs text-brand-background">
                        {appt.status}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-brand-muted">
                      {appt.contactName || "Unknown"}
                      {appt.arrivalWindow ? ` — ${appt.arrivalWindow}` : ""}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

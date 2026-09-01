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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-cream">Dashboard</h1>
        <p className="mt-1 text-cream-200">Overview of today&apos;s activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-navy p-6 shadow">
          <p className="text-sm font-medium text-cream-200">New leads</p>
          <p className="mt-2 text-4xl font-bold text-orange">{summary.newLeadsCount}</p>
        </div>
        <div className="rounded-lg bg-navy p-6 shadow">
          <p className="text-sm font-medium text-cream-200">Upcoming appointment requests</p>
          <p className="mt-2 text-4xl font-bold text-orange">{summary.upcomingRequestsCount}</p>
        </div>
        <div className="rounded-lg bg-navy p-6 shadow">
          <p className="text-sm font-medium text-cream-200">Leads needing follow-up</p>
          <p className="mt-2 text-4xl font-bold text-orange">{summary.followUpLeadsCount}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-lg bg-navy p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-cream">Recent leads</h2>
            <Link href="/admin/leads">
              <Button variant="outline" size="sm">
                View all
              </Button>
            </Link>
          </div>

          {summary.recentLeads.length === 0 ? (
            <p className="text-cream-200">No recent leads.</p>
          ) : (
            <ul className="divide-y divide-navy-700">
              {summary.recentLeads.map((lead) => (
                <li key={lead.id} className="py-3">
                  <Link
                    href={`/admin/leads/${lead.id}`}
                    className="block rounded-md p-2 transition-colors hover:bg-navy-800"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-cream">{lead.referenceNumber}</span>
                      <span className="text-sm text-cream-200">{formatDate(lead.createdAt)}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-sm">
                      <span className="text-cream-200">{lead.contactName || "Unknown"}</span>
                      <span className="rounded-full bg-charcoal px-2 py-0.5 text-xs text-cream-200">
                        {lead.status}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg bg-navy p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-cream">Upcoming appointments</h2>
            <Link href="/admin/appointments">
              <Button variant="outline" size="sm">
                View all
              </Button>
            </Link>
          </div>

          {summary.upcomingAppointments.length === 0 ? (
            <p className="text-cream-200">No upcoming appointments.</p>
          ) : (
            <ul className="divide-y divide-navy-700">
              {summary.upcomingAppointments.map((appt) => (
                <li key={appt.id} className="py-3">
                  <Link
                    href={`/admin/appointments/${appt.id}`}
                    className="block rounded-md p-2 transition-colors hover:bg-navy-800"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-cream">
                        {formatDate(appt.scheduledDate)}
                      </span>
                      <span className="rounded-full bg-charcoal px-2 py-0.5 text-xs text-cream-200">
                        {appt.status}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-cream-200">
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

import Link from "next/link";
import { Suspense } from "react";
import { AppointmentStatus } from "@prisma/client";
import { getAppointments, type AppointmentFilters } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const statusOptions: { value: string; label: string }[] = [
  { value: "", label: "All statuses" },
  ...Object.values(AppointmentStatus).map((status) => ({
    value: status,
    label: status.replace(/_/g, " "),
  })),
];

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function FilterForm({ filters }: { filters: AppointmentFilters }) {
  return (
    <form
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
      action="/admin/appointments"
      method="GET"
    >
      <Input
        name="search"
        placeholder="Search name, email, ref, address..."
        defaultValue={filters.search ?? ""}
        className="border-brand-text/30 bg-brand-text/90 text-brand-background placeholder:text-brand-muted/70 lg:col-span-2"
      />
      <Select
        name="status"
        options={statusOptions}
        defaultValue={filters.status ?? ""}
        className="border-brand-text/30 bg-brand-text/90 text-brand-background"
      />
      <Input
        name="dateFrom"
        type="date"
        placeholder="From"
        defaultValue={filters.dateFrom ?? ""}
        className="border-brand-text/30 bg-brand-text/90 text-brand-background"
      />
      <Input
        name="dateTo"
        type="date"
        placeholder="To"
        defaultValue={filters.dateTo ?? ""}
        className="border-brand-text/30 bg-brand-text/90 text-brand-background"
      />
      <Button type="submit" variant="secondary" className="sm:col-span-2 lg:col-span-5">
        Filter
      </Button>
    </form>
  );
}

async function AppointmentsTable({ filters }: { filters: AppointmentFilters }) {
  const result = await getAppointments(filters);

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-brand-background/20">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-text/70 text-brand-background/80">
            <tr>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Location</th>
              <th className="px-4 py-3 font-semibold">Window</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-700">
            {result.appointments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-brand-background/80">
                  No appointments found.
                </td>
              </tr>
            ) : (
              result.appointments.map((appt) => (
                <tr key={appt.id} className="hover:bg-brand-text/20">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/appointments/${appt.id}`}
                      className="font-medium text-brand-accent hover:underline"
                    >
                      {formatDate(appt.scheduledDate)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-brand-background">{appt.contactName || "—"}</td>
                  <td className="px-4 py-3 text-brand-background/80">
                    {appt.addressSummary || "—"}
                  </td>
                  <td className="px-4 py-3 text-brand-background/80">
                    {appt.arrivalWindow || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-brand-primary px-2 py-0.5 text-xs text-brand-background/80">
                      {appt.status.replace(/_/g, " ")}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {result.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-brand-background/80">
          <p>
            Page {result.page} of {result.totalPages} ({result.total} total)
          </p>
          <div className="flex gap-2">
            {result.page > 1 && (
              <Link
                href={`/admin/appointments?${new URLSearchParams({
                  ...(filters.search ? { search: filters.search } : {}),
                  ...(filters.status ? { status: filters.status } : {}),
                  ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
                  ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
                  page: String(result.page - 1),
                })}`}
              >
                <Button variant="outline" size="sm">
                  Previous
                </Button>
              </Link>
            )}
            {result.page < result.totalPages && (
              <Link
                href={`/admin/appointments?${new URLSearchParams({
                  ...(filters.search ? { search: filters.search } : {}),
                  ...(filters.status ? { status: filters.status } : {}),
                  ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
                  ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
                  page: String(result.page + 1),
                })}`}
              >
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const filters: AppointmentFilters = {
    status: (typeof params.status === "string" && params.status in AppointmentStatus
      ? params.status
      : undefined) as AppointmentStatus | undefined,
    search: typeof params.search === "string" ? params.search : undefined,
    dateFrom: typeof params.dateFrom === "string" ? params.dateFrom : undefined,
    dateTo: typeof params.dateTo === "string" ? params.dateTo : undefined,
    page: typeof params.page === "string" ? Number.parseInt(params.page, 10) : undefined,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-brand-background">Appointments</h1>
        <p className="mt-1 text-brand-background/80">View and manage scheduled appointments.</p>
      </div>

      <FilterForm filters={filters} />

      <Suspense fallback={<p className="text-brand-background/80">Loading appointments...</p>}>
        <AppointmentsTable filters={filters} />
      </Suspense>
    </div>
  );
}

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
        className="lg:col-span-2"
      />
      <Select name="status" options={statusOptions} defaultValue={filters.status ?? ""} />
      <Input name="dateFrom" type="date" placeholder="From" defaultValue={filters.dateFrom ?? ""} />
      <Input name="dateTo" type="date" placeholder="To" defaultValue={filters.dateTo ?? ""} />
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
      <div className="overflow-x-auto rounded-lg border border-brand-border bg-brand-surface shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-primary text-brand-background">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Location</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Window</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {result.appointments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-brand-muted">
                  No appointments found.
                </td>
              </tr>
            ) : (
              result.appointments.map((appt) => (
                <tr
                  key={appt.id}
                  className="border-t border-brand-border hover:bg-brand-background/60"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/appointments/${appt.id}`}
                      className="font-medium text-brand-accent hover:underline"
                    >
                      {formatDate(appt.scheduledDate)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-brand-text">{appt.contactName || "—"}</td>
                  <td className="px-4 py-3 text-brand-muted">{appt.addressSummary || "—"}</td>
                  <td className="px-4 py-3 text-brand-muted">{appt.arrivalWindow || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-brand-primary px-2 py-0.5 text-xs text-brand-background">
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
        <div className="flex items-center justify-between text-sm text-brand-muted">
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
      <div className="mb-6 lg:mb-8">
        <h1 className="font-headline text-2xl font-bold text-brand-primary lg:text-3xl">
          Appointments
        </h1>
        <p className="mt-1 text-sm text-brand-muted">View and manage scheduled appointments.</p>
      </div>

      <div className="rounded-lg border border-brand-border bg-brand-surface p-4 shadow-sm">
        <FilterForm filters={filters} />
      </div>

      <Suspense fallback={<p className="text-brand-muted">Loading appointments...</p>}>
        <AppointmentsTable filters={filters} />
      </Suspense>
    </div>
  );
}

import Link from "next/link";
import { Suspense } from "react";
import { LeadStatus } from "@prisma/client";
import { getLeads, type LeadFilters } from "./actions";
import { CsvExportButton } from "./components/CsvExportButton";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const statusOptions: { value: string; label: string }[] = [
  { value: "", label: "All statuses" },
  ...Object.values(LeadStatus).map((status) => ({
    value: status,
    label: status.replace(/_/g, " "),
  })),
];

function formatPhone(phone: string | null): string {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function SearchForm({ filters }: { filters: LeadFilters }) {
  return (
    <form
      className="flex flex-col gap-3 rounded-lg border border-brand-border bg-brand-surface p-4 shadow-sm sm:flex-row"
      action="/admin/leads"
      method="GET"
    >
      <Input
        name="search"
        placeholder="Search name, phone, email, ref, ZIP, address..."
        defaultValue={filters.search ?? ""}
        className="sm:flex-1"
      />
      <Select
        name="status"
        options={statusOptions}
        defaultValue={filters.status ?? ""}
        className="sm:w-48"
      />
      <Button type="submit" variant="secondary">
        Filter
      </Button>
    </form>
  );
}

async function LeadsTable({ filters }: { filters: LeadFilters }) {
  const result = await getLeads(filters);

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-brand-border bg-brand-surface shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-primary text-xs font-semibold uppercase tracking-wider text-brand-background">
            <tr>
              <th className="px-4 py-3 font-semibold">Reference</th>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Contact</th>
              <th className="px-4 py-3 font-semibold">Location</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {result.leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-brand-muted">
                  No leads found.
                </td>
              </tr>
            ) : (
              result.leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-t border-brand-border hover:bg-brand-background/60"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="font-medium text-brand-accent hover:underline"
                    >
                      {lead.referenceNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-brand-text">{lead.contactName}</td>
                  <td className="px-4 py-3 text-brand-text">
                    <div>{lead.contactEmail}</div>
                    <div>{formatPhone(lead.contactPhone)}</div>
                  </td>
                  <td className="px-4 py-3 text-brand-text">
                    {lead.address
                      ? `${lead.address.city}, ${lead.address.state} ${lead.address.zip}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-brand-primary px-2 py-0.5 text-xs text-brand-background">
                      {lead.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-brand-text">{formatDate(lead.createdAt)}</td>
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
                href={`/admin/leads?${new URLSearchParams({
                  ...(filters.search ? { search: filters.search } : {}),
                  ...(filters.status ? { status: filters.status } : {}),
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
                href={`/admin/leads?${new URLSearchParams({
                  ...(filters.search ? { search: filters.search } : {}),
                  ...(filters.status ? { status: filters.status } : {}),
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

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const filters: LeadFilters = {
    status: (typeof params.status === "string" && params.status in LeadStatus
      ? params.status
      : undefined) as LeadStatus | undefined,
    search: typeof params.search === "string" ? params.search : undefined,
    page: typeof params.page === "string" ? Number.parseInt(params.page, 10) : undefined,
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:mb-8">
        <div>
          <h1 className="font-headline text-2xl font-bold text-brand-primary lg:text-3xl">Leads</h1>
          <p className="mt-1 text-sm text-brand-muted">
            Manage quote requests and customer inquiries.
          </p>
        </div>
        <CsvExportButton filters={filters} />
      </div>

      <SearchForm filters={filters} />

      <Suspense fallback={<p className="text-brand-muted">Loading leads...</p>}>
        <LeadsTable filters={filters} />
      </Suspense>
    </div>
  );
}

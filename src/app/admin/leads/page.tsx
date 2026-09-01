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
    <form className="flex flex-col gap-3 sm:flex-row" action="/admin/leads" method="GET">
      <Input
        name="search"
        placeholder="Search name, phone, email, ref, ZIP, address..."
        defaultValue={filters.search ?? ""}
        className="border-charcoal-600 bg-charcoal-700 text-cream placeholder:text-charcoal-400 sm:flex-1"
      />
      <Select
        name="status"
        options={statusOptions}
        defaultValue={filters.status ?? ""}
        className="border-charcoal-600 bg-charcoal-700 text-cream sm:w-48"
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
      <div className="overflow-x-auto rounded-lg border border-charcoal-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-charcoal-800 text-cream-200">
            <tr>
              <th className="px-4 py-3 font-semibold">Reference</th>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Contact</th>
              <th className="px-4 py-3 font-semibold">Location</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-700">
            {result.leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-cream-200">
                  No leads found.
                </td>
              </tr>
            ) : (
              result.leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-charcoal-800/50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="font-medium text-orange hover:underline"
                    >
                      {lead.referenceNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-cream">{lead.contactName}</td>
                  <td className="px-4 py-3 text-cream-200">
                    <div>{lead.contactEmail}</div>
                    <div>{formatPhone(lead.contactPhone)}</div>
                  </td>
                  <td className="px-4 py-3 text-cream-200">
                    {lead.address
                      ? `${lead.address.city}, ${lead.address.state} ${lead.address.zip}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-navy px-2 py-0.5 text-xs text-cream-200">
                      {lead.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-cream-200">{formatDate(lead.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {result.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-cream-200">
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cream">Leads</h1>
          <p className="mt-1 text-cream-200">Manage quote requests and customer inquiries.</p>
        </div>
        <CsvExportButton filters={filters} />
      </div>

      <SearchForm filters={filters} />

      <Suspense fallback={<p className="text-cream-200">Loading leads...</p>}>
        <LeadsTable filters={filters} />
      </Suspense>
    </div>
  );
}

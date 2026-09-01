"use client";

import { useActionState } from "react";
import { exportLeadsCsv, type LeadFilters, type CsvExportResult } from "../actions";
import { Button } from "@/components/ui/Button";

export function CsvExportButton({ filters }: { filters: LeadFilters }) {
  const [state, action, pending] = useActionState(
    async (_prevState: CsvExportResult | undefined, _formData: FormData) => exportLeadsCsv(filters),
    undefined
  );

  if (state?.success) {
    const blob = new Blob([state.csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = state.filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <form action={action}>
      <Button type="submit" variant="outline" size="sm" isLoading={pending}>
        Export CSV
      </Button>
    </form>
  );
}

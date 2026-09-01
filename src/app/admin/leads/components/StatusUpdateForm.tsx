"use client";

import { useActionState, useState } from "react";
import { LeadStatus } from "@prisma/client";
import { updateLeadStatus, type ActionResult } from "../actions";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { ErrorSummary } from "@/components/ui/ErrorSummary";

const statusOptions = Object.values(LeadStatus).map((status) => ({
  value: status,
  label: status.replace(/_/g, " "),
}));

export function StatusUpdateForm({
  leadId,
  currentStatus,
}: {
  leadId: string;
  currentStatus: LeadStatus;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [reason, setReason] = useState("");

  const [state, action, pending] = useActionState(
    async (_prevState: ActionResult | undefined) =>
      updateLeadStatus(leadId, status as LeadStatus, reason || undefined),
    undefined
  );

  return (
    <form action={action} className="rounded-lg bg-navy p-4 shadow">
      <h2 className="mb-3 text-sm font-semibold text-cream-200">Update status</h2>
      {state?.success === false && <ErrorSummary message={state.message} className="mb-3" />}
      <div className="space-y-3">
        <div>
          <Label htmlFor="status" className="sr-only">
            Status
          </Label>
          <Select
            id="status"
            name="status"
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value as LeadStatus)}
            className="border-charcoal-600 bg-charcoal-700 text-cream"
          />
        </div>
        <div>
          <Label htmlFor="reason" className="sr-only">
            Reason
          </Label>
          <Textarea
            id="reason"
            name="reason"
            placeholder="Reason for status change (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="border-charcoal-600 bg-charcoal-700 text-cream placeholder:text-charcoal-400"
          />
        </div>
        <Button type="submit" isLoading={pending} size="sm" className="w-full">
          Update status
        </Button>
      </div>
    </form>
  );
}

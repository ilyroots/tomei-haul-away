"use client";

import { useActionState, useState } from "react";
import { AppointmentStatus } from "@prisma/client";
import { updateAppointmentStatus, type ActionResult } from "../actions";
import type { getAppointmentById } from "../actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { ErrorSummary } from "@/components/ui/ErrorSummary";

const statusOptions = Object.values(AppointmentStatus).map((status) => ({
  value: status,
  label: status.replace(/_/g, " "),
}));

const windowOptions = [
  { value: "", label: "— No window —" },
  { value: "MORNING", label: "Morning" },
  { value: "AFTERNOON", label: "Afternoon" },
  { value: "EVENING", label: "Evening" },
  { value: "ANYTIME", label: "Anytime" },
];

export function AppointmentEditForm({
  appointment,
}: {
  appointment: NonNullable<Awaited<ReturnType<typeof getAppointmentById>>>;
}) {
  const [status, setStatus] = useState(appointment.status);
  const [scheduledDate, setScheduledDate] = useState(
    new Date(appointment.scheduledDate).toISOString().slice(0, 16)
  );
  const [arrivalWindow, setArrivalWindow] = useState(appointment.arrivalWindow);
  const [reason, setReason] = useState("");

  const [state, action, pending] = useActionState(
    async (_prevState: ActionResult | undefined) =>
      updateAppointmentStatus(
        appointment.id,
        status as AppointmentStatus,
        new Date(scheduledDate),
        arrivalWindow || undefined,
        reason || undefined
      ),
    undefined
  );

  return (
    <section className="rounded-lg border border-brand-border bg-brand-surface p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-brand-primary">Edit appointment</h2>
      {state?.success === false && <ErrorSummary message={state.message} className="mb-4" />}
      <form action={action} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="status" className="text-brand-muted">
              Status
            </Label>
            <Select
              id="status"
              options={statusOptions}
              value={status}
              onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
            />
          </div>
          <div>
            <Label htmlFor="scheduledDate" className="text-brand-muted">
              Scheduled date
            </Label>
            <Input
              id="scheduledDate"
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="arrivalWindow" className="text-brand-muted">
              Arrival window
            </Label>
            <Select
              id="arrivalWindow"
              options={windowOptions}
              value={arrivalWindow}
              onChange={(e) => setArrivalWindow(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="reason" className="text-brand-muted">
              Reason
            </Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>
        <Button type="submit" isLoading={pending}>
          Save changes
        </Button>
      </form>
    </section>
  );
}

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
    <section className="rounded-lg bg-brand-primary p-6 shadow">
      <h2 className="mb-4 text-xl font-bold text-brand-background">Edit appointment</h2>
      {state?.success === false && <ErrorSummary message={state.message} className="mb-4" />}
      <form action={action} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="status" className="text-brand-background/80">
              Status
            </Label>
            <Select
              id="status"
              options={statusOptions}
              value={status}
              onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
              className="border-brand-text/30 bg-brand-text/90 text-brand-background"
            />
          </div>
          <div>
            <Label htmlFor="scheduledDate" className="text-brand-background/80">
              Scheduled date
            </Label>
            <Input
              id="scheduledDate"
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="border-brand-text/30 bg-brand-text/90 text-brand-background"
            />
          </div>
          <div>
            <Label htmlFor="arrivalWindow" className="text-brand-background/80">
              Arrival window
            </Label>
            <Select
              id="arrivalWindow"
              options={windowOptions}
              value={arrivalWindow}
              onChange={(e) => setArrivalWindow(e.target.value)}
              className="border-brand-text/30 bg-brand-text/90 text-brand-background"
            />
          </div>
          <div>
            <Label htmlFor="reason" className="text-brand-background/80">
              Reason
            </Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Optional"
              className="border-brand-text/30 bg-brand-text/90 text-brand-background placeholder:text-brand-muted/70"
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

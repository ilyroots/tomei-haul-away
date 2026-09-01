"use client";

import { useActionState, useState } from "react";
import { AppointmentStatus, type Appointment, type Address } from "@prisma/client";
import { updateAppointmentStatus, type ActionResult } from "@/app/admin/appointments/actions";
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
  appointment: Appointment & { address: Address | null };
}) {
  const [status, setStatus] = useState(appointment.status);
  const [scheduledDate, setScheduledDate] = useState(
    new Date(appointment.scheduledDate).toISOString().slice(0, 16)
  );
  const [arrivalWindow, setArrivalWindow] = useState(
    appointment.arrivalWindowLabel ?? appointment.arrivalWindow ?? ""
  );
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

  const addressText = appointment.address
    ? `${appointment.address.line1}${appointment.address.line2 ? ` ${appointment.address.line2}` : ""}, ${appointment.address.city}, ${appointment.address.state} ${appointment.address.zip}`
    : "No address";

  return (
    <form action={action} className="rounded-md border border-charcoal-600 bg-charcoal-800 p-4">
      {state?.success === false && <ErrorSummary message={state.message} className="mb-3" />}
      <div className="mb-3 text-sm text-cream-200">{addressText}</div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label htmlFor={`appt-status-${appointment.id}`} className="text-cream-200">
            Status
          </Label>
          <Select
            id={`appt-status-${appointment.id}`}
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
            className="border-charcoal-600 bg-charcoal-700 text-cream"
          />
        </div>
        <div>
          <Label htmlFor={`appt-date-${appointment.id}`} className="text-cream-200">
            Scheduled date
          </Label>
          <Input
            id={`appt-date-${appointment.id}`}
            type="datetime-local"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="border-charcoal-600 bg-charcoal-700 text-cream"
          />
        </div>
        <div>
          <Label htmlFor={`appt-window-${appointment.id}`} className="text-cream-200">
            Window
          </Label>
          <Select
            id={`appt-window-${appointment.id}`}
            options={windowOptions}
            value={arrivalWindow}
            onChange={(e) => setArrivalWindow(e.target.value)}
            className="border-charcoal-600 bg-charcoal-700 text-cream"
          />
        </div>
        <div>
          <Label htmlFor={`appt-reason-${appointment.id}`} className="text-cream-200">
            Reason
          </Label>
          <Input
            id={`appt-reason-${appointment.id}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Optional"
            className="border-charcoal-600 bg-charcoal-700 text-cream placeholder:text-charcoal-400"
          />
        </div>
      </div>
      <Button type="submit" size="sm" isLoading={pending} className="mt-3">
        Save appointment
      </Button>
    </form>
  );
}

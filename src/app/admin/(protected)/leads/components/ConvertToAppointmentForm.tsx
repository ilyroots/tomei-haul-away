"use client";

import { useActionState, useState } from "react";
import { createAppointmentFromLead, type ActionResult } from "../actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { ErrorSummary } from "@/components/ui/ErrorSummary";

const windowOptions = ["MORNING", "AFTERNOON", "EVENING", "ANYTIME"].map((value) => ({
  value,
  label: value.charAt(0) + value.slice(1).toLowerCase(),
}));

export function ConvertToAppointmentForm({ leadId }: { leadId: string }) {
  const [scheduledDate, setScheduledDate] = useState("");
  const [arrivalWindow, setArrivalWindow] = useState("MORNING");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [crewNotes, setCrewNotes] = useState("");

  const [state, action, pending] = useActionState(
    async (_prevState: ActionResult | undefined) =>
      createAppointmentFromLead(
        leadId,
        scheduledDate,
        arrivalWindow,
        estimatedPrice ? Number(estimatedPrice) : undefined,
        crewNotes || undefined
      ),
    undefined
  );

  return (
    <form
      action={action}
      className="rounded-md border border-brand-border bg-brand-background/60 p-4"
    >
      <h3 className="mb-3 text-sm font-semibold text-brand-primary">Convert to appointment</h3>
      {state?.success === false && <ErrorSummary message={state.message} className="mb-3" />}
      {state?.success === true && (
        <p className="mb-3 text-sm font-medium text-brand-accent">
          Appointment created and lead marked as scheduled.
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="convert-date">Scheduled date</Label>
          <Input
            id="convert-date"
            name="scheduledDate"
            type="date"
            required
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="convert-window">Arrival window</Label>
          <Select
            id="convert-window"
            name="arrivalWindow"
            options={windowOptions}
            value={arrivalWindow}
            onChange={(e) => setArrivalWindow(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="convert-price">Estimated price (optional)</Label>
          <Input
            id="convert-price"
            name="estimatedPrice"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 350"
            value={estimatedPrice}
            onChange={(e) => setEstimatedPrice(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="convert-notes">Crew notes (optional)</Label>
          <Textarea
            id="convert-notes"
            name="crewNotes"
            placeholder="Gate codes, access notes, etc."
            value={crewNotes}
            onChange={(e) => setCrewNotes(e.target.value)}
          />
        </div>
      </div>
      <Button type="submit" isLoading={pending} size="sm" className="mt-3">
        Create appointment
      </Button>
    </form>
  );
}

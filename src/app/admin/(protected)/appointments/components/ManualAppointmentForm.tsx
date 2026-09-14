"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createManualAppointment,
  type CreateAppointmentResult,
} from "../actions";
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

export function ManualAppointmentForm() {
  const router = useRouter();
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [state2, setState2] = useState("");
  const [zip, setZip] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [arrivalWindow, setArrivalWindow] = useState("MORNING");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [crewNotes, setCrewNotes] = useState("");

  const [state, action, pending] = useActionState(
    async (_prevState: CreateAppointmentResult | undefined) => {
      const result = await createManualAppointment({
        contactName,
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
        line1: line1 || undefined,
        city: city || undefined,
        state: state2 || undefined,
        zip: zip || undefined,
        scheduledDate,
        arrivalWindow,
        estimatedPrice: estimatedPrice ? Number(estimatedPrice) : undefined,
        crewNotes: crewNotes || undefined,
      });
      if (result.success) {
        router.push(`/admin/appointments/${result.appointmentId}`);
      }
      return result;
    },
    undefined
  );

  return (
    <form
      action={action}
      className="rounded-lg border border-brand-border bg-brand-surface p-6 shadow-sm"
    >
      {state?.success === false && <ErrorSummary message={state.message} className="mb-4" />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="manual-name">Contact name</Label>
          <Input
            id="manual-name"
            name="contactName"
            required
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="manual-email">Email (optional)</Label>
          <Input
            id="manual-email"
            name="contactEmail"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="manual-phone">Phone (optional)</Label>
          <Input
            id="manual-phone"
            name="contactPhone"
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="manual-line1">Street address (optional)</Label>
          <Input
            id="manual-line1"
            name="line1"
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="manual-city">City</Label>
          <Input id="manual-city" name="city" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="manual-state">State</Label>
            <Input
              id="manual-state"
              name="state"
              maxLength={2}
              placeholder="CA"
              value={state2}
              onChange={(e) => setState2(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="manual-zip">ZIP</Label>
            <Input id="manual-zip" name="zip" value={zip} onChange={(e) => setZip(e.target.value)} />
          </div>
        </div>
        <div>
          <Label htmlFor="manual-date">Scheduled date</Label>
          <Input
            id="manual-date"
            name="scheduledDate"
            type="date"
            required
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="manual-window">Arrival window</Label>
          <Select
            id="manual-window"
            name="arrivalWindow"
            options={windowOptions}
            value={arrivalWindow}
            onChange={(e) => setArrivalWindow(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="manual-price">Estimated price (optional)</Label>
          <Input
            id="manual-price"
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
          <Label htmlFor="manual-notes">Crew notes (optional)</Label>
          <Textarea
            id="manual-notes"
            name="crewNotes"
            placeholder="Gate codes, access notes, etc."
            value={crewNotes}
            onChange={(e) => setCrewNotes(e.target.value)}
          />
        </div>
      </div>
      <Button type="submit" isLoading={pending} className="mt-4">
        Create appointment
      </Button>
    </form>
  );
}

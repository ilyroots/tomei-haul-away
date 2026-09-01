"use client";

import { useActionState } from "react";
import type { AvailabilityWindow } from "@prisma/client";
import {
  createAvailabilityWindow,
  updateAvailabilityWindow,
  deleteAvailabilityWindow,
  type ActionResult,
} from "../actions";
import { DAYS } from "../lib/days";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { Checkbox } from "@/components/ui/Checkbox";
import { ErrorSummary } from "@/components/ui/ErrorSummary";

const dayOptions = DAYS.map((day, index) => ({ value: String(index), label: day }));

export function AvailabilityWindowForm({ window }: { window?: AvailabilityWindow }) {
  const [state, formAction, pending] = useActionState(
    async (_prevState: ActionResult | undefined, formData: FormData) => {
      if (window) {
        return updateAvailabilityWindow(window.id, formData);
      }
      return createAvailabilityWindow(formData);
    },
    undefined
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    async (_prevState: ActionResult | undefined) => deleteAvailabilityWindow(window!.id),
    undefined
  );

  return (
    <form action={formAction} className="space-y-3">
      {(state?.success === false || deleteState?.success === false) && (
        <ErrorSummary
          message={
            state?.success === false
              ? state.message
              : deleteState?.success === false
                ? deleteState.message
                : undefined
          }
        />
      )}
      <div className="grid gap-3 sm:grid-cols-6">
        <div>
          <Label htmlFor={`day-${window?.id ?? "new"}`} className="text-cream-200">
            Day
          </Label>
          <Select
            id={`day-${window?.id ?? "new"}`}
            name="dayOfWeek"
            options={dayOptions}
            defaultValue={String(window?.dayOfWeek ?? 1)}
            className="border-charcoal-600 bg-charcoal-700 text-cream"
          />
        </div>
        <div>
          <Label htmlFor={`start-${window?.id ?? "new"}`} className="text-cream-200">
            Start
          </Label>
          <Input
            id={`start-${window?.id ?? "new"}`}
            name="startTime"
            type="time"
            defaultValue={window?.startTime ?? "08:00"}
            className="border-charcoal-600 bg-charcoal-700 text-cream"
          />
        </div>
        <div>
          <Label htmlFor={`end-${window?.id ?? "new"}`} className="text-cream-200">
            End
          </Label>
          <Input
            id={`end-${window?.id ?? "new"}`}
            name="endTime"
            type="time"
            defaultValue={window?.endTime ?? "17:00"}
            className="border-charcoal-600 bg-charcoal-700 text-cream"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={`label-${window?.id ?? "new"}`} className="text-cream-200">
            Label
          </Label>
          <Input
            id={`label-${window?.id ?? "new"}`}
            name="label"
            defaultValue={window?.label ?? ""}
            placeholder="e.g. Morning (8am–12pm)"
            className="border-charcoal-600 bg-charcoal-700 text-cream placeholder:text-charcoal-400"
          />
        </div>
        <div>
          <Label htmlFor={`max-${window?.id ?? "new"}`} className="text-cream-200">
            Max
          </Label>
          <Input
            id={`max-${window?.id ?? "new"}`}
            name="maxAppointments"
            type="number"
            min={1}
            defaultValue={window?.maxAppointments ?? 2}
            className="border-charcoal-600 bg-charcoal-700 text-cream"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Checkbox name="isActive" label="Active" defaultChecked={window ? window.isActive : true} />
        <Button type="submit" size="sm" isLoading={pending}>
          {window ? "Update" : "Add"}
        </Button>
        {window && (
          <Button formAction={deleteAction} size="sm" variant="outline" isLoading={deletePending}>
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}

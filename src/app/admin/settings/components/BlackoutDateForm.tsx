"use client";

import { useActionState } from "react";
import { createBlackoutDate, deleteBlackoutDate, type ActionResult } from "../actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { ErrorSummary } from "@/components/ui/ErrorSummary";

export function BlackoutDateForm({ id }: { id?: string }) {
  const [state, action, pending] = useActionState(
    async (_prevState: ActionResult | undefined, formData: FormData) => {
      if (id) {
        return deleteBlackoutDate(id);
      }
      return createBlackoutDate(formData);
    },
    undefined
  );

  if (id) {
    return (
      <form action={action}>
        {state?.success === false && <ErrorSummary message={state.message} className="mb-2" />}
        <Button type="submit" size="sm" variant="outline" isLoading={pending}>
          Delete
        </Button>
      </form>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      {state?.success === false && <ErrorSummary message={state.message} className="sm:w-full" />}
      <div className="flex-1">
        <Label htmlFor="blackout-date" className="text-cream-200">
          Date
        </Label>
        <Input
          id="blackout-date"
          name="date"
          type="date"
          required
          className="border-charcoal-600 bg-charcoal-700 text-cream"
        />
      </div>
      <div className="flex-[2]">
        <Label htmlFor="blackout-reason" className="text-cream-200">
          Reason
        </Label>
        <Input
          id="blackout-reason"
          name="reason"
          placeholder="e.g. Holiday closure"
          className="border-charcoal-600 bg-charcoal-700 text-cream placeholder:text-charcoal-400"
        />
      </div>
      <Button type="submit" isLoading={pending}>
        Add blackout
      </Button>
    </form>
  );
}

"use client";

import { useActionState, useState } from "react";
import { updateLeadPrice, type ActionResult } from "../actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { ErrorSummary } from "@/components/ui/ErrorSummary";

export function PriceUpdateForm({
  leadId,
  estimatedPriceMin,
  estimatedPriceMax,
}: {
  leadId: string;
  estimatedPriceMin: number | null;
  estimatedPriceMax: number | null;
}) {
  const [min, setMin] = useState(estimatedPriceMin ?? "");
  const [max, setMax] = useState(estimatedPriceMax ?? "");

  const [state, action, pending] = useActionState(
    async (_prevState: ActionResult | undefined) =>
      updateLeadPrice(
        leadId,
        min === "" ? undefined : Number(min),
        max === "" ? undefined : Number(max)
      ),
    undefined
  );

  return (
    <form action={action} className="space-y-3">
      {state?.success === false && <ErrorSummary message={state.message} />}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="min" className="text-cream-200">
            Min
          </Label>
          <Input
            id="min"
            name="min"
            type="number"
            min="0"
            step="0.01"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="border-charcoal-600 bg-charcoal-700 text-cream"
          />
        </div>
        <div>
          <Label htmlFor="max" className="text-cream-200">
            Max
          </Label>
          <Input
            id="max"
            name="max"
            type="number"
            min="0"
            step="0.01"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="border-charcoal-600 bg-charcoal-700 text-cream"
          />
        </div>
      </div>
      <Button type="submit" size="sm" isLoading={pending} className="w-full">
        Update estimate
      </Button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import type { ServiceArea } from "@prisma/client";
import { createServiceArea, updateServiceArea, type ActionResult } from "../actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Checkbox } from "@/components/ui/Checkbox";
import { ErrorSummary } from "@/components/ui/ErrorSummary";

export function ServiceAreaForm({ item }: { item?: ServiceArea }) {
  const [state, formAction, pending] = useActionState(
    async (_prevState: ActionResult | undefined, formData: FormData) => {
      if (item) {
        return updateServiceArea(item.id, formData);
      }
      return createServiceArea(formData);
    },
    undefined
  );

  return (
    <form action={formAction} className="space-y-3">
      {state?.success === false && <ErrorSummary message={state.message} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label
            htmlFor={`city-${item?.id ?? "new"}`}
            className="text-brand-background/80"
            isRequired
          >
            City
          </Label>
          <Input
            id={`city-${item?.id ?? "new"}`}
            name="city"
            defaultValue={item?.city ?? ""}
            required
            className="border-brand-text/30 bg-brand-text/90 text-brand-background"
          />
        </div>
        <div>
          <Label
            htmlFor={`zip-${item?.id ?? "new"}`}
            className="text-brand-background/80"
            isRequired
          >
            ZIP
          </Label>
          <Input
            id={`zip-${item?.id ?? "new"}`}
            name="zip"
            defaultValue={item?.zip ?? ""}
            required
            className="border-brand-text/30 bg-brand-text/90 text-brand-background"
          />
        </div>
      </div>
      <div>
        <Label htmlFor={`content-${item?.id ?? "new"}`} className="text-brand-background/80">
          Page content
        </Label>
        <Textarea
          id={`content-${item?.id ?? "new"}`}
          name="pageContent"
          defaultValue={item?.pageContent ?? ""}
          className="border-brand-text/30 bg-brand-text/90 text-brand-background"
          rows={4}
        />
      </div>
      <div className="flex items-center gap-4">
        <Checkbox name="isActive" label="Active" defaultChecked={item ? item.isActive : true} />
        <Button type="submit" size="sm" isLoading={pending}>
          {item ? "Update" : "Add"}
        </Button>
      </div>
    </form>
  );
}

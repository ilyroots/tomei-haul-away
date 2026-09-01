"use client";

import { useActionState } from "react";
import type { Service } from "@prisma/client";
import { createService, updateService, type ActionResult } from "../actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Checkbox } from "@/components/ui/Checkbox";
import { ErrorSummary } from "@/components/ui/ErrorSummary";

export function ServiceForm({ item }: { item?: Service }) {
  const [state, formAction, pending] = useActionState(
    async (_prevState: ActionResult | undefined, formData: FormData) => {
      if (item) {
        return updateService(item.id, formData);
      }
      return createService(formData);
    },
    undefined
  );

  return (
    <form action={formAction} className="space-y-3">
      {state?.success === false && <ErrorSummary message={state.message} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`slug-${item?.id ?? "new"}`} className="text-cream-200" isRequired>
            Slug
          </Label>
          <Input
            id={`slug-${item?.id ?? "new"}`}
            name="slug"
            defaultValue={item?.slug ?? ""}
            required
            className="border-charcoal-600 bg-charcoal-700 text-cream"
          />
        </div>
        <div>
          <Label htmlFor={`title-${item?.id ?? "new"}`} className="text-cream-200" isRequired>
            Title
          </Label>
          <Input
            id={`title-${item?.id ?? "new"}`}
            name="title"
            defaultValue={item?.title ?? ""}
            required
            className="border-charcoal-600 bg-charcoal-700 text-cream"
          />
        </div>
      </div>
      <div>
        <Label htmlFor={`short-${item?.id ?? "new"}`} className="text-cream-200" isRequired>
          Short description
        </Label>
        <Textarea
          id={`short-${item?.id ?? "new"}`}
          name="shortDescription"
          defaultValue={item?.shortDescription ?? ""}
          required
          className="border-charcoal-600 bg-charcoal-700 text-cream"
          rows={2}
        />
      </div>
      <div>
        <Label htmlFor={`desc-${item?.id ?? "new"}`} className="text-cream-200" isRequired>
          Description
        </Label>
        <Textarea
          id={`desc-${item?.id ?? "new"}`}
          name="description"
          defaultValue={item?.description ?? ""}
          required
          className="border-charcoal-600 bg-charcoal-700 text-cream"
          rows={4}
        />
      </div>
      <div className="flex items-center gap-4">
        <div className="w-32">
          <Label htmlFor={`sort-${item?.id ?? "new"}`} className="text-cream-200">
            Sort order
          </Label>
          <Input
            id={`sort-${item?.id ?? "new"}`}
            name="sortOrder"
            type="number"
            defaultValue={item?.sortOrder ?? 0}
            className="border-charcoal-600 bg-charcoal-700 text-cream"
          />
        </div>
        <Checkbox name="isActive" label="Active" defaultChecked={item ? item.isActive : true} />
        <Button type="submit" size="sm" isLoading={pending}>
          {item ? "Update" : "Add"}
        </Button>
      </div>
    </form>
  );
}

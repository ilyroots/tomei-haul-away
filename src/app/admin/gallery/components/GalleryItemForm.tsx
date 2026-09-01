"use client";

import { useActionState } from "react";
import type { GalleryItem } from "@prisma/client";
import { createGalleryItem, updateGalleryItem, type ActionResult } from "../actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Checkbox } from "@/components/ui/Checkbox";
import { ErrorSummary } from "@/components/ui/ErrorSummary";

export function GalleryItemForm({ item }: { item?: GalleryItem }) {
  const [state, formAction, pending] = useActionState(
    async (_prevState: ActionResult | undefined, formData: FormData) => {
      if (item) {
        return updateGalleryItem(item.id, formData);
      }
      return createGalleryItem(formData);
    },
    undefined
  );

  return (
    <form action={formAction} className="space-y-3">
      {state?.success === false && <ErrorSummary message={state.message} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`title-${item?.id ?? "new"}`} className="text-cream-200">
            Title
          </Label>
          <Input
            id={`title-${item?.id ?? "new"}`}
            name="title"
            defaultValue={item?.title ?? ""}
            className="border-charcoal-600 bg-charcoal-700 text-cream"
          />
        </div>
        <div>
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
      </div>
      <div>
        <Label htmlFor={`desc-${item?.id ?? "new"}`} className="text-cream-200">
          Description
        </Label>
        <Textarea
          id={`desc-${item?.id ?? "new"}`}
          name="description"
          defaultValue={item?.description ?? ""}
          className="border-charcoal-600 bg-charcoal-700 text-cream"
          rows={2}
        />
      </div>
      <div>
        <Label htmlFor={`photo-${item?.id ?? "new"}`} className="text-cream-200">
          Photo {item ? "(replace)" : ""}
        </Label>
        <Input
          id={`photo-${item?.id ?? "new"}`}
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required={!item}
          className="border-charcoal-600 bg-charcoal-700 text-cream file:text-cream"
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

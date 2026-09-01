"use client";

import { useActionState } from "react";
import type { Testimonial } from "@prisma/client";
import { createTestimonial, updateTestimonial, type ActionResult } from "../actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Checkbox } from "@/components/ui/Checkbox";
import { ErrorSummary } from "@/components/ui/ErrorSummary";

export function TestimonialForm({ item }: { item?: Testimonial }) {
  const [state, formAction, pending] = useActionState(
    async (_prevState: ActionResult | undefined, formData: FormData) => {
      if (item) {
        return updateTestimonial(item.id, formData);
      }
      return createTestimonial(formData);
    },
    undefined
  );

  return (
    <form action={formAction} className="space-y-3">
      {state?.success === false && <ErrorSummary message={state.message} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label
            htmlFor={`author-${item?.id ?? "new"}`}
            className="text-brand-background/80"
            isRequired
          >
            Author name
          </Label>
          <Input
            id={`author-${item?.id ?? "new"}`}
            name="authorName"
            defaultValue={item?.authorName ?? ""}
            required
            className="border-brand-text/30 bg-brand-text/90 text-brand-background"
          />
        </div>
        <div>
          <Label htmlFor={`location-${item?.id ?? "new"}`} className="text-brand-background/80">
            Location
          </Label>
          <Input
            id={`location-${item?.id ?? "new"}`}
            name="location"
            defaultValue={item?.location ?? ""}
            className="border-brand-text/30 bg-brand-text/90 text-brand-background"
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-3">
          <Label
            htmlFor={`content-${item?.id ?? "new"}`}
            className="text-brand-background/80"
            isRequired
          >
            Content
          </Label>
          <Textarea
            id={`content-${item?.id ?? "new"}`}
            name="content"
            defaultValue={item?.content ?? ""}
            required
            className="border-brand-text/30 bg-brand-text/90 text-brand-background"
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor={`rating-${item?.id ?? "new"}`} className="text-brand-background/80">
            Rating
          </Label>
          <Input
            id={`rating-${item?.id ?? "new"}`}
            name="rating"
            type="number"
            min={1}
            max={5}
            defaultValue={item?.rating ?? ""}
            className="border-brand-text/30 bg-brand-text/90 text-brand-background"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Checkbox
          name="isApproved"
          label="Approved"
          defaultChecked={item ? item.isApproved : false}
        />
        <Button type="submit" size="sm" isLoading={pending}>
          {item ? "Update" : "Add"}
        </Button>
      </div>
    </form>
  );
}

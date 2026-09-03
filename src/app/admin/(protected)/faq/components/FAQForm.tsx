"use client";

import { useActionState } from "react";
import type { FAQ } from "@prisma/client";
import { createFAQ, updateFAQ, type ActionResult } from "../actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Checkbox } from "@/components/ui/Checkbox";
import { ErrorSummary } from "@/components/ui/ErrorSummary";

export function FAQForm({ item }: { item?: FAQ }) {
  const [state, formAction, pending] = useActionState(
    async (_prevState: ActionResult | undefined, formData: FormData) => {
      if (item) {
        return updateFAQ(item.id, formData);
      }
      return createFAQ(formData);
    },
    undefined
  );

  return (
    <form action={formAction} className="space-y-3">
      {state?.success === false && <ErrorSummary message={state.message} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`question-${item?.id ?? "new"}`} className="text-brand-muted" isRequired>
            Question
          </Label>
          <Input
            id={`question-${item?.id ?? "new"}`}
            name="question"
            defaultValue={item?.question ?? ""}
            required
            className="border-brand-border bg-brand-surface text-brand-text"
          />
        </div>
        <div>
          <Label htmlFor={`category-${item?.id ?? "new"}`} className="text-brand-muted">
            Category
          </Label>
          <Input
            id={`category-${item?.id ?? "new"}`}
            name="category"
            defaultValue={item?.category ?? ""}
            className="border-brand-border bg-brand-surface text-brand-text"
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-3">
          <Label htmlFor={`answer-${item?.id ?? "new"}`} className="text-brand-muted" isRequired>
            Answer
          </Label>
          <Textarea
            id={`answer-${item?.id ?? "new"}`}
            name="answer"
            defaultValue={item?.answer ?? ""}
            required
            className="border-brand-border bg-brand-surface text-brand-text"
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor={`sort-${item?.id ?? "new"}`} className="text-brand-muted">
            Sort order
          </Label>
          <Input
            id={`sort-${item?.id ?? "new"}`}
            name="sortOrder"
            type="number"
            defaultValue={item?.sortOrder ?? 0}
            className="border-brand-border bg-brand-surface text-brand-text"
          />
        </div>
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

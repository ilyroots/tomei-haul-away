"use client";

import { useActionState } from "react";
import { toggleTestimonialApproval, type ActionResult } from "../actions";
import { Button } from "@/components/ui/Button";

export function ToggleApprovalButton({ id, isApproved }: { id: string; isApproved: boolean }) {
  const [, action, pending] = useActionState(
    async (_prevState: ActionResult | undefined, _formData: FormData) =>
      toggleTestimonialApproval(id, !isApproved),
    undefined
  );

  return (
    <form action={action}>
      <Button type="submit" size="sm" variant="outline" isLoading={pending}>
        {isApproved ? "Unapprove" : "Approve"}
      </Button>
    </form>
  );
}

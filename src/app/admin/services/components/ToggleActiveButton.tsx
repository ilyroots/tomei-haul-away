"use client";

import { useActionState } from "react";
import { toggleServiceActive, type ActionResult } from "../actions";
import { Button } from "@/components/ui/Button";

export function ToggleActiveButton({ id, isActive }: { id: string; isActive: boolean }) {
  const [, action, pending] = useActionState(
    async (_prevState: ActionResult | undefined, _formData: FormData) =>
      toggleServiceActive(id, !isActive),
    undefined
  );

  return (
    <form action={action}>
      <Button type="submit" size="sm" variant="outline" isLoading={pending}>
        {isActive ? "Deactivate" : "Activate"}
      </Button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { deleteService, type ActionResult } from "../actions";
import { Button } from "@/components/ui/Button";

export function DeleteButton({ id }: { id: string }) {
  const [, action, pending] = useActionState(
    async (_prevState: ActionResult | undefined, _formData: FormData) => deleteService(id),
    undefined
  );

  return (
    <form action={action}>
      <Button type="submit" size="sm" variant="outline" isLoading={pending}>
        Delete
      </Button>
    </form>
  );
}

"use client";

import { useActionState, useState } from "react";
import { addInternalNote, type ActionResult } from "../actions";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { ErrorSummary } from "@/components/ui/ErrorSummary";

export function NoteForm({ leadId }: { leadId: string }) {
  const [content, setContent] = useState("");

  const [state, action, pending] = useActionState(async (_prevState: ActionResult | undefined) => {
    const result = await addInternalNote(leadId, content);
    if (result.success) {
      setContent("");
    }
    return result;
  }, undefined);

  return (
    <form action={action} className="space-y-3">
      {state?.success === false && <ErrorSummary message={state.message} />}
      <Textarea
        name="content"
        placeholder="Add an internal note..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
      />
      <Button type="submit" size="sm" isLoading={pending}>
        Add note
      </Button>
    </form>
  );
}

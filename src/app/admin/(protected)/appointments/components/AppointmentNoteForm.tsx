"use client";

import { useActionState, useState } from "react";
import { addAppointmentNote, type getAppointmentById, type ActionResult } from "../actions";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { ErrorSummary } from "@/components/ui/ErrorSummary";

export function AppointmentNoteForm({
  appointmentId,
  notes,
}: {
  appointmentId: string;
  notes: NonNullable<Awaited<ReturnType<typeof getAppointmentById>>>["notes"];
}) {
  const [content, setContent] = useState("");
  const [state, action, pending] = useActionState(async (_prevState: ActionResult | undefined) => {
    const result = await addAppointmentNote(appointmentId, content);
    if (result.success) setContent("");
    return result;
  }, undefined);

  return (
    <section className="rounded-lg border border-brand-border bg-brand-surface p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-brand-primary">Internal notes</h2>
      {state?.success === false && <ErrorSummary message={state.message} className="mb-4" />}
      <form action={action} className="space-y-3">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a note..."
          rows={3}
        />
        <Button type="submit" size="sm" isLoading={pending}>
          Add note
        </Button>
      </form>
      <div className="mt-6 space-y-4">
        {notes.length === 0 ? (
          <p className="text-brand-muted">No notes yet.</p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="rounded-md border border-brand-border bg-brand-background/60 p-4"
            >
              <p className="whitespace-pre-wrap text-brand-text">{note.content}</p>
              <p className="mt-2 text-xs text-brand-muted">
                {note.author.name || note.author.email} ·{" "}
                {new Date(note.createdAt).toLocaleString("en-US")}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

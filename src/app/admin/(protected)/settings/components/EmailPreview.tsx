"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import type { EmailTemplateName } from "../actions";

export function EmailPreview({
  templates,
  previewAction,
}: {
  templates: { value: EmailTemplateName; label: string }[];
  previewAction: (template: EmailTemplateName) => Promise<string>;
}) {
  const [template, setTemplate] = useState<EmailTemplateName>(
    templates[0]?.value ?? "quoteReceived"
  );
  const [state, action, pending] = useActionState(
    async (_prevState: string | undefined, _formData: FormData) => previewAction(template),
    undefined
  );

  return (
    <div className="space-y-4">
      <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Label htmlFor="template" className="text-brand-background/80">
            Template
          </Label>
          <Select
            id="template"
            options={templates}
            value={template}
            onChange={(e) => setTemplate(e.target.value as EmailTemplateName)}
            className="border-brand-text/30 bg-brand-text/90 text-brand-background"
          />
        </div>
        <Button type="submit" isLoading={pending}>
          Preview
        </Button>
      </form>

      {state && (
        <div className="rounded-md border border-brand-text/30 bg-brand-surface p-4">
          <iframe
            title="Email preview"
            srcDoc={state}
            className="h-96 w-full rounded-md border border-brand-border"
            sandbox=""
          />
        </div>
      )}
    </div>
  );
}

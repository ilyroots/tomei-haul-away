import { cn } from "@/lib/utils";
import type { FieldErrors, FieldError, FieldValues } from "react-hook-form";

export type SimpleFieldErrors = Record<string, string[] | undefined>;

export interface ErrorSummaryProps {
  title?: string;
  errors?: SimpleFieldErrors | FieldErrors<FieldValues>;
  message?: string;
  className?: string;
}

function extractMessages(value: string[] | FieldError | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "object" && "message" in value && value.message) {
    return [String(value.message)];
  }
  return [];
}

export function ErrorSummary({
  title = "Please correct the following errors:",
  errors,
  message,
  className,
}: ErrorSummaryProps) {
  const entries = errors
    ? Object.entries(errors)
        .map(
          ([key, value]) =>
            [key, extractMessages(value as string[] | FieldError | undefined)] as const
        )
        .filter(([, messages]) => messages.length > 0)
    : [];

  if (entries.length === 0 && !message) return null;

  return (
    <div
      className={cn("rounded-md border border-red-300 bg-red-50 p-4 text-red-900", className)}
      role="alert"
      aria-live="assertive"
    >
      {message && <p className="mb-2 font-semibold">{message}</p>}
      {entries.length > 0 && (
        <>
          <p className="mb-2 font-semibold">{title}</p>
          <ul className="list-inside list-disc space-y-1 text-sm">
            {entries.map(([field, messages]) => (
              <li key={field}>
                <span className="font-medium capitalize">{field}:</span> {messages.join(" ")}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

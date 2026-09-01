import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string | undefined | null): string {
  if (value === undefined || value === null) return "$—";
  const num = typeof value === "string" ? Number.parseFloat(value) : value;
  if (Number.isNaN(num)) return "$—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
}

function toDate(value: Date | string | number | undefined | null): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: Date | string | number | undefined | null): string {
  const date = toDate(value);
  if (!date) return "—";
  return format(date, "MMMM d, yyyy");
}

export function formatDateTime(value: Date | string | number | undefined | null): string {
  const date = toDate(value);
  if (!date) return "—";
  return format(date, "MMMM d, yyyy 'at' h:mm a");
}

export function formatShortDate(value: Date | string | number | undefined | null): string {
  const date = toDate(value);
  if (!date) return "—";
  return format(date, "M/d/yyyy");
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

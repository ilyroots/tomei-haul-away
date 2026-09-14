import Link from "next/link";
import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { getAppointments } from "../actions";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseMonth(month: string): Date {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return startOfMonth(new Date());
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  if (monthIndex < 0 || monthIndex > 11) return startOfMonth(new Date());
  return startOfMonth(new Date(year, monthIndex, 1));
}

export async function AppointmentsCalendar({ month }: { month: string }) {
  const monthStart = parseMonth(month);

  const result = await getAppointments({
    dateFrom: startOfMonth(monthStart).toISOString(),
    dateTo: endOfMonth(monthStart).toISOString(),
    pageSize: 100,
  });

  const byDay = new Map<string, typeof result.appointments>();
  for (const appointment of result.appointments) {
    const key = format(appointment.scheduledDate, "yyyy-MM-dd");
    const list = byDay.get(key) ?? [];
    list.push(appointment);
    byDay.set(key, list);
  }

  const gridStart = startOfWeek(monthStart); // Sunday
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  const prevMonth = format(addMonths(monthStart, -1), "yyyy-MM");
  const nextMonth = format(addMonths(monthStart, 1), "yyyy-MM");
  const currentMonth = format(new Date(), "yyyy-MM");

  return (
    <div className="rounded-lg border border-brand-border bg-brand-surface p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-brand-primary">{format(monthStart, "MMMM yyyy")}</h2>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/appointments?view=calendar&month=${prevMonth}`}>Previous</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/appointments?view=calendar&month=${currentMonth}`}>Today</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/appointments?view=calendar&month=${nextMonth}`}>Next</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-md border border-brand-border bg-brand-border">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="bg-brand-primary px-2 py-1.5 text-center text-xs font-semibold uppercase tracking-wider text-brand-background"
          >
            {label}
          </div>
        ))}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const appointments = byDay.get(key) ?? [];
          return (
            <div
              key={key}
              className={cn(
                "min-h-24 bg-brand-surface p-1.5",
                !isSameMonth(day, monthStart) && "bg-brand-background/60",
                isToday(day) && "ring-2 ring-inset ring-brand-accent"
              )}
            >
              <p
                className={cn(
                  "text-xs font-medium",
                  isSameMonth(day, monthStart) ? "text-brand-text" : "text-brand-muted/60"
                )}
              >
                {format(day, "d")}
              </p>
              <div className="mt-1 space-y-1">
                {appointments.map((appointment) => (
                  <Link
                    key={appointment.id}
                    href={`/admin/appointments/${appointment.id}`}
                    className={cn(
                      "block truncate rounded bg-brand-primary px-1.5 py-0.5 text-xs text-brand-background hover:bg-brand-navy-hover",
                      (appointment.status === "CANCELLED" || appointment.status === "DECLINED") &&
                        "opacity-60"
                    )}
                  >
                    {appointment.contactName ?? "Manual"}
                    {appointment.arrivalWindow ? ` · ${appointment.arrivalWindow}` : ""} ·{" "}
                    {appointment.status.replace(/_/g, " ")}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

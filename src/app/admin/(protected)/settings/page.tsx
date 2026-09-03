import {
  getBusinessSettings,
  getAvailabilityWindows,
  getBlackoutDates,
  previewEmailTemplate,
  type EmailTemplateName,
} from "./actions";
import { DAYS } from "./lib/days";
import { AvailabilityWindowForm } from "./components/AvailabilityWindowForm";
import { BlackoutDateForm } from "./components/BlackoutDateForm";
import { EmailPreview } from "./components/EmailPreview";
import { BusinessSettingsForm } from "./components/BusinessSettingsForm";

const templateOptions: { value: EmailTemplateName; label: string }[] = [
  { value: "quoteReceived", label: "Quote received" },
  { value: "moreInfoRequested", label: "More info requested" },
  { value: "quoteReady", label: "Quote ready" },
  { value: "appointmentConfirmed", label: "Appointment confirmed" },
  { value: "appointmentChanged", label: "Appointment changed" },
  { value: "appointmentCancelled", label: "Appointment cancelled" },
  { value: "appointmentReminder", label: "Appointment reminder" },
  { value: "internalNewLead", label: "Internal new lead" },
];

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}

export default async function SettingsPage() {
  const [settings, windows, blackoutDates] = await Promise.all([
    getBusinessSettings(),
    getAvailabilityWindows(),
    getBlackoutDates(),
  ]);

  return (
    <div className="space-y-10">
      <div className="mb-6 lg:mb-8">
        <h1 className="font-headline text-2xl lg:text-3xl font-bold text-brand-primary">
          Settings
        </h1>
        <p className="mt-1 text-sm text-brand-muted">
          Configure business details, availability, and blackout dates.
        </p>
      </div>

      <BusinessSettingsForm settings={settings} />

      <section className="bg-brand-surface rounded-lg border border-brand-border shadow-sm p-6">
        <h2 className="mb-4 text-lg font-semibold text-brand-primary">Availability windows</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-primary text-brand-background text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Day</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Max appointments</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {windows.map((window) => (
                <tr
                  key={window.id}
                  className="border-t border-brand-border hover:bg-brand-background/60"
                >
                  <td className="px-4 py-3 text-brand-text">{DAYS[window.dayOfWeek]}</td>
                  <td className="px-4 py-3 text-brand-muted">
                    {formatTime(window.startTime)} – {formatTime(window.endTime)}
                  </td>
                  <td className="px-4 py-3 text-brand-muted">{window.label || "—"}</td>
                  <td className="px-4 py-3 text-brand-muted">{window.maxAppointments}</td>
                  <td className="px-4 py-3 text-brand-muted">{window.isActive ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">
                    <AvailabilityWindowForm window={window} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 border-t border-brand-border pt-6">
          <h3 className="mb-3 text-lg font-semibold text-brand-primary">Add availability window</h3>
          <AvailabilityWindowForm />
        </div>
      </section>

      <section className="bg-brand-surface rounded-lg border border-brand-border shadow-sm p-6">
        <h2 className="mb-4 text-lg font-semibold text-brand-primary">Blackout dates</h2>
        <ul className="space-y-3">
          {blackoutDates.map((date) => (
            <li
              key={date.id}
              className="flex items-center justify-between rounded-md border border-brand-border bg-brand-background p-4"
            >
              <div>
                <p className="font-medium text-brand-text">
                  {new Date(date.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                {date.reason && <p className="text-sm text-brand-muted">{date.reason}</p>}
              </div>
              <BlackoutDateForm id={date.id} />
            </li>
          ))}
          {blackoutDates.length === 0 && (
            <p className="text-sm text-brand-muted">No blackout dates configured.</p>
          )}
        </ul>
        <div className="mt-6 border-t border-brand-border pt-6">
          <h3 className="mb-3 text-lg font-semibold text-brand-primary">Add blackout date</h3>
          <BlackoutDateForm />
        </div>
      </section>

      <section className="bg-brand-surface rounded-lg border border-brand-border shadow-sm p-6">
        <h2 className="mb-4 text-lg font-semibold text-brand-primary">Email template preview</h2>
        <EmailPreview templates={templateOptions} previewAction={previewEmailTemplate} />
      </section>
    </div>
  );
}

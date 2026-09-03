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
      <div>
        <h1 className="text-3xl font-bold text-brand-background">Settings</h1>
        <p className="mt-1 text-brand-background/80">
          Configure business details, availability, and blackout dates.
        </p>
      </div>

      <BusinessSettingsForm settings={settings} />

      <section className="rounded-lg bg-brand-primary p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-brand-background">Availability windows</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-text/70 text-brand-background/80">
              <tr>
                <th className="px-4 py-3">Day</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Max appointments</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-700">
              {windows.map((window) => (
                <tr key={window.id} className="hover:bg-brand-text/20">
                  <td className="px-4 py-3 text-brand-background">{DAYS[window.dayOfWeek]}</td>
                  <td className="px-4 py-3 text-brand-background/80">
                    {formatTime(window.startTime)} – {formatTime(window.endTime)}
                  </td>
                  <td className="px-4 py-3 text-brand-background/80">{window.label || "—"}</td>
                  <td className="px-4 py-3 text-brand-background/80">{window.maxAppointments}</td>
                  <td className="px-4 py-3 text-brand-background/80">
                    {window.isActive ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3">
                    <AvailabilityWindowForm window={window} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 border-t border-brand-background/20 pt-6">
          <h3 className="mb-3 text-lg font-semibold text-brand-background">
            Add availability window
          </h3>
          <AvailabilityWindowForm />
        </div>
      </section>

      <section className="rounded-lg bg-brand-primary p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-brand-background">Blackout dates</h2>
        <ul className="space-y-3">
          {blackoutDates.map((date) => (
            <li
              key={date.id}
              className="flex items-center justify-between rounded-md border border-brand-text/30 bg-brand-text/70 p-4"
            >
              <div>
                <p className="font-medium text-brand-background">
                  {new Date(date.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                {date.reason && <p className="text-sm text-brand-background/80">{date.reason}</p>}
              </div>
              <BlackoutDateForm id={date.id} />
            </li>
          ))}
          {blackoutDates.length === 0 && (
            <p className="text-brand-background/80">No blackout dates configured.</p>
          )}
        </ul>
        <div className="mt-6 border-t border-brand-background/20 pt-6">
          <h3 className="mb-3 text-lg font-semibold text-brand-background">Add blackout date</h3>
          <BlackoutDateForm />
        </div>
      </section>

      <section className="rounded-lg bg-brand-primary p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-brand-background">Email template preview</h2>
        <EmailPreview templates={templateOptions} previewAction={previewEmailTemplate} />
      </section>
    </div>
  );
}

"use client";

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import type { BusinessSettings } from "../actions";

export function BusinessSettingsForm({ settings }: { settings: BusinessSettings }) {
  return (
    <section className="bg-brand-surface rounded-lg border border-brand-border shadow-sm p-6">
      <h2 className="mb-4 text-lg font-semibold text-brand-primary">Business settings</h2>
      <p className="mb-4 text-sm text-brand-muted">
        These values are read from environment variables. Update your deployment environment to
        change them.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="businessTimezone" className="text-brand-muted">
            Timezone
          </Label>
          <Input id="businessTimezone" value={settings.businessTimezone} readOnly />
        </div>
        <div>
          <Label htmlFor="adminEmail" className="text-brand-muted">
            Admin email
          </Label>
          <Input id="adminEmail" value={settings.adminEmail} readOnly />
        </div>
        <div>
          <Label htmlFor="notificationEmail" className="text-brand-muted">
            Notification email
          </Label>
          <Input id="notificationEmail" value={settings.notificationEmail} readOnly />
        </div>
        <div>
          <Label htmlFor="phone" className="text-brand-muted">
            Phone
          </Label>
          <Input id="phone" value={settings.phone} readOnly />
        </div>
        <div>
          <Label htmlFor="textNumber" className="text-brand-muted">
            Text number
          </Label>
          <Input id="textNumber" value={settings.textNumber} readOnly />
        </div>
      </div>
    </section>
  );
}

"use client";

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import type { BusinessSettings } from "../actions";

export function BusinessSettingsForm({ settings }: { settings: BusinessSettings }) {
  return (
    <section className="rounded-lg bg-brand-primary p-6 shadow">
      <h2 className="mb-4 text-xl font-bold text-brand-background">Business settings</h2>
      <p className="mb-4 text-sm text-brand-background/80">
        These values are read from environment variables. Update your deployment environment to
        change them.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="businessTimezone" className="text-brand-background/80">
            Timezone
          </Label>
          <Input
            id="businessTimezone"
            value={settings.businessTimezone}
            readOnly
            className="border-brand-text/30 bg-brand-text/90 text-brand-background"
          />
        </div>
        <div>
          <Label htmlFor="adminEmail" className="text-brand-background/80">
            Admin email
          </Label>
          <Input
            id="adminEmail"
            value={settings.adminEmail}
            readOnly
            className="border-brand-text/30 bg-brand-text/90 text-brand-background"
          />
        </div>
        <div>
          <Label htmlFor="notificationEmail" className="text-brand-background/80">
            Notification email
          </Label>
          <Input
            id="notificationEmail"
            value={settings.notificationEmail}
            readOnly
            className="border-brand-text/30 bg-brand-text/90 text-brand-background"
          />
        </div>
        <div>
          <Label htmlFor="phone" className="text-brand-background/80">
            Phone
          </Label>
          <Input
            id="phone"
            value={settings.phone}
            readOnly
            className="border-brand-text/30 bg-brand-text/90 text-brand-background"
          />
        </div>
        <div>
          <Label htmlFor="textNumber" className="text-brand-background/80">
            Text number
          </Label>
          <Input
            id="textNumber"
            value={settings.textNumber}
            readOnly
            className="border-brand-text/30 bg-brand-text/90 text-brand-background"
          />
        </div>
      </div>
    </section>
  );
}

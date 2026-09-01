"use client";

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import type { BusinessSettings } from "../actions";

export function BusinessSettingsForm({ settings }: { settings: BusinessSettings }) {
  return (
    <section className="rounded-lg bg-navy p-6 shadow">
      <h2 className="mb-4 text-xl font-bold text-cream">Business settings</h2>
      <p className="mb-4 text-sm text-cream-200">
        These values are read from environment variables. Update your deployment environment to
        change them.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="businessTimezone" className="text-cream-200">
            Timezone
          </Label>
          <Input
            id="businessTimezone"
            value={settings.businessTimezone}
            readOnly
            className="border-charcoal-600 bg-charcoal-700 text-cream"
          />
        </div>
        <div>
          <Label htmlFor="adminEmail" className="text-cream-200">
            Admin email
          </Label>
          <Input
            id="adminEmail"
            value={settings.adminEmail}
            readOnly
            className="border-charcoal-600 bg-charcoal-700 text-cream"
          />
        </div>
        <div>
          <Label htmlFor="notificationEmail" className="text-cream-200">
            Notification email
          </Label>
          <Input
            id="notificationEmail"
            value={settings.notificationEmail}
            readOnly
            className="border-charcoal-600 bg-charcoal-700 text-cream"
          />
        </div>
        <div>
          <Label htmlFor="phone" className="text-cream-200">
            Phone
          </Label>
          <Input
            id="phone"
            value={settings.phone}
            readOnly
            className="border-charcoal-600 bg-charcoal-700 text-cream"
          />
        </div>
        <div>
          <Label htmlFor="textNumber" className="text-cream-200">
            Text number
          </Label>
          <Input
            id="textNumber"
            value={settings.textNumber}
            readOnly
            className="border-charcoal-600 bg-charcoal-700 text-cream"
          />
        </div>
      </div>
    </section>
  );
}

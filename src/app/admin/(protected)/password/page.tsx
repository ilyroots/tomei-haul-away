"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { changePassword } from "./actions";

export default function ChangePasswordPage() {
  const [state, action, pending] = useActionState(changePassword, null);
  return (
    <div className="max-w-lg pt-10 lg:pt-0">
      <h1 className="text-3xl font-bold text-brand-primary">Change password</h1>
      <p className="mt-3">Choose a unique password with at least 12 characters.</p>
      {state && (
        <p role={state.success ? "status" : "alert"} className="mt-4 rounded-md bg-brand-surface p-3">
          {state.message}
        </p>
      )}
      <form action={action} className="mt-6 space-y-5 rounded-lg border border-brand-border bg-brand-surface p-5">
        <div>
          <Label htmlFor="current">Current password</Label>
          <Input id="current" name="current" type="password" autoComplete="current-password" required />
        </div>
        <div>
          <Label htmlFor="next">New password</Label>
          <Input id="next" name="next" type="password" autoComplete="new-password" minLength={12} maxLength={72} required />
        </div>
        <div>
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={12} maxLength={72} required />
        </div>
        <Button type="submit" isLoading={pending}>Save new password</Button>
      </form>
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { loginAdmin, type LoginResult } from "./actions";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { ErrorSummary } from "@/components/ui/ErrorSummary";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(
    async (_prevState: LoginResult | undefined, formData: FormData) => loginAdmin(formData),
    undefined
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-primary px-4">
      <div className="w-full max-w-md rounded-lg bg-brand-text p-8 shadow-xl">
        <h1 className="mb-2 text-center font-headline text-3xl font-bold text-brand-background">
          Tomei Admin
        </h1>
        <p className="mb-8 text-center text-brand-background/80">
          Sign in to manage leads and appointments.
        </p>

        {state?.success === false && (
          <ErrorSummary message={state.message} errors={state.errors} className="mb-6" />
        )}

        <form action={action} className="space-y-5">
          <div>
            <Label htmlFor="email" isRequired className="text-brand-background/80">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" isRequired className="text-brand-background/80">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          <Button type="submit" isLoading={pending} className="w-full">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}

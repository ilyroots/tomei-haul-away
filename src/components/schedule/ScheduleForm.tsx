"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm, Controller, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { scheduleRequestSchema, type ScheduleRequestInput } from "@/lib/validation/schemas";
import { SERVICES, EMAIL, PHONE, formatPhone, isInServiceArea } from "@/lib/business/config";
import { normalizeZip } from "@/lib/security/helpers";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { FileUpload, type FileUploadFile } from "@/components/ui/FileUpload";
import { ErrorSummary, type SimpleFieldErrors } from "@/components/ui/ErrorSummary";
import { Turnstile } from "@/components/ui/Turnstile";
import {
  submitScheduleRequest,
  checkAvailability,
  type ScheduleResult,
} from "@/app/(public)/schedule/actions";

const SERVICE_OPTIONS = SERVICES.map((service) => ({
  value: service.slug,
  label: service.title,
}));

const ARRIVAL_WINDOW_OPTIONS = [
  { value: "", label: "Select window" },
  { value: "MORNING", label: "Morning (8am–12pm)" },
  { value: "AFTERNOON", label: "Afternoon (12pm–4pm)" },
  { value: "EVENING", label: "Evening (4pm–7pm)" },
  { value: "ANYTIME", label: "Anytime" },
];

const MAX_FILE_SIZE = Number.parseInt(
  process.env.NEXT_PUBLIC_SCHEDULE_MAX_FILE_SIZE_BYTES ?? "10485760",
  10
);

export interface ScheduleFormProps {
  submissionToken: string;
  turnstileSiteKey?: string;
}

export function ScheduleForm({ submissionToken, turnstileSiteKey }: ScheduleFormProps) {
  const router = useRouter();
  const [files, setFiles] = useState<FileUploadFile[]>([]);
  const [serverResult, setServerResult] = useState<ScheduleResult | null>(null);
  const [fieldErrors, setFieldErrors] = useState<SimpleFieldErrors | undefined>();
  const [turnstileToken, setTurnstileToken] = useState("");
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleRequestInput>({
    resolver: zodResolver(scheduleRequestSchema) as Resolver<ScheduleRequestInput>,
    mode: "onTouched",
    defaultValues: {
      serviceSlug: "",
      zip: "",
      preferredDate: undefined,
      arrivalWindow: "",
      contact: {
        name: "",
        email: "",
        phone: "",
      },
      address: {
        line1: "",
        line2: "",
        city: "",
        state: "MA",
        zip: "",
      },
      notes: "",
      photos: [],
      website: "",
      turnstileToken: "",
      startedAt: new Date().toISOString(),
    },
  });

  const [preferredDate, arrivalWindow, zip] = useWatch({
    control,
    name: ["preferredDate", "arrivalWindow", "zip"],
  }) as [Date | undefined, string | undefined, string | undefined];

  useEffect(() => {
    const updateAvailability = async () => {
      if (!preferredDate || !arrivalWindow) {
        setAvailabilityMessage(null);
        return;
      }
      const result = await checkAvailability(preferredDate, arrivalWindow);
      if (result.success) {
        setAvailabilityMessage(
          result.available
            ? `${result.remaining} of ${result.capacity} spots remaining in this window.`
            : "This window is fully booked. Please choose another date or window."
        );
      } else {
        setAvailabilityMessage(null);
      }
    };
    updateAvailability();
  }, [preferredDate, arrivalWindow]);

  const onSubmit = async (data: ScheduleRequestInput) => {
    setServerResult(null);
    setFieldErrors(undefined);

    if (turnstileSiteKey && !turnstileToken) {
      setServerResult({
        success: false,
        message: "Please complete the security check.",
      });
      return;
    }

    const formData = new FormData();
    const payload = {
      ...data,
      turnstileToken,
      submissionToken,
      photos: files.map((f) => ({
        name: f.file.name,
        size: f.file.size,
        type: f.file.type,
      })),
    };
    formData.append("data", JSON.stringify(payload));

    for (const file of files) {
      formData.append("photos", file.file);
    }

    startTransition(async () => {
      const result = await submitScheduleRequest(formData);
      if (result.success) {
        router.push(`/thank-you?ref=${encodeURIComponent(result.referenceNumber)}&scheduled=true`);
      } else {
        setServerResult(result);
        setFieldErrors(result.errors);
      }
    });
  };

  const isSubmitDisabled =
    isSubmitting || isPending || (turnstileSiteKey ? !turnstileToken : false);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto max-w-2xl space-y-6 rounded-xl bg-brand-surface p-6 shadow-sm sm:p-8"
    >
      {(serverResult && !serverResult.success) || Object.keys(errors).length > 0 ? (
        <ErrorSummary
          message={serverResult && !serverResult.success ? serverResult.message : undefined}
          errors={fieldErrors ?? errors}
        />
      ) : null}

      <div className="rounded-md border border-brand-accent/30 bg-brand-accent/10 p-4 text-brand-accent-hover">
        <p className="font-semibold">Appointment requests are not confirmed immediately.</p>
        <p className="text-sm">
          We will review your request and follow up to confirm your appointment time.
        </p>
      </div>

      <div>
        <Label htmlFor="serviceSlug" isRequired>
          Service type
        </Label>
        <Controller
          name="serviceSlug"
          control={control}
          render={({ field }) => (
            <Select
              id="serviceSlug"
              options={[{ value: "", label: "Select service" }, ...SERVICE_OPTIONS]}
              {...field}
            />
          )}
        />
        {errors.serviceSlug && (
          <p className="mt-1 text-sm text-red-700">{errors.serviceSlug.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="zip" isRequired>
          ZIP code
        </Label>
        <Input id="zip" {...register("zip")} />
        {errors.zip && <p className="mt-1 text-sm text-red-700">{errors.zip.message}</p>}
        {zip && !isInServiceArea(normalizeZip(zip)) && (
          <p className="mt-1 text-sm text-brand-accent">
            This ZIP is outside our core service area, but we will still review your request.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="preferredDate" isRequired>
            Preferred date
          </Label>
          <Input id="preferredDate" type="date" {...register("preferredDate")} />
          {errors.preferredDate && (
            <p className="mt-1 text-sm text-red-700">{errors.preferredDate.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="arrivalWindow" isRequired>
            Arrival window
          </Label>
          <Controller
            name="arrivalWindow"
            control={control}
            render={({ field }) => (
              <Select
                id="arrivalWindow"
                options={ARRIVAL_WINDOW_OPTIONS}
                {...field}
                value={field.value ?? ""}
              />
            )}
          />
          {errors.arrivalWindow && (
            <p className="mt-1 text-sm text-red-700">{errors.arrivalWindow.message}</p>
          )}
        </div>
      </div>

      {availabilityMessage && (
        <p
          className={`text-sm ${
            availabilityMessage.includes("fully booked") ? "text-red-700" : "text-sage"
          }`}
        >
          {availabilityMessage}
        </p>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-brand-primary">Contact Information</h3>
        <div>
          <Label htmlFor="contact.name" isRequired>
            Name
          </Label>
          <Input id="contact.name" {...register("contact.name")} />
          {errors.contact?.name && (
            <p className="mt-1 text-sm text-red-700">{errors.contact.name.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="contact.email" isRequired>
            Email
          </Label>
          <Input id="contact.email" type="email" {...register("contact.email")} />
          {errors.contact?.email && (
            <p className="mt-1 text-sm text-red-700">{errors.contact.email.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="contact.phone">Phone</Label>
          <Input id="contact.phone" type="tel" {...register("contact.phone")} />
          {errors.contact?.phone && (
            <p className="mt-1 text-sm text-red-700">{errors.contact.phone.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-brand-primary">Address</h3>
        <div>
          <Label htmlFor="address.line1" isRequired>
            Address line 1
          </Label>
          <Input id="address.line1" {...register("address.line1")} />
          {errors.address?.line1 && (
            <p className="mt-1 text-sm text-red-700">{errors.address.line1.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="address.line2">Address line 2</Label>
          <Input id="address.line2" {...register("address.line2")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Label htmlFor="address.city" isRequired>
              City
            </Label>
            <Input id="address.city" {...register("address.city")} />
            {errors.address?.city && (
              <p className="mt-1 text-sm text-red-700">{errors.address.city.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="address.state" isRequired>
              State
            </Label>
            <Input id="address.state" maxLength={2} {...register("address.state")} />
            {errors.address?.state && (
              <p className="mt-1 text-sm text-red-700">{errors.address.state.message}</p>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="address.zip" isRequired>
            ZIP
          </Label>
          <Input id="address.zip" {...register("address.zip")} />
          {errors.address?.zip && (
            <p className="mt-1 text-sm text-red-700">{errors.address.zip.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={3} {...register("notes")} />
      </div>

      <div>
        <Label>Photos</Label>
        <FileUpload
          files={files}
          onChange={setFiles}
          maxFiles={10}
          validation={{
            maxSizeBytes: MAX_FILE_SIZE,
            allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/heic"],
          }}
        />
      </div>

      {turnstileSiteKey && (
        <Turnstile
          siteKey={turnstileSiteKey}
          onVerify={setTurnstileToken}
          onError={() => setTurnstileToken("")}
        />
      )}

      {/* Honeypot */}
      <input
        type="text"
        {...register("website")}
        tabIndex={-1}
        autoComplete="off"
        className="sr-only"
        aria-hidden="true"
      />

      <p className="text-sm text-brand-muted">
        Questions? Call or text{" "}
        <a
          href={`tel:${PHONE}`}
          className="font-semibold text-brand-primary hover:text-brand-accent"
        >
          {formatPhone(PHONE)}
        </a>{" "}
        or email{" "}
        <a
          href={`mailto:${EMAIL}`}
          className="font-semibold text-brand-primary hover:text-brand-accent"
        >
          {EMAIL}
        </a>
        .
      </p>

      <Button
        type="submit"
        className="w-full"
        isLoading={isSubmitting || isPending}
        disabled={isSubmitDisabled}
      >
        Request Appointment
      </Button>
    </form>
  );
}

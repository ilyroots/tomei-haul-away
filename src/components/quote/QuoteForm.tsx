"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm, FormProvider, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { quoteSubmissionSchema, ContactPreference } from "@/lib/validation/schemas";
import { isInServiceArea, SERVICES, EMAIL, PHONE, formatPhone } from "@/lib/business/config";
import { normalizeZip } from "@/lib/security/helpers";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { FileUpload, type FileUploadFile } from "@/components/ui/FileUpload";
import { ProgressIndicator } from "@/components/ui/ProgressIndicator";
import { ErrorSummary, type SimpleFieldErrors } from "@/components/ui/ErrorSummary";
import { Turnstile } from "@/components/ui/Turnstile";
import { submitQuote, type SubmissionResult } from "@/app/(public)/quote/actions";

const STEPS = ["The Job", "Contact & Timing"];

const CONTACT_PREFERENCE_OPTIONS = [
  { value: ContactPreference.PHONE, label: "Call" },
  { value: ContactPreference.TEXT, label: "Text" },
  { value: ContactPreference.EMAIL, label: "Email" },
];

const REMOVAL_ITEM_OPTIONS = [
  "Furniture",
  "Appliances",
  "Mattresses",
  "Electronics",
  "Boxes & clutter",
  "Yard debris",
  "Construction debris",
  "Hot tub / piano / safe",
  "Other",
];

const ARRIVAL_WINDOW_OPTIONS = [
  { value: "MORNING", label: "Morning (8am–12pm)" },
  { value: "AFTERNOON", label: "Afternoon (12pm–4pm)" },
  { value: "EVENING", label: "Evening (4pm–7pm)" },
  { value: "ANYTIME", label: "Anytime" },
];

const DRAFT_KEY = "quote-form-draft";
const MAX_FILE_SIZE = Number.parseInt(
  process.env.NEXT_PUBLIC_QUOTE_MAX_FILE_SIZE_BYTES ?? "10485760",
  10
);

export interface QuoteFormProps {
  submissionToken: string;
  turnstileSiteKey?: string;
  initialService?: string;
  initialZip?: string;
}

export function QuoteForm({
  submissionToken,
  turnstileSiteKey,
  initialService,
  initialZip,
}: QuoteFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<FileUploadFile[]>([]);
  const [serverResult, setServerResult] = useState<SubmissionResult | null>(null);
  const [fieldErrors, setFieldErrors] = useState<SimpleFieldErrors | undefined>();
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isPending, startTransition] = useTransition();

  const methods = useForm({
    resolver: zodResolver(quoteSubmissionSchema),
    mode: "onTouched",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      contactPreference: ContactPreference.EMAIL,
      zip: initialZip ?? "",
      serviceSlug: initialService ?? "",
      removalItems: [],
      itemsDescription: "",
      photos: [],
      preferredDate: undefined,
      arrivalWindow: "",
      consentToContact: false,
      privacyPolicyAcknowledged: false,
      marketingConsent: false,
      submissionAcknowledged: false,
      website: "",
      turnstileToken: "",
      startedAt: new Date().toISOString(),
      submissionToken,
    },
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = methods;

  const watchedValues = useWatch({ control });

  const [zip, serviceSlug, removalItems, itemsDescription] = useWatch({
    control,
    name: ["zip", "serviceSlug", "removalItems", "itemsDescription"],
  }) as [string, string, string[], string | undefined];

  const selectedItems = removalItems ?? [];

  // Restore draft from localStorage on mount
  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        const parsed = JSON.parse(draft) as Record<string, unknown>;
        Object.entries(parsed).forEach(([key, value]) => {
          if (!["photos", "turnstileToken", "submissionToken", "startedAt"].includes(key)) {
            setValue(key as never, value as never);
          }
        });
      }
    } catch {
      // Ignore corrupt draft
    }
    // Query-param values win over an empty draft field
    if (initialService && SERVICES.some((s) => s.slug === initialService)) {
      setValue("serviceSlug", initialService, { shouldValidate: true });
    }
    if (initialZip) {
      setValue("zip", initialZip, { shouldValidate: true });
    }
  }, [setValue, initialService, initialZip]);

  // Autosave draft to localStorage (lightweight)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const draft = { ...watchedValues };
      delete (draft as Record<string, unknown>).turnstileToken;
      delete (draft as Record<string, unknown>).submissionToken;
      delete (draft as Record<string, unknown>).startedAt;
      delete (draft as Record<string, unknown>).photos;
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }, 500);
    return () => clearTimeout(timeout);
  }, [watchedValues]);

  const toggleItem = (item: string) => {
    const current = new Set(selectedItems);
    if (current.has(item)) {
      current.delete(item);
    } else {
      current.add(item);
    }
    setValue("removalItems", Array.from(current), { shouldValidate: true });
  };

  const handleNext = async () => {
    const fields = (
      step === 0
        ? ["zip", "serviceSlug", "removalItems", "itemsDescription"]
        : [
            "firstName",
            "lastName",
            "phone",
            "email",
            "contactPreference",
            "consentToContact",
            "privacyPolicyAcknowledged",
            "submissionAcknowledged",
          ]
    ) as Parameters<typeof trigger>[0];
    const valid = await trigger(fields);
    if (valid) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
      setFieldErrors(undefined);
    }
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 0));
    setServerResult(null);
  };

  const onSubmit = async (data: unknown) => {
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
      ...(data as Record<string, unknown>),
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
      if (file.status === "complete" || file.status === "pending" || file.status === "uploading") {
        formData.append("photos", file.file);
      }
    }

    startTransition(async () => {
      const result = await submitQuote(formData);
      if (result.success) {
        localStorage.removeItem(DRAFT_KEY);
        router.push(`/thank-you?ref=${encodeURIComponent(result.referenceNumber)}`);
      } else {
        setServerResult(result);
        setFieldErrors(result.errors);
      }
    });
  };

  const isSubmitDisabled =
    isSubmitting || isPending || (turnstileSiteKey ? !turnstileToken : false);

  const serviceTitle = serviceSlug
    ? (SERVICES.find((s) => s.slug === serviceSlug)?.title ?? serviceSlug)
    : "";

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto max-w-3xl space-y-8 rounded-xl bg-brand-surface p-6 shadow-sm sm:p-8"
      >
        <ProgressIndicator steps={STEPS} currentStep={step} />

        {(serverResult && !serverResult.success) || Object.keys(errors).length > 0 ? (
          <ErrorSummary
            message={serverResult && !serverResult.success ? serverResult.message : undefined}
            errors={fieldErrors ?? errors}
          />
        ) : null}

        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-brand-primary">Tell us about the job</h2>

            <div>
              <Label htmlFor="zip" isRequired>
                ZIP code
              </Label>
              <Input id="zip" autoComplete="postal-code" {...register("zip")} />
              {errors.zip && <p className="mt-1 text-sm text-red-700">{errors.zip.message}</p>}
              {zip && !isInServiceArea(normalizeZip(zip)) && (
                <p className="mt-1 text-sm text-brand-accent">
                  This ZIP is outside our core service area, but we will still review your request
                  and let you know if we can help.
                </p>
              )}
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
                    options={[
                      { value: "", label: "Select a service" },
                      ...SERVICES.map((s) => ({ value: s.slug, label: s.title })),
                    ]}
                    {...field}
                    value={field.value ?? ""}
                  />
                )}
              />
              {errors.serviceSlug && (
                <p className="mt-1 text-sm text-red-700">{errors.serviceSlug.message}</p>
              )}
            </div>

            <div>
              <Label isRequired>What needs to be removed?</Label>
              <div className="flex flex-wrap gap-2">
                {REMOVAL_ITEM_OPTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleItem(item)}
                    aria-pressed={selectedItems.includes(item)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      selectedItems.includes(item)
                        ? "border-brand-accent bg-brand-accent/10 text-brand-primary"
                        : "border-brand-border bg-brand-surface text-brand-text hover:border-brand-accent"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              {errors.removalItems && (
                <p className="mt-1 text-sm text-red-700">{errors.removalItems.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="itemsDescription">Anything else we should know?</Label>
              <Textarea
                id="itemsDescription"
                rows={3}
                placeholder="Condition, quantity, access details, etc."
                {...register("itemsDescription")}
              />
              {errors.itemsDescription && (
                <p className="mt-1 text-sm text-red-700">{errors.itemsDescription.message}</p>
              )}
            </div>

            <div>
              <Label>Photos (recommended)</Label>
              <p className="mb-2 text-sm text-brand-text/80">
                A quick photo helps us give you a faster, more accurate estimate. Optional — up to
                10 images.
              </p>
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
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-brand-primary">How do we reach you?</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName" isRequired>
                  First name
                </Label>
                <Input id="firstName" autoComplete="given-name" {...register("firstName")} />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-700">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName" isRequired>
                  Last name
                </Label>
                <Input id="lastName" autoComplete="family-name" {...register("lastName")} />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-700">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="phone" isRequired>
                  Phone
                </Label>
                <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-700">{errors.phone.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email" isRequired>
                  Email
                </Label>
                <Input id="email" type="email" autoComplete="email" {...register("email")} />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-700">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="contactPreference" isRequired>
                Preferred contact method
              </Label>
              <Controller
                name="contactPreference"
                control={control}
                render={({ field }) => (
                  <Select id="contactPreference" options={CONTACT_PREFERENCE_OPTIONS} {...field} />
                )}
              />
              {errors.contactPreference && (
                <p className="mt-1 text-sm text-red-700">{errors.contactPreference.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="preferredDate">Preferred day (optional)</Label>
                <Input id="preferredDate" type="date" {...register("preferredDate")} />
                {errors.preferredDate && (
                  <p className="mt-1 text-sm text-red-700">{errors.preferredDate.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="arrivalWindow">Preferred time (optional)</Label>
                <Controller
                  name="arrivalWindow"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="arrivalWindow"
                      options={[{ value: "", label: "No preference" }, ...ARRIVAL_WINDOW_OPTIONS]}
                      {...field}
                      value={field.value ?? ""}
                    />
                  )}
                />
              </div>
            </div>

            <section className="rounded-md bg-brand-background p-4">
              <h3 className="font-semibold text-brand-primary">Job summary</h3>
              <p className="mt-1 text-brand-text">
                {serviceTitle} in ZIP {zip}
              </p>
              {selectedItems.length > 0 && (
                <p className="mt-1 text-brand-text">Items: {selectedItems.join(", ")}</p>
              )}
              {!!itemsDescription && (
                <p className="mt-1 text-brand-text">Details: {String(itemsDescription)}</p>
              )}
              <p className="mt-1 text-brand-text">
                Photos: {files.length > 0 ? files.length : "None attached"}
              </p>
              <button
                type="button"
                onClick={handleBack}
                className="mt-2 text-sm font-semibold text-brand-primary underline hover:text-brand-accent"
              >
                Edit job details
              </button>
            </section>

            <div className="space-y-3">
              <Checkbox
                label={
                  <>
                    I consent to being contacted about my request via my selected contact method.{" "}
                    <span className="text-brand-accent">*</span>
                  </>
                }
                {...register("consentToContact")}
              />
              {errors.consentToContact && (
                <p className="text-sm text-red-700">{errors.consentToContact.message}</p>
              )}

              <Checkbox
                label={
                  <>
                    I have read and acknowledge the{" "}
                    <a href="/privacy" className="underline hover:text-brand-accent">
                      privacy policy
                    </a>
                    . <span className="text-brand-accent">*</span>
                  </>
                }
                {...register("privacyPolicyAcknowledged")}
              />
              {errors.privacyPolicyAcknowledged && (
                <p className="text-sm text-red-700">{errors.privacyPolicyAcknowledged.message}</p>
              )}

              <Checkbox
                label="Send me occasional updates and promotions (optional)."
                {...register("marketingConsent")}
              />

              <Checkbox
                label={
                  <>
                    I understand that submitting this form does not guarantee an appointment or
                    final price. <span className="text-brand-accent">*</span>
                  </>
                }
                {...register("submissionAcknowledged")}
              />
              {errors.submissionAcknowledged && (
                <p className="text-sm text-red-700">{errors.submissionAcknowledged.message}</p>
              )}
            </div>

            {turnstileSiteKey && (
              <Turnstile
                siteKey={turnstileSiteKey}
                onVerify={setTurnstileToken}
                onError={() => setTurnstileToken("")}
              />
            )}

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
          </div>
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

        <div className="flex justify-between gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={step === 0 || isSubmitting || isPending}
          >
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button type="submit" isLoading={isSubmitting || isPending} disabled={isSubmitDisabled}>
              Submit Quote Request
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

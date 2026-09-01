"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm, FormProvider, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import {
  quoteSubmissionSchema,
  ContactPreference,
  PropertyType,
  LoadSize,
} from "@/lib/validation/schemas";
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

const STEPS = ["Contact", "Job Location", "Job Details", "Photos", "Timing", "Review"];

const CONTACT_PREFERENCE_OPTIONS = [
  { value: ContactPreference.PHONE, label: "Call" },
  { value: ContactPreference.TEXT, label: "Text" },
  { value: ContactPreference.EMAIL, label: "Email" },
];

const PROPERTY_TYPE_OPTIONS = [
  { value: PropertyType.RESIDENTIAL_SINGLE_FAMILY, label: "Single-family home" },
  { value: PropertyType.RESIDENTIAL_APARTMENT, label: "Apartment" },
  { value: PropertyType.RESIDENTIAL_CONDO, label: "Condo / townhouse" },
  { value: PropertyType.COMMERCIAL, label: "Commercial" },
  { value: PropertyType.STORAGE_UNIT, label: "Storage unit" },
  { value: PropertyType.OTHER, label: "Other" },
];

const LOAD_SIZE_OPTIONS = [
  { value: LoadSize.SINGLE_ITEM, label: "Single item" },
  { value: LoadSize.SMALL_LOAD, label: "Small load" },
  { value: LoadSize.QUARTER_LOAD, label: "Quarter load" },
  { value: LoadSize.HALF_LOAD, label: "Half load" },
  { value: LoadSize.THREE_QUARTER_LOAD, label: "Three-quarter load" },
  { value: LoadSize.FULL_LOAD, label: "Full load" },
  { value: LoadSize.MULTIPLE_LOADS, label: "Multiple loads" },
  { value: LoadSize.UNSURE, label: "Not sure — help me estimate" },
];

const ARRIVAL_WINDOW_OPTIONS = [
  { value: "MORNING", label: "Morning (8am–12pm)" },
  { value: "AFTERNOON", label: "Afternoon (12pm–4pm)" },
  { value: "EVENING", label: "Evening (4pm–7pm)" },
  { value: "ANYTIME", label: "Anytime" },
];

const INDOOR_OUTDOOR_OPTIONS = [
  { value: "indoor", label: "Indoor" },
  { value: "outdoor", label: "Outdoor" },
  { value: "both", label: "Both" },
];

const DRAFT_KEY = "quote-form-draft";
const MAX_FILE_SIZE = Number.parseInt(
  process.env.NEXT_PUBLIC_QUOTE_MAX_FILE_SIZE_BYTES ?? "10485760",
  10
);

function formatOptionalDate(value: unknown): string {
  if (!value) return "Not selected";
  const date = typeof value === "string" ? new Date(value) : value instanceof Date ? value : null;
  if (!date || Number.isNaN(date.getTime())) return "Not selected";
  return date.toLocaleDateString("en-US");
}

export interface QuoteFormProps {
  submissionToken: string;
  turnstileSiteKey?: string;
}

export function QuoteForm({ submissionToken, turnstileSiteKey }: QuoteFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      line1: "",
      line2: "",
      city: "",
      state: "MA",
      zip: "",
      serviceSlugs: [],
      itemsDescription: "",
      loadSize: undefined,
      propertyType: undefined,
      indoorOutdoor: undefined,
      floorLevel: "",
      hasStairs: false,
      hasElevator: false,
      longCarry: false,
      disassemblyRequired: false,
      heavySpecialtyItems: "",
      notes: "",
      photos: [],
      preferredDate: undefined,
      secondaryDate: undefined,
      arrivalWindow: "",
      asSoonAsPossible: false,
      flexibleDate: false,
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

  const [
    firstName,
    lastName,
    email,
    phone,
    contactPreference,
    line1,
    line2,
    city,
    state,
    zip,
    serviceSlugs,
    loadSize,
    propertyType,
    itemsDescription,
    preferredDate,
    secondaryDate,
    arrivalWindow,
  ] = useWatch({
    control,
    name: [
      "firstName",
      "lastName",
      "email",
      "phone",
      "contactPreference",
      "line1",
      "line2",
      "city",
      "state",
      "zip",
      "serviceSlugs",
      "loadSize",
      "propertyType",
      "itemsDescription",
      "preferredDate",
      "secondaryDate",
      "arrivalWindow",
    ],
  }) as [
    string,
    string,
    string,
    string | undefined,
    string,
    string,
    string | undefined,
    string,
    string,
    string,
    string[],
    string | undefined,
    string | undefined,
    string | undefined,
    string | undefined,
    string | undefined,
    string | undefined,
  ];

  const selectedServices = serviceSlugs ?? [];

  // Load draft from localStorage and query params on mount
  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        const parsed = JSON.parse(draft) as Record<string, unknown>;
        // Restore scalar fields, not files or security tokens
        Object.entries(parsed).forEach(([key, value]) => {
          if (!["photos", "turnstileToken", "submissionToken", "startedAt"].includes(key)) {
            setValue(key as never, value as never);
          }
        });
      }

      const serviceFromQuery = searchParams.get("service");
      if (serviceFromQuery && SERVICES.some((s) => s.slug === serviceFromQuery)) {
        setValue("serviceSlugs", [serviceFromQuery], { shouldValidate: true });
      }

      const zipFromQuery = searchParams.get("zip");
      if (zipFromQuery) {
        setValue("zip", zipFromQuery, { shouldValidate: true });
      }

      const cityFromQuery = searchParams.get("city");
      if (cityFromQuery) {
        setValue("city", cityFromQuery, { shouldValidate: true });
      }
    } catch {
      // Ignore corrupt draft or query params
    }
  }, [setValue, searchParams]);

  // Autosave draft to localStorage
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

  const toggleService = (slug: string) => {
    const current = new Set(selectedServices);
    if (current.has(slug)) {
      current.delete(slug);
    } else {
      current.add(slug);
    }
    setValue("serviceSlugs", Array.from(current), { shouldValidate: true });
  };

  const handleNext = async () => {
    const stepFields = [
      ["firstName", "lastName", "email", "phone", "contactPreference"],
      ["line1", "line2", "city", "state", "zip"],
      [
        "serviceSlugs",
        "itemsDescription",
        "loadSize",
        "propertyType",
        "indoorOutdoor",
        "floorLevel",
      ],
      [], // Photos step has no required text fields
      ["preferredDate", "secondaryDate", "arrivalWindow"],
      [
        "consentToContact",
        "privacyPolicyAcknowledged",
        "marketingConsent",
        "submissionAcknowledged",
      ],
    ] as const;
    const fields = stepFields[step] as unknown as Parameters<typeof trigger>[0];
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

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto max-w-3xl space-y-8 rounded-xl bg-white p-6 shadow-sm sm:p-8"
      >
        <ProgressIndicator steps={STEPS} currentStep={step} />

        {(serverResult && !serverResult.success) || Object.keys(errors).length > 0 ? (
          <ErrorSummary
            message={serverResult && !serverResult.success ? serverResult.message : undefined}
            errors={fieldErrors ?? errors}
          />
        ) : null}

        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-navy">Contact Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName" isRequired>
                  First name
                </Label>
                <Input id="firstName" {...register("firstName")} />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-700">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName" isRequired>
                  Last name
                </Label>
                <Input id="lastName" {...register("lastName")} />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-700">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="email" isRequired>
                Email
              </Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
              {errors.email && <p className="mt-1 text-sm text-red-700">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
              {errors.phone && <p className="mt-1 text-sm text-red-700">{errors.phone.message}</p>}
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
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-navy">Job Location</h2>
            <div>
              <Label htmlFor="line1" isRequired>
                Address line 1
              </Label>
              <Input id="line1" autoComplete="address-line1" {...register("line1")} />
              {errors.line1 && <p className="mt-1 text-sm text-red-700">{errors.line1.message}</p>}
            </div>
            <div>
              <Label htmlFor="line2">Address line 2</Label>
              <Input id="line2" autoComplete="address-line2" {...register("line2")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Label htmlFor="city" isRequired>
                  City
                </Label>
                <Input id="city" autoComplete="address-level2" {...register("city")} />
                {errors.city && <p className="mt-1 text-sm text-red-700">{errors.city.message}</p>}
              </div>
              <div>
                <Label htmlFor="state" isRequired>
                  State
                </Label>
                <Input
                  id="state"
                  maxLength={2}
                  autoComplete="address-level1"
                  {...register("state")}
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-700">{errors.state.message}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="zip" isRequired>
                ZIP code
              </Label>
              <Input id="zip" autoComplete="postal-code" {...register("zip")} />
              {errors.zip && <p className="mt-1 text-sm text-red-700">{errors.zip.message}</p>}
              {zip && !isInServiceArea(normalizeZip(zip)) && (
                <p className="mt-1 text-sm text-orange">
                  This ZIP is outside our core service area, but we will still review your request
                  and let you know if we can help.
                </p>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-navy">Job Details</h2>
            <div>
              <Label isRequired>What service(s) do you need?</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {SERVICES.map((service) => (
                  <button
                    key={service.slug}
                    type="button"
                    onClick={() => toggleService(service.slug)}
                    className={`rounded-md border px-4 py-3 text-left text-sm font-medium transition-colors ${
                      selectedServices.includes(service.slug)
                        ? "border-orange bg-orange-50 text-navy"
                        : "border-charcoal-200 bg-white text-charcoal hover:border-orange"
                    }`}
                    aria-pressed={selectedServices.includes(service.slug)}
                  >
                    {service.title}
                  </button>
                ))}
              </div>
              {errors.serviceSlugs && (
                <p className="mt-1 text-sm text-red-700">{errors.serviceSlugs.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="itemsDescription">Describe the items to remove</Label>
              <Textarea
                id="itemsDescription"
                rows={4}
                placeholder="Couches, appliances, boxes, yard debris, etc."
                {...register("itemsDescription")}
              />
              {errors.itemsDescription && (
                <p className="mt-1 text-sm text-red-700">{errors.itemsDescription.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="loadSize">Estimated load size</Label>
                <Controller
                  name="loadSize"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="loadSize"
                      options={[{ value: "", label: "Select load size" }, ...LOAD_SIZE_OPTIONS]}
                      {...field}
                      value={field.value ?? ""}
                    />
                  )}
                />
                {errors.loadSize && (
                  <p className="mt-1 text-sm text-red-700">{errors.loadSize.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="propertyType">Property type</Label>
                <Controller
                  name="propertyType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="propertyType"
                      options={[
                        { value: "", label: "Select property type" },
                        ...PROPERTY_TYPE_OPTIONS,
                      ]}
                      {...field}
                      value={field.value ?? ""}
                    />
                  )}
                />
                {errors.propertyType && (
                  <p className="mt-1 text-sm text-red-700">{errors.propertyType.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="indoorOutdoor">Item location</Label>
                <Controller
                  name="indoorOutdoor"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="indoorOutdoor"
                      options={[{ value: "", label: "Select" }, ...INDOOR_OUTDOOR_OPTIONS]}
                      {...field}
                      value={field.value ?? ""}
                    />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="floorLevel">Floor level</Label>
                <Input
                  id="floorLevel"
                  placeholder="e.g. 2nd floor, basement"
                  {...register("floorLevel")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-charcoal">Access details</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Checkbox label="Stairs involved" {...register("hasStairs")} />
                <Checkbox label="Elevator available" {...register("hasElevator")} />
                <Checkbox label="Long carry to truck" {...register("longCarry")} />
                <Checkbox label="Disassembly required" {...register("disassemblyRequired")} />
              </div>
            </div>

            <div>
              <Label htmlFor="heavySpecialtyItems">
                Heavy or specialty items (pianos, safes, hot tubs, etc.)
              </Label>
              <Textarea id="heavySpecialtyItems" rows={2} {...register("heavySpecialtyItems")} />
            </div>

            <div>
              <Label htmlFor="notes">Additional notes</Label>
              <Textarea id="notes" rows={3} {...register("notes")} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-navy">Photos</h2>
            <p className="text-charcoal-600">
              Photos help us provide a more accurate estimate. They are optional.
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
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-navy">Timing</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="preferredDate">Preferred date</Label>
                <Input id="preferredDate" type="date" {...register("preferredDate")} />
                {errors.preferredDate && (
                  <p className="mt-1 text-sm text-red-700">{errors.preferredDate.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="secondaryDate">Secondary date</Label>
                <Input id="secondaryDate" type="date" {...register("secondaryDate")} />
              </div>
            </div>
            <div>
              <Label htmlFor="arrivalWindow">Preferred arrival window</Label>
              <Controller
                name="arrivalWindow"
                control={control}
                render={({ field }) => (
                  <Select
                    id="arrivalWindow"
                    options={[{ value: "", label: "Select window" }, ...ARRIVAL_WINDOW_OPTIONS]}
                    {...field}
                    value={field.value ?? ""}
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Checkbox label="As soon as possible" {...register("asSoonAsPossible")} />
              <Checkbox label="I am flexible on date / time" {...register("flexibleDate")} />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-navy">Review & Consent</h2>

            <section className="rounded-md bg-cream-100 p-4">
              <h3 className="font-semibold text-navy">Contact</h3>
              <p className="text-charcoal">
                {firstName} {lastName}
              </p>
              <p className="text-charcoal">{email}</p>
              <p className="text-charcoal">{phone || "No phone provided"}</p>
              <p className="text-charcoal capitalize">
                Preferred: {contactPreference?.toLowerCase()}
              </p>
            </section>

            <section className="rounded-md bg-cream-100 p-4">
              <h3 className="font-semibold text-navy">Location</h3>
              <p className="text-charcoal">{line1}</p>
              {line2 && <p className="text-charcoal">{line2}</p>}
              <p className="text-charcoal">
                {city}, {state} {zip}
              </p>
              {zip && !isInServiceArea(normalizeZip(zip)) && (
                <p className="mt-1 text-sm text-orange">
                  Outside core service area — request will be reviewed.
                </p>
              )}
            </section>

            <section className="rounded-md bg-cream-100 p-4">
              <h3 className="font-semibold text-navy">Job Details</h3>
              <p className="text-charcoal">
                Services:{" "}
                {selectedServices
                  .map((slug) => SERVICES.find((s) => s.slug === slug)?.title ?? slug)
                  .join(", ") || "None selected"}
              </p>
              {!!loadSize && <p className="text-charcoal">Load size: {String(loadSize)}</p>}
              {!!propertyType && <p className="text-charcoal">Property: {String(propertyType)}</p>}
              {!!itemsDescription && (
                <p className="text-charcoal">Items: {String(itemsDescription)}</p>
              )}
              {files.length > 0 && <p className="text-charcoal">Photos: {files.length}</p>}
            </section>

            <section className="rounded-md bg-cream-100 p-4">
              <h3 className="font-semibold text-navy">Timing</h3>
              <p className="text-charcoal">Preferred date: {formatOptionalDate(preferredDate)}</p>
              {!!secondaryDate && (
                <p className="text-charcoal">Secondary date: {formatOptionalDate(secondaryDate)}</p>
              )}
              {!!arrivalWindow && (
                <p className="text-charcoal">
                  Window:{" "}
                  {ARRIVAL_WINDOW_OPTIONS.find((o) => o.value === String(arrivalWindow ?? ""))
                    ?.label ?? String(arrivalWindow)}
                </p>
              )}
            </section>

            <div className="space-y-3">
              <Checkbox
                label={
                  <>
                    I consent to being contacted about my request via my selected contact method.{" "}
                    <span className="text-orange">*</span>
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
                    <a href="/privacy" className="underline hover:text-orange">
                      privacy policy
                    </a>
                    . <span className="text-orange">*</span>
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
                    final price. <span className="text-orange">*</span>
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

            <p className="text-sm text-charcoal-500">
              Questions? Call or text{" "}
              <a href={`tel:${PHONE}`} className="font-semibold text-navy hover:text-orange">
                {formatPhone(PHONE)}
              </a>{" "}
              or email{" "}
              <a href={`mailto:${EMAIL}`} className="font-semibold text-navy hover:text-orange">
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

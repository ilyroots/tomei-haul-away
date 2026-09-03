import { z } from "zod";
import {
  ContactPreference,
  PropertyType,
  LoadSize,
  ArrivalWindow,
  LeadStatus,
  AppointmentStatus,
} from "@prisma/client";

export { ContactPreference, PropertyType, LoadSize, ArrivalWindow, LeadStatus, AppointmentStatus };
import { isInServiceArea } from "@/lib/business/config";
import { normalizePhone, normalizeZip } from "@/lib/security/helpers";

const phoneRegex = /^\+?1?\d{10}$/;

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

export const phoneSchema = z
  .string()
  .optional()
  .or(z.literal(""))
  .transform((val) => (val ? normalizePhone(val) : undefined))
  .refine((val) => !val || phoneRegex.test(val), {
    message: "Please enter a valid 10-digit phone number.",
  });

export const zipSchema = z
  .string()
  .min(1, "ZIP code is required.")
  .transform(normalizeZip)
  .refine((val) => val.length === 5, {
    message: "ZIP code must be 5 digits.",
  });

export const requiredBooleanTrue = (message: string) =>
  z.boolean().refine((val) => val === true, { message });

// ---------------------------------------------------------------------------
// Quote form step schemas
// ---------------------------------------------------------------------------

export const quoteContactSchema = z.object({
  firstName: z.string().min(1, "First name is required.").max(100),
  lastName: z.string().min(1, "Last name is required.").max(100),
  email: z.string().min(1, "Email is required.").email("Please enter a valid email address."),
  phone: z
    .string()
    .min(1, "Phone number is required.")
    .transform(normalizePhone)
    .refine((val) => phoneRegex.test(val), {
      message: "Please enter a valid 10-digit phone number.",
    }),
  contactPreference: z.nativeEnum(ContactPreference, {
    message: "Please select a contact preference.",
  }),
  line1: z.string().min(1, "Street address is required.").max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1, "City is required.").max(100),
  state: z.string().length(2, "State must be 2 characters.").toUpperCase().default("CA"),
});

export type QuoteContactInput = z.infer<typeof quoteContactSchema>;

export const quoteJobDetailsSchema = z.object({
  zip: zipSchema,
  serviceSlug: z.string().min(1, "Please select a service type.").max(100),
  removalItems: z
    .array(z.string().min(1).max(100))
    .min(1, "Select at least one item that needs to go.")
    .max(30),
  itemsDescription: z.string().max(5000).optional(),
});

export type QuoteJobDetailsInput = z.infer<typeof quoteJobDetailsSchema>;

export const photoFileMetadataSchema = z.object({
  name: z.string().min(1),
  size: z.number().int().nonnegative(),
  type: z.string().min(1),
  key: z.string().optional(),
});

export type PhotoFileMetadata = z.infer<typeof photoFileMetadataSchema>;

export const quotePhotosSchema = z.object({
  photos: z.array(photoFileMetadataSchema).max(3, "You can upload up to 3 photos."),
});

export type QuotePhotosInput = z.infer<typeof quotePhotosSchema>;

export const quoteTimingSchema = z.object({
  preferredDate: z.preprocess(
    (val) => (val === "" || val == null ? undefined : val),
    z.coerce.date().optional()
  ),
  arrivalWindow: z.string().max(50).optional(),
});

export type QuoteTimingInput = z.infer<typeof quoteTimingSchema>;

export const quoteConsentSchema = z.object({
  consentToContact: requiredBooleanTrue("You must consent to be contacted."),
  privacyPolicyAcknowledged: requiredBooleanTrue("You must acknowledge the privacy policy."),
  marketingConsent: z.boolean().default(false),
  submissionAcknowledged: requiredBooleanTrue(
    "You must acknowledge that submission does not guarantee an appointment or price."
  ),
});

export type QuoteConsentInput = z.infer<typeof quoteConsentSchema>;

// ---------------------------------------------------------------------------
// Complete quote submission schema
// ---------------------------------------------------------------------------

export const quoteSubmissionSchema = quoteContactSchema
  .merge(quoteJobDetailsSchema)
  .merge(quotePhotosSchema)
  .merge(quoteTimingSchema)
  .merge(quoteConsentSchema)
  .extend({
    // Honeypot field (should be empty)
    website: z.string().optional(),
    // Security / anti-spam
    turnstileToken: z.string().optional(),
    startedAt: z.string().optional(),
    // Computed on the server; included here for type completeness.
    isInServiceArea: z.boolean().optional(),
    submissionToken: z.string().optional(),
  })
  .transform((data) => ({
    ...data,
    isInServiceArea: isInServiceArea(data.zip),
  }));

export type QuoteSubmissionInput = z.infer<typeof quoteSubmissionSchema>;

// ---------------------------------------------------------------------------
// Schedule request schema
// ---------------------------------------------------------------------------

export const scheduleRequestSchema = z.object({
  serviceSlug: z.string().min(1, "Please select a service type."),
  zip: zipSchema,
  preferredDate: z.coerce.date({ message: "Please select a valid date." }),
  arrivalWindow: z.string().min(1, "Please select an arrival window."),
  contact: z.object({
    name: z.string().min(1, "Name is required.").max(100),
    email: z.string().email("Please enter a valid email address."),
    phone: phoneSchema,
  }),
  address: z.object({
    line1: z.string().min(1, "Address line 1 is required.").max(200),
    line2: z.string().max(200).optional(),
    city: z.string().min(1, "City is required.").max(100),
    state: z.string().length(2, "State must be 2 characters.").toUpperCase(),
    zip: zipSchema,
  }),
  notes: z.string().max(2000).optional(),
  photos: z.array(photoFileMetadataSchema).max(10, "You can upload up to 10 photos.").optional(),
  // Honeypot field
  website: z.string().optional(),
  // Security
  turnstileToken: z.string().optional(),
  startedAt: z.string().optional(),
});

export type ScheduleRequestInput = z.infer<typeof scheduleRequestSchema>;

// ---------------------------------------------------------------------------
// Admin schemas
// ---------------------------------------------------------------------------

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required."),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export const createAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12, "Password must be at least 12 characters."),
  name: z.string().max(100).optional(),
  role: z.string().max(50).default("admin"),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;

export const updateLeadStatusSchema = z.object({
  leadId: z.string().cuid(),
  status: z.nativeEnum(LeadStatus),
  reason: z.string().max(2000).optional(),
});

export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>;

export const updateAppointmentStatusSchema = z.object({
  appointmentId: z.string().cuid(),
  status: z.nativeEnum(AppointmentStatus),
  scheduledDate: z.coerce.date().optional(),
  arrivalWindow: z.string().optional(),
  reason: z.string().max(2000).optional(),
});

export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;

export const updateLeadPriceSchema = z.object({
  leadId: z.string().cuid(),
  estimatedPriceMin: z.number().nonnegative().optional(),
  estimatedPriceMax: z.number().nonnegative().optional(),
});

export type UpdateLeadPriceInput = z.infer<typeof updateLeadPriceSchema>;

export const businessSettingsSchema = z.object({
  businessTimezone: z.string().min(1),
  adminEmail: z.string().email(),
  notificationEmail: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  textNumber: z.string().optional().or(z.literal("")),
});

export type BusinessSettingsInput = z.infer<typeof businessSettingsSchema>;

// ---------------------------------------------------------------------------
// Admin CRUD schemas
// ---------------------------------------------------------------------------

export const availabilityWindowSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use HH:mm format."),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use HH:mm format."),
  label: z.string().max(100).optional(),
  maxAppointments: z.number().int().min(1).default(2),
  isActive: z.boolean().default(true),
});

export type AvailabilityWindowInput = z.infer<typeof availabilityWindowSchema>;

export const blackoutDateSchema = z.object({
  date: z.coerce.date(),
  reason: z.string().max(500).optional(),
});

export type BlackoutDateInput = z.infer<typeof blackoutDateSchema>;

export const internalNoteSchema = z.object({
  content: z.string().min(1, "Note content is required.").max(5000),
});

export type InternalNoteInput = z.infer<typeof internalNoteSchema>;

export const galleryItemSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export type GalleryItemInput = z.infer<typeof galleryItemSchema>;

export const testimonialSchema = z.object({
  authorName: z.string().min(1).max(200),
  location: z.string().max(200).optional(),
  content: z.string().min(1).max(5000),
  rating: z.number().int().min(1).max(5).optional(),
  isApproved: z.boolean().default(false),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;

export const faqSchema = z.object({
  question: z.string().min(1).max(500),
  answer: z.string().min(1).max(10000),
  category: z.string().max(100).optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export type FAQInput = z.infer<typeof faqSchema>;

export const serviceSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens."),
  title: z.string().min(1).max(200),
  shortDescription: z.string().min(1).max(1000),
  description: z.string().min(1).max(10000),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

export const serviceAreaSchema = z.object({
  city: z.string().min(1).max(200),
  zip: zipSchema,
  pageContent: z.string().max(10000).optional(),
  isActive: z.boolean().default(true),
});

export type ServiceAreaInput = z.infer<typeof serviceAreaSchema>;

export const idSchema = z.string().cuid();

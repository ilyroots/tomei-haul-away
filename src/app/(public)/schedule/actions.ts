"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { scheduleRequestSchema } from "@/lib/validation/schemas";
import {
  isHoneypotClean,
  isFormCompletedTooFast,
  verifyTurnstileToken,
  generateSubmissionToken,
  isSubmissionTokenUsed,
  markSubmissionTokenUsed,
  normalizeEmail,
  normalizePhone,
  normalizeZip,
  generateReferenceNumber,
  validateFile,
} from "@/lib/security/helpers";
import { isInServiceArea } from "@/lib/business/config";
import { prisma } from "@/lib/db/prisma";
import { uploadToS3 } from "@/lib/storage/s3";
import { email } from "@/lib/email/resend";
import { logger } from "@/lib/logging/logger";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const MAX_FILE_SIZE_BYTES = Number.parseInt(
  process.env.SCHEDULE_MAX_FILE_SIZE_BYTES ?? "10485760",
  10
); // 10 MB default
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

// ---------------------------------------------------------------------------
// Rate limiting (in-memory; replace with Redis in multi-instance deployments)
// ---------------------------------------------------------------------------

type RateLimitBucket = { count: number; resetAt: number };
const RATE_LIMITS = new Map<string, RateLimitBucket>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 5;

function gcRateLimits() {
  const now = Date.now();
  for (const [key, bucket] of RATE_LIMITS.entries()) {
    if (now > bucket.resetAt) {
      RATE_LIMITS.delete(key);
    }
  }
}

function isRateLimited(key: string): boolean {
  gcRateLimits();
  const bucket = RATE_LIMITS.get(key);
  if (!bucket) return false;
  if (Date.now() > bucket.resetAt) {
    RATE_LIMITS.delete(key);
    return false;
  }
  return bucket.count >= RATE_LIMIT_MAX_REQUESTS;
}

function recordRateLimit(key: string): void {
  gcRateLimits();
  const now = Date.now();
  const bucket = RATE_LIMITS.get(key);
  if (!bucket || now > bucket.resetAt) {
    RATE_LIMITS.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    bucket.count += 1;
  }
}

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export type ScheduleResult =
  | { success: true; referenceNumber: string }
  | {
      success: false;
      message: string;
      errors?: Record<string, string[]>;
    };

export type AvailabilityResult =
  | { success: true; available: boolean; remaining: number; capacity: number }
  | { success: false; message: string };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseArrivalWindow(value: string): {
  arrivalWindow?: "MORNING" | "AFTERNOON" | "EVENING" | "ANYTIME";
  arrivalWindowLabel?: string;
} {
  const upper = value.toUpperCase();
  if (["MORNING", "AFTERNOON", "EVENING", "ANYTIME"].includes(upper)) {
    return { arrivalWindow: upper as "MORNING" | "AFTERNOON" | "EVENING" | "ANYTIME" };
  }
  return { arrivalWindowLabel: value };
}

async function uploadPhotos(
  files: File[],
  ownerType: string,
  ownerId: string
): Promise<{ key: string; originalName: string; contentType: string; sizeBytes: number }[]> {
  const uploaded: { key: string; originalName: string; contentType: string; sizeBytes: number }[] =
    [];

  for (const file of files) {
    const error = validateFile(file, {
      maxSizeBytes: MAX_FILE_SIZE_BYTES,
      allowedMimeTypes: ALLOWED_PHOTO_TYPES,
    });
    if (error) {
      throw new Error(`File validation failed for ${file.name}: ${error}`);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { key } = await uploadToS3(
      buffer,
      file.name,
      file.type,
      `${ownerType.toLowerCase()}s/${ownerId}`
    );
    uploaded.push({
      key,
      originalName: file.name,
      contentType: file.type,
      sizeBytes: file.size,
    });
  }

  return uploaded;
}

function getDayOfWeek(date: Date): number {
  return date.getUTCDay();
}

function toDateOnly(date: Date): Date {
  const copy = new Date(date);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

// ---------------------------------------------------------------------------
// Availability check
// ---------------------------------------------------------------------------

export async function checkAvailability(
  dateInput: string | Date,
  windowLabel?: string
): Promise<AvailabilityResult> {
  try {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (Number.isNaN(date.getTime())) {
      return { success: false, message: "Invalid date." };
    }

    // Blackout dates
    const dateOnly = toDateOnly(date);
    const blackout = await prisma.blackoutDate.findUnique({ where: { date: dateOnly } });
    if (blackout) {
      return { success: true, available: false, remaining: 0, capacity: 0 };
    }

    const dayOfWeek = getDayOfWeek(date);
    const windows = await prisma.availabilityWindow.findMany({
      where: { dayOfWeek, isActive: true },
    });

    if (windows.length === 0) {
      return { success: true, available: false, remaining: 0, capacity: 0 };
    }

    // If a specific window label is provided, match against window label or fallback to enum
    let targetWindows = windows;
    if (windowLabel) {
      const upper = windowLabel.toUpperCase();
      const matched = windows.filter(
        (w) =>
          (w.label && w.label.toUpperCase().includes(upper)) ||
          ["MORNING", "AFTERNOON", "EVENING", "ANYTIME"].includes(upper)
      );
      if (matched.length > 0) {
        targetWindows = matched;
      }
    }

    const capacity = targetWindows.reduce((sum, w) => sum + w.maxAppointments, 0);

    const { arrivalWindow } = parseArrivalWindow(windowLabel ?? "");
    const scheduledCount = await prisma.appointment.count({
      where: {
        scheduledDate: {
          gte: dateOnly,
          lt: new Date(dateOnly.getTime() + 24 * 60 * 60 * 1000),
        },
        OR: [{ arrivalWindowLabel: windowLabel }, arrivalWindow ? { arrivalWindow } : {}],
      },
    });

    const remaining = Math.max(0, capacity - scheduledCount);
    return { success: true, available: remaining > 0, remaining, capacity };
  } catch (error) {
    logger.error("Failed to check availability", { error });
    return { success: false, message: "Unable to check availability right now." };
  }
}

// ---------------------------------------------------------------------------
// Server action
// ---------------------------------------------------------------------------

export async function submitScheduleRequest(formData: FormData): Promise<ScheduleResult> {
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for") ?? requestHeaders.get("x-real-ip") ?? "unknown";
  const userAgent = requestHeaders.get("user-agent") ?? undefined;

  try {
    const website = formData.get("website")?.toString();
    if (!isHoneypotClean(website)) {
      logger.warn("Honeypot triggered on schedule form", { ip });
      return { success: false, message: "Submission failed. Please try again." };
    }

    if (isRateLimited(String(ip))) {
      return {
        success: false,
        message: "Too many submissions from this device. Please try again later.",
      };
    }

    const rawJson = formData.get("data")?.toString();
    if (!rawJson) {
      return { success: false, message: "Missing form data." };
    }

    let rawData: unknown;
    try {
      rawData = JSON.parse(rawJson);
    } catch {
      return { success: false, message: "Invalid form data." };
    }

    const token =
      typeof (rawData as Record<string, unknown>).submissionToken === "string"
        ? ((rawData as Record<string, unknown>).submissionToken as string)
        : generateSubmissionToken();

    if (isSubmissionTokenUsed(token)) {
      return {
        success: false,
        message:
          "This submission has already been received. Please refresh the page to submit again.",
      };
    }

    const turnstileToken = (rawData as Record<string, unknown>).turnstileToken?.toString() ?? "";
    const turnstileOk = await verifyTurnstileToken(turnstileToken, TURNSTILE_SECRET_KEY);
    if (!turnstileOk) {
      return { success: false, message: "Security check failed. Please try again." };
    }

    const startedAt = (rawData as Record<string, unknown>).startedAt?.toString();
    if (startedAt && isFormCompletedTooFast(startedAt)) {
      return {
        success: false,
        message: "Submission was too fast. Please take your time filling out the form.",
      };
    }

    const parseResult = scheduleRequestSchema.safeParse(rawData);
    if (!parseResult.success) {
      const flattened = parseResult.error.flatten();
      return {
        success: false,
        message: "Please correct the errors below and try again.",
        errors: {
          ...flattened.fieldErrors,
          form: flattened.formErrors,
        },
      };
    }

    const data = parseResult.data;

    if (isRateLimited(data.contact.email)) {
      return {
        success: false,
        message: "Too many submissions from this email. Please try again later.",
      };
    }

    const normalizedEmail = normalizeEmail(data.contact.email);
    const normalizedPhone = data.contact.phone ? normalizePhone(data.contact.phone) : null;
    const normalizedZip = normalizeZip(data.address.zip);
    const inServiceArea = isInServiceArea(normalizedZip);

    const files: File[] = [];
    for (const entry of formData.getAll("photos")) {
      if (entry instanceof File && entry.size > 0) {
        files.push(entry);
      }
    }

    if (files.length > 10) {
      return { success: false, message: "You can upload up to 10 photos." };
    }

    const scheduledDate = new Date(data.preferredDate);
    const arrivalWindowData = parseArrivalWindow(data.arrivalWindow);

    // Check blackout / availability
    const availability = await checkAvailability(scheduledDate, data.arrivalWindow);
    if (!availability.success || !availability.available) {
      return {
        success: false,
        message:
          "The selected date and arrival window are no longer available. Please choose another time.",
      };
    }

    // Resolve service
    const service = await prisma.service.findUnique({
      where: { slug: data.serviceSlug },
      select: { id: true, title: true },
    });

    if (!service) {
      return {
        success: false,
        message: "The selected service is not available. Please refresh and try again.",
      };
    }

    // Build reference number (retry on collision)
    let referenceNumber = generateReferenceNumber();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await prisma.lead.findUnique({ where: { referenceNumber } });
      if (!existing) break;
      referenceNumber = generateReferenceNumber();
      attempts += 1;
    }

    const result = await prisma.$transaction(async (tx) => {
      // Double-booking guard: recount inside the transaction
      const dateOnly = toDateOnly(scheduledDate);
      const scheduledCount = await tx.appointment.count({
        where: {
          scheduledDate: {
            gte: dateOnly,
            lt: new Date(dateOnly.getTime() + 24 * 60 * 60 * 1000),
          },
          OR: [
            { arrivalWindowLabel: data.arrivalWindow },
            arrivalWindowData.arrivalWindow
              ? { arrivalWindow: arrivalWindowData.arrivalWindow }
              : {},
          ],
        },
      });

      const dayOfWeek = getDayOfWeek(scheduledDate);
      const windows = await tx.availabilityWindow.findMany({
        where: { dayOfWeek, isActive: true },
      });
      const capacity = windows.reduce((sum, w) => sum + w.maxAppointments, 0);

      if (scheduledCount >= capacity) {
        throw new Error("SLOT_UNAVAILABLE");
      }

      const customer = await tx.customer.upsert({
        where: { email: normalizedEmail },
        update: {
          name: data.contact.name,
          phone: normalizedPhone ?? undefined,
        },
        create: {
          email: normalizedEmail,
          name: data.contact.name,
          phone: normalizedPhone,
        },
      });

      const address = await tx.address.create({
        data: {
          line1: data.address.line1,
          line2: data.address.line2,
          city: data.address.city,
          state: data.address.state.toUpperCase(),
          zip: normalizeZip(data.address.zip),
          customerId: customer.id,
        },
      });

      const lead = await tx.lead.create({
        data: {
          referenceNumber,
          submissionToken: token,
          source: "website-schedule",
          contactName: data.contact.name,
          contactEmail: normalizedEmail,
          contactPhone: normalizedPhone,
          contactPreference: "EMAIL",
          isInServiceArea: inServiceArea,
          outOfServiceAreaNote: inServiceArea
            ? undefined
            : "Address is outside the published service area.",
          customerId: customer.id,
          addressId: address.id,
          marketingConsent: false,
          consentToContact: true,
          privacyPolicyAcknowledged: true,
        },
      });

      await tx.leadService.create({
        data: {
          leadId: lead.id,
          serviceId: service.id,
        },
      });

      const appointment = await tx.appointment.create({
        data: {
          leadId: lead.id,
          customerId: customer.id,
          addressId: address.id,
          scheduledDate,
          arrivalWindow: arrivalWindowData.arrivalWindow,
          arrivalWindowLabel: arrivalWindowData.arrivalWindowLabel,
          status: "REQUESTED",
          crewNotes: data.notes,
        },
      });

      return { lead, appointment, customer, address };
    });

    // Upload photos after transaction
    if (files.length > 0) {
      const uploaded = await uploadPhotos(files, "Appointment", result.appointment.id);
      await prisma.uploadedAsset.createMany({
        data: uploaded.map((asset) => ({
          key: asset.key,
          originalName: asset.originalName,
          contentType: asset.contentType,
          sizeBytes: asset.sizeBytes,
          ownerType: "Appointment",
          ownerId: result.appointment.id,
          isPrivate: true,
        })),
      });
    }

    markSubmissionTokenUsed(token);
    recordRateLimit(String(ip));
    recordRateLimit(data.contact.email);

    await Promise.allSettled([
      email.appointmentConfirmed({
        name: data.contact.name,
        email: normalizedEmail,
        referenceNumber,
        scheduledDate: scheduledDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        arrivalWindow: data.arrivalWindow,
        address: `${result.address.line1}, ${result.address.city}, ${result.address.state} ${result.address.zip}`,
      }),
      email.internalNewLead({
        referenceNumber,
        name: data.contact.name,
        email: normalizedEmail,
        phone: normalizedPhone ?? undefined,
        services: [service.title],
      }),
    ]);

    await prisma.auditLog.create({
      data: {
        action: "SCHEDULE_REQUEST_SUBMITTED",
        entityType: "Appointment",
        entityId: result.appointment.id,
        actorType: "Customer",
        metadata: { referenceNumber, inServiceArea, serviceSlug: data.serviceSlug },
        ipAddress: String(ip),
        userAgent,
      },
    });

    revalidatePath("/schedule");

    return { success: true, referenceNumber };
  } catch (error) {
    logger.error("Failed to submit schedule request", { error, ip });

    if (error instanceof Error && error.message === "SLOT_UNAVAILABLE") {
      return {
        success: false,
        message:
          "The selected time slot is no longer available. Please choose another date or window.",
      };
    }

    if (error instanceof z.ZodError) {
      const flattened = error.flatten();
      return {
        success: false,
        message: "Please correct the errors below and try again.",
        errors: {
          ...flattened.fieldErrors,
          form: flattened.formErrors,
        },
      };
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          success: false,
          message: "A duplicate submission was detected. Please refresh and try again.",
        };
      }
    }

    return {
      success: false,
      message: "Something went wrong while scheduling your appointment. Please try again.",
    };
  }
}

export async function getScheduleSubmissionToken(): Promise<string> {
  return generateSubmissionToken();
}

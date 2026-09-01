"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { quoteSubmissionSchema } from "@/lib/validation/schemas";
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
  normalizeDateString,
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
  process.env.QUOTE_MAX_FILE_SIZE_BYTES ?? "10485760",
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

export type SubmissionResult =
  | { success: true; referenceNumber: string }
  | {
      success: false;
      message: string;
      errors?: Record<string, string[]>;
    };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseArrivalWindow(value: string | undefined): {
  arrivalWindow?: "MORNING" | "AFTERNOON" | "EVENING" | "ANYTIME";
  arrivalWindowLabel?: string;
} {
  if (!value) return {};
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

// ---------------------------------------------------------------------------
// Server action
// ---------------------------------------------------------------------------

export async function submitQuote(formData: FormData): Promise<SubmissionResult> {
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for") ?? requestHeaders.get("x-real-ip") ?? "unknown";
  const userAgent = requestHeaders.get("user-agent") ?? undefined;

  try {
    // Honeypot check
    const website = formData.get("website")?.toString();
    if (!isHoneypotClean(website)) {
      logger.warn("Honeypot triggered", { ip });
      return { success: false, message: "Submission failed. Please try again." };
    }

    // Rate limit by IP and by email (email checked after parsing)
    if (isRateLimited(String(ip))) {
      return {
        success: false,
        message: "Too many submissions from this device. Please try again later.",
      };
    }

    // Parse JSON form data
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

    // Submission token / duplicate guard
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

    // Turnstile verification
    const turnstileToken = (rawData as Record<string, unknown>).turnstileToken?.toString() ?? "";
    const turnstileOk = await verifyTurnstileToken(turnstileToken, TURNSTILE_SECRET_KEY);
    if (!turnstileOk) {
      return { success: false, message: "Security check failed. Please try again." };
    }

    // Minimum completion-time check
    const startedAt = (rawData as Record<string, unknown>).startedAt?.toString();
    if (startedAt && isFormCompletedTooFast(startedAt)) {
      return {
        success: false,
        message: "Submission was too fast. Please take your time filling out the form.",
      };
    }

    // Validate schema
    const parseResult = quoteSubmissionSchema.safeParse(rawData);
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

    // Rate limit by email
    if (isRateLimited(data.email)) {
      return {
        success: false,
        message: "Too many submissions from this email. Please try again later.",
      };
    }

    // Normalize
    const normalizedEmail = normalizeEmail(data.email);
    const normalizedPhone = data.phone ? normalizePhone(data.phone) : null;
    const normalizedZip = normalizeZip(data.zip);
    const inServiceArea = isInServiceArea(normalizedZip);

    // Collect files
    const files: File[] = [];
    for (const entry of formData.getAll("photos")) {
      if (entry instanceof File && entry.size > 0) {
        files.push(entry);
      }
    }

    if (files.length > 10) {
      return { success: false, message: "You can upload up to 10 photos." };
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

    const arrivalWindowData = parseArrivalWindow(data.arrivalWindow);
    const serviceSlugs = data.serviceSlugs;
    const contactName = `${data.firstName} ${data.lastName}`.trim();

    // Resolve services to real database IDs
    const serviceRecords = await prisma.service.findMany({
      where: { slug: { in: serviceSlugs } },
      select: { id: true, slug: true, title: true },
    });

    if (serviceRecords.length === 0 && serviceSlugs.length > 0) {
      return {
        success: false,
        message: "One or more selected services are not available. Please refresh and try again.",
      };
    }

    // Create records in a transaction
    const lead = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.upsert({
        where: { email: normalizedEmail },
        update: {
          name: contactName,
          phone: normalizedPhone ?? undefined,
        },
        create: {
          email: normalizedEmail,
          name: contactName,
          phone: normalizedPhone,
        },
      });

      const address = await tx.address.create({
        data: {
          line1: data.line1,
          line2: data.line2,
          city: data.city,
          state: data.state.toUpperCase(),
          zip: normalizedZip,
          customerId: customer.id,
        },
      });

      const newLead = await tx.lead.create({
        data: {
          referenceNumber,
          submissionToken: token,
          source: "website",
          firstName: data.firstName,
          lastName: data.lastName,
          contactName,
          contactEmail: normalizedEmail,
          contactPhone: normalizedPhone,
          contactPreference: data.contactPreference,
          isInServiceArea: inServiceArea,
          outOfServiceAreaNote: inServiceArea
            ? undefined
            : "Address is outside the published service area.",
          propertyType: data.propertyType,
          itemsDescription: data.itemsDescription,
          indoorOutdoor: data.indoorOutdoor,
          floorLevel: data.floorLevel,
          hasStairs: data.hasStairs,
          hasElevator: data.hasElevator,
          longCarry: data.longCarry,
          disassemblyRequired: data.disassemblyRequired,
          heavySpecialtyItems: data.heavySpecialtyItems,
          preferredDate: normalizeDateString(data.preferredDate?.toISOString()),
          arrivalWindow: arrivalWindowData.arrivalWindow,
          loadSize: data.loadSize,
          marketingConsent: data.marketingConsent,
          consentToContact: data.consentToContact,
          privacyPolicyAcknowledged: data.privacyPolicyAcknowledged,
          customerId: customer.id,
          addressId: address.id,
        },
      });

      await tx.quoteRequest.create({
        data: {
          leadId: newLead.id,
          estimatedLoadSize: data.loadSize,
          notes: data.notes,
          status: "submitted",
        },
      });

      await tx.leadService.createMany({
        data: serviceRecords.map((service) => ({
          leadId: newLead.id,
          serviceId: service.id,
        })),
        skipDuplicates: true,
      });

      return newLead;
    });

    // Upload photos after the transaction so we don't leave orphaned S3 objects on DB rollback
    if (files.length > 0) {
      const uploaded = await uploadPhotos(files, "Lead", lead.id);
      await prisma.uploadedAsset.createMany({
        data: uploaded.map((asset) => ({
          key: asset.key,
          originalName: asset.originalName,
          contentType: asset.contentType,
          sizeBytes: asset.sizeBytes,
          ownerType: "Lead",
          ownerId: lead.id,
          isPrivate: true,
        })),
      });
    }

    // Mark token used after successful creation
    markSubmissionTokenUsed(token);
    recordRateLimit(String(ip));
    recordRateLimit(data.email);

    // Send emails
    const serviceTitles = serviceRecords.map((service) => service.title);
    await Promise.allSettled([
      email.quoteReceived({
        name: contactName,
        email: normalizedEmail,
        referenceNumber,
        services: serviceTitles,
      }),
      email.internalNewLead({
        referenceNumber,
        name: contactName,
        email: normalizedEmail,
        phone: normalizedPhone ?? undefined,
        services: serviceTitles,
      }),
    ]);

    await prisma.auditLog.create({
      data: {
        action: "QUOTE_SUBMITTED",
        entityType: "Lead",
        entityId: lead.id,
        actorType: "Customer",
        metadata: { referenceNumber, inServiceArea },
        ipAddress: String(ip),
        userAgent,
      },
    });

    revalidatePath("/quote");

    return { success: true, referenceNumber };
  } catch (error) {
    logger.error("Failed to submit quote", { error, ip });

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
      message: "Something went wrong while submitting your request. Please try again.",
    };
  }
}

// ---------------------------------------------------------------------------
// Client helper: generate a fresh submission token server-side
// ---------------------------------------------------------------------------

export async function getQuoteSubmissionToken(): Promise<string> {
  return generateSubmissionToken();
}

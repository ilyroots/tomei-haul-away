"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, logAuditAction } from "@/lib/audit/audit";
import { prisma } from "@/lib/db/prisma";
import {
  businessSettingsSchema,
  availabilityWindowSchema,
  blackoutDateSchema,
} from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";

// ---------------------------------------------------------------------------
// Business settings (env-driven)
// ---------------------------------------------------------------------------

export type BusinessSettings = {
  businessTimezone: string;
  adminEmail: string;
  notificationEmail: string;
  phone: string;
  textNumber: string;
};

export async function getBusinessSettings(): Promise<BusinessSettings> {
  await requireAdmin();

  return {
    businessTimezone: process.env.BUSINESS_TIMEZONE ?? "America/New_York",
    adminEmail: process.env.ADMIN_EMAIL ?? "",
    notificationEmail: process.env.BUSINESS_NOTIFICATION_EMAIL ?? "",
    phone: process.env.PHONE ?? "",
    textNumber: process.env.TEXT_NUMBER ?? "",
  };
}

export type ActionResult = { success: true } | { success: false; message: string };

export async function updateBusinessSettings(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = businessSettingsSchema.safeParse({
    businessTimezone: formData.get("businessTimezone"),
    adminEmail: formData.get("adminEmail"),
    notificationEmail: formData.get("notificationEmail"),
    phone: formData.get("phone"),
    textNumber: formData.get("textNumber"),
  });

  if (!parsed.success) {
    return { success: false, message: "Invalid settings." };
  }

  // Business settings are stored in environment variables and cannot be updated at runtime.
  // Validate the input and instruct the operator to update the deployment environment.
  await logAuditAction({
    action: "BUSINESS_SETTINGS_VALIDATED",
    metadata: parsed.data,
  });

  return {
    success: true,
  };
}

// ---------------------------------------------------------------------------
// Availability windows
// ---------------------------------------------------------------------------

export async function getAvailabilityWindows() {
  await requireAdmin();
  return prisma.availabilityWindow.findMany({
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
}

export async function createAvailabilityWindow(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = availabilityWindowSchema.safeParse({
    dayOfWeek: Number(formData.get("dayOfWeek")),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    label: formData.get("label") || undefined,
    maxAppointments: Number(formData.get("maxAppointments")),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { success: false, message: "Invalid availability window." };
  }

  try {
    await prisma.availabilityWindow.create({ data: parsed.data });
    await logAuditAction({ action: "AVAILABILITY_WINDOW_CREATED", metadata: parsed.data });
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    logger.error("Failed to create availability window", { error });
    return { success: false, message: "Failed to create availability window." };
  }
}

export async function updateAvailabilityWindow(
  id: number,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = availabilityWindowSchema.safeParse({
    dayOfWeek: Number(formData.get("dayOfWeek")),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    label: formData.get("label") || undefined,
    maxAppointments: Number(formData.get("maxAppointments")),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { success: false, message: "Invalid availability window." };
  }

  try {
    await prisma.availabilityWindow.update({ where: { id }, data: parsed.data });
    await logAuditAction({
      action: "AVAILABILITY_WINDOW_UPDATED",
      entityId: String(id),
      metadata: parsed.data,
    });
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    logger.error("Failed to update availability window", { error, id });
    return { success: false, message: "Failed to update availability window." };
  }
}

export async function deleteAvailabilityWindow(id: number): Promise<ActionResult> {
  await requireAdmin();

  try {
    await prisma.availabilityWindow.delete({ where: { id } });
    await logAuditAction({ action: "AVAILABILITY_WINDOW_DELETED", entityId: String(id) });
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    logger.error("Failed to delete availability window", { error, id });
    return { success: false, message: "Failed to delete availability window." };
  }
}

// ---------------------------------------------------------------------------
// Blackout dates
// ---------------------------------------------------------------------------

export async function getBlackoutDates() {
  await requireAdmin();
  return prisma.blackoutDate.findMany({ orderBy: { date: "asc" } });
}

export async function createBlackoutDate(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = blackoutDateSchema.safeParse({
    date: formData.get("date"),
    reason: formData.get("reason") || undefined,
  });

  if (!parsed.success) {
    return { success: false, message: "Invalid blackout date." };
  }

  try {
    await prisma.blackoutDate.create({
      data: { date: parsed.data.date, reason: parsed.data.reason },
    });
    await logAuditAction({
      action: "BLACKOUT_DATE_CREATED",
      metadata: { date: parsed.data.date.toISOString(), reason: parsed.data.reason },
    });
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    logger.error("Failed to create blackout date", { error });
    return { success: false, message: "Failed to create blackout date. It may already exist." };
  }
}

export async function deleteBlackoutDate(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    await prisma.blackoutDate.delete({ where: { id } });
    await logAuditAction({ action: "BLACKOUT_DATE_DELETED", entityId: id });
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    logger.error("Failed to delete blackout date", { error, id });
    return { success: false, message: "Failed to delete blackout date." };
  }
}

// ---------------------------------------------------------------------------
// Email template preview
// ---------------------------------------------------------------------------

export type EmailTemplateName =
  | "quoteReceived"
  | "moreInfoRequested"
  | "quoteReady"
  | "appointmentConfirmed"
  | "appointmentChanged"
  | "appointmentCancelled"
  | "appointmentReminder"
  | "internalNewLead";

export async function previewEmailTemplate(templateName: EmailTemplateName): Promise<string> {
  await requireAdmin();

  const sample = {
    name: "Jane Doe",
    email: "jane@example.com",
    referenceNumber: "THA-SAMPLE",
    services: ["Furniture Removal", "Appliance Removal"],
    questions: "Could you confirm whether you remove pianos?",
    estimatedMin: 150,
    estimatedMax: 300,
    validUntil: "December 31, 2025",
    scheduledDate: "Saturday, January 15, 2026",
    arrivalWindow: "Morning",
    address: "123 Main St, Haverhill, MA 01830",
    phone: "5551234567",
  };

  switch (templateName) {
    case "quoteReceived":
      return `
        <p>Hi ${sample.name},</p>
        <p>Thanks for contacting Tomei Haul Away. We received your request and will review it shortly.</p>
        <p><strong>Reference:</strong> ${sample.referenceNumber}</p>
      `;
    case "moreInfoRequested":
      return `
        <p>Hi ${sample.name},</p>
        <p>We are reviewing your request and need a bit more detail:</p>
        <blockquote>${sample.questions}</blockquote>
        <p><strong>Reference:</strong> ${sample.referenceNumber}</p>
      `;
    case "quoteReady":
      return `
        <p>Hi ${sample.name},</p>
        <p>Your estimate is ready:</p>
        <p><strong>Estimated range:</strong> $${sample.estimatedMin} – $${sample.estimatedMax}</p>
        <p><strong>Valid until:</strong> ${sample.validUntil}</p>
        <p><strong>Reference:</strong> ${sample.referenceNumber}</p>
      `;
    case "appointmentConfirmed":
      return `
        <p>Hi ${sample.name},</p>
        <p>Your appointment is confirmed for <strong>${sample.scheduledDate}</strong> (${sample.arrivalWindow}).</p>
        <p><strong>Address:</strong> ${sample.address}</p>
        <p><strong>Reference:</strong> ${sample.referenceNumber}</p>
      `;
    case "appointmentChanged":
      return `
        <p>Hi ${sample.name},</p>
        <p>Your appointment has been rescheduled to <strong>${sample.scheduledDate}</strong> (${sample.arrivalWindow}).</p>
        <p><strong>Reference:</strong> ${sample.referenceNumber}</p>
      `;
    case "appointmentCancelled":
      return `
        <p>Hi ${sample.name},</p>
        <p>Your appointment on ${sample.scheduledDate} has been cancelled. Let us know if you would like to reschedule.</p>
        <p><strong>Reference:</strong> ${sample.referenceNumber}</p>
      `;
    case "appointmentReminder":
      return `
        <p>Hi ${sample.name},</p>
        <p>This is a friendly reminder that our crew is scheduled to arrive tomorrow, <strong>${sample.scheduledDate}</strong> (${sample.arrivalWindow}).</p>
        <p><strong>Address:</strong> ${sample.address}</p>
        <p><strong>Reference:</strong> ${sample.referenceNumber}</p>
      `;
    case "internalNewLead":
      return `
        <p>A new quote request was submitted.</p>
        <ul>
          <li><strong>Reference:</strong> ${sample.referenceNumber}</li>
          <li><strong>Name:</strong> ${sample.name}</li>
          <li><strong>Email:</strong> ${sample.email}</li>
          <li><strong>Phone:</strong> ${sample.phone}</li>
          <li><strong>Services:</strong> ${sample.services.join(", ")}</li>
        </ul>
      `;
    default:
      return "<p>Unknown template.</p>";
  }
}

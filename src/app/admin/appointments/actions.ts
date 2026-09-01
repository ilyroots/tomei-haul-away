"use server";

import { revalidatePath } from "next/cache";
import { AppointmentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { updateAppointmentStatusSchema, internalNoteSchema } from "@/lib/validation/schemas";
import { requireAdmin, logAuditAction } from "@/lib/audit/audit";
import { logger } from "@/lib/logging/logger";
import { getSignedDownloadUrl } from "@/lib/storage/s3";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AppointmentFilters = {
  status?: AppointmentStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
};

export type AppointmentsResult = {
  appointments: Array<{
    id: string;
    scheduledDate: Date;
    arrivalWindow: string | null;
    status: AppointmentStatus;
    leadId: string | null;
    contactName: string | null;
    addressSummary: string | null;
  }>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_PAGE_SIZE = 20;

function buildAppointmentSearchWhere(search?: string): Prisma.AppointmentWhereInput {
  if (!search || search.trim() === "") return {};

  const term = search.trim();
  const phoneTerm = term.replace(/\D/g, "");

  return {
    OR: [
      { lead: { contactName: { contains: term, mode: "insensitive" } } },
      { lead: { contactEmail: { contains: term, mode: "insensitive" } } },
      { lead: { referenceNumber: { contains: term, mode: "insensitive" } } },
      ...(phoneTerm.length > 0 ? [{ lead: { contactPhone: { contains: phoneTerm } } }] : []),
      {
        address: {
          OR: [
            { zip: { contains: term } },
            { city: { contains: term, mode: "insensitive" } },
            { line1: { contains: term, mode: "insensitive" } },
          ],
        },
      },
    ],
  };
}

function toDateOnly(date: Date): Date {
  const copy = new Date(date);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

function getDayOfWeek(date: Date): number {
  return date.getUTCDay();
}

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

export async function checkCapacity(
  scheduledDate: Date,
  arrivalWindowLabel: string,
  excludeAppointmentId?: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const dateOnly = toDateOnly(scheduledDate);

  const blackout = await prisma.blackoutDate.findUnique({ where: { date: dateOnly } });
  if (blackout) {
    return { ok: false, message: "The selected date is blocked for scheduling." };
  }

  const dayOfWeek = getDayOfWeek(scheduledDate);
  const windows = await prisma.availabilityWindow.findMany({
    where: { dayOfWeek, isActive: true },
  });

  if (windows.length === 0) {
    return { ok: false, message: "No availability windows configured for this day." };
  }

  const arrivalWindowData = parseArrivalWindow(arrivalWindowLabel);
  const targetWindows = windows.filter(
    (w) =>
      !arrivalWindowLabel ||
      (w.label && w.label.toUpperCase().includes(arrivalWindowLabel.toUpperCase())) ||
      (arrivalWindowData.arrivalWindow &&
        w.label?.toUpperCase().includes(arrivalWindowData.arrivalWindow))
  );

  const capacity = (targetWindows.length > 0 ? targetWindows : windows).reduce(
    (sum, w) => sum + w.maxAppointments,
    0
  );

  const scheduledCount = await prisma.appointment.count({
    where: {
      scheduledDate: {
        gte: dateOnly,
        lt: new Date(dateOnly.getTime() + 24 * 60 * 60 * 1000),
      },
      OR: [
        { arrivalWindowLabel },
        arrivalWindowData.arrivalWindow ? { arrivalWindow: arrivalWindowData.arrivalWindow } : {},
      ],
      ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
    },
  });

  if (scheduledCount >= capacity) {
    return { ok: false, message: "The selected time slot is fully booked." };
  }

  return { ok: true };
}

// ---------------------------------------------------------------------------
// Read actions
// ---------------------------------------------------------------------------

export async function getAppointments(
  filters: AppointmentFilters = {}
): Promise<AppointmentsResult> {
  await requireAdmin();

  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? DEFAULT_PAGE_SIZE));

  const where: Prisma.AppointmentWhereInput = {
    ...(filters.status ? { status: filters.status } : {}),
    ...buildAppointmentSearchWhere(filters.search),
    ...(filters.dateFrom || filters.dateTo
      ? {
          scheduledDate: {
            ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
            ...(filters.dateTo ? { lte: new Date(filters.dateTo) } : {}),
          },
        }
      : {}),
  };

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      orderBy: { scheduledDate: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        lead: { select: { contactName: true } },
        address: { select: { city: true, state: true, zip: true } },
      },
    }),
    prisma.appointment.count({ where }),
  ]);

  return {
    appointments: appointments.map((appt) => ({
      id: appt.id,
      scheduledDate: appt.scheduledDate,
      arrivalWindow: appt.arrivalWindowLabel ?? appt.arrivalWindow ?? null,
      status: appt.status,
      leadId: appt.leadId,
      contactName: appt.lead?.contactName ?? null,
      addressSummary: appt.address
        ? `${appt.address.city}, ${appt.address.state} ${appt.address.zip}`
        : null,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getAppointmentById(id: string) {
  await requireAdmin();

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      lead: true,
      customer: true,
      address: true,
      notes: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  if (!appointment) return null;

  const assets = await prisma.uploadedAsset.findMany({
    where: { ownerType: "Appointment", ownerId: appointment.id },
    orderBy: { createdAt: "desc" },
  });

  const signedAssets = await Promise.all(
    assets.map(async (asset) => ({
      ...asset,
      signedUrl: await getSignedDownloadUrl(asset.key, 60 * 60),
    }))
  );

  const statusHistory = await prisma.statusHistory.findMany({
    where: { entityType: "Appointment", entityId: appointment.id },
    orderBy: { createdAt: "desc" },
    include: { changedBy: { select: { id: true, name: true, email: true } } },
  });

  return {
    ...appointment,
    arrivalWindow: appointment.arrivalWindowLabel ?? appointment.arrivalWindow ?? "",
    assets: signedAssets,
    statusHistory,
  };
}

// ---------------------------------------------------------------------------
// Mutation actions
// ---------------------------------------------------------------------------

export type ActionResult = { success: true } | { success: false; message: string };

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
  scheduledDate?: Date,
  arrivalWindow?: string,
  reason?: string
): Promise<ActionResult> {
  const session = await requireAdmin();

  const parsed = updateAppointmentStatusSchema.safeParse({
    appointmentId,
    status,
    scheduledDate,
    arrivalWindow,
    reason,
  });
  if (!parsed.success) {
    return { success: false, message: "Invalid input." };
  }

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: parsed.data.appointmentId },
    });
    if (!appointment) {
      return { success: false, message: "Appointment not found." };
    }

    const newDate = parsed.data.scheduledDate ?? appointment.scheduledDate;
    const newWindowLabel =
      parsed.data.arrivalWindow !== undefined
        ? parsed.data.arrivalWindow
        : (appointment.arrivalWindowLabel ?? "");

    if (newWindowLabel) {
      const capacity = await checkCapacity(newDate, newWindowLabel, appointment.id);
      if (!capacity.ok) {
        return { success: false, message: capacity.message };
      }
    }

    const arrivalWindowData = parseArrivalWindow(newWindowLabel);

    await prisma.$transaction([
      prisma.appointment.update({
        where: { id: parsed.data.appointmentId },
        data: {
          status: parsed.data.status,
          scheduledDate: newDate,
          arrivalWindow: arrivalWindowData.arrivalWindow,
          arrivalWindowLabel: arrivalWindowData.arrivalWindowLabel ?? newWindowLabel,
        },
      }),
      prisma.statusHistory.create({
        data: {
          entityType: "Appointment",
          entityId: parsed.data.appointmentId,
          fromStatus: appointment.status,
          toStatus: parsed.data.status,
          changedById: session.user.id,
          reason: parsed.data.reason,
        },
      }),
    ]);

    await logAuditAction({
      action: "APPOINTMENT_STATUS_UPDATED",
      entityType: "Appointment",
      entityId: parsed.data.appointmentId,
      metadata: {
        fromStatus: appointment.status,
        toStatus: parsed.data.status,
        scheduledDate: newDate.toISOString(),
        arrivalWindow: newWindowLabel,
        reason: parsed.data.reason,
      },
    });

    revalidatePath(`/admin/appointments/${parsed.data.appointmentId}`);
    revalidatePath("/admin/appointments");
    return { success: true };
  } catch (error) {
    logger.error("Failed to update appointment status", { error, appointmentId, status });
    return { success: false, message: "Failed to update appointment." };
  }
}

export async function addAppointmentNote(
  appointmentId: string,
  content: string
): Promise<ActionResult> {
  const session = await requireAdmin();

  const parsed = internalNoteSchema.safeParse({ content });
  if (!parsed.success) {
    return { success: false, message: "Note content is required." };
  }

  try {
    await prisma.internalNote.create({
      data: {
        appointmentId,
        authorId: session.user.id,
        content: parsed.data.content,
      },
    });

    await logAuditAction({
      action: "APPOINTMENT_NOTE_ADDED",
      entityType: "Appointment",
      entityId: appointmentId,
      metadata: { authorId: session.user.id },
    });

    revalidatePath(`/admin/appointments/${appointmentId}`);
    return { success: true };
  } catch (error) {
    logger.error("Failed to add appointment note", { error, appointmentId });
    return { success: false, message: "Failed to add note." };
  }
}

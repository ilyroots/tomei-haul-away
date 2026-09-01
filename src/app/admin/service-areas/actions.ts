"use server";

import { revalidatePath } from "next/cache";
import { serviceAreaSchema } from "@/lib/validation/schemas";
import { requireAdmin, logAuditAction } from "@/lib/audit/audit";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";

export type ActionResult = { success: true } | { success: false; message: string };

function parseServiceAreaForm(formData: FormData) {
  return serviceAreaSchema.safeParse({
    city: formData.get("city"),
    zip: formData.get("zip"),
    pageContent: formData.get("pageContent") || undefined,
    isActive: formData.get("isActive") === "on",
  });
}

export async function getServiceAreas() {
  await requireAdmin();
  return prisma.serviceArea.findMany({ orderBy: [{ city: "asc" }, { zip: "asc" }] });
}

export async function createServiceArea(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = parseServiceAreaForm(formData);
  if (!parsed.success) {
    return { success: false, message: "Invalid service area." };
  }

  try {
    const area = await prisma.serviceArea.create({ data: parsed.data });
    await logAuditAction({
      action: "SERVICE_AREA_CREATED",
      entityType: "ServiceArea",
      entityId: area.id,
      metadata: { city: parsed.data.city, zip: parsed.data.zip },
    });
    revalidatePath("/admin/service-areas");
    return { success: true };
  } catch (error) {
    logger.error("Failed to create service area", { error });
    return { success: false, message: "Failed to create service area. The ZIP may already exist." };
  }
}

export async function updateServiceArea(id: string, formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = parseServiceAreaForm(formData);
  if (!parsed.success) {
    return { success: false, message: "Invalid service area." };
  }

  try {
    await prisma.serviceArea.update({ where: { id }, data: parsed.data });
    await logAuditAction({
      action: "SERVICE_AREA_UPDATED",
      entityType: "ServiceArea",
      entityId: id,
      metadata: { city: parsed.data.city, zip: parsed.data.zip },
    });
    revalidatePath("/admin/service-areas");
    return { success: true };
  } catch (error) {
    logger.error("Failed to update service area", { error, id });
    return { success: false, message: "Failed to update service area." };
  }
}

export async function deleteServiceArea(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    await prisma.serviceArea.delete({ where: { id } });
    await logAuditAction({
      action: "SERVICE_AREA_DELETED",
      entityType: "ServiceArea",
      entityId: id,
    });
    revalidatePath("/admin/service-areas");
    return { success: true };
  } catch (error) {
    logger.error("Failed to delete service area", { error, id });
    return { success: false, message: "Failed to delete service area." };
  }
}

export async function toggleServiceAreaActive(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  await requireAdmin();

  try {
    await prisma.serviceArea.update({ where: { id }, data: { isActive } });
    await logAuditAction({
      action: isActive ? "SERVICE_AREA_ACTIVATED" : "SERVICE_AREA_DEACTIVATED",
      entityType: "ServiceArea",
      entityId: id,
    });
    revalidatePath("/admin/service-areas");
    return { success: true };
  } catch (error) {
    logger.error("Failed to toggle service area", { error, id });
    return { success: false, message: "Failed to update service area." };
  }
}

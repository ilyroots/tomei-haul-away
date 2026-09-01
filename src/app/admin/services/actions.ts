"use server";

import { revalidatePath } from "next/cache";
import { serviceSchema } from "@/lib/validation/schemas";
import { requireAdmin, logAuditAction } from "@/lib/audit/audit";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";

export type ActionResult = { success: true } | { success: false; message: string };

function parseServiceForm(formData: FormData) {
  return serviceSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    isActive: formData.get("isActive") === "on",
  });
}

export async function getServices() {
  await requireAdmin();
  return prisma.service.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function createService(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = parseServiceForm(formData);
  if (!parsed.success) {
    return { success: false, message: "Invalid service." };
  }

  try {
    const service = await prisma.service.create({ data: parsed.data });
    await logAuditAction({
      action: "SERVICE_CREATED",
      entityType: "Service",
      entityId: service.id,
      metadata: { slug: parsed.data.slug, title: parsed.data.title },
    });
    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    logger.error("Failed to create service", { error });
    return { success: false, message: "Failed to create service. The slug may already exist." };
  }
}

export async function updateService(id: string, formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = parseServiceForm(formData);
  if (!parsed.success) {
    return { success: false, message: "Invalid service." };
  }

  try {
    await prisma.service.update({ where: { id }, data: parsed.data });
    await logAuditAction({
      action: "SERVICE_UPDATED",
      entityType: "Service",
      entityId: id,
      metadata: { slug: parsed.data.slug, title: parsed.data.title },
    });
    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    logger.error("Failed to update service", { error, id });
    return { success: false, message: "Failed to update service." };
  }
}

export async function deleteService(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    await prisma.service.delete({ where: { id } });
    await logAuditAction({ action: "SERVICE_DELETED", entityType: "Service", entityId: id });
    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    logger.error("Failed to delete service", { error, id });
    return { success: false, message: "Failed to delete service." };
  }
}

export async function toggleServiceActive(id: string, isActive: boolean): Promise<ActionResult> {
  await requireAdmin();

  try {
    await prisma.service.update({ where: { id }, data: { isActive } });
    await logAuditAction({
      action: isActive ? "SERVICE_ACTIVATED" : "SERVICE_DEACTIVATED",
      entityType: "Service",
      entityId: id,
    });
    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    logger.error("Failed to toggle service", { error, id });
    return { success: false, message: "Failed to update service." };
  }
}

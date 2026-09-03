"use server";

import { revalidatePath } from "next/cache";
import { faqSchema } from "@/lib/validation/schemas";
import { requireAdmin, logAuditAction } from "@/lib/audit/audit";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";

export type ActionResult = { success: true } | { success: false; message: string };

function parseFAQForm(formData: FormData) {
  return faqSchema.safeParse({
    question: formData.get("question"),
    answer: formData.get("answer"),
    category: formData.get("category") || undefined,
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    isActive: formData.get("isActive") === "on",
  });
}

export async function getFAQs() {
  await requireAdmin();
  return prisma.fAQ.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] });
}

export async function createFAQ(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = parseFAQForm(formData);
  if (!parsed.success) {
    return { success: false, message: "Invalid FAQ." };
  }

  try {
    const faq = await prisma.fAQ.create({ data: parsed.data });
    await logAuditAction({
      action: "FAQ_CREATED",
      entityType: "FAQ",
      entityId: faq.id,
      metadata: { question: parsed.data.question },
    });
    revalidatePath("/admin/faq");
    return { success: true };
  } catch (error) {
    logger.error("Failed to create FAQ", { error });
    return { success: false, message: "Failed to create FAQ." };
  }
}

export async function updateFAQ(id: string, formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = parseFAQForm(formData);
  if (!parsed.success) {
    return { success: false, message: "Invalid FAQ." };
  }

  try {
    await prisma.fAQ.update({ where: { id }, data: parsed.data });
    await logAuditAction({
      action: "FAQ_UPDATED",
      entityType: "FAQ",
      entityId: id,
      metadata: { question: parsed.data.question },
    });
    revalidatePath("/admin/faq");
    return { success: true };
  } catch (error) {
    logger.error("Failed to update FAQ", { error, id });
    return { success: false, message: "Failed to update FAQ." };
  }
}

export async function deleteFAQ(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    await prisma.fAQ.delete({ where: { id } });
    await logAuditAction({ action: "FAQ_DELETED", entityType: "FAQ", entityId: id });
    revalidatePath("/admin/faq");
    return { success: true };
  } catch (error) {
    logger.error("Failed to delete FAQ", { error, id });
    return { success: false, message: "Failed to delete FAQ." };
  }
}

export async function toggleFAQActive(id: string, isActive: boolean): Promise<ActionResult> {
  await requireAdmin();

  try {
    await prisma.fAQ.update({ where: { id }, data: { isActive } });
    await logAuditAction({
      action: isActive ? "FAQ_ACTIVATED" : "FAQ_DEACTIVATED",
      entityType: "FAQ",
      entityId: id,
    });
    revalidatePath("/admin/faq");
    return { success: true };
  } catch (error) {
    logger.error("Failed to toggle FAQ", { error, id });
    return { success: false, message: "Failed to update FAQ." };
  }
}

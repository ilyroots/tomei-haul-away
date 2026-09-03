"use server";

import { revalidatePath } from "next/cache";
import { testimonialSchema } from "@/lib/validation/schemas";
import { requireAdmin, logAuditAction } from "@/lib/audit/audit";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";

export type ActionResult = { success: true } | { success: false; message: string };

function parseTestimonialForm(formData: FormData) {
  return testimonialSchema.safeParse({
    authorName: formData.get("authorName"),
    location: formData.get("location") || undefined,
    content: formData.get("content"),
    rating: formData.get("rating") ? Number(formData.get("rating")) : undefined,
    isApproved: formData.get("isApproved") === "on",
  });
}

export async function getTestimonials() {
  await requireAdmin();
  return prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createTestimonial(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = parseTestimonialForm(formData);
  if (!parsed.success) {
    return { success: false, message: "Invalid testimonial." };
  }

  try {
    const testimonial = await prisma.testimonial.create({ data: parsed.data });
    await logAuditAction({
      action: "TESTIMONIAL_CREATED",
      entityType: "Testimonial",
      entityId: testimonial.id,
      metadata: { authorName: parsed.data.authorName },
    });
    revalidatePath("/admin/testimonials");
    return { success: true };
  } catch (error) {
    logger.error("Failed to create testimonial", { error });
    return { success: false, message: "Failed to create testimonial." };
  }
}

export async function updateTestimonial(id: string, formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = parseTestimonialForm(formData);
  if (!parsed.success) {
    return { success: false, message: "Invalid testimonial." };
  }

  try {
    await prisma.testimonial.update({ where: { id }, data: parsed.data });
    await logAuditAction({
      action: "TESTIMONIAL_UPDATED",
      entityType: "Testimonial",
      entityId: id,
      metadata: { authorName: parsed.data.authorName },
    });
    revalidatePath("/admin/testimonials");
    return { success: true };
  } catch (error) {
    logger.error("Failed to update testimonial", { error, id });
    return { success: false, message: "Failed to update testimonial." };
  }
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    await prisma.testimonial.delete({ where: { id } });
    await logAuditAction({
      action: "TESTIMONIAL_DELETED",
      entityType: "Testimonial",
      entityId: id,
    });
    revalidatePath("/admin/testimonials");
    return { success: true };
  } catch (error) {
    logger.error("Failed to delete testimonial", { error, id });
    return { success: false, message: "Failed to delete testimonial." };
  }
}

export async function toggleTestimonialApproval(
  id: string,
  isApproved: boolean
): Promise<ActionResult> {
  await requireAdmin();

  try {
    await prisma.testimonial.update({ where: { id }, data: { isApproved } });
    await logAuditAction({
      action: isApproved ? "TESTIMONIAL_APPROVED" : "TESTIMONIAL_UNAPPROVED",
      entityType: "Testimonial",
      entityId: id,
    });
    revalidatePath("/admin/testimonials");
    return { success: true };
  } catch (error) {
    logger.error("Failed to toggle testimonial approval", { error, id });
    return { success: false, message: "Failed to update testimonial." };
  }
}

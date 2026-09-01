"use server";

import { revalidatePath } from "next/cache";
import { galleryItemSchema } from "@/lib/validation/schemas";
import { requireAdmin, logAuditAction } from "@/lib/audit/audit";
import { prisma } from "@/lib/db/prisma";
import { uploadToS3, getSignedDownloadUrl } from "@/lib/storage/s3";
import { validateFile } from "@/lib/security/helpers";
import { logger } from "@/lib/logging/logger";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const MAX_FILE_SIZE_BYTES = Number.parseInt(
  process.env.GALLERY_MAX_FILE_SIZE_BYTES ?? "10485760",
  10
);
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseGalleryForm(formData: FormData) {
  return galleryItemSchema.safeParse({
    title: formData.get("title") || undefined,
    description: formData.get("description") || undefined,
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    isActive: formData.get("isActive") === "on",
  });
}

async function uploadGalleryPhoto(file: File, galleryItemId: string) {
  const error = validateFile(file, {
    maxSizeBytes: MAX_FILE_SIZE_BYTES,
    allowedMimeTypes: ALLOWED_PHOTO_TYPES,
  });
  if (error) {
    throw new Error(error);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { key } = await uploadToS3(buffer, file.name, file.type, `gallery/${galleryItemId}`);

  return {
    key,
    originalName: file.name,
    contentType: file.type,
    sizeBytes: file.size,
  };
}

// ---------------------------------------------------------------------------
// Read actions
// ---------------------------------------------------------------------------

export async function getGalleryItems() {
  await requireAdmin();
  const items = await prisma.galleryItem.findMany({ orderBy: { sortOrder: "asc" } });
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      signedUrl: item.assetKey ? await getSignedDownloadUrl(item.assetKey, 60 * 60) : null,
    }))
  );
}

// ---------------------------------------------------------------------------
// Mutation actions
// ---------------------------------------------------------------------------

export type ActionResult = { success: true } | { success: false; message: string };

export async function createGalleryItem(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = parseGalleryForm(formData);
  if (!parsed.success) {
    return { success: false, message: "Invalid gallery item." };
  }

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, message: "A photo is required." };
  }

  try {
    // Create placeholder item first so we have an owner ID for the asset.
    const item = await prisma.galleryItem.create({
      data: { ...parsed.data, assetKey: "" },
    });

    const asset = await uploadGalleryPhoto(file, item.id);

    await prisma.$transaction([
      prisma.galleryItem.update({
        where: { id: item.id },
        data: { assetKey: asset.key },
      }),
      prisma.uploadedAsset.create({
        data: {
          key: asset.key,
          originalName: asset.originalName,
          contentType: asset.contentType,
          sizeBytes: asset.sizeBytes,
          ownerType: "GalleryItem",
          ownerId: item.id,
          isPrivate: true,
        },
      }),
    ]);

    await logAuditAction({
      action: "GALLERY_ITEM_CREATED",
      entityType: "GalleryItem",
      entityId: item.id,
      metadata: { title: parsed.data.title },
    });

    revalidatePath("/admin/gallery");
    return { success: true };
  } catch (error) {
    logger.error("Failed to create gallery item", { error });
    return { success: false, message: "Failed to create gallery item." };
  }
}

export async function updateGalleryItem(id: string, formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = parseGalleryForm(formData);
  if (!parsed.success) {
    return { success: false, message: "Invalid gallery item." };
  }

  try {
    const file = formData.get("photo");
    let assetKey: string | undefined;

    if (file instanceof File && file.size > 0) {
      const asset = await uploadGalleryPhoto(file, id);
      assetKey = asset.key;

      await prisma.uploadedAsset.create({
        data: {
          key: asset.key,
          originalName: asset.originalName,
          contentType: asset.contentType,
          sizeBytes: asset.sizeBytes,
          ownerType: "GalleryItem",
          ownerId: id,
          isPrivate: true,
        },
      });
    }

    await prisma.galleryItem.update({
      where: { id },
      data: { ...parsed.data, ...(assetKey ? { assetKey } : {}) },
    });

    await logAuditAction({
      action: "GALLERY_ITEM_UPDATED",
      entityType: "GalleryItem",
      entityId: id,
      metadata: { title: parsed.data.title },
    });

    revalidatePath("/admin/gallery");
    return { success: true };
  } catch (error) {
    logger.error("Failed to update gallery item", { error, id });
    return { success: false, message: "Failed to update gallery item." };
  }
}

export async function deleteGalleryItem(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    await prisma.galleryItem.delete({ where: { id } });
    await logAuditAction({
      action: "GALLERY_ITEM_DELETED",
      entityType: "GalleryItem",
      entityId: id,
    });
    revalidatePath("/admin/gallery");
    return { success: true };
  } catch (error) {
    logger.error("Failed to delete gallery item", { error, id });
    return { success: false, message: "Failed to delete gallery item." };
  }
}

export async function toggleGalleryItemActive(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  await requireAdmin();

  try {
    await prisma.galleryItem.update({ where: { id }, data: { isActive } });
    await logAuditAction({
      action: isActive ? "GALLERY_ITEM_ACTIVATED" : "GALLERY_ITEM_DEACTIVATED",
      entityType: "GalleryItem",
      entityId: id,
    });
    revalidatePath("/admin/gallery");
    return { success: true };
  } catch (error) {
    logger.error("Failed to toggle gallery item", { error, id });
    return { success: false, message: "Failed to update gallery item." };
  }
}

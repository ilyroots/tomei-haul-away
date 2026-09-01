import { prisma } from "@/lib/db/prisma";

export async function getActiveFaqs() {
  try {
    return await prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to fetch FAQs; returning empty list.", error);
    }
    return [];
  }
}

export async function getActiveGalleryItems(limit?: number) {
  try {
    return await prisma.galleryItem.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      take: limit,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to fetch gallery items; returning empty list.", error);
    }
    return [];
  }
}

export async function getApprovedTestimonials(limit?: number) {
  try {
    return await prisma.testimonial.findMany({
      where: { isApproved: true },
      orderBy: { submittedAt: "desc" },
      take: limit,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to fetch testimonials; returning empty list.", error);
    }
    return [];
  }
}

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

export interface ReviewStats {
  total: number;
  average: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export async function getReviewStats(): Promise<ReviewStats> {
  const empty: ReviewStats = {
    total: 0,
    average: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  };
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isApproved: true },
      select: { rating: true },
    });
    const stats: ReviewStats = {
      total: testimonials.length,
      average: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
    let sum = 0;
    let rated = 0;
    for (const testimonial of testimonials) {
      const rating = testimonial.rating;
      if (rating && rating >= 1 && rating <= 5) {
        stats.distribution[rating as 1 | 2 | 3 | 4 | 5] += 1;
        sum += rating;
        rated += 1;
      }
    }
    stats.average = rated > 0 ? sum / rated : 0;
    return stats;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to fetch review stats; returning empty stats.", error);
    }
    return empty;
  }
}

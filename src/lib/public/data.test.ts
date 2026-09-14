import { describe, it, expect, vi, beforeEach } from "vitest";
import { getReviewStats } from "./data";

const mockFindMany = vi.fn();

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    testimonial: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}));

function testimonial(rating: number | null) {
  return { rating };
}

beforeEach(() => {
  mockFindMany.mockReset();
});

describe("getReviewStats", () => {
  it("returns zeroed stats when there are no approved testimonials", async () => {
    mockFindMany.mockResolvedValue([]);

    const stats = await getReviewStats();

    expect(mockFindMany).toHaveBeenCalledWith({
      where: { isApproved: true },
      select: { rating: true },
    });
    expect(stats).toEqual({
      total: 0,
      average: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    });
  });

  it("computes total, average, and per-rating distribution", async () => {
    mockFindMany.mockResolvedValue([
      testimonial(5),
      testimonial(5),
      testimonial(5),
      testimonial(4),
      testimonial(4),
      testimonial(1),
    ]);

    const stats = await getReviewStats();

    expect(stats.total).toBe(6);
    expect(stats.average).toBeCloseTo((5 + 5 + 5 + 4 + 4 + 1) / 6);
    expect(stats.distribution).toEqual({ 5: 3, 4: 2, 3: 0, 2: 0, 1: 1 });
  });

  it("counts unrated testimonials in the total but not the average", async () => {
    mockFindMany.mockResolvedValue([testimonial(5), testimonial(null), testimonial(3)]);

    const stats = await getReviewStats();

    expect(stats.total).toBe(3);
    expect(stats.average).toBe(4);
    expect(stats.distribution).toEqual({ 5: 1, 4: 0, 3: 1, 2: 0, 1: 0 });
  });

  it("ignores ratings outside the 1-5 range", async () => {
    mockFindMany.mockResolvedValue([testimonial(5), testimonial(0), testimonial(7)]);

    const stats = await getReviewStats();

    expect(stats.total).toBe(3);
    expect(stats.average).toBe(5);
    expect(stats.distribution).toEqual({ 5: 1, 4: 0, 3: 0, 2: 0, 1: 0 });
  });

  it("returns zeroed stats when the query fails", async () => {
    mockFindMany.mockRejectedValue(new Error("db unavailable"));

    const stats = await getReviewStats();

    expect(stats).toEqual({
      total: 0,
      average: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    });
  });
});

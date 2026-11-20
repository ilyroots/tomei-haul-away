import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ findFirst: vi.fn(), sign: vi.fn() }));
vi.mock("@/lib/db/prisma", () => ({ prisma: { galleryItem: { findFirst: mocks.findFirst } } }));
vi.mock("@/lib/storage/s3", () => ({ getSignedDownloadUrl: mocks.sign }));
vi.mock("@/lib/logging/logger", () => ({ logger: { error: vi.fn() } }));
import { GET } from "./route";
const request = () =>
  GET(new Request("https://example.com/api/gallery/job/image"), {
    params: Promise.resolve({ id: "job" }),
  });
describe("published gallery photo access", () => {
  beforeEach(() => vi.resetAllMocks());
  it("only looks up active gallery records and never signs a missing or unpublished photo", async () => {
    mocks.findFirst.mockResolvedValue(null);
    expect((await request()).status).toBe(404);
    expect(mocks.findFirst).toHaveBeenCalledWith({
      where: { id: "job", isActive: true },
      select: { assetKey: true },
    });
    expect(mocks.sign).not.toHaveBeenCalled();
  });
  it("does not substitute a fake job image when the record has no photo", async () => {
    mocks.findFirst.mockResolvedValue({ assetKey: null });
    expect((await request()).status).toBe(404);
    expect(mocks.sign).not.toHaveBeenCalled();
  });
  it("issues a short-lived uncached redirect for an explicitly published photo", async () => {
    mocks.findFirst.mockResolvedValue({ assetKey: "gallery/job/photo.webp" });
    mocks.sign.mockResolvedValue("https://storage.example.com/photo?signature=test");
    const response = await request();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://storage.example.com/photo?signature=test"
    );
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.sign).toHaveBeenCalledWith("gallery/job/photo.webp", 60);
  });
  it("returns unavailable without exposing storage errors", async () => {
    mocks.findFirst.mockRejectedValue(new Error("private database detail"));
    const response = await request();
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private database detail");
  });
});

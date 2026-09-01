import { describe, it, expect, vi, beforeEach } from "vitest";
import { LeadStatus } from "@prisma/client";
import { getLeads, updateLeadStatus, updateLeadPrice, addInternalNote } from "./actions";

const mockAuth = vi.fn();
const mockHeaders = vi.fn();
const mockGetSignedDownloadUrl = vi.fn();

const mockPrisma = vi.hoisted(() => ({
  lead: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
  statusHistory: {
    create: vi.fn(),
  },
  internalNote: {
    create: vi.fn(),
  },
  uploadedAsset: {
    findMany: vi.fn(),
  },
  $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: () => mockAuth(),
}));

vi.mock("next/headers", () => ({
  headers: () => mockHeaders(),
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: mockPrisma,
}));

vi.mock("@/lib/storage/s3", () => ({
  getSignedDownloadUrl: (key: string) => mockGetSignedDownloadUrl(key),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

function mockAuthenticated() {
  mockAuth.mockResolvedValue({ user: { id: "admin-1", email: "admin@example.com" } });
  mockHeaders.mockResolvedValue(new Headers());
}

function mockUnauthenticated() {
  mockAuth.mockResolvedValue(null);
  mockHeaders.mockResolvedValue(new Headers());
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getLeads", () => {
  it("rejects unauthenticated requests", async () => {
    mockUnauthenticated();
    await expect(getLeads()).rejects.toThrow("Unauthorized");
  });

  it("returns paginated leads for authenticated admins", async () => {
    mockAuthenticated();
    mockPrisma.lead.findMany.mockResolvedValue([
      {
        id: "c00000000000000000000000",
        referenceNumber: "THA-123456",
        contactName: "Alice Smith",
        contactEmail: "alice@example.com",
        contactPhone: "5551234567",
        status: "NEW",
        isInServiceArea: true,
        createdAt: new Date(),
        address: { city: "Haverhill", state: "MA", zip: "01830" },
      },
    ]);
    mockPrisma.lead.count.mockResolvedValue(1);

    const result = await getLeads({ search: "alice" });

    expect(result.leads).toHaveLength(1);
    expect(result.leads[0].referenceNumber).toBe("THA-123456");
    expect(result.total).toBe(1);
    expect(mockPrisma.auditLog.create).not.toHaveBeenCalled();
  });
});

describe("updateLeadStatus", () => {
  it("creates StatusHistory and AuditLog on status transition", async () => {
    mockAuthenticated();
    mockPrisma.lead.findUnique.mockResolvedValue({
      id: "c00000000000000000000000",
      status: "NEW",
    });
    mockPrisma.lead.update.mockResolvedValue({
      id: "c00000000000000000000000",
      status: "CONTACTED",
    });
    mockPrisma.statusHistory.create.mockResolvedValue({ id: "sh-1" });

    const result = await updateLeadStatus(
      "c00000000000000000000000",
      LeadStatus.CONTACTED,
      "Called customer"
    );

    expect(result).toEqual({ success: true });
    expect(mockPrisma.lead.update).toHaveBeenCalledWith({
      where: { id: "c00000000000000000000000" },
      data: { status: "CONTACTED" },
    });
    expect(mockPrisma.statusHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        entityType: "Lead",
        entityId: "c00000000000000000000000",
        fromStatus: "NEW",
        toStatus: "CONTACTED",
        changedById: "admin-1",
        reason: "Called customer",
      }),
    });
    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "LEAD_STATUS_UPDATED",
        entityType: "Lead",
        entityId: "c00000000000000000000000",
        actorId: "admin-1",
        metadata: expect.objectContaining({ fromStatus: "NEW", toStatus: "CONTACTED" }),
      }),
    });
  });

  it("rejects invalid status values", async () => {
    mockAuthenticated();
    const result = await updateLeadStatus("c00000000000000000000000", "INVALID" as LeadStatus);
    expect(result.success).toBe(false);
    expect(mockPrisma.lead.findUnique).not.toHaveBeenCalled();
  });
});

describe("updateLeadPrice", () => {
  it("updates price and logs audit action", async () => {
    mockAuthenticated();
    mockPrisma.lead.update.mockResolvedValue({ id: "c00000000000000000000000" });

    const result = await updateLeadPrice("c00000000000000000000000", 100, 250);

    expect(result).toEqual({ success: true });
    expect(mockPrisma.lead.update).toHaveBeenCalledWith({
      where: { id: "c00000000000000000000000" },
      data: { estimatedPriceMin: 100, estimatedPriceMax: 250 },
    });
    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "LEAD_PRICE_UPDATED",
        entityType: "Lead",
        entityId: "c00000000000000000000000",
      }),
    });
  });

  it("rejects negative prices", async () => {
    mockAuthenticated();
    const result = await updateLeadPrice("c00000000000000000000000", -10);
    expect(result.success).toBe(false);
    expect(mockPrisma.lead.update).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated requests", async () => {
    mockUnauthenticated();
    await expect(updateLeadPrice("c00000000000000000000000", 100)).rejects.toThrow("Unauthorized");
  });
});

describe("addInternalNote", () => {
  it("creates a note linked to the admin author", async () => {
    mockAuthenticated();
    mockPrisma.internalNote.create.mockResolvedValue({ id: "note-1" });

    const result = await addInternalNote(
      "c00000000000000000000000",
      "Customer prefers afternoon calls."
    );

    expect(result).toEqual({ success: true });
    expect(mockPrisma.internalNote.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        leadId: "c00000000000000000000000",
        authorId: "admin-1",
        content: "Customer prefers afternoon calls.",
      }),
    });
    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "LEAD_NOTE_ADDED",
        entityType: "Lead",
        entityId: "c00000000000000000000000",
      }),
    });
  });
});

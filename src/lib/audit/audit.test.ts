import { describe, it, expect, vi, beforeEach } from "vitest";
import { logAuditAction, requireAdmin } from "./audit";

const mockAuditLogCreate = vi.fn();
const mockAuth = vi.fn();
const mockHeaders = vi.fn();

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    auditLog: {
      create: (...args: unknown[]) => mockAuditLogCreate(...args),
    },
  },
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: () => mockAuth(),
}));

vi.mock("next/headers", () => ({
  headers: () => mockHeaders(),
}));

beforeEach(() => {
  mockAuditLogCreate.mockReset();
  mockAuth.mockReset();
  mockHeaders.mockReset();
});

describe("requireAdmin", () => {
  it("returns session when authenticated", async () => {
    const session = { user: { id: "admin-1", email: "admin@example.com" } };
    mockAuth.mockResolvedValue(session);
    await expect(requireAdmin()).resolves.toEqual(session);
  });

  it("throws when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);
    await expect(requireAdmin()).rejects.toThrow("Unauthorized");
  });
});

describe("logAuditAction", () => {
  it("records authenticated actor and metadata", async () => {
    mockAuth.mockResolvedValue({ user: { id: "admin-1" } });
    mockHeaders.mockResolvedValue(
      new Headers({
        "x-forwarded-for": "1.2.3.4",
        "user-agent": "test-agent",
      })
    );

    await logAuditAction({
      action: "LEAD_STATUS_UPDATED",
      entityType: "Lead",
      entityId: "lead-1",
      metadata: { fromStatus: "NEW", toStatus: "CONTACTED" },
    });

    expect(mockAuditLogCreate).toHaveBeenCalledTimes(1);
    expect(mockAuditLogCreate).toHaveBeenCalledWith({
      data: {
        action: "LEAD_STATUS_UPDATED",
        entityType: "Lead",
        entityId: "lead-1",
        actorId: "admin-1",
        actorType: "Admin",
        metadata: { fromStatus: "NEW", toStatus: "CONTACTED" },
        ipAddress: "1.2.3.4",
        userAgent: "test-agent",
      },
    });
  });

  it("falls back to System actor when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);
    mockHeaders.mockResolvedValue(new Headers());

    await logAuditAction({ action: "SYSTEM_EVENT" });

    expect(mockAuditLogCreate).toHaveBeenCalledTimes(1);
    expect(mockAuditLogCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "SYSTEM_EVENT",
        actorId: null,
        actorType: "System",
      }),
    });
  });
});

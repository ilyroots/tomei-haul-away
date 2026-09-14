import { describe, it, expect, vi, beforeEach } from "vitest";
import { createManualAppointment } from "./actions";

const mockAuth = vi.fn();
const mockHeaders = vi.fn();
const mockGetSignedDownloadUrl = vi.fn();

const mockPrisma = vi.hoisted(() => {
  const prisma = {
    lead: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    customer: {
      upsert: vi.fn(),
      create: vi.fn(),
    },
    address: {
      create: vi.fn(),
    },
    appointment: {
      create: vi.fn(),
      count: vi.fn(),
    },
    blackoutDate: {
      findUnique: vi.fn(),
    },
    availabilityWindow: {
      findMany: vi.fn(),
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
    $transaction: vi.fn(
      (arg: unknown) =>
        typeof arg === "function"
          ? (arg as (tx: unknown) => unknown)(prisma)
          : Promise.all(arg as unknown[])
    ),
  };
  return prisma;
});

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

function mockSlotAvailable() {
  mockPrisma.blackoutDate.findUnique.mockResolvedValue(null);
  mockPrisma.availabilityWindow.findMany.mockResolvedValue([
    { label: "Morning", maxAppointments: 2 },
  ]);
  mockPrisma.appointment.count.mockResolvedValue(0);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createManualAppointment", () => {
  it("creates customer, address, lead, and appointment in one transaction", async () => {
    mockAuthenticated();
    mockSlotAvailable();
    mockPrisma.lead.findUnique.mockResolvedValue(null); // reference number collision check
    mockPrisma.customer.upsert.mockResolvedValue({ id: "cust-1" });
    mockPrisma.address.create.mockResolvedValue({ id: "addr-1" });
    mockPrisma.lead.create.mockResolvedValue({ id: "lead-1" });
    mockPrisma.appointment.create.mockResolvedValue({ id: "appt-1" });
    mockPrisma.statusHistory.create.mockResolvedValue({ id: "sh-1" });

    const result = await createManualAppointment({
      contactName: "Bob Jones",
      contactEmail: "Bob@Example.com",
      contactPhone: "5551234567",
      line1: "123 Main St",
      city: "San Diego",
      state: "ca",
      zip: "92101",
      scheduledDate: new Date("2026-10-01T00:00:00Z"),
      arrivalWindow: "MORNING",
      estimatedPrice: 400,
      crewNotes: "Call on arrival",
    });

    expect(result).toEqual({ success: true, appointmentId: "appt-1" });
    expect(mockPrisma.customer.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: "bob@example.com" } })
    );
    expect(mockPrisma.address.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        line1: "123 Main St",
        city: "San Diego",
        state: "CA",
        zip: "92101",
        customerId: "cust-1",
      }),
    });
    expect(mockPrisma.lead.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        source: "manual-entry",
        status: "SCHEDULED",
        contactName: "Bob Jones",
        contactEmail: "bob@example.com",
        customerId: "cust-1",
        addressId: "addr-1",
        consentToContact: true,
        privacyPolicyAcknowledged: true,
      }),
    });
    expect(mockPrisma.appointment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        leadId: "lead-1",
        customerId: "cust-1",
        addressId: "addr-1",
        status: "CONFIRMED",
        arrivalWindow: "MORNING",
        estimatedPrice: 400,
        crewNotes: "Call on arrival",
      }),
    });
    expect(mockPrisma.statusHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        entityType: "Lead",
        entityId: "lead-1",
        toStatus: "SCHEDULED",
        changedById: "admin-1",
      }),
    });
    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "APPOINTMENT_CREATED_MANUAL",
        entityType: "Appointment",
        entityId: "appt-1",
        actorId: "admin-1",
      }),
    });
  });

  it("creates a plain customer when no email is given and skips the address", async () => {
    mockAuthenticated();
    mockSlotAvailable();
    mockPrisma.lead.findUnique.mockResolvedValue(null);
    mockPrisma.customer.create.mockResolvedValue({ id: "cust-2" });
    mockPrisma.lead.create.mockResolvedValue({ id: "lead-2" });
    mockPrisma.appointment.create.mockResolvedValue({ id: "appt-2" });
    mockPrisma.statusHistory.create.mockResolvedValue({ id: "sh-2" });

    const result = await createManualAppointment({
      contactName: "Walk-in Customer",
      scheduledDate: new Date("2026-10-02T00:00:00Z"),
      arrivalWindow: "ANYTIME",
    });

    expect(result).toEqual({ success: true, appointmentId: "appt-2" });
    expect(mockPrisma.customer.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ name: "Walk-in Customer" }),
    });
    expect(mockPrisma.customer.upsert).not.toHaveBeenCalled();
    expect(mockPrisma.address.create).not.toHaveBeenCalled();
    expect(mockPrisma.appointment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        leadId: "lead-2",
        customerId: "cust-2",
        addressId: null,
        status: "CONFIRMED",
      }),
    });
  });

  it("rejects when only part of the address is provided", async () => {
    mockAuthenticated();
    const result = await createManualAppointment({
      contactName: "Bob Jones",
      city: "San Diego",
      scheduledDate: new Date("2026-10-01T00:00:00Z"),
      arrivalWindow: "MORNING",
    });

    expect(result.success).toBe(false);
    expect(mockPrisma.appointment.create).not.toHaveBeenCalled();
  });

  it("rejects invalid input", async () => {
    mockAuthenticated();
    const result = await createManualAppointment({
      contactName: "",
      scheduledDate: new Date("2026-10-01T00:00:00Z"),
      arrivalWindow: "MORNING",
    });

    expect(result.success).toBe(false);
    expect(mockPrisma.appointment.create).not.toHaveBeenCalled();
  });

  it("returns the capacity error when the slot is fully booked", async () => {
    mockAuthenticated();
    mockPrisma.blackoutDate.findUnique.mockResolvedValue(null);
    mockPrisma.availabilityWindow.findMany.mockResolvedValue([
      { label: "Morning", maxAppointments: 1 },
    ]);
    mockPrisma.appointment.count.mockResolvedValue(1);

    const result = await createManualAppointment({
      contactName: "Bob Jones",
      scheduledDate: new Date("2026-10-01T00:00:00Z"),
      arrivalWindow: "MORNING",
    });

    expect(result).toEqual({ success: false, message: "The selected time slot is fully booked." });
    expect(mockPrisma.appointment.create).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated requests", async () => {
    mockUnauthenticated();
    await expect(
      createManualAppointment({
        contactName: "Bob Jones",
        scheduledDate: new Date(),
        arrivalWindow: "MORNING",
      })
    ).rejects.toThrow("Unauthorized");
  });
});
